'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

import {
  myappRealtimeApiHeartbeat,
  myappRealtimeApiRegisterQueue,
} from '../api/real-time/real-time';
import { useAuthStore } from '../stores/authStore';
import { useRealtimeContextStore } from '../stores/realtimeStore';
import { useUnreadNotificationsStore } from '../stores/unreadNotificationsStore';
import { isSoundOnDiscussionNotificationEnabled } from './useUserSettings';

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
      [key: string]: any;
    };
    comment?: {
      id?: number;
      author?: {
        username: string;
      };
      content?: string;
      [key: string]: any;
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
    activeDiscussionId,
    isViewingDiscussions,
    isViewingComments,
    isContextFresh,
  } = useRealtimeContextStore();

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const leaderHeartbeatRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Prepare notification sound
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const audio = new Audio('/notification.mp3');
      audio.preload = 'auto';
      audio.volume = 0.75;
      audioRef.current = audio;
    } catch {
      audioRef.current = null;
    }
  }, []);

  const playNotification = useCallback(() => {
    // Check if sound notifications are enabled in user settings
    if (!isSoundOnDiscussionNotificationEnabled()) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch {
      // ignore autoplay restrictions
    }
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
        (oldData: any) => {
          if (!oldData?.data?.items) return oldData;

          const discussion = event.data.discussion;
          if (!discussion?.id) return oldData;

          const items = oldData.data.items;

          switch (event.type) {
            case 'new_discussion': {
              // Check if discussion already exists to prevent duplicates
              const exists = items.some((item: any) => item.id === discussion.id);
              if (exists) return oldData;

              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  items: [{ ...discussion, comments_count: 0, replies: [] }, ...items],
                },
              };
            }

            case 'updated_discussion': {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  items: items.map((item: any) =>
                    item.id === discussion.id ? { ...item, ...discussion } : item
                  ),
                },
              };
            }

            case 'deleted_discussion': {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  items: items.filter((item: any) => item.id !== discussion.id),
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
        (oldData: any) => {
          if (!Array.isArray(oldData?.data)) return oldData;

          const comment = event.data.comment;
          if (!comment?.id) return oldData;

          const parentId = event.data.parent_id;

          const updateCommentsArray = (comments: any[]): any[] => {
            if (!Array.isArray(comments)) return [];

            switch (event.type) {
              case 'new_comment': {
                if (!parentId) {
                  // Top-level comment
                  const exists = comments.some((c: any) => c.id === comment.id);
                  if (exists) return comments;

                  return [...comments, { ...comment, replies: [] }];
                } else {
                  // Reply to existing comment
                  return comments.map((c: any) => {
                    if (c.id === parentId) {
                      const replies = Array.isArray(c.replies) ? c.replies : [];
                      const exists = replies.some((r: any) => r.id === comment.id);
                      if (exists) return c;

                      return { ...c, replies: [...replies, { ...comment, replies: [] }] };
                    } else if (Array.isArray(c.replies)) {
                      // Recursively check nested replies
                      return { ...c, replies: updateCommentsArray(c.replies) };
                    }
                    return c;
                  });
                }
              }

              case 'updated_comment': {
                return comments.map((c: any) => {
                  if (c.id === comment.id) {
                    return { ...c, ...comment };
                  } else if (Array.isArray(c.replies)) {
                    return { ...c, replies: updateCommentsArray(c.replies) };
                  }
                  return c;
                });
              }

              case 'deleted_comment': {
                const filtered = comments.filter((c: any) => c.id !== comment.id);
                return filtered.map((c: any) =>
                  Array.isArray(c.replies) ? { ...c, replies: updateCommentsArray(c.replies) } : c
                );
              }

              default:
                return comments;
            }
          };

          return { ...oldData, data: updateCommentsArray(oldData.data) };
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
          (oldData: any) => {
            if (!oldData?.data?.items) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                items: oldData.data.items.map((item: any) =>
                  item.id === discussionId
                    ? { ...item, comments_count: (item.comments_count || 0) + 1 }
                    : item
                ),
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

      // Filter out already processed events to prevent duplicates
      const newEvents = events.filter((event) => {
        if (processedEventIdsRef.current.has(event.event_id)) {
          return false;
        }
        // Add to processed set
        processedEventIdsRef.current.add(event.event_id);
        return true;
      });

      // Clean up old event IDs (keep only last 1000 to prevent memory leak)
      if (processedEventIdsRef.current.size > 1000) {
        const idsArray = Array.from(processedEventIdsRef.current);
        processedEventIdsRef.current = new Set(idsArray.slice(-500));
      }

      if (!newEvents.length) return;

      // Only broadcast to other tabs if this is NOT from a broadcast (leader tab only)
      if (!fromBroadcast) {
        bc?.postMessage({ type: 'realtime:events', payload: newEvents, senderId: TAB_ID });
      }

      for (const event of newEvents) {
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

          // Show notification and track unread
          if (event.type === 'new_discussion' && event.data.discussion) {
            const username = event.data.discussion.user?.username || 'Unknown user';
            const topic = event.data.discussion.topic || 'Untitled discussion';
            const discussionId = event.data.discussion.id;

            // Add to unread notifications store
            if (discussionId !== undefined) {
              useUnreadNotificationsStore.getState().addUnreadItem(communityId, articleId, {
                id: discussionId,
                type: 'discussion',
              });
            }

            toast.warning(
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-functional-yellow" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-functional-yellow">
                    {username} added a new discussion
                  </div>
                  <div className="line-clamp-1 text-xs text-functional-yellow opacity-90">
                    {topic}
                  </div>
                </div>
              </div>,
              { duration: 4000, position: 'top-right' }
            );
            playNotification();
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

          // Show notification and track unread
          if (event.type === 'new_comment' && event.data.comment) {
            const username = event.data.comment.author?.username || 'Unknown user';
            const content = event.data.comment.content || 'No content';
            const commentId = event.data.comment.id;

            // Add to unread notifications store
            if (commentId !== undefined) {
              useUnreadNotificationsStore.getState().addUnreadItem(communityId, articleId, {
                id: commentId,
                type: event.data.parent_id ? 'reply' : 'comment',
                discussionId: event.data.discussion_id,
                parentId: event.data.parent_id,
              });
            }

            toast.warning(
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-functional-yellow" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-functional-yellow">
                    {username} added a new comment
                  </div>
                  <div className="line-clamp-1 text-xs text-functional-yellow opacity-90">
                    {content}
                  </div>
                </div>
              </div>,
              { duration: 4000, position: 'top-right' }
            );
            playNotification();
          }
        }
      }
    },
    [
      queryClient,
      activeArticleId,
      activeCommunityId,
      activeDiscussionId,
      isViewingDiscussions,
      isViewingComments,
      isContextFresh,
      updateDiscussionsCache,
      updateCommentsCache,
      playNotification,
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
          toast.info('Syncing latest discussions…');
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
    } catch (err: any) {
      // Check for authentication errors first (401/403)
      const httpStatus = err?.response?.status || err?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        queueIdRef.current = null;
        lastEventIdRef.current = null;
        stoppedRef.current = true;
        setStatus('disabled');
        return;
      }

      if (err?.name === 'AbortError') {
        // ignore aborts
      } else if (err?.message === 'No queue_id') {
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
      } else if (err?.message === 'queue_not_found') {
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
          toast.info('Reconnected. Syncing latest discussions…');
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
        window.setTimeout(() => {
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
    } catch (e: any) {
      // Check for auth errors
      const status = e?.response?.status || e?.status;
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
      } catch (err: any) {
        // Check for authentication errors (401)
        const status = err?.response?.status || err?.status;
        if (status === 401 || status === 403) {
          // Auth failed - clear queue state and stop
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

        setStatus('error');
        return false;
      }
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
    } else {
      // User logged out - stop everything
      stoppedRef.current = true;
      queueIdRef.current = null;
      lastEventIdRef.current = null;
      setStatus('disabled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // If leadership changes, start/stop polling accordingly
  useEffect(() => {
    if (!isLeader || loopStartedRef.current) return;
    // Don't start polling if not authenticated
    if (!isAuthenticated || !accessToken) return;
    loopStartedRef.current = true;
    void pollLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeader, isAuthenticated, accessToken]);

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
