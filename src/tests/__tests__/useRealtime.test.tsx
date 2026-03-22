import { renderHook } from '@testing-library/react';

import { useRealtime } from '@/hooks/useRealtime';

const mockUseAuthStore = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueriesData: jest.fn(),
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (
    selector: (state: { accessToken: string | null; isAuthenticated: boolean }) => unknown
  ) => mockUseAuthStore(selector),
}));

jest.mock('@/stores/realtimeStore', () => ({
  useRealtimeContextStore: () => ({
    activeArticleId: null,
    activeCommunityId: null,
    activeDiscussionId: null,
    isViewingDiscussions: false,
    isViewingComments: false,
    isContextFresh: () => true,
  }),
}));

jest.mock('@/api/real-time/real-time', () => ({
  myappRealtimeApiHeartbeat: jest.fn(),
  myappRealtimeApiRegisterQueue: jest.fn(),
}));

describe('useRealtime', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem('realtime_queue_id', 'stale-queue');
    localStorage.setItem('realtime_last_event_id', '123');
    mockUseAuthStore.mockImplementation(
      (selector: (state: { accessToken: string | null; isAuthenticated: boolean }) => unknown) =>
        selector({
          accessToken: null,
          isAuthenticated: false,
        })
    );
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('clears persisted queue state when user is unauthenticated', () => {
    renderHook(() => useRealtime());

    expect(localStorage.getItem('realtime_queue_id')).toBeNull();
    expect(localStorage.getItem('realtime_last_event_id')).toBeNull();
  });
});
