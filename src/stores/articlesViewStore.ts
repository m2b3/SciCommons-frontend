import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ArticlesViewType = 'grid' | 'list' | 'preview';

interface ArticlesViewState {
  viewType: ArticlesViewType;
  setViewType: (viewType: ArticlesViewType) => void;
}

const DEFAULT_VIEW_TYPE: ArticlesViewType = 'grid';

export const useArticlesViewStore = create<ArticlesViewState>()(
  persist(
    (set) => ({
      viewType: DEFAULT_VIEW_TYPE,
      setViewType: (viewType: ArticlesViewType) => {
        set({ viewType });
      },
    }),
    {
      name: 'articles-view-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
