import { create } from 'zustand';

import { useReadItemsStore } from './readItemsStore';

/**
 * Store for tracking subscription unread state.
 *
 * This store handles:
 * 1. Tracking articles with new realtime events (should show as unread)
 * 2. Computing effective unread state by combining:
 *    - API's has_unread_event
 *    - Local read items (from readItemsStore)
 *    - New realtime events
 */

interface SubscriptionUnreadState {
  // Articles with new realtime events (should show as unread)
  // Key: `${communityId}-${articleId}`
  articlesWithNewEvents: Set<string>;

  // Actions
  markArticleHasNewEvent: (communityId: number, articleId: number) => void;
  clearNewEvent: (communityId: number, articleId: number) => void;
  /** Mark article as read when user clicks on sidebar tile (clears both realtime event and marks as cleared) */
  markArticleAsRead: (communityId: number, articleId: number) => void;
  isArticleUnread: (communityId: number, articleId: number, apiHasUnreadEvent: boolean) => boolean;
  getNewEventsCount: () => number;
  reset: () => void;
}

const getKey = (communityId: number, articleId: number) => `${communityId}-${articleId}`;

export const useSubscriptionUnreadStore = create<SubscriptionUnreadState>((set, get) => ({
  articlesWithNewEvents: new Set(),

  markArticleHasNewEvent: (communityId, articleId) => {
    const key = getKey(communityId, articleId);
    set((state) => {
      const newEvents = new Set(state.articlesWithNewEvents);
      newEvents.add(key);
      return { articlesWithNewEvents: newEvents };
    });
  },

  clearNewEvent: (communityId, articleId) => {
    const key = getKey(communityId, articleId);
    set((state) => {
      const newEvents = new Set(state.articlesWithNewEvents);
      newEvents.delete(key);
      return { articlesWithNewEvents: newEvents };
    });
  },

  markArticleAsRead: (communityId, articleId) => {
    const key = getKey(communityId, articleId);

    // Clear realtime event indicator
    set((state) => {
      const newEvents = new Set(state.articlesWithNewEvents);
      newEvents.delete(key);
      return { articlesWithNewEvents: newEvents };
    });

    // Mark article as cleared in readItemsStore (for persistence)
    useReadItemsStore.getState().markArticleCleared(communityId, articleId);
  },

  isArticleUnread: (communityId, articleId, apiHasUnreadEvent) => {
    const key = getKey(communityId, articleId);
    const { articlesWithNewEvents } = get();

    // If there's a new realtime event (in this session), always show as unread
    if (articlesWithNewEvents.has(key)) {
      return true;
    }

    // If API says no unread events, trust it (backend is source of truth)
    if (!apiHasUnreadEvent) {
      return false;
    }

    // API says there are unread events (has_unread_event: true)
    // This means backend has unread items for this article
    // We should show as unread UNLESS user just clicked on this tile (optimistic clear)

    // Check if user has an optimistic clear that hasn't been synced yet
    // We use pendingSyncItems to check if there are items waiting to sync for this article
    // If there are pending items, the user recently read something → don't show unread
    const readItemsStore = useReadItemsStore.getState();
    const articleKey = `${communityId}-${articleId}`;
    const hasPendingReads = readItemsStore
      .getPendingSync()
      .some((item) => item.articleKey === articleKey);

    // If user has pending reads for this article, they just read it → hide unread
    if (hasPendingReads) {
      return false;
    }

    // Also check clearedArticles for click-to-clear (when user clicks tile without reading items)
    // But we need to be smarter - only trust clearedArticles if it was set recently
    // For now, we'll check if the article was cleared AND there are no pending syncs
    // This handles the case where user clicked tile but hasn't read individual items yet
    const isCleared = readItemsStore.isArticleCleared(communityId, articleId);

    // If cleared but API still says unread, check if we have any pending sync for ANY article
    // If we do, we're in an active session and the clear is valid
    // If not, this might be a stale clear from a previous session
    if (isCleared) {
      const totalPending = readItemsStore.getPendingSync().length;
      // If there are any pending syncs, user is active → trust the clear
      // If no pending syncs, this could be stale → trust API
      if (totalPending > 0) {
        return false;
      }
      // No pending syncs - could be stale clear, trust API
      // But also remove from clearedArticles to clean up stale data
      readItemsStore.removeArticleCleared(communityId, articleId);
    }

    // API says unread → show as unread
    return true;
  },

  getNewEventsCount: () => {
    return get().articlesWithNewEvents.size;
  },

  reset: () => {
    set({ articlesWithNewEvents: new Set() });
  },
}));
