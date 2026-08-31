
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CommentCategory = 'general' | 'research' | 'anonymous';

export interface DemoNote {
  id: string;
  body: string;
  createdAt: number;
}

export interface DemoComment {
  id: string;
  body: string;
  category: CommentCategory;
  author: string;
  createdAt: number;
}

interface ArticleState {
  notes: DemoNote[];
  comments: DemoComment[];
  liked: boolean;
  likeCount: number;
  bookmarked: boolean;
}

interface DemoFeedState {
  byArticle: Record<string, ArticleState>;
  getArticleState: (pmid: string) => ArticleState;
  addNote: (pmid: string, body: string) => void;
  deleteNote: (pmid: string, id: string) => void;
  addComment: (pmid: string, body: string, category: CommentCategory) => void;
  toggleLike: (pmid: string) => void;
  toggleBookmark: (pmid: string) => void;
}

const EMPTY: ArticleState = {
  notes: [],
  comments: [],
  liked: false,
  likeCount: 0,
  bookmarked: false,
};

// Deterministic pseudo-id: avoids Math.random/Date.now non-determinism warnings and
// is unique enough for a single-user localStorage demo.
let counter = 0;
const newId = () => {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
};

export const useDemoFeedStore = create<DemoFeedState>()(
  persist(
    (set, get) => ({
      byArticle: {},
      getArticleState: (pmid) => get().byArticle[pmid] ?? EMPTY,
      addNote: (pmid, body) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        set((state) => {
          const cur = state.byArticle[pmid] ?? EMPTY;
          return {
            byArticle: {
              ...state.byArticle,
              [pmid]: {
                ...cur,
                notes: [{ id: newId(), body: trimmed, createdAt: Date.now() }, ...cur.notes],
              },
            },
          };
        });
      },
      deleteNote: (pmid, id) => {
        set((state) => {
          const cur = state.byArticle[pmid] ?? EMPTY;
          return {
            byArticle: {
              ...state.byArticle,
              [pmid]: { ...cur, notes: cur.notes.filter((n) => n.id !== id) },
            },
          };
        });
      },
      addComment: (pmid, body, category) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        set((state) => {
          const cur = state.byArticle[pmid] ?? EMPTY;
          const author = category === 'anonymous' ? 'Anonymous' : 'You';
          return {
            byArticle: {
              ...state.byArticle,
              [pmid]: {
                ...cur,
                comments: [
                  { id: newId(), body: trimmed, category, author, createdAt: Date.now() },
                  ...cur.comments,
                ],
              },
            },
          };
        });
      },
      toggleLike: (pmid) => {
        set((state) => {
          const cur = state.byArticle[pmid] ?? EMPTY;
          const liked = !cur.liked;
          return {
            byArticle: {
              ...state.byArticle,
              [pmid]: { ...cur, liked, likeCount: cur.likeCount + (liked ? 1 : -1) },
            },
          };
        });
      },
      toggleBookmark: (pmid) => {
        set((state) => {
          const cur = state.byArticle[pmid] ?? EMPTY;
          return {
            byArticle: {
              ...state.byArticle,
              [pmid]: { ...cur, bookmarked: !cur.bookmarked },
            },
          };
        });
      },
    }),
    {
      name: 'demo-feed-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ byArticle: state.byArticle }),
    }
  )
);
