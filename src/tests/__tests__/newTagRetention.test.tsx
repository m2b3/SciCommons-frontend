import { act, renderHook } from '@testing-library/react';

import { EntityType } from '@/api/schemas';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { useMarkAsReadOnView } from '@/hooks/useMarkAsReadOnView';
import { NEW_TAG_REMOVAL_DELAY_MS } from '@/hooks/useUnreadFlags';
import { useEphemeralUnreadStore } from '@/stores/ephemeralUnreadStore';
import { useNewTagRetentionStore } from '@/stores/newTagRetentionStore';
import { useReadItemsStore } from '@/stores/readItemsStore';

/* Added by Claude on 2026-08-22
   What: Coverage for the persisted NEW badge retention introduced on this branch.
   Why: The review of PR #360 blocked on there being no test for the five-minute timer,
        for retention surviving unmount/remount, for expiry cleanup, or for entity types
        that opt out of retention entirely.
   How: Drive useMarkAsReadOnView through the jest.setup IntersectionObserver stub with fake
        timers, and assert against both the retention store and its localStorage projection. */

const RETENTION_STORAGE_KEY = 'new-tag-retention-storage';
const VISIBILITY_DELAY_MS = 2000;
const COMMENT_ID = 101;
const RETENTION_KEY = `discussion-comment:${COMMENT_ID}`;
const ARTICLE_CONTEXT = { communityId: 7, articleId: 42 };

type MarkAsReadOptions = Parameters<typeof useMarkAsReadOnView>[1];

/** The jest.setup IntersectionObserver stub reports an immediate intersection on observe(). */
const renderNewTagHook = (options: MarkAsReadOptions) => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  // Hoisted outside the render callback so the observer effect does not re-run every render.
  const ref = { current: element };

  return renderHook(() => useMarkAsReadOnView(ref, options));
};

const readPersistedRetentions = (): Record<string, number> => {
  const raw = localStorage.getItem(RETENTION_STORAGE_KEY);
  if (!raw) return {};
  return JSON.parse(raw).state?.retainedUntilByKey ?? {};
};

const retentionOptions = (overrides: Partial<MarkAsReadOptions> = {}): MarkAsReadOptions => ({
  entityId: COMMENT_ID,
  entityType: 'comment',
  hasUnreadFlag: true,
  articleContext: ARTICLE_CONTEXT,
  newTagRemovalDelayMs: FIVE_MINUTES_IN_MS,
  newTagRetentionKey: RETENTION_KEY,
  ...overrides,
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-08-22T09:00:00.000Z'));
  useNewTagRetentionStore.setState({ retainedUntilByKey: {} });
  useReadItemsStore.getState().reset();
  useEphemeralUnreadStore.setState({ items: {} });
  localStorage.clear();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  document.body.innerHTML = '';
});

describe('newTagRetentionStore', () => {
  it('retains a key and clears only that key', () => {
    const { retainNewTag, clearRetention } = useNewTagRetentionStore.getState();
    const retainedUntil = Date.now() + FIVE_MINUTES_IN_MS;

    act(() => {
      retainNewTag(RETENTION_KEY, retainedUntil);
      retainNewTag('discussion-reply:202', retainedUntil);
    });
    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({
      [RETENTION_KEY]: retainedUntil,
      'discussion-reply:202': retainedUntil,
    });

    act(() => clearRetention(RETENTION_KEY));
    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({
      'discussion-reply:202': retainedUntil,
    });
  });

  it('leaves state untouched when clearing an absent key', () => {
    const before = useNewTagRetentionStore.getState().retainedUntilByKey;

    act(() => useNewTagRetentionStore.getState().clearRetention('never-retained'));

    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toBe(before);
  });

  it('clears only retentions that have reached their expiry', () => {
    const now = Date.now();

    act(() => {
      useNewTagRetentionStore.getState().retainNewTag('expired', now - 1);
      useNewTagRetentionStore.getState().retainNewTag('exactly-now', now);
      useNewTagRetentionStore.getState().retainNewTag('future', now + 1);
      useNewTagRetentionStore.getState().clearExpiredRetentions(now);
    });

    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({ future: now + 1 });
  });

  it('projects retentions into localStorage and rehydrates them back', async () => {
    const retainedUntil = Date.now() + FIVE_MINUTES_IN_MS;

    act(() => useNewTagRetentionStore.getState().retainNewTag(RETENTION_KEY, retainedUntil));
    expect(readPersistedRetentions()).toEqual({ [RETENTION_KEY]: retainedUntil });

    // Simulate a page reload: drop in-memory state, then rehydrate from storage.
    useNewTagRetentionStore.setState({ retainedUntilByKey: {} });
    localStorage.setItem(
      RETENTION_STORAGE_KEY,
      JSON.stringify({
        state: { retainedUntilByKey: { [RETENTION_KEY]: retainedUntil } },
        version: 0,
      })
    );
    await useNewTagRetentionStore.persist.rehydrate();

    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({
      [RETENTION_KEY]: retainedUntil,
    });
  });
});

