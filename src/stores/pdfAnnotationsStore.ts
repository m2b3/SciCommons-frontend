import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// NOTE(bsureshkrishna, 2026-02-07): PDF annotation state added after baseline 5271498.
// Persists highlights/notes locally and supports future backend sync/export.
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

// Fixed by Claude Sonnet 4.5 on 2026-02-08
// Issue 12: Validate annotation structure before importing to prevent malformed data
const validateHighlightArea = (obj: unknown): obj is HighlightArea => {
  if (!obj || typeof obj !== 'object') return false;
  const area = obj as Record<string, unknown>;
  return (
    typeof area.height === 'number' &&
    typeof area.left === 'number' &&
    typeof area.pageIndex === 'number' &&
    typeof area.top === 'number' &&
    typeof area.width === 'number' &&
    area.height >= 0 &&
    area.width >= 0 &&
    Number.isInteger(area.pageIndex) &&
    area.pageIndex >= 0
  );
};

const validateAnnotation = (obj: unknown): obj is PDFAnnotation => {
  if (!obj || typeof obj !== 'object') return false;
  const ann = obj as Record<string, unknown>;

  // Check required string fields
  if (
    typeof ann.id !== 'string' ||
    typeof ann.articleSlug !== 'string' ||
    typeof ann.pdfUrl !== 'string' ||
    typeof ann.selectedText !== 'string' ||
    typeof ann.note !== 'string' ||
    typeof ann.color !== 'string' ||
    typeof ann.createdAt !== 'string' ||
    typeof ann.updatedAt !== 'string'
  ) {
    return false;
  }

  // Check pageIndex is a valid non-negative integer
  if (typeof ann.pageIndex !== 'number' || !Number.isInteger(ann.pageIndex) || ann.pageIndex < 0) {
    return false;
  }

  // Check color is valid AnnotationColor
  const validColors = ['red', 'orange', 'yellow', 'teal', 'blue', 'purple', 'pink', 'gray'];
  if (!validColors.includes(ann.color as string)) {
    return false;
  }

  // Validate highlightAreas array
  if (!Array.isArray(ann.highlightAreas) || ann.highlightAreas.length === 0) {
    return false;
  }

  // Validate each highlight area
  for (const area of ann.highlightAreas) {
    if (!validateHighlightArea(area)) {
      return false;
    }
  }

  // Validate date strings
  try {
    const createdDate = new Date(ann.createdAt as string);
    const updatedDate = new Date(ann.updatedAt as string);
    if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
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
          const imported: unknown = JSON.parse(jsonData);
          if (!Array.isArray(imported)) {
            throw new Error('Invalid annotation data format: expected array');
          }

          // Fixed by Claude Sonnet 4.5 on 2026-02-08
          // Issue 12: Validate each annotation before importing
          const validAnnotations: PDFAnnotation[] = [];
          const errors: string[] = [];

          for (let i = 0; i < imported.length; i++) {
            const item = imported[i];
            if (validateAnnotation(item)) {
              validAnnotations.push(item);
            } else {
              errors.push(`Invalid annotation at index ${i}`);
            }
          }

          // Log validation results
          if (errors.length > 0) {
            console.warn(
              `[PDF Annotations] Import validation: ${errors.length} invalid items skipped`
            );
            errors.forEach((err) => console.warn(`[PDF Annotations] ${err}`));
          }

          if (validAnnotations.length === 0) {
            throw new Error('No valid annotations found in import data');
          }

          set((state) => {
            // Merge imported annotations, avoiding duplicates by ID
            const existingIds = new Set(state.annotations.map((a) => a.id));
            const newAnnotations = validAnnotations.filter((a) => !existingIds.has(a.id));

            console.log(
              `[PDF Annotations] Imported ${newAnnotations.length} annotations (${validAnnotations.length - newAnnotations.length} duplicates skipped)`
            );

            return {
              annotations: [...state.annotations, ...newAnnotations],
            };
          });
        } catch (error) {
          console.error('[PDF Annotations] Failed to import:', error);
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
