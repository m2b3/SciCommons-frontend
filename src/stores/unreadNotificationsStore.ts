import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Types
export interface UnreadItem {
  id: number;
  type: 'discussion' | 'comment' | 'reply';
  discussionId?: number; // For comments/replies
  parentId?: number | null; // For nested replies
  timestamp: number;
}

export interface ArticleUnreadState {
  articleId: number;
  communityId: number;
  items: UnreadItem[];
  lastActivityAt: number;
}

interface UnreadNotificationsState {
  // Map key: `${communityId}-${articleId}`
  articleUnreads: Record<string, ArticleUnreadState>;

  // Actions
  addUnreadItem: (
    communityId: number,
    articleId: number,
    item: Omit<UnreadItem, 'timestamp'>
  ) => void;
  markItemRead: (
    communityId: number,
    articleId: number,
    itemId: number,
    type: 'discussion' | 'comment' | 'reply'
  ) => void;
  markDiscussionItemsRead: (communityId: number, articleId: number, discussionId: number) => void;
  markArticleRead: (communityId: number, articleId: number) => void;
  getUnreadCount: (communityId: number, articleId: number) => number;
  getTotalUnreadCount: () => number;
  getArticlesSortedByActivity: () => ArticleUnreadState[];
  isItemUnread: (itemId: number, type: 'discussion' | 'comment' | 'reply') => boolean;
  clearAll: () => void;
}

// Helper to generate consistent keys
const getArticleKey = (communityId: number, articleId: number): string =>
  `${communityId}-${articleId}`;

// Cleanup items older than 7 days
const CLEANUP_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const cleanupOldItems = (
  articleUnreads: Record<string, ArticleUnreadState>
): Record<string, ArticleUnreadState> => {
  const cutoff = Date.now() - CLEANUP_THRESHOLD_MS;
  const cleaned: Record<string, ArticleUnreadState> = {};

  Object.entries(articleUnreads).forEach(([key, article]) => {
    const filteredItems = article.items.filter((item) => item.timestamp > cutoff);
    // Only keep articles that have items or recent activity
    if (filteredItems.length > 0 || article.lastActivityAt > cutoff) {
      cleaned[key] = {
        ...article,
        items: filteredItems,
      };
    }
  });

  return cleaned;
};

export const useUnreadNotificationsStore = create<UnreadNotificationsState>()(
  persist(
    (set, get) => ({
      articleUnreads: {},

      addUnreadItem: (communityId, articleId, item) => {
        const key = getArticleKey(communityId, articleId);
        const now = Date.now();

        set((state) => {
          const existing = state.articleUnreads[key];

          // Check if item already exists to prevent duplicates
          if (existing?.items.some((i) => i.id === item.id && i.type === item.type)) {
            // Update lastActivityAt even if item exists
            return {
              articleUnreads: {
                ...state.articleUnreads,
                [key]: {
                  ...existing,
                  lastActivityAt: now,
                },
              },
            };
          }

          const newItem: UnreadItem = {
            ...item,
            timestamp: now,
          };

          if (existing) {
            return {
              articleUnreads: {
                ...state.articleUnreads,
                [key]: {
                  ...existing,
                  items: [...existing.items, newItem],
                  lastActivityAt: now,
                },
              },
            };
          }

          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                articleId,
                communityId,
                items: [newItem],
                lastActivityAt: now,
              },
            },
          };
        });
      },

      markItemRead: (communityId, articleId, itemId, type) => {
        const key = getArticleKey(communityId, articleId);

        set((state) => {
          const existing = state.articleUnreads[key];
          if (!existing) return state;

          const filteredItems = existing.items.filter(
            (item) => !(item.id === itemId && item.type === type)
          );

          // If no items left, we can remove the article entry but keep lastActivityAt for sorting
          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                ...existing,
                items: filteredItems,
              },
            },
          };
        });
      },

      markDiscussionItemsRead: (communityId, articleId, discussionId) => {
        const key = getArticleKey(communityId, articleId);

        set((state) => {
          const existing = state.articleUnreads[key];
          if (!existing) return state;

          // Remove all items related to this discussion (comments and replies)
          // Keep discussions and items that belong to other discussions
          const filteredItems = existing.items.filter(
            (item) => item.type === 'discussion' || item.discussionId !== discussionId
          );

          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                ...existing,
                items: filteredItems,
              },
            },
          };
        });
      },

      markArticleRead: (communityId, articleId) => {
        const key = getArticleKey(communityId, articleId);

        set((state) => {
          const existing = state.articleUnreads[key];
          if (!existing) return state;

          return {
            articleUnreads: {
              ...state.articleUnreads,
              [key]: {
                ...existing,
                items: [], // Clear all items but keep the entry for sorting
              },
            },
          };
        });
      },

      getUnreadCount: (communityId, articleId) => {
        const key = getArticleKey(communityId, articleId);
        const article = get().articleUnreads[key];
        return article?.items.length ?? 0;
      },

      getTotalUnreadCount: () => {
        const { articleUnreads } = get();
        return Object.values(articleUnreads).reduce(
          (total, article) => total + article.items.length,
          0
        );
      },

      getArticlesSortedByActivity: () => {
        const { articleUnreads } = get();
        return Object.values(articleUnreads).sort((a, b) => b.lastActivityAt - a.lastActivityAt);
      },

      isItemUnread: (itemId, type) => {
        const { articleUnreads } = get();
        return Object.values(articleUnreads).some((article) =>
          article.items.some((item) => item.id === itemId && item.type === type)
        );
      },

      clearAll: () => {
        set({ articleUnreads: {} });
      },
    }),
    {
      name: 'unread-notifications-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clean up old items on rehydration
          state.articleUnreads = cleanupOldItems(state.articleUnreads);
        }
      },
    }
  )
);

// BroadcastChannel for cross-tab sync
const BROADCAST_CHANNEL_NAME = 'unread-notifications-sync';

let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

  // Listen for updates from other tabs
  broadcastChannel.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type === 'sync') {
      // Sync the entire state from another tab
      useUnreadNotificationsStore.setState({ articleUnreads: payload });
    }
  };

  // Subscribe to store changes and broadcast to other tabs
  useUnreadNotificationsStore.subscribe((state) => {
    broadcastChannel?.postMessage({
      type: 'sync',
      payload: state.articleUnreads,
    });
  });
}

// Export helper for external sync trigger
export const syncUnreadNotifications = () => {
  const state = useUnreadNotificationsStore.getState();
  broadcastChannel?.postMessage({
    type: 'sync',
    payload: state.articleUnreads,
  });
};
