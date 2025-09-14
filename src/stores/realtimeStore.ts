import { create } from 'zustand';

interface RealtimeContextState {
  activeArticleId: number | null;
  activeCommunityId: number | null;
  activeDiscussionId: number | null;
  setActiveContext: (articleId: number | null, communityId: number | null) => void;
  setActiveDiscussion: (discussionId: number | null) => void;
  clearActiveContext: () => void;
}

export const useRealtimeContextStore = create<RealtimeContextState>((set) => ({
  activeArticleId: null,
  activeCommunityId: null,
  activeDiscussionId: null,
  setActiveContext: (articleId, communityId) =>
    set({ activeArticleId: articleId, activeCommunityId: communityId }),
  setActiveDiscussion: (discussionId) => set({ activeDiscussionId: discussionId }),
  clearActiveContext: () => set({ activeArticleId: null, activeCommunityId: null }),
}));
