import { act, renderHook } from '@testing-library/react';

type QueryFilter = {
  predicate?: (query: { queryKey: readonly unknown[] }) => boolean;
};

type QueryUpdater = (oldData: unknown) => unknown;

type RealtimeTestEvent = {
  type: string;
  data: Record<string, unknown>;
  community_ids: number[];
  timestamp: string;
  event_id: number;
};

const mockQueryClient = {
  setQueriesData: jest.fn(),
  invalidateQueries: jest.fn(),
};

// Hoisted so tests can assert on it. Returning a fresh jest.fn() from getState() would
// discard the calls before an assertion could see them.
const mockMarkArticleHasNewEvent = jest.fn();

const mockAuthState = {
  accessToken: null as string | null,
  isAuthenticated: false,
  user: { id: 9, username: 'viewer' },
};

const mockUseAuthStore = jest.fn((selector: (state: typeof mockAuthState) => unknown) =>
  selector(mockAuthState)
) as jest.Mock & {
  getState: jest.Mock;
};
mockUseAuthStore.getState = jest.fn(() => mockAuthState);

const mockRealtimeContext = {
  activeArticleId: null as number | null,
  activeCommunityId: null as number | null,
  activeDiscussionId: null as number | null,
  isViewingDiscussions: false,
  isViewingComments: false,
  isContextFresh: () => true,
};

const broadcastListeners = new Set<(event: MessageEvent) => void>();

class MockBroadcastChannel {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  postMessage = jest.fn();

  addEventListener(type: string, listener: EventListener) {
    if (type === 'message') {
      broadcastListeners.add(listener as (event: MessageEvent) => void);
    }
  }

  removeEventListener(type: string, listener: EventListener) {
    if (type === 'message') {
      broadcastListeners.delete(listener as (event: MessageEvent) => void);
    }
  }

  close() {}
}

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

jest.mock('@/stores/realtimeStore', () => ({
  useRealtimeContextStore: () => mockRealtimeContext,
}));

jest.mock('@/stores/ephemeralUnreadStore', () => ({
  useEphemeralUnreadStore: {
    getState: () => ({
      markItemUnread: jest.fn(),
      cleanupExpired: jest.fn(),
    }),
  },
}));

jest.mock('@/stores/subscriptionUnreadStore', () => ({
  useSubscriptionUnreadStore: {
    getState: () => ({
      markArticleHasNewEvent: mockMarkArticleHasNewEvent,
    }),
  },
}));

jest.mock('@/stores/realtimeNotificationStore', () => ({
  useRealtimeNotificationStore: {
    getState: () => ({
      addNotification: jest.fn(),
    }),
  },
}));

jest.mock('@/stores/readItemsStore', () => ({
  startSyncTimer: jest.fn(),
  stopSyncTimer: jest.fn(),
}));

jest.mock('@/lib/mentionNotifications', () => ({
  captureMentionNotification: jest.fn(),
}));

jest.mock('@/api/real-time/real-time', () => ({
  myappRealtimeApiHeartbeat: jest.fn(),
  myappRealtimeApiRegisterQueue: jest.fn(),
}));

const emitRealtimeEvents = (events: RealtimeTestEvent[]) => {
  act(() => {
    broadcastListeners.forEach((listener) => {
      listener({
        data: {
          type: 'realtime:events',
          payload: events,
          senderId: 'remote-tab',
        },
      } as MessageEvent);
    });
  });
};

const getMatchingSetQueriesDataUpdater = (queryKey: readonly unknown[]): QueryUpdater => {
  const call = mockQueryClient.setQueriesData.mock.calls.find(([filter]: [QueryFilter]) =>
    filter.predicate?.({ queryKey })
  );

  if (!call) {
    throw new Error(`No setQueriesData call matched ${JSON.stringify(queryKey)}`);
  }

  return call[1] as QueryUpdater;
};

