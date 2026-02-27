'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  myappRealtimeApiHeartbeat,
  myappRealtimeApiRegisterQueue,
} from '../api/real-time/real-time';
import { useAuthStore } from '../stores/authStore';
import { useEphemeralUnreadStore } from '../stores/ephemeralUnreadStore';
import { startSyncTimer, stopSyncTimer } from '../stores/readItemsStore';
import { useRealtimeContextStore } from '../stores/realtimeStore';
import { useSubscriptionUnreadStore } from '../stores/subscriptionUnreadStore';

type RealtimeEventType =
  | 'new_discussion'
  | 'new_comment'
  | 'updated_discussion'
  | 'updated_comment'
  | 'deleted_discussion'
  | 'deleted_comment';

type RealtimeEvent = {
  type: RealtimeEventType;
  data: {
    article_id: number;
    community_id: number;
    discussion_id?: number;
    parent_id?: number | null;
    is_reply?: boolean;
    reply_depth?: number;
    discussion?: {
      id?: number;
      user?: {
        username: string;
      };
      topic?: string;
      [key: string]: unknown;
    };
    comment?: {
      id?: number;
      author?: {
        username: string;
      };
      content?: string;
      [key: string]: unknown;
    };
  };
  community_ids: number[];
  timestamp: string;
  event_id: number;
};

type PollSuccess = { events: RealtimeEvent[]; last_event_id: number };
type PollCatchup = { catchup_required: true };
type PollResponse = PollSuccess | PollCatchup;

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disabled';

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL;
const HEARTBEAT_INTERVAL_MS = 60_000;
const POLL_ABORT_MS = 65_000;
const LEADER_TTL_MS = 10_000;
const MAX_RETRIES = 3;
// NOTE(bsureshkrishna, 2026-02-07): Realtime pipeline was rebuilt after baseline 5271498.
// Key changes: queue + last_event_id persistence, multi-tab leader election,
// auth-aware polling/heartbeat, and integration with unread notifications + toasts.
// TODO(bsureshkrishna): Re-validate multi-tab leader election, retry/backoff, and unread/notification sync after merge.

const STORAGE_KEYS = {
  QUEUE_ID: 'realtime_queue_id',
  LAST_EVENT_ID: 'realtime_last_event_id',
  LEADER: 'realtime_leader',
};

// Generate a unique tab ID to prevent processing our own broadcasts
const TAB_ID =
  typeof window !== 'undefined' ? `${Date.now()}-${Math.random().toString(36).slice(2)}` : '';

const bc =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('realtime')
    : null;

function isPollSuccess(r: PollResponse): r is PollSuccess {
  return (r as PollSuccess).events !== undefined;
}

// Helper function to match query keys more reliably
function matchesQueryKey(queryKey: readonly unknown[], pattern: string | RegExp): boolean {
  const keyStr = JSON.stringify(queryKey);
  if (typeof pattern === 'string') {
    return keyStr.includes(pattern);
  }
  return pattern.test(keyStr);
}

