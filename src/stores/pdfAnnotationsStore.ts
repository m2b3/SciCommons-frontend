import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Annotation color types matching the UI design
export type AnnotationColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

// Color mapping for CSS classes and hex values
export const ANNOTATION_COLORS: Record<AnnotationColor, { bg: string; hex: string }> = {
  red: { bg: 'bg-red-300/10', hex: '#fca5a5' },
  orange: { bg: 'bg-orange-300/10', hex: '#fdba74' },
  yellow: { bg: 'bg-yellow-300/10', hex: '#fde047' },
  teal: { bg: 'bg-teal-300/10', hex: '#5eead4' },
  blue: { bg: 'bg-blue-300/10', hex: '#93c5fd' },
  purple: { bg: 'bg-purple-300/10', hex: '#d8b4fe' },
  pink: { bg: 'bg-pink-300/10', hex: '#f9a8d4' },
  gray: { bg: 'bg-gray-300/10', hex: '#d1d5db' },
};

// Highlight area from react-pdf-viewer
export interface HighlightArea {
  height: number;
  left: number;
  pageIndex: number;
  top: number;
  width: number;
}

export interface PDFAnnotation {
  id: string;
  articleSlug: string;
  pdfUrl: string;
  pageIndex: number;
  highlightAreas: HighlightArea[];
  selectedText: string;
  note: string;
  color: AnnotationColor;
  createdAt: string;
  updatedAt: string;
}

interface PDFAnnotationsState {
  annotations: PDFAnnotation[];

  // CRUD operations
  addAnnotation: (annotation: Omit<PDFAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAnnotation: (id: string, updates: Partial<PDFAnnotation>) => void;
  deleteAnnotation: (id: string) => void;

  // Query operations
  getAnnotationsForArticle: (articleSlug: string) => PDFAnnotation[];
  getAnnotationsForPdf: (articleSlug: string, pdfUrl: string) => PDFAnnotation[];
  getAnnotationById: (id: string) => PDFAnnotation | undefined;

  // Bulk operations for future backend sync
  setAnnotations: (annotations: PDFAnnotation[]) => void;
  clearAnnotationsForArticle: (articleSlug: string) => void;

  // Export/Import for future sync
  exportAnnotations: (articleSlug: string) => string;
  importAnnotations: (jsonData: string) => void;
}

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const usePdfAnnotationsStore = create<PDFAnnotationsState>()(
  persist(
    (set, get) => ({
      annotations: [],

      addAnnotation: (annotationData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newAnnotation: PDFAnnotation = {
          ...annotationData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          annotations: [...state.annotations, newAnnotation],
        }));

        return id;
      },

      updateAnnotation: (id, updates) => {
        set((state) => ({
          annotations: state.annotations.map((annotation) =>
            annotation.id === id
              ? { ...annotation, ...updates, updatedAt: new Date().toISOString() }
              : annotation
          ),
        }));
      },

      deleteAnnotation: (id) => {
        set((state) => ({
          annotations: state.annotations.filter((annotation) => annotation.id !== id),
        }));
      },

      getAnnotationsForArticle: (articleSlug) => {
        return get().annotations.filter((a) => a.articleSlug === articleSlug);
      },

      getAnnotationsForPdf: (articleSlug, pdfUrl) => {
        return get().annotations.filter(
          (a) => a.articleSlug === articleSlug && a.pdfUrl === pdfUrl
        );
      },

      getAnnotationById: (id) => {
        return get().annotations.find((a) => a.id === id);
      },

      setAnnotations: (annotations) => {
        set({ annotations });
      },

      clearAnnotationsForArticle: (articleSlug) => {
        set((state) => ({
          annotations: state.annotations.filter((a) => a.articleSlug !== articleSlug),
        }));
      },

      exportAnnotations: (articleSlug) => {
        const annotations = get().getAnnotationsForArticle(articleSlug);
        return JSON.stringify(annotations, null, 2);
      },

      importAnnotations: (jsonData) => {
        try {
          const imported: PDFAnnotation[] = JSON.parse(jsonData);
          if (!Array.isArray(imported)) {
            throw new Error('Invalid annotation data format');
          }

          set((state) => {
            // Merge imported annotations, avoiding duplicates by ID
            const existingIds = new Set(state.annotations.map((a) => a.id));
            const newAnnotations = imported.filter((a) => !existingIds.has(a.id));
            return {
              annotations: [...state.annotations, ...newAnnotations],
            };
          });
        } catch (error) {
          console.error('Failed to import annotations:', error);
          throw error;
        }
      },
    }),
    {
      name: 'pdf-annotations-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