describe('useRealtime', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let useRealtime: typeof import('@/hooks/useRealtime').useRealtime;

  beforeAll(() => {
    Object.defineProperty(window, 'BroadcastChannel', {
      value: MockBroadcastChannel,
      configurable: true,
    });

    ({ useRealtime } = require('@/hooks/useRealtime'));
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    broadcastListeners.clear();
    localStorage.clear();
    localStorage.setItem('realtime_queue_id', 'stale-queue');
    localStorage.setItem('realtime_last_event_id', '123');
    mockAuthState.accessToken = null;
    mockAuthState.isAuthenticated = false;
    mockRealtimeContext.activeArticleId = null;
    mockRealtimeContext.activeCommunityId = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('clears persisted queue state when user is unauthenticated', () => {
    const { unmount } = renderHook(() => useRealtime());

    expect(localStorage.getItem('realtime_queue_id')).toBeNull();
    expect(localStorage.getItem('realtime_last_event_id')).toBeNull();

    unmount();
  });

  it('prepends realtime review creates to matching article review list caches', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'new_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: {
            id: 202,
            article_id: 42,
            subject: 'New review',
            content: 'New content',
            rating: 5,
            comments_count: 0,
          },
        },
        community_ids: [7],
        timestamp: '2026-06-27T00:00:00Z',
        event_id: 1,
      },
    ]);

    const updater = getMatchingSetQueriesDataUpdater([
      '/api/articles/42/reviews/',
      { community_id: 7 },
    ]);
    const updated = updater({
      data: {
        items: [{ id: 101, subject: 'Existing review' }],
        total: 1,
      },
    }) as { data: { items: Array<{ id: number; subject: string }>; total: number } };

    expect(updated.data.items.map((review) => review.id)).toEqual([202, 101]);
    expect(updated.data.total).toBe(2);

    unmount();
  });

  it('updates the targeted review instead of only the first review in the list', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'updated_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: {
            id: 202,
            article_id: 42,
            subject: 'Updated second review',
            content: 'Updated body',
            rating: 4,
          },
        },
        community_ids: [7],
        timestamp: '2026-06-27T00:00:00Z',
        event_id: 2,
      },
    ]);

    const updater = getMatchingSetQueriesDataUpdater([
      '/api/articles/42/reviews/',
      { community_id: 7 },
    ]);
    const updated = updater({
      data: {
        items: [
          { id: 101, subject: 'First review', content: 'First body' },
          { id: 202, subject: 'Second review', content: 'Second body' },
        ],
        total: 2,
      },
    }) as { data: { items: Array<{ id: number; subject: string; content: string }> } };

    expect(updated.data.items).toEqual([
      { id: 101, subject: 'First review', content: 'First body' },
      {
        id: 202,
        article_id: 42,
        subject: 'Updated second review',
        content: 'Updated body',
        rating: 4,
      },
    ]);

    unmount();
  });

  it('merges logical review deletions into the matching review cache entry', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'deleted_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: {
            id: 202,
            article_id: 42,
            subject: '[deleted]',
            content: '[deleted]',
            deleted_at: '2026-06-27T00:00:00Z',
          },
        },
        community_ids: [7],
        timestamp: '2026-06-27T00:00:00Z',
        event_id: 3,
      },
    ]);

    const updater = getMatchingSetQueriesDataUpdater([
      '/api/articles/42/reviews/',
      { community_id: 7 },
    ]);
    const updated = updater({
      data: {
        items: [
          { id: 101, subject: 'First review', content: 'First body' },
          { id: 202, subject: 'Second review', content: 'Second body', deleted_at: null },
        ],
        total: 2,
      },
    }) as {
      data: {
        items: Array<{ id: number; subject: string; content: string; deleted_at?: string | null }>;
      };
    };

    expect(updated.data.items[0].subject).toBe('First review');
    expect(updated.data.items[1]).toMatchObject({
      id: 202,
      subject: '[deleted]',
      content: '[deleted]',
      deleted_at: '2026-06-27T00:00:00Z',
    });

    unmount();
  });

  it('updates review caches stored under the custom [reviews, articleId, communityId] key', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'new_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: { id: 202, subject: 'New review', content: 'New content', rating: 5 },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:00Z',
        event_id: 1,
      },
    ]);

    const updater = getMatchingSetQueriesDataUpdater(['reviews', 42, 7]);
    const updated = updater({
      data: { items: [{ id: 101, subject: 'Existing review' }], total: 1 },
    }) as { data: { items: Array<{ id: number }>; total: number } };

    expect(updated.data.items.map((review) => review.id)).toEqual([202, 101]);
    expect(updated.data.total).toBe(2);

    unmount();
  });

  it('does not treat another article’s custom reviews key as a match', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'new_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: { id: 202, subject: 'New review' },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:00Z',
        event_id: 1,
      },
    ]);

    // Different article, and same article in a different community.
    expect(() => getMatchingSetQueriesDataUpdater(['reviews', 99, 7])).toThrow();
    expect(() => getMatchingSetQueriesDataUpdater(['reviews', 42, 8])).toThrow();

    unmount();
  });

  it('does not leak a community review into another community or the no-community list', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'new_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: { id: 202, subject: 'Private community review' },
        },
        community_ids: [7],
        timestamp: '2026-08-22T00:00:00Z',
        event_id: 1,
      },
    ]);

    // The generated key carries the community in its params object. Matching on the article
    // portion of the URL alone let this event rewrite every cached list for the article.
    expect(() =>
      getMatchingSetQueriesDataUpdater(['/api/articles/42/reviews/', { community_id: 8 }])
    ).toThrow();

    // list_reviews serves community=None reviews when community_id is omitted, so neither of
    // these caches may receive a community review.
    expect(() =>
      getMatchingSetQueriesDataUpdater(['/api/articles/42/reviews/', {}])
    ).toThrow();
    expect(() => getMatchingSetQueriesDataUpdater(['/api/articles/42/reviews/'])).toThrow();

    // Same article id embedded in a different endpoint must not match either.
    expect(() =>
      getMatchingSetQueriesDataUpdater(['/api/articles/420/reviews/', { community_id: 7 }])
    ).toThrow();

    // The correctly scoped cache still updates.
    const updater = getMatchingSetQueriesDataUpdater([
      '/api/articles/42/reviews/',
      { community_id: 7 },
    ]);
    const updated = updater({
      data: { items: [{ id: 101 }], total: 1 },
    }) as { data: { items: Array<{ id: number }>; total: number } };

    expect(updated.data.items.map((review) => review.id)).toEqual([202, 101]);

    unmount();
  });


  it('marks the article as having a new event for review and review-comment creates', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'new_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: { id: 202, subject: 'New review' },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:00Z',
        event_id: 1,
      },
    ]);

    expect(mockMarkArticleHasNewEvent).toHaveBeenCalledWith(7, 42);

    mockMarkArticleHasNewEvent.mockClear();

    emitRealtimeEvents([
      {
        type: 'new_review_comment',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          comment_id: 303,
          parent_id: null,
          review_comment: { id: 303, content: 'Nice work', replies: [] },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:01Z',
        event_id: 2,
      },
    ]);

    expect(mockMarkArticleHasNewEvent).toHaveBeenCalledWith(7, 42);

    unmount();
  });

  it('does not mark the article unread for review updates or deletions', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'updated_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: { id: 202, subject: 'Edited' },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:00Z',
        event_id: 1,
      },
      {
        type: 'deleted_review',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          review: { id: 202, subject: '[deleted]' },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:01Z',
        event_id: 2,
      },
      {
        type: 'deleted_review_comment',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          comment_id: 303,
          review_comment: { id: 303, content: '[deleted]', replies: [] },
        },
        community_ids: [7],
        timestamp: '2026-07-29T00:00:02Z',
        event_id: 3,
      },
    ]);

    expect(mockMarkArticleHasNewEvent).not.toHaveBeenCalled();

    unmount();
  });

  it('inserts realtime review replies into the matching review comment tree', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'new_review_comment',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          comment_id: 302,
          parent_id: 301,
          is_reply: true,
          review_comment: {
            id: 302,
            content: 'Reply from another reviewer',
            replies: [],
          },
        },
        community_ids: [7],
        timestamp: '2026-06-27T00:00:00Z',
        event_id: 4,
      },
    ]);

    const updater = getMatchingSetQueriesDataUpdater(['/api/articles/reviews/202/comments/']);
    const updated = updater({
      data: [{ id: 301, content: 'Parent comment', replies: [] }],
    }) as { data: Array<{ id: number; replies: Array<{ id: number; content: string }> }> };

    expect(updated.data[0].replies).toEqual([
      {
        id: 302,
        content: 'Reply from another reviewer',
        replies: [],
      },
    ]);

    unmount();
  });

  it('merges realtime review-comment deletions recursively and keeps the deleted marker', () => {
    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'deleted_review_comment',
        data: {
          article_id: 42,
          community_id: 7,
          review_id: 202,
          comment_id: 302,
          parent_id: 301,
          is_reply: true,
          review_comment: {
            id: 302,
            content: '[deleted]',
            is_deleted: true,
            replies: [],
          },
        },
        community_ids: [7],
        timestamp: '2026-06-27T00:00:00Z',
        event_id: 5,
      },
    ]);

    const commentsUpdater = getMatchingSetQueriesDataUpdater([
      '/api/articles/reviews/202/comments/',
    ]);
    const updatedComments = commentsUpdater({
      data: [
        {
          id: 301,
          content: 'Parent comment',
          replies: [{ id: 302, content: 'Nested reply', is_deleted: false, replies: [] }],
        },
      ],
    }) as { data: Array<{ replies: Array<{ content: string; is_deleted: boolean }> }> };

    expect(updatedComments.data[0].replies[0]).toMatchObject({
      content: '[deleted]',
      is_deleted: true,
    });

    const reviewListUpdater = getMatchingSetQueriesDataUpdater([
      '/api/articles/42/reviews/',
      { community_id: 7 },
    ]);
    const updatedReviews = reviewListUpdater({
      data: {
        items: [{ id: 202, comments_count: 3 }],
        total: 1,
      },
    }) as { data: { items: Array<{ comments_count: number }> } };

    expect(updatedReviews.data.items[0].comments_count).toBe(2);

    unmount();
  });

  it('handles id-only discussion delete events', () => {
    mockRealtimeContext.activeArticleId = 42;
    mockRealtimeContext.activeCommunityId = 7;

    const { unmount } = renderHook(() => useRealtime());

    emitRealtimeEvents([
      {
        type: 'deleted_discussion',
        data: {
          article_id: 42,
          community_id: 7,
          discussion_id: 501,
        },
        community_ids: [7],
        timestamp: '2026-06-27T00:00:00Z',
        event_id: 6,
      },
    ]);

    const updater = getMatchingSetQueriesDataUpdater(['/api/articles/42/discussions/']);
    const updated = updater({
      data: {
        items: [
          { id: 501, topic: 'Deleted' },
          { id: 502, topic: 'Still here' },
        ],
      },
    }) as { data: { items: Array<{ id: number; topic: string }> } };

    expect(updated.data.items).toEqual([{ id: 502, topic: 'Still here' }]);

    unmount();
  });
});
