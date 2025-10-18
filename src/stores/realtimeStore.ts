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
    console.log(`[Realtime] Setting context: article=${articleId}, community=${communityId}`);
    set({
      activeArticleId: articleId,
      activeCommunityId: communityId,
      contextSetAt: Date.now(),
    });
  },

  setActiveDiscussion: (discussionId) => {
    console.log(`[Realtime] Setting discussion: ${discussionId}`);
    set({ activeDiscussionId: discussionId });
  },

  setViewingDiscussions: (viewing) => {
    console.log(`[Realtime] Setting viewing discussions: ${viewing}`);
    set({
      isViewingDiscussions: viewing,
      isViewingComments: viewing ? false : get().isViewingComments,
    });
  },

  setViewingComments: (viewing, discussionId) => {
    console.log(`[Realtime] Setting viewing comments: ${viewing}, discussion: ${discussionId}`);
    set({
      isViewingComments: viewing,
      isViewingDiscussions: viewing ? false : get().isViewingDiscussions,
      activeDiscussionId: discussionId ?? get().activeDiscussionId,
    });
  },

  clearActiveContext: () => {
    console.log(`[Realtime] Clearing context`);
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
