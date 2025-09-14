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
      user?: {
        username: string;
      };
      topic?: string;
    };
    comment?: {
      author?: {
        username: string;
      };
      content?: string;
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
const LEADER_TTL_MS = 10_000; // leader write frequency
const MAX_RETRIES = 10; // stop after this many consecutive failures

const STORAGE_KEYS = {
  QUEUE_ID: 'realtime_queue_id',
  LAST_EVENT_ID: 'realtime_last_event_id',
  LEADER: 'realtime_leader',
};

const bc =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('realtime')
    : null;

function isPollSuccess(r: PollResponse): r is PollSuccess {
  return (r as PollSuccess).events !== undefined;
}

export function useRealtime() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const activeArticleId = useRealtimeContextStore((s) => s.activeArticleId);
  const activeCommunityId = useRealtimeContextStore((s) => s.activeCommunityId);
  const activeDiscussionId = useRealtimeContextStore((s) => s.activeDiscussionId);

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const leaderHeartbeatRef = useRef<number | null>(null);
  const isLeaderRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const queueIdRef = useRef<string | null>(null);
  const lastEventIdRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const backoffRef = useRef<number>(1000);
  const retryCountRef = useRef<number>(0);
  const stoppedRef = useRef<boolean>(false);
  const isPollingRef = useRef<boolean>(false);
  const loopStartedRef = useRef<boolean>(false);
  const pendingEventsRef = useRef<Array<{ ev: RealtimeEvent; ts: number }>>([]);

  const writeLeaderHeartbeat = useCallback((tabId: string) => {
    const payload = { tabId, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEYS.LEADER, JSON.stringify(payload));
    } catch {
      // ignore
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

  // Broadcast received from leader → propagate events and status
  useEffect(() => {
    if (!bc) return;
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg?.type === 'realtime:events') {
        handleEvents(msg.payload as RealtimeEvent[]);
      } else if (msg?.type === 'realtime:status') {
        setStatus(msg.payload as ConnectionStatus);
      }
    };
    bc.addEventListener('message', onMessage);
    return () => bc.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // storage listener to detect leader loss
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
      // ignore
    }
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
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch {
      // ignore autoplay restrictions
    }
  }, []);

  const loadQueueState = useCallback(() => {
    const q = localStorage.getItem(STORAGE_KEYS.QUEUE_ID);
    const l = localStorage.getItem(STORAGE_KEYS.LAST_EVENT_ID);
    queueIdRef.current = q;
    lastEventIdRef.current = l ? Number(l) : null;
  }, []);

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
        if (res.status === 404) {
          throw new Error('queue_not_found');
        }
        throw new Error(`poll_http_${res.status}`);
      }
      const data = (await res.json()) as PollResponse;
      return data;
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
    }
  }, []);

  const handleEvents = useCallback(
    (events: RealtimeEvent[]) => {
      if (!events?.length) return;
      // Broadcast to other tabs
      bc?.postMessage({ type: 'realtime:events', payload: events });

      for (const ev of events) {
        const articleId = ev.data.article_id;
        switch (ev.type) {
          case 'new_discussion':
          case 'updated_discussion':
          case 'deleted_discussion': {
            const matchesCommunity =
              typeof ev.data?.community_id === 'number'
                ? ev.data.community_id === activeCommunityId
                : Array.isArray(ev.community_ids)
                  ? ev.community_ids.includes(activeCommunityId as number)
                  : false;
            const shouldUpdateInPlace =
              !!activeArticleId && !!activeCommunityId
                ? activeArticleId === ev.data.article_id && matchesCommunity
                : false;

            if (shouldUpdateInPlace && articleId) {
              // Optimistic in-place update for list cache
              queryClient.setQueriesData(
                { queryKey: [`/api/articles/${articleId}/discussions/`], exact: false },
                (old: any) => {
                  if (!old?.data?.items) return old;
                  if (ev.type === 'new_discussion' && ev.data.discussion) {
                    const d = ev.data.discussion as any;
                    // Prepend if not present
                    const exists = old.data.items.some((x: any) => x.id === d.id);
                    if (exists) return old;
                    return { ...old, data: { ...old.data, items: [d, ...old.data.items] } };
                  }
                  if (ev.type === 'updated_discussion' && ev.data.discussion) {
                    const d = ev.data.discussion as any;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        items: old.data.items.map((x: any) => (x.id === d.id ? { ...x, ...d } : x)),
                      },
                    };
                  }
                  if (ev.type === 'deleted_discussion' && ev.data.discussion) {
                    const d = ev.data.discussion as any;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        items: old.data.items.filter((x: any) => x.id !== d.id),
                      },
                    };
                  }
                  return old;
                }
              );
              // Also update the component's custom key used in DiscussionForum
              queryClient.setQueriesData(
                { queryKey: ['discussions', articleId, activeCommunityId], exact: false },
                (old: any) => {
                  if (!old?.data?.items) return old;
                  if (ev.type === 'new_discussion' && ev.data.discussion) {
                    const d = ev.data.discussion as any;
                    const exists = old.data.items.some((x: any) => x.id === d.id);
                    if (exists) return old;
                    return { ...old, data: { ...old.data, items: [d, ...old.data.items] } };
                  }
                  if (ev.type === 'updated_discussion' && ev.data.discussion) {
                    const d = ev.data.discussion as any;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        items: old.data.items.map((x: any) => (x.id === d.id ? { ...x, ...d } : x)),
                      },
                    };
                  }
                  if (ev.type === 'deleted_discussion' && ev.data.discussion) {
                    const d = ev.data.discussion as any;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        items: old.data.items.filter((x: any) => x.id !== d.id),
                      },
                    };
                  }
                  return old;
                }
              );
            } else {
              // If context not ready yet after refresh, buffer for a short window
              if (!activeArticleId || !activeCommunityId) {
                pendingEventsRef.current.push({ ev, ts: Date.now() });
              }
              // Fallback: invalidate
              if (articleId) {
                queryClient.invalidateQueries({
                  queryKey: [`/api/articles/${articleId}/discussions/`],
                  exact: false,
                });
                queryClient.invalidateQueries({
                  queryKey: ['discussions', articleId, activeCommunityId],
                  exact: false,
                });
              } else {
                queryClient.invalidateQueries({
                  predicate: (q) =>
                    Array.isArray(q.queryKey) &&
                    typeof q.queryKey[0] === 'string' &&
                    (q.queryKey[0] as string).includes('/api/articles/') &&
                    (q.queryKey[0] as string).includes('/discussions'),
                });
              }
            }
            break;
          }
          case 'new_comment':
          case 'updated_comment':
          case 'deleted_comment': {
            // Invalidate comment lists for the affected discussion
            const discussionId = ev.data.discussion_id;
            const matchesCommunity2 =
              typeof ev.data?.community_id === 'number'
                ? ev.data.community_id === activeCommunityId
                : Array.isArray(ev.community_ids)
                  ? ev.community_ids.includes(activeCommunityId as number)
                  : false;
            const shouldUpdateInPlace =
              !!activeArticleId && !!activeCommunityId
                ? activeArticleId === ev.data.article_id && matchesCommunity2
                : false;

            if (shouldUpdateInPlace && discussionId) {
              queryClient.setQueriesData(
                { queryKey: [`/api/articles/discussions/${discussionId}/comments/`], exact: false },
                (old: any) => {
                  if (!Array.isArray(old?.data)) return old;
                  const c = (ev.data.comment || {}) as any;
                  const parentId = ev.data.parent_id ?? null;

                  const addOrUpdate = (arr: any[]): any[] => {
                    if (!Array.isArray(arr)) return arr;
                    if (!c || c.id == null) return arr;
                    if (!parentId) {
                      if (ev.type === 'new_comment') {
                        const exists = arr.some((x: any) => x.id === c.id);
                        return exists ? arr : [...arr, { replies: [], ...c }];
                      }
                      if (ev.type === 'updated_comment') {
                        return arr.map((x: any) => (x.id === c.id ? { ...x, ...c } : x));
                      }
                      if (ev.type === 'deleted_comment') {
                        return arr.filter((x: any) => x.id !== c.id);
                      }
                      return arr;
                    }
                    // With parent; recurse to attach under parent.replies
                    return arr.map((x: any) => {
                      if (x.id === parentId) {
                        const replies = Array.isArray(x.replies) ? x.replies : [];
                        if (ev.type === 'new_comment') {
                          const exists = replies.some((r: any) => r.id === c.id);
                          return exists
                            ? x
                            : { ...x, replies: [...replies, { replies: [], ...c }] };
                        }
                        if (ev.type === 'updated_comment') {
                          return {
                            ...x,
                            replies: replies.map((r: any) => (r.id === c.id ? { ...r, ...c } : r)),
                          };
                        }
                        if (ev.type === 'deleted_comment') {
                          return { ...x, replies: replies.filter((r: any) => r.id !== c.id) };
                        }
                        return x;
                      }
                      // Recurse deeper for nested replies
                      if (Array.isArray(x.replies) && x.replies.length > 0) {
                        return { ...x, replies: addOrUpdate(x.replies) };
                      }
                      return x;
                    });
                  };

                  return { ...old, data: addOrUpdate(old.data) };
                }
              );
              // Also update potential custom keys used by components for comments
              queryClient.setQueriesData(
                { queryKey: ['discussion-comments', discussionId], exact: false },
                (old: any) => {
                  if (!Array.isArray(old?.data)) return old;
                  const c = (ev.data.comment || {}) as any;
                  const parentId = ev.data.parent_id ?? null;

                  const addOrUpdate = (arr: any[]): any[] => {
                    if (!Array.isArray(arr)) return arr;
                    if (!c || c.id == null) return arr;
                    if (!parentId) {
                      if (ev.type === 'new_comment') {
                        const exists = arr.some((x: any) => x.id === c.id);
                        return exists ? arr : [...arr, { replies: [], ...c }];
                      }
                      if (ev.type === 'updated_comment') {
                        return arr.map((x: any) => (x.id === c.id ? { ...x, ...c } : x));
                      }
                      if (ev.type === 'deleted_comment') {
                        return arr.filter((x: any) => x.id !== c.id);
                      }
                      return arr;
                    }
                    return arr.map((x: any) => {
                      if (x.id === parentId) {
                        const replies = Array.isArray(x.replies) ? x.replies : [];
                        if (ev.type === 'new_comment') {
                          const exists = replies.some((r: any) => r.id === c.id);
                          return exists
                            ? x
                            : { ...x, replies: [...replies, { replies: [], ...c }] };
                        }
                        if (ev.type === 'updated_comment') {
                          return {
                            ...x,
                            replies: replies.map((r: any) => (r.id === c.id ? { ...r, ...c } : r)),
                          };
                        }
                        if (ev.type === 'deleted_comment') {
                          return { ...x, replies: replies.filter((r: any) => r.id !== c.id) };
                        }
                        return x;
                      }
                      if (Array.isArray(x.replies) && x.replies.length > 0) {
                        return { ...x, replies: addOrUpdate(x.replies) };
                      }
                      return x;
                    });
                  };

                  return { ...old, data: addOrUpdate(old.data) };
                }
              );
              // If a new top-level comment arrives while user views discussion, bump comments_count in the discussions list cache
              if (ev.type === 'new_comment') {
                const isTopLevel = !ev.data.parent_id;
                if (isTopLevel) {
                  queryClient.setQueriesData(
                    { queryKey: [`/api/articles/${articleId}/discussions/`], exact: false },
                    (old: any) => {
                      if (!old?.data?.items) return old;
                      return {
                        ...old,
                        data: {
                          ...old.data,
                          items: old.data.items.map((x: any) =>
                            x.id === discussionId
                              ? { ...x, comments_count: (x.comments_count || 0) + 1 }
                              : x
                          ),
                        },
                      };
                    }
                  );
                  queryClient.setQueriesData(
                    { queryKey: ['discussions', articleId, activeCommunityId], exact: false },
                    (old: any) => {
                      if (!old?.data?.items) return old;
                      return {
                        ...old,
                        data: {
                          ...old.data,
                          items: old.data.items.map((x: any) =>
                            x.id === discussionId
                              ? { ...x, comments_count: (x.comments_count || 0) + 1 }
                              : x
                          ),
                        },
                      };
                    }
                  );
                }
              }
            } else {
              if (!activeArticleId || !activeCommunityId) {
                pendingEventsRef.current.push({ ev, ts: Date.now() });
              }
              if (discussionId) {
                queryClient.invalidateQueries({
                  queryKey: [`/api/articles/discussions/${discussionId}/comments/`],
                  exact: false,
                });
                queryClient.invalidateQueries({
                  queryKey: ['discussion-comments', discussionId],
                  exact: false,
                });
              } else {
                queryClient.invalidateQueries({
                  predicate: (q) =>
                    Array.isArray(q.queryKey) &&
                    q.queryKey.some(
                      (k) => typeof k === 'string' && (k as string).includes('/api/discussions')
                    ),
                });
              }
            }
            break;
          }
        }
      }
    },
    [queryClient, activeArticleId, activeCommunityId, activeDiscussionId]
  );

  // When context becomes available (e.g., after refresh), reprocess recent buffered events
  useEffect(() => {
    if (!activeArticleId || !activeCommunityId) return;
    if (!pendingEventsRef.current.length) return;
    const cutoff = Date.now() - 15_000; // only last 15s
    const recent = pendingEventsRef.current.filter((x) => x.ts >= cutoff).map((x) => x.ev);
    pendingEventsRef.current = [];
    if (recent.length) {
      handleEvents(recent);
    }
  }, [activeArticleId, activeCommunityId, handleEvents]);

  const pollLoop = useCallback(async () => {
    if (!isLeader || stoppedRef.current) {
      loopStartedRef.current = false;
      return;
    }
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      if (!REALTIME_URL) {
        setStatus('disabled');
        await new Promise((r) => setTimeout(r, 10_000));
        return;
      }
      setStatus((s) => (s === 'idle' ? 'connecting' : s));
      const res = await fetchPoll();
      if (isPollSuccess(res)) {
        const { events, last_event_id } = res;
        if (events.length) {
          handleEvents(events);
          // Toast each event with a single-line preview
          let shouldPlay = false;
          for (const ev of events) {
            const preview =
              (ev.data?.discussion && (ev.data.discussion as any)?.title) ||
              (ev.data?.comment && (ev.data.comment as any)?.content) ||
              '';
            const trimmed =
              typeof preview === 'string' ? preview.replace(/\s+/g, ' ').slice(0, 80) : '';
            if (ev.type === 'new_discussion') {
              shouldPlay = true;
              const username = ev.data.discussion?.user?.username || 'Unknown user';
              const topic = ev.data.discussion?.topic || 'Untitled discussion';
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
                {
                  duration: 4000,
                  position: 'top-right',
                }
              );
            } else if (ev.type === 'new_comment') {
              shouldPlay = true;
              const username = ev.data.comment?.author?.username || 'Unknown user';
              const content = ev.data.comment?.content || 'No content';
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
                {
                  duration: 4000,
                  position: 'top-right',
                }
              );
            } else if (ev.type === 'updated_discussion') {
              toast.warning(
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-functional-yellow" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-functional-yellow">
                      Discussion updated
                    </div>
                    <div className="line-clamp-1 text-xs text-functional-yellow opacity-90">
                      {trimmed}
                    </div>
                  </div>
                </div>,
                {
                  duration: 4000,
                  position: 'top-right',
                }
              );
            } else if (ev.type === 'updated_comment') {
              toast.warning(
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-functional-yellow" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-functional-yellow">Comment updated</div>
                    <div className="line-clamp-1 text-xs text-functional-yellow opacity-90">
                      {trimmed}
                    </div>
                  </div>
                </div>,
                {
                  duration: 4000,
                  position: 'top-right',
                }
              );
            }
          }
          if (shouldPlay) {
            playNotification();
          }
        }
        saveQueueState(queueIdRef.current as string, last_event_id);
        lastEventIdRef.current = last_event_id;
        setStatus('connected');
        backoffRef.current = 1000; // reset
        retryCountRef.current = 0; // reset consecutive failure counter on success
      } else {
        // catchup required
        setStatus('reconnecting');
        // re-register to reset last_event_id baseline
        try {
          await registerQueue(true);
          retryCountRef.current = 0;
        } catch {
          // registration failed; apply backoff and count failure
          retryCountRef.current += 1;
          if (retryCountRef.current >= MAX_RETRIES) {
            stoppedRef.current = true;
            setStatus('disabled'); // fail silently after cap
            return;
          }
          await new Promise((r) => setTimeout(r, backoffRef.current));
          backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
        }
        // Invalidate discussions/comments broadly
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey.some(
              (k) =>
                typeof k === 'string' &&
                ((k as string).includes('/api/discussions') ||
                  (k as string).includes('/api/articles/'))
            ),
        });
        toast.info('Syncing latest discussions…');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // ignore aborts (timeout or teardown)
      } else if (err?.message === 'queue_not_found') {
        setStatus('reconnecting');
        try {
          await registerQueue(true);
          retryCountRef.current = 0;
        } catch {
          // registration failed; apply backoff and count failure
          retryCountRef.current += 1;
          if (retryCountRef.current >= MAX_RETRIES) {
            stoppedRef.current = true;
            setStatus('disabled');
            return;
          }
          await new Promise((r) => setTimeout(r, backoffRef.current));
          backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
          // do not show any toast here (fail silently)
          return;
        }
        // Force baseline refresh same as catch-up path
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey.some(
              (k) =>
                typeof k === 'string' &&
                ((k as string).includes('/api/discussions') ||
                  (k as string).includes('/api/articles/'))
            ),
        });
        toast.info('Reconnected. Syncing latest discussions…');
      } else {
        setStatus('error');
        // backoff before retry and cap retries
        retryCountRef.current += 1;
        if (retryCountRef.current >= MAX_RETRIES) {
          stoppedRef.current = true;
          setStatus('disabled'); // stop polling silently
        } else {
          await new Promise((r) => setTimeout(r, backoffRef.current));
          backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
        }
      }
    } finally {
      isPollingRef.current = false;
      // schedule next iteration without recursion growth
      if (!stoppedRef.current && isLeader) {
        window.setTimeout(() => {
          void pollLoop();
        }, 0);
      } else {
        loopStartedRef.current = false;
      }
    }
  }, [fetchPoll, handleEvents, isLeader, queryClient]);

  const sendHeartbeat = useCallback(async () => {
    if (!queueIdRef.current || !accessToken) return;
    try {
      await myappRealtimeApiHeartbeat(
        { queue_id: queueIdRef.current },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (e) {
      // On heartbeat failure, trigger re-register
      await registerQueue(true);
    }
  }, [accessToken]);

  const heartbeatLoop = useCallback(() => {
    const id = window.setInterval(() => {
      if (isLeaderRef.current) {
        void sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sendHeartbeat]);

  // No activity gating: always heartbeat while leader & tab open

  const registerQueue = useCallback(
    async (force?: boolean) => {
      if (!isAuthenticated || !accessToken) {
        setStatus('disabled');
        return;
      }
      loadQueueState();
      if (!force && queueIdRef.current && lastEventIdRef.current !== null) {
        return; // already registered
      }
      setStatus('connecting');
      const { data } = await myappRealtimeApiRegisterQueue({
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      saveQueueState(data.queue_id, data.last_event_id);
      bc?.postMessage({ type: 'realtime:status', payload: 'connected' satisfies ConnectionStatus });
      setStatus('connected');
    },
    [accessToken, isAuthenticated, loadQueueState, saveQueueState]
  );

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
      void registerQueue(true);
    } else {
      setStatus('disabled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // If leadership changes, start/stop polling accordingly
  useEffect(() => {
    isLeaderRef.current = isLeader;
    if (!isLeader || loopStartedRef.current) return;
    loopStartedRef.current = true;
    void pollLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLeader]);

  // Keep status in other tabs updated
  useEffect(() => {
    bc?.postMessage({ type: 'realtime:status', payload: status });
  }, [status]);

  // Periodically attempt to become leader if none is active
  useEffect(() => {
    if (isLeader) return;
    const id = window.setInterval(() => {
      tryBecomeLeader();
    }, LEADER_TTL_MS);
    return () => clearInterval(id);
  }, [isLeader, tryBecomeLeader]);

  // react-query aware status for consumers
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