export function useRealtime() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  // Get all context state
  const {
    activeArticleId,
    activeCommunityId,
    activeDiscussionId: _activeDiscussionId,
    isViewingDiscussions: _isViewingDiscussions,
    isViewingComments: _isViewingComments,
    isContextFresh,
  } = useRealtimeContextStore();

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const leaderHeartbeatRef = useRef<number | null>(null);

  const queueIdRef = useRef<string | null>(null);
  const lastEventIdRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const backoffRef = useRef<number>(1000);
  const retryCountRef = useRef<number>(0);
  const stoppedRef = useRef<boolean>(false);
  const isPollingRef = useRef<boolean>(false);
  const loopStartedRef = useRef<boolean>(false);
  const registerQueueRef = useRef<((force?: boolean) => Promise<boolean>) | null>(null);
  // Track processed event IDs to prevent duplicate processing
  const processedEventIdsRef = useRef<Set<number>>(new Set());

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 4: Track event sequences to ensure ordering
  // Map key format: "communityId:articleId" -> last processed event_id
  const eventSequenceRef = useRef<Map<string, number>>(new Map());
  // Queue for out-of-order events that arrived too early
  // Map key format: "communityId:articleId" -> array of pending events
  const pendingEventsRef = useRef<Map<string, RealtimeEvent[]>>(new Map());

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 6: Track poll timeout to prevent zombie polls after unmount
  const pollTimeoutRef = useRef<number | null>(null);

  const writeLeaderHeartbeat = useCallback((tabId: string) => {
    const payload = { tabId, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEYS.LEADER, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, []);

  const tryBecomeLeader = useCallback(() => {
    const myId = (Math.random() + 1).toString(36).slice(2);
    const now = Date.now();
    const raw = localStorage.getItem(STORAGE_KEYS.LEADER);
    let current: { tabId: string; ts: number } | null = null;

    try {
      current = raw ? JSON.parse(raw) : null;
    } catch {
      current = null;
    }

    if (!current || now - current.ts > LEADER_TTL_MS * 2) {
      writeLeaderHeartbeat(myId);
      setIsLeader(true);
      leaderHeartbeatRef.current = window.setInterval(
        () => writeLeaderHeartbeat(myId),
        LEADER_TTL_MS
      );
    } else {
      setIsLeader(false);
    }
  }, [writeLeaderHeartbeat]);

  const releaseLeadership = useCallback(() => {
    setIsLeader(false);
    if (leaderHeartbeatRef.current) {
      clearInterval(leaderHeartbeatRef.current);
      leaderHeartbeatRef.current = null;
    }
  }, []);

  // Storage listener to detect leader loss
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LEADER) {
        tryBecomeLeader();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [tryBecomeLeader]);

  const saveQueueState = useCallback((queueId: string, lastEventId: number) => {
    queueIdRef.current = queueId;
    lastEventIdRef.current = lastEventId;
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE_ID, queueId);
      localStorage.setItem(STORAGE_KEYS.LAST_EVENT_ID, String(lastEventId));
    } catch {
      // ignore storage errors
    }
  }, []);

  const loadQueueState = useCallback(() => {
    const q = localStorage.getItem(STORAGE_KEYS.QUEUE_ID);
    const l = localStorage.getItem(STORAGE_KEYS.LAST_EVENT_ID);
    queueIdRef.current = q;
    lastEventIdRef.current = l ? Number(l) : null;
  }, []);

  // Improved cache update functions
  const updateDiscussionsCache = useCallback(
    (event: RealtimeEvent) => {
      const { article_id: articleId } = event.data;

      // Silently update discussions cache

      // Update both query key formats that might be used
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return (
              // Match the default API query key format
              matchesQueryKey(key, `/api/articles/${articleId}/discussions/`) ||
              // Match the custom query key format used in DiscussionForum
              (Array.isArray(key) &&
                key.length >= 3 &&
                key[0] === 'discussions' &&
                key[1] === articleId &&
                key[2] === event.data.community_id)
            );
          },
        },
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== 'object' || !('data' in oldData)) return oldData;
          const data = oldData.data as { items?: unknown[] };
          if (!data?.items) return oldData;

          const discussion = event.data.discussion;
          if (!discussion?.id) return oldData;

          const items = data.items;

          switch (event.type) {
            case 'new_discussion': {
              // Check if discussion already exists to prevent duplicates
              const exists = items.some(
                (item: unknown) =>
                  typeof item === 'object' &&
                  item !== null &&
                  'id' in item &&
                  item.id === discussion.id
              );
              if (exists) return oldData;

              return {
                ...oldData,
                data: {
                  ...data,
                  items: [{ ...discussion, comments_count: 0, replies: [] }, ...items],
                },
              };
            }

            case 'updated_discussion': {
              return {
                ...oldData,
                data: {
                  ...data,
                  items: items.map((item: unknown) =>
                    typeof item === 'object' &&
                    item !== null &&
                    'id' in item &&
                    item.id === discussion.id
                      ? { ...item, ...discussion }
                      : item
                  ),
                },
              };
            }

            case 'deleted_discussion': {
              return {
                ...oldData,
                data: {
                  ...data,
                  items: items.filter(
                    (item: unknown) =>
                      !(
                        typeof item === 'object' &&
                        item !== null &&
                        'id' in item &&
                        item.id === discussion.id
                      )
                  ),
                },
              };
            }

            default:
              return oldData;
          }
        }
      );
    },
    [queryClient]
  );

  const updateCommentsCache = useCallback(
    (event: RealtimeEvent) => {
      const { discussion_id: discussionId } = event.data;
      if (!discussionId) return;

      // Silently update comments cache

      // Update comment caches
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return matchesQueryKey(key, `/api/articles/discussions/${discussionId}/comments/`);
          },
        },
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== 'object' || !('data' in oldData)) return oldData;
          if (!Array.isArray((oldData as { data?: unknown }).data)) return oldData;

          const comment = event.data.comment;
          if (!comment?.id) return oldData;

          const parentId = event.data.parent_id;

          const updateCommentsArray = (comments: unknown[]): unknown[] => {
            if (!Array.isArray(comments)) return [];

            switch (event.type) {
              case 'new_comment': {
                if (!parentId) {
                  // Top-level comment
                  const exists = comments.some(
                    (c: unknown) =>
                      typeof c === 'object' && c !== null && 'id' in c && c.id === comment.id
                  );
                  if (exists) return comments;

                  return [...comments, { ...comment, replies: [] }];
                } else {
                  // Reply to existing comment
                  return comments.map((c: unknown) => {
                    if (typeof c !== 'object' || c === null || !('id' in c)) return c;
                    if (c.id === parentId) {
                      const replies = 'replies' in c && Array.isArray(c.replies) ? c.replies : [];
                      const exists = replies.some(
                        (r: unknown) =>
                          typeof r === 'object' && r !== null && 'id' in r && r.id === comment.id
                      );
                      if (exists) return c;

                      return { ...c, replies: [...replies, { ...comment, replies: [] }] };
                    } else if ('replies' in c && Array.isArray(c.replies)) {
                      // Recursively check nested replies
                      return { ...c, replies: updateCommentsArray(c.replies) };
                    }
                    return c;
                  });
                }
              }

              case 'updated_comment': {
                return comments.map((c: unknown) => {
                  if (typeof c !== 'object' || c === null || !('id' in c)) return c;
                  if (c.id === comment.id) {
                    return { ...c, ...comment };
                  } else if ('replies' in c && Array.isArray(c.replies)) {
                    return { ...c, replies: updateCommentsArray(c.replies) };
                  }
                  return c;
                });
              }

              case 'deleted_comment': {
                const filtered = comments.filter(
                  (c: unknown) =>
                    !(typeof c === 'object' && c !== null && 'id' in c && c.id === comment.id)
                );
                return filtered.map((c: unknown) =>
                  typeof c === 'object' && c !== null && 'replies' in c && Array.isArray(c.replies)
                    ? { ...c, replies: updateCommentsArray(c.replies) }
                    : c
                );
              }

              default:
                return comments;
            }
          };

          return {
            ...oldData,
            data: updateCommentsArray(
              Array.isArray((oldData as { data?: unknown }).data)
                ? (oldData as { data: unknown[] }).data
                : []
            ),
          };
        }
      );

      // Also update discussions cache to increment comment count for new top-level comments
      if (event.type === 'new_comment' && !event.data.parent_id) {
        queryClient.setQueriesData(
          {
            predicate: (query) => {
              const key = query.queryKey;
              return (
                matchesQueryKey(key, `/api/articles/${event.data.article_id}/discussions/`) ||
                (Array.isArray(key) &&
                  key.length >= 3 &&
                  key[0] === 'discussions' &&
                  key[1] === event.data.article_id)
              );
            },
          },
          (oldData: unknown) => {
            if (!oldData || typeof oldData !== 'object' || !('data' in oldData)) return oldData;
            const data = oldData.data as { items?: unknown[] };
            if (!data?.items) return oldData;

            return {
              ...oldData,
              data: {
                ...data,
                items: data.items.map((item: unknown) => {
                  if (typeof item !== 'object' || item === null || !('id' in item)) return item;
                  return item.id === discussionId
                    ? {
                        ...item,
                        comments_count:
                          ('comments_count' in item && typeof item.comments_count === 'number'
                            ? item.comments_count
                            : 0) + 1,
                      }
                    : item;
                }),
              },
            };
          }
        );
      }
    },
    [queryClient]
  );

  const fetchPoll = useCallback(async (): Promise<PollResponse> => {
    if (!REALTIME_URL) throw new Error('Missing NEXT_PUBLIC_REALTIME_URL');
    const queueId = queueIdRef.current;
    const lastEventId = lastEventIdRef.current ?? 0;
    if (!queueId) throw new Error('No queue_id');

    const url = new URL('/realtime/poll', REALTIME_URL);
    url.searchParams.set('queue_id', queueId);
    url.searchParams.set('last_event_id', String(lastEventId));

    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = window.setTimeout(() => controller.abort(), POLL_ABORT_MS);
    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!res.ok) {
        // Create error with status code for proper handling
        const error = new Error(
          res.status === 404 ? 'queue_not_found' : `poll_http_${res.status}`
        ) as Error & { status: number };
        error.status = res.status;
        throw error;
      }
      const data = (await res.json()) as PollResponse;
      return data;
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
    }
  }, []);

  const handleEvents = useCallback(
    (events: RealtimeEvent[], fromBroadcast = false) => {
      if (!events?.length) return;

      // Fixed by Claude Sonnet 4.5 on 2026-02-08
      // Issue 4: Sort events by event_id before processing to ensure correct order
      const sortedEvents = [...events].sort((a, b) => a.event_id - b.event_id);

      // Filter out already processed events to prevent duplicates
      const newEvents = sortedEvents.filter((event) => {
        if (processedEventIdsRef.current.has(event.event_id)) {
          return false;
        }
        // Add to processed set
        processedEventIdsRef.current.add(event.event_id);
        return true;
      });

      // Fixed by Claude Sonnet 4.5 on 2026-02-08
      // Issue 5: More aggressive cleanup - reduced threshold from 1000→500, keep only 250
      if (processedEventIdsRef.current.size > 500) {
        const idsArray = Array.from(processedEventIdsRef.current);
        processedEventIdsRef.current = new Set(idsArray.slice(-250));
      }

      if (!newEvents.length) return;

      // Only broadcast to other tabs if this is NOT from a broadcast (leader tab only)
      if (!fromBroadcast) {
        bc?.postMessage({ type: 'realtime:events', payload: newEvents, senderId: TAB_ID });
      }

      // Fixed by Claude Sonnet 4.5 on 2026-02-08
      // Issue 4: Process events in sequence, queue out-of-order events
      const eventsToProcess: RealtimeEvent[] = [];
      const eventsToQueue: RealtimeEvent[] = [];

      for (const event of newEvents) {
        const { article_id: articleId, community_id: communityId } = event.data;
        const contextKey = `${communityId}:${articleId}`;
        const lastSeq = eventSequenceRef.current.get(contextKey) ?? 0;

        // Check if this event is in sequence
        if (event.event_id === lastSeq + 1 || lastSeq === 0) {
          // In sequence - process immediately
          eventsToProcess.push(event);
          eventSequenceRef.current.set(contextKey, event.event_id);
        } else if (event.event_id > lastSeq + 1) {
          // Out of order - queue for later
          eventsToQueue.push(event);
        }
        // If event.event_id <= lastSeq, it's already processed (skip)
      }

      // Queue out-of-order events
      for (const event of eventsToQueue) {
        const { article_id: articleId, community_id: communityId } = event.data;
        const contextKey = `${communityId}:${articleId}`;
        const pending = pendingEventsRef.current.get(contextKey) ?? [];
        pending.push(event);
        pendingEventsRef.current.set(contextKey, pending);
      }

      // Helper to process pending events that are now ready
      const processPendingEvents = (contextKey: string) => {
        const pending = pendingEventsRef.current.get(contextKey);
        if (!pending?.length) return;

        const lastSeq = eventSequenceRef.current.get(contextKey) ?? 0;
        const readyEvents: RealtimeEvent[] = [];
        const stillPending: RealtimeEvent[] = [];

        for (const event of pending) {
          if (event.event_id === lastSeq + 1) {
            readyEvents.push(event);
          } else {
            stillPending.push(event);
          }
        }

        if (readyEvents.length > 0) {
          // Sort ready events by event_id
          readyEvents.sort((a, b) => a.event_id - b.event_id);

          // Update sequence tracker
          for (const event of readyEvents) {
            eventSequenceRef.current.set(contextKey, event.event_id);
          }

          // Update pending queue
          if (stillPending.length > 0) {
            pendingEventsRef.current.set(contextKey, stillPending);
          } else {
            pendingEventsRef.current.delete(contextKey);
          }

          // Recursively process newly ready events
          eventsToProcess.push(...readyEvents);
          processPendingEvents(contextKey);
        }
      };

      for (const event of eventsToProcess) {
        const { article_id: articleId, community_id: communityId } = event.data;

        // Check if this event is relevant to current context
        const isRelevantToCurrentContext =
          activeArticleId === articleId &&
          (activeCommunityId === communityId ||
            (Array.isArray(event.community_ids) &&
              event.community_ids.includes(activeCommunityId as number)));

        // Process discussion events
        if (['new_discussion', 'updated_discussion', 'deleted_discussion'].includes(event.type)) {
          if (isRelevantToCurrentContext || !isContextFresh()) {
            updateDiscussionsCache(event);
          } else {
            // Invalidate for non-relevant contexts
            queryClient.invalidateQueries({
              predicate: (query) =>
                matchesQueryKey(query.queryKey, `/api/articles/${articleId}/discussions/`),
            });
          }

          // Show notification and mark subscription as having new event
          if (event.type === 'new_discussion' && event.data.discussion) {
            // Mark subscription as having new unread event (for sidebar)
            useSubscriptionUnreadStore.getState().markArticleHasNewEvent(communityId, articleId);

            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Remove realtime toast + sound for new discussions; keep the unread dot only.
               Why: Users want silent indicators without popup or audio noise.
               How: Skip toast.warning and notification audio for new_discussion events. */
            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Track realtime-only NEW badges for discussions.
               Why: Backend unread flags may arrive later, delaying NEW indicators.
               How: Record ephemeral unread entries on realtime events and clean expired ones. */
            if (event.data.discussion.id !== undefined) {
              const ephemeralStore = useEphemeralUnreadStore.getState();
              ephemeralStore.markItemUnread('discussion', event.data.discussion.id);
              ephemeralStore.cleanupExpired();
            }
          }
        }

        // Process comment events
        if (['new_comment', 'updated_comment', 'deleted_comment'].includes(event.type)) {
          if (isRelevantToCurrentContext || !isContextFresh()) {
            updateCommentsCache(event);
          } else {
            // Invalidate for non-relevant contexts
            const discussionId = event.data.discussion_id;
            if (discussionId) {
              queryClient.invalidateQueries({
                predicate: (query) =>
                  matchesQueryKey(
                    query.queryKey,
                    `/api/articles/discussions/${discussionId}/comments/`
                  ),
              });
            }
          }

          // Show notification and mark subscription as having new event
          if (event.type === 'new_comment' && event.data.comment) {
            // Mark subscription as having new unread event (for sidebar)
            useSubscriptionUnreadStore.getState().markArticleHasNewEvent(communityId, articleId);

            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Remove realtime toast + sound for new comments; keep the unread dot only.
               Why: Users want silent indicators without popup or audio noise.
               How: Skip toast.warning and notification audio for new_comment events. */
            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Track realtime-only NEW badges for comments and replies.
               Why: Comments can appear before unread flags, so NEW badges need a local overlay.
               How: Record ephemeral unread entries keyed by comment/reply IDs. */
            if (event.data.comment.id !== undefined) {
              const commentType = event.data.parent_id ? 'reply' : 'comment';
              const ephemeralStore = useEphemeralUnreadStore.getState();
              ephemeralStore.markItemUnread(commentType, event.data.comment.id);
              /* Fixed by Codex on 2026-02-17
                 Who: Codex
                 What: Propagate realtime comment unread state to the parent discussion.
                 Why: Discussion cards should show NEW and auto-open when unread activity is inside their comment tree.
                 How: Mark the event's `discussion_id` as ephemeral unread alongside the comment/reply entry. */
              if (event.data.discussion_id !== undefined) {
                ephemeralStore.markItemUnread('discussion', event.data.discussion_id);
              }
              ephemeralStore.cleanupExpired();
            }
          }
        }

        // Fixed by Claude Sonnet 4.5 on 2026-02-08
        // Issue 4: After processing each event, check if any queued events are now ready
        const contextKey = `${communityId}:${articleId}`;
        processPendingEvents(contextKey);
      }
    },
    [
      queryClient,
      activeArticleId,
      activeCommunityId,
      isContextFresh,
      updateDiscussionsCache,
      updateCommentsCache,
    ]
  );

  // Store handleEvents in a ref to avoid stale closure in BroadcastChannel listener
  const handleEventsRef = useRef(handleEvents);
  useEffect(() => {
    handleEventsRef.current = handleEvents;
  }, [handleEvents]);

  // Broadcast received from leader → propagate events and status
  useEffect(() => {
    if (!bc) return;
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      // Ignore messages from our own tab
      if (msg?.senderId === TAB_ID) {
        return;
      }
      if (msg?.type === 'realtime:events') {
        // Pass fromBroadcast=true to prevent re-broadcasting
        handleEventsRef.current(msg.payload as RealtimeEvent[], true);
      } else if (msg?.type === 'realtime:status') {
        setStatus(msg.payload as ConnectionStatus);
      }
    };
    bc.addEventListener('message', onMessage);
    return () => bc.removeEventListener('message', onMessage);
  }, []);

  const pollLoop = useCallback(async () => {
    // Check authentication first - don't poll if not logged in
    if (!isAuthenticated || !accessToken) {
      loopStartedRef.current = false;
      setStatus('disabled');
      return;
    }

    if (!isLeader || stoppedRef.current) {
      loopStartedRef.current = false;
      return;
    }
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      if (!REALTIME_URL) {
        setStatus('disabled');
        loopStartedRef.current = false;
        isPollingRef.current = false;
        return;
      }

      // Check if we have a queue_id before attempting to poll
      if (!queueIdRef.current) {
        // Try to register first
        if (registerQueueRef.current) {
          const registered = await registerQueueRef.current(true);
          if (!registered || stoppedRef.current) {
            loopStartedRef.current = false;
            isPollingRef.current = false;
            return;
          }
        }
        // If still no queue_id after registration, stop polling
        if (!queueIdRef.current) {
          setStatus('disabled');
          loopStartedRef.current = false;
          isPollingRef.current = false;
          return;
        }
      }

      setStatus((s) => (s === 'idle' ? 'connecting' : s));
      const res = await fetchPoll();

      if (isPollSuccess(res)) {
        const { events, last_event_id } = res;
        if (events.length) {
          handleEvents(events);
        }
        saveQueueState(queueIdRef.current as string, last_event_id);
        lastEventIdRef.current = last_event_id;
        setStatus('connected');
        backoffRef.current = 1000;
        retryCountRef.current = 0;
      } else {
        // catchup required
        setStatus('reconnecting');
        let registered = false;
        if (registerQueueRef.current) {
          registered = await registerQueueRef.current(true);
        }
        // Check if registration succeeded and we're not stopped (auth failure)
        if (registered && queueIdRef.current && !stoppedRef.current) {
          retryCountRef.current = 0;
          // Invalidate all discussion and comment caches
          queryClient.invalidateQueries({
            predicate: (query) =>
              matchesQueryKey(query.queryKey, '/api/articles/') &&
              (matchesQueryKey(query.queryKey, '/discussions') ||
                matchesQueryKey(query.queryKey, '/comments')),
          });
          /* Fixed by Codex on 2026-02-15
             Who: Codex
             What: Comment out the initial sync toast after queue registration.
             Why: User asked to remove the first-login "Syncing latest" notification.
             How: Disable the toast.info call while keeping cache invalidation. */
          // toast.info('Syncing latest discussions…');
        } else if (stoppedRef.current) {
          // Auth failure - stop completely
          return;
        } else {
          retryCountRef.current += 1;
          if (retryCountRef.current >= MAX_RETRIES) {
            stoppedRef.current = true;
            setStatus('disabled');
            return;
          }
          await new Promise((r) => setTimeout(r, backoffRef.current));
          backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
        }
      }
    } catch (err: unknown) {
      // Check for authentication errors first (401/403)
      const httpStatus =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'status' in err.response
          ? err.response.status
          : err && typeof err === 'object' && 'status' in err
            ? err.status
            : undefined;
      if (httpStatus === 401 || httpStatus === 403) {
        queueIdRef.current = null;
        lastEventIdRef.current = null;
        stoppedRef.current = true;
        setStatus('disabled');
        return;
      }

      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        // ignore aborts
      } else if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        err.message === 'No queue_id'
      ) {
        // No queue_id means we're not properly registered, likely not authenticated
        if (!isAuthenticated || !accessToken) {
          setStatus('disabled');
          stoppedRef.current = true;
          return;
        }
        retryCountRef.current += 1;
        if (retryCountRef.current >= MAX_RETRIES) {
          stoppedRef.current = true;
          setStatus('disabled');
          return;
        }
        await new Promise((r) => setTimeout(r, backoffRef.current));
        backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
      } else if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        err.message === 'queue_not_found'
      ) {
        setStatus('reconnecting');
        let registered = false;
        if (registerQueueRef.current) {
          registered = await registerQueueRef.current(true);
        }
        // Only show toast and invalidate if registration succeeded and not stopped
        if (registered && queueIdRef.current && !stoppedRef.current) {
          retryCountRef.current = 0;
          queryClient.invalidateQueries({
            predicate: (query) =>
              matchesQueryKey(query.queryKey, '/api/articles/') &&
              (matchesQueryKey(query.queryKey, '/discussions') ||
                matchesQueryKey(query.queryKey, '/comments')),
          });
          /* Fixed by Codex on 2026-02-15
             Who: Codex
             What: Comment out the reconnect sync toast.
             Why: User requested removing the "Reconnected, syncing latest" notification.
             How: Disable the toast.info call while keeping the cache invalidation. */
          // toast.info('Reconnected. Syncing latest discussions…');
        } else if (stoppedRef.current) {
          // Auth failure - stop completely
          return;
        } else {
          retryCountRef.current += 1;
          if (retryCountRef.current >= MAX_RETRIES) {
            stoppedRef.current = true;
            setStatus('disabled');
            return;
          }
          await new Promise((r) => setTimeout(r, backoffRef.current));
          backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
        }
      } else {
        // Generic error - retry silently up to MAX_RETRIES
        retryCountRef.current += 1;
        if (retryCountRef.current >= MAX_RETRIES) {
          // Only log on final failure
          console.warn('[Realtime] Max retries reached, disabling realtime');
          stoppedRef.current = true;
          setStatus('disabled');
        } else {
          setStatus('error');
          await new Promise((r) => setTimeout(r, backoffRef.current));
          backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
        }
      }
    } finally {
      isPollingRef.current = false;
      // Only continue polling if authenticated and not stopped
      if (!stoppedRef.current && isLeader && isAuthenticated && accessToken) {
        // Fixed by Claude Sonnet 4.5 on 2026-02-08
        // Issue 6: Clear any existing timeout before setting new one
        if (pollTimeoutRef.current !== null) {
          clearTimeout(pollTimeoutRef.current);
        }
        // Store timeout ID for cleanup on unmount
        pollTimeoutRef.current = window.setTimeout(() => {
          void pollLoop();
        }, 0);
      } else {
        loopStartedRef.current = false;
      }
    }
  }, [
    fetchPoll,
    handleEvents,
    isLeader,
    queryClient,
    isAuthenticated,
    accessToken,
    saveQueueState,
  ]);

  const sendHeartbeat = useCallback(async () => {
    if (!queueIdRef.current || !accessToken || stoppedRef.current) return;
    try {
      await myappRealtimeApiHeartbeat(
        { queue_id: queueIdRef.current },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (e: unknown) {
      // Check for auth errors
      const status =
        e &&
        typeof e === 'object' &&
        'response' in e &&
        e.response &&
        typeof e.response === 'object' &&
        'status' in e.response
          ? e.response.status
          : e && typeof e === 'object' && 'status' in e
            ? e.status
            : undefined;
      if (status === 401 || status === 403) {
        stoppedRef.current = true;
        setStatus('disabled');
        return;
      }
      if (registerQueueRef.current && !stoppedRef.current) {
        await registerQueueRef.current(true);
      }
    }
  }, [accessToken]);

  const heartbeatLoop = useCallback(() => {
    const id = window.setInterval(() => {
      if (isLeader && !stoppedRef.current) {
        void sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sendHeartbeat, isLeader]);

  const registerQueue = useCallback(
    async (force?: boolean): Promise<boolean> => {
      if (!isAuthenticated || !accessToken) {
        setStatus('disabled');
        stoppedRef.current = true;
        return false;
      }
      loadQueueState();
      if (!force && queueIdRef.current && lastEventIdRef.current !== null) {
        return true;
      }

      // Fixed by Claude Sonnet 4.5 on 2026-02-08
      // Issue 7: Retry queue registration up to 3 times with exponential backoff
      const MAX_REGISTER_RETRIES = 3;
      let retries = 0;
      let backoff = 1000; // Start with 1 second

      while (retries < MAX_REGISTER_RETRIES) {
        setStatus('connecting');
        try {
          const { data } = await myappRealtimeApiRegisterQueue({
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          saveQueueState(data.queue_id, data.last_event_id);
          bc?.postMessage({
            type: 'realtime:status',
            payload: 'connected' satisfies ConnectionStatus,
          });
          setStatus('connected');
          return true;
        } catch (err: unknown) {
          // Check for authentication errors (401/403)
          const status =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            err.response &&
            typeof err.response === 'object' &&
            'status' in err.response
              ? err.response.status
              : err && typeof err === 'object' && 'status' in err
                ? err.status
                : undefined;

          // Fixed by Claude Sonnet 4.5 on 2026-02-08
          // Issue 7: Don't retry on auth errors, only on network errors
          if (status === 401 || status === 403) {
            // Auth failed - clear queue state and stop immediately (no retry)
            queueIdRef.current = null;
            lastEventIdRef.current = null;
            try {
              localStorage.removeItem(STORAGE_KEYS.QUEUE_ID);
              localStorage.removeItem(STORAGE_KEYS.LAST_EVENT_ID);
            } catch {
              // ignore storage errors
            }
            stoppedRef.current = true;
            setStatus('disabled');
            return false;
          }

          // Network error or other error - retry with backoff
          retries++;
          if (retries < MAX_REGISTER_RETRIES) {
            console.warn(
              `[Realtime] Queue registration failed, retrying (${retries}/${MAX_REGISTER_RETRIES})...`
            );
            await new Promise((resolve) => setTimeout(resolve, backoff));
            backoff = Math.min(backoff * 2, 5000); // Exponential backoff, max 5s
          } else {
            // Max retries reached - set error state but don't disable completely
            console.error('[Realtime] Queue registration failed after max retries');
            setStatus('error');
            return false;
          }
        }
      }

      setStatus('error');
      return false;
    },
    [accessToken, isAuthenticated, loadQueueState, saveQueueState]
  );

  // Store registerQueue in ref for use in pollLoop and sendHeartbeat
  useEffect(() => {
    registerQueueRef.current = registerQueue;
  }, [registerQueue]);

  // Startup/shutdown
  useEffect(() => {
    stoppedRef.current = false;
    tryBecomeLeader();
    void registerQueue();

    const stopHeartbeat = heartbeatLoop();

    return () => {
      stoppedRef.current = true;
      if (abortRef.current) abortRef.current.abort();
      stopHeartbeat();
      releaseLeadership();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-attempt registration when auth state changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Reset stopped state when user logs back in
      stoppedRef.current = false;
      retryCountRef.current = 0;
      backoffRef.current = 1000;
      void registerQueue(true);

      // Start the read items sync timer (syncs read flags with backend every 2 minutes)
      startSyncTimer(() => useAuthStore.getState().accessToken);
    } else {
      // User logged out - stop everything
      stoppedRef.current = true;
      queueIdRef.current = null;
      lastEventIdRef.current = null;
      /* Fixed by Codex on 2026-02-17
         Who: Codex
         What: Abort any in-flight realtime poll and clear queued poll reruns on logout.
         Why: Auth-state teardown previously stopped future loops but could leave one long-poll
         request open until timeout, which looked like a lingering realtime connection.
         How: Abort the active AbortController and clear pending poll timeout before leadership
         release and status reset. */
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      try {
        localStorage.removeItem(STORAGE_KEYS.QUEUE_ID);
        localStorage.removeItem(STORAGE_KEYS.LAST_EVENT_ID);
        // NOTE(Codex for bsureshkrishna, 2026-02-09): Clear leader state on logout
        // so other tabs can take over realtime polling.
        localStorage.removeItem(STORAGE_KEYS.LEADER);
      } catch {
        // ignore storage errors
      }
      // NOTE(Codex for bsureshkrishna, 2026-02-09): Explicitly release leadership
      // to avoid a stale heartbeat holding the leader slot.
      releaseLeadership();
      setStatus('disabled');

      // Stop the sync timer
      stopSyncTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // If leadership changes, start/stop polling accordingly
  useEffect(() => {
    if (!isLeader || loopStartedRef.current) return;
    // Don't start polling if not authenticated
    if (!isAuthenticated || !accessToken) return;
    // Refresh persisted queue state when leadership changes to avoid stale last_event_id.
    loadQueueState();
    loopStartedRef.current = true;
    void pollLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeader, isAuthenticated, accessToken, loadQueueState]);

  // Keep status in other tabs updated
  useEffect(() => {
    bc?.postMessage({ type: 'realtime:status', payload: status });
  }, [status]);

  // Periodically attempt to become leader if none is active
  useEffect(() => {
    if (isLeader) return;
    const id = window.setInterval(() => {
      // Don't try to become leader if stopped or not authenticated
      if (!stoppedRef.current && isAuthenticated && accessToken) {
        tryBecomeLeader();
      }
    }, LEADER_TTL_MS);
    return () => clearInterval(id);
  }, [isLeader, tryBecomeLeader, isAuthenticated, accessToken]);

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 5: Periodic cleanup of event tracking structures to prevent memory leaks
  useEffect(() => {
    const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
    const SEQUENCE_TRACKER_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

    const cleanupTimestamp = new Map<string, number>();

    const id = window.setInterval(() => {
      const now = Date.now();

      // Clean processed event IDs aggressively
      if (processedEventIdsRef.current.size > 250) {
        const idsArray = Array.from(processedEventIdsRef.current);
        processedEventIdsRef.current = new Set(idsArray.slice(-250));
      }

      // Clean old sequence trackers (contexts not seen in 1 hour)
      const sequenceKeysToDelete: string[] = [];
      for (const key of eventSequenceRef.current.keys()) {
        const lastSeen = cleanupTimestamp.get(key) ?? now;
        if (now - lastSeen > SEQUENCE_TRACKER_MAX_AGE_MS) {
          sequenceKeysToDelete.push(key);
        }
      }
      for (const key of sequenceKeysToDelete) {
        eventSequenceRef.current.delete(key);
        pendingEventsRef.current.delete(key);
        cleanupTimestamp.delete(key);
      }

      // Update cleanup timestamps for active keys
      for (const key of eventSequenceRef.current.keys()) {
        if (!cleanupTimestamp.has(key)) {
          cleanupTimestamp.set(key, now);
        }
      }
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 6: Cleanup poll timeout on unmount to prevent zombie polls
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, []);

  // React-query aware status for consumers
  return useMemo(
    () => ({
      status,
      isLeader,
      queueId: queueIdRef.current,
      lastEventId: lastEventIdRef.current,
    }),
    [status, isLeader]
  );
}
