import { create } from 'zustand';

interface RealtimeContextState {
  activeArticleId: number | null;
  activeCommunityId: number | null;
  activeDiscussionId: number | null;
  // Track if we're currently viewing discussions or comments
  isViewingDiscussions: boolean;
  isViewingComments: boolean;
  // Track context timestamps for debugging and freshness
  contextSetAt: number | null;

  setActiveContext: (articleId: number | null, communityId: number | null) => void;
  setActiveDiscussion: (discussionId: number | null) => void;
  setViewingDiscussions: (viewing: boolean) => void;
  setViewingComments: (viewing: boolean, discussionId?: number | null) => void;
  clearActiveContext: () => void;

  // Helper to check if context is fresh (set recently)
  isContextFresh: () => boolean;
}

export const useRealtimeContextStore = create<RealtimeContextState>((set, get) => ({
  activeArticleId: null,
  activeCommunityId: null,
  activeDiscussionId: null,
  isViewingDiscussions: false,
  isViewingComments: false,
  contextSetAt: null,

  setActiveContext: (articleId, communityId) => {
    set({
      activeArticleId: articleId,
      activeCommunityId: communityId,
      contextSetAt: Date.now(),
    });
  },

  setActiveDiscussion: (discussionId) => {
    set({ activeDiscussionId: discussionId });
  },

  setViewingDiscussions: (viewing) => {
    set({
      isViewingDiscussions: viewing,
      isViewingComments: viewing ? false : get().isViewingComments,
    });
  },

  setViewingComments: (viewing, discussionId) => {
    set({
      isViewingComments: viewing,
      isViewingDiscussions: viewing ? false : get().isViewingDiscussions,
      activeDiscussionId: discussionId ?? get().activeDiscussionId,
    });
  },

  clearActiveContext: () => {
    set({
      activeArticleId: null,
      activeCommunityId: null,
      activeDiscussionId: null,
      isViewingDiscussions: false,
      isViewingComments: false,
      contextSetAt: null,
    });
  },

  isContextFresh: () => {
    const { contextSetAt } = get();
    if (!contextSetAt) return false;
    // Consider context fresh if set within last 30 seconds
    return Date.now() - contextSetAt < 30000;
  },
}));
