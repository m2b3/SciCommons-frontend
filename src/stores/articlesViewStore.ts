import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ArticlesViewType = 'grid' | 'list' | 'preview';

interface ArticlesViewState {
  viewType: ArticlesViewType;
  setViewType: (viewType: ArticlesViewType) => void;
  gridCount: number;
  setGridCount: (gridCount: number) => void;
}

const DEFAULT_VIEW_TYPE: ArticlesViewType = 'grid';
const DEFAULT_GRID_COUNT = 3;

export const useArticlesViewStore = create<ArticlesViewState>()(
  persist(
    (set) => ({
      viewType: DEFAULT_VIEW_TYPE,
      setViewType: (viewType: ArticlesViewType) => {
        set({ viewType });
      },
      gridCount: DEFAULT_GRID_COUNT,
      setGridCount: (gridCount: number) => {
        set({ gridCount });
      },
    }),
    {
      name: 'articles-view-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