describe('useMarkAsReadOnView with a retention key', () => {
  it('marks the item read on dwell but holds the badge for the full retention window', () => {
    const { result } = renderNewTagHook(retentionOptions());

    expect(result.current.showNewTag).toBe(true);

    act(() => jest.advanceTimersByTime(VISIBILITY_DELAY_MS));

    // Read state is committed immediately; the badge is what lingers.
    expect(useReadItemsStore.getState().isItemRead(COMMENT_ID, EntityType.comment)).toBe(true);
    expect(result.current.showNewTag).toBe(true);
    expect(readPersistedRetentions()).toEqual({
      [RETENTION_KEY]: Date.now() + FIVE_MINUTES_IN_MS,
    });

    act(() => jest.advanceTimersByTime(FIVE_MINUTES_IN_MS - 1));
    expect(result.current.showNewTag).toBe(true);

    act(() => jest.advanceTimersByTime(1));
    expect(result.current.showNewTag).toBe(false);
  });

  it('restores the badge on remount and expires it on the original schedule', () => {
    const first = renderNewTagHook(retentionOptions());

    act(() => jest.advanceTimersByTime(VISIBILITY_DELAY_MS));
    expect(first.result.current.showNewTag).toBe(true);
    first.unmount();

    const awayMs = 60_000;
    act(() => jest.advanceTimersByTime(awayMs));

    // Coming back, the API no longer reports the comment as unread - only the retention can show it.
    const second = renderNewTagHook(retentionOptions({ hasUnreadFlag: false }));
    expect(second.result.current.showNewTag).toBe(true);

    act(() => jest.advanceTimersByTime(FIVE_MINUTES_IN_MS - awayMs - 1));
    expect(second.result.current.showNewTag).toBe(true);

    act(() => jest.advanceTimersByTime(1));
    expect(second.result.current.showNewTag).toBe(false);
  });

  it('shows the badge straight from a rehydrated retention with no dwell', async () => {
    const retainedUntil = Date.now() + FIVE_MINUTES_IN_MS;
    localStorage.setItem(
      RETENTION_STORAGE_KEY,
      JSON.stringify({
        state: { retainedUntilByKey: { [RETENTION_KEY]: retainedUntil } },
        version: 0,
      })
    );
    await useNewTagRetentionStore.persist.rehydrate();

    const { result } = renderNewTagHook(retentionOptions({ hasUnreadFlag: false }));

    expect(result.current.showNewTag).toBe(true);
  });

  it('drops the retention entry from store and storage once it expires', () => {
    renderNewTagHook(retentionOptions());

    act(() => jest.advanceTimersByTime(VISIBILITY_DELAY_MS + FIVE_MINUTES_IN_MS));

    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({});
    expect(readPersistedRetentions()).toEqual({});
  });

  it('does not show a badge for its own already expired retention', () => {
    act(() => useNewTagRetentionStore.getState().retainNewTag(RETENTION_KEY, Date.now() - 1));

    const { result } = renderNewTagHook(retentionOptions({ hasUnreadFlag: false }));

    expect(result.current.showNewTag).toBe(false);
    expect(useNewTagRetentionStore.getState().retainedUntilByKey).not.toHaveProperty(RETENTION_KEY);
  });

  it('prunes expired retentions left behind by other entities on mount', () => {
    // Keys the mounted hook never looks at: only the mount-time sweep can remove them.
    const expiredElsewhere = 'discussion-reply:888';
    const stillLive = 'discussion-comment:999';
    const liveUntil = Date.now() + FIVE_MINUTES_IN_MS;

    act(() => {
      useNewTagRetentionStore.getState().retainNewTag(expiredElsewhere, Date.now() - 1);
      useNewTagRetentionStore.getState().retainNewTag(stillLive, liveUntil);
    });

    renderNewTagHook(retentionOptions({ hasUnreadFlag: false }));

    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({
      [stillLive]: liveUntil,
    });
  });
});

describe('useMarkAsReadOnView without a retention key', () => {
  it('hides the badge after the default delay and persists nothing', () => {
    const { result } = renderNewTagHook({
      entityId: 303,
      entityType: 'comment',
      hasUnreadFlag: true,
      articleContext: ARTICLE_CONTEXT,
    });

    expect(result.current.showNewTag).toBe(true);

    act(() => jest.advanceTimersByTime(VISIBILITY_DELAY_MS));
    expect(result.current.showNewTag).toBe(true);

    act(() => jest.advanceTimersByTime(NEW_TAG_REMOVAL_DELAY_MS));
    expect(result.current.showNewTag).toBe(false);

    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({});
    expect(readPersistedRetentions()).toEqual({});
  });

  it('still hides the badge after the default delay for replies', () => {
    const { result } = renderNewTagHook({
      entityId: 404,
      entityType: 'reply',
      hasUnreadFlag: true,
      articleContext: ARTICLE_CONTEXT,
    });

    act(() => jest.advanceTimersByTime(VISIBILITY_DELAY_MS + NEW_TAG_REMOVAL_DELAY_MS));

    expect(result.current.showNewTag).toBe(false);
    expect(readPersistedRetentions()).toEqual({});
  });
});
