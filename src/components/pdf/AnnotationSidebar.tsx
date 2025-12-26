'use client';

import React, { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Edit2,
  FileText,
  MessageSquareQuote,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  ANNOTATION_COLORS,
  AnnotationColor,
  PDFAnnotation,
  usePdfAnnotationsStore,
} from '@/stores/pdfAnnotationsStore';

dayjs.extend(relativeTime);

interface AnnotationSidebarProps {
  articleSlug: string;
  pdfUrl?: string;
  onQuoteSelect?: (text: string) => void;
  onAnnotationClick?: (annotation: PDFAnnotation) => void;
  onJumpToAnnotation?: (area: {
    pageIndex: number;
    top: number;
    left: number;
    height: number;
    width: number;
  }) => void;
}

const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({
  articleSlug,
  pdfUrl,
  onQuoteSelect,
  onAnnotationClick,
  onJumpToAnnotation,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'page'>('date');

  const {
    annotations,
    getAnnotationsForArticle,
    getAnnotationsForPdf,
    updateAnnotation,
    deleteAnnotation,
    exportAnnotations,
    importAnnotations,
  } = usePdfAnnotationsStore();

  // Get annotations based on whether pdfUrl is provided
  const filteredAnnotations = useMemo(() => {
    const items = pdfUrl
      ? getAnnotationsForPdf(articleSlug, pdfUrl)
      : getAnnotationsForArticle(articleSlug);

    // Sort annotations
    return [...items].sort((a, b) => {
      if (sortBy === 'page') {
        return a.pageIndex - b.pageIndex;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [articleSlug, pdfUrl, annotations, sortBy, getAnnotationsForArticle, getAnnotationsForPdf]);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStartEdit = (annotation: PDFAnnotation) => {
    setEditingId(annotation.id);
    setEditNote(annotation.note);
  };

  const handleSaveEdit = (id: string) => {
    updateAnnotation(id, { note: editNote });
    setEditingId(null);
    setEditNote('');
    toast.success('Note updated', {
      position: 'top-right',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNote('');
  };

  const handleDelete = (id: string) => {
    deleteAnnotation(id);
    toast.success('Annotation deleted', {
      position: 'top-right',
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', {
      position: 'top-right',
    });
  };

  const handleQuote = (text: string) => {
    const quoteText = `> ${text.replace(/\n/g, '\n> ')}`;
    navigator.clipboard.writeText(quoteText);
    toast.success('Quote copied to clipboard', {
      position: 'top-right',
    });
    if (onQuoteSelect) {
      onQuoteSelect(quoteText);
    }
  };

  const handleExport = () => {
    const data = exportAnnotations(articleSlug);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${articleSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Annotations exported', {
      position: 'top-right',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            importAnnotations(data);
            toast.success('Annotations imported', {
              position: 'top-right',
            });
          } catch (error) {
            toast.error('Failed to import annotations', {
              position: 'top-right',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleChangeColor = (id: string, color: AnnotationColor) => {
    updateAnnotation(id, { color });
    toast.success('Color updated', {
      position: 'top-right',
    });
  };

  if (filteredAnnotations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <FileText size={48} className="mb-4 text-text-tertiary" />
        <h3 className="mb-2 text-base font-medium text-text-secondary">No annotations yet</h3>
        <p className="text-sm text-text-tertiary">
          Select text in the PDF and add highlights or notes
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-common-minimal p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Annotations ({filteredAnnotations.length})
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="transparent"
              size="sm"
              onClick={handleImport}
              className="h-7 w-7 p-0"
              title="Import annotations"
            >
              <Upload size={14} />
            </Button>
            <Button
              variant="transparent"
              size="sm"
              onClick={handleExport}
              className="h-7 w-7 p-0"
              title="Export annotations"
            >
              <Download size={14} />
            </Button>
          </div>
        </div>
        <span className="text-xxs italic text-text-tertiary">
          (Annotations are saved locally in your browser.)
        </span>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">Sort by:</span>
          <button
            onClick={() => setSortBy('date')}
            className={`text-xs ${
              sortBy === 'date' ? 'font-medium text-functional-blue' : 'text-text-tertiary'
            }`}
          >
            Date
          </button>
          <span className="text-text-tertiary">|</span>
          <button
            onClick={() => setSortBy('page')}
            className={`text-xs ${
              sortBy === 'page' ? 'font-medium text-functional-blue' : 'text-text-tertiary'
            }`}
          >
            Page
          </button>
        </div>
      </div>

      {/* Annotations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredAnnotations.map((annotation) => (
          <div
            key={annotation.id}
            className="border-b border-common-minimal p-3 transition-colors hover:bg-common-minimal/50"
          >
            {/* Annotation header */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: ANNOTATION_COLORS[annotation.color].hex }}
                />
                <span className="text-xs text-text-tertiary">Page {annotation.pageIndex + 1}</span>
                <span className="text-xs text-text-tertiary">•</span>
                <span className="text-xs text-text-tertiary">
                  {dayjs(annotation.createdAt).fromNow()}
                </span>
              </div>

              <button
                onClick={() => handleToggleExpand(annotation.id)}
                className="text-text-tertiary hover:text-text-primary"
              >
                {expandedId === annotation.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Selected text preview */}
            <p
              className={`mb-2 cursor-pointer text-sm text-text-primary hover:text-functional-blue ${
                expandedId === annotation.id ? '' : 'line-clamp-2'
              }`}
              onClick={() => {
                // Jump to the annotation in the PDF
                if (onJumpToAnnotation && annotation.highlightAreas.length > 0) {
                  const firstArea = annotation.highlightAreas[0];
                  onJumpToAnnotation({
                    pageIndex: firstArea.pageIndex,
                    top: firstArea.top,
                    left: firstArea.left,
                    height: firstArea.height,
                    width: firstArea.width,
                  });
                }
                onAnnotationClick?.(annotation);
              }}
              title="Click to jump to this annotation"
            >
              {annotation.selectedText}
            </p>

            {/* Note (if exists) */}
            {annotation.note && (
              <div className="mb-2 rounded bg-common-background p-2">
                {editingId === annotation.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="h-16 w-full resize-none rounded border border-common-minimal bg-common-cardBackground p-2 text-xs text-text-primary focus:border-functional-blue focus:outline-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="transparent"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-6 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="blue"
                        size="sm"
                        onClick={() => handleSaveEdit(annotation.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary">{annotation.note}</p>
                )}
              </div>
            )}

            {/* Actions (expanded) */}
            {expandedId === annotation.id && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {/* Color picker */}
                <div className="mr-2 flex items-center gap-1">
                  {(
                    [
                      'red',
                      'orange',
                      'yellow',
                      'teal',
                      'blue',
                      'purple',
                      'pink',
                      'gray',
                    ] as AnnotationColor[]
                  ).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleChangeColor(annotation.id, color)}
                      className={`h-4 w-4 rounded-full transition-transform hover:scale-110 ${
                        annotation.color === color
                          ? 'ring-1 ring-functional-blue ring-offset-1'
                          : ''
                      }`}
                      style={{ backgroundColor: ANNOTATION_COLORS[color].hex }}
                      title={color}
                    />
                  ))}
                </div>

                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => handleCopyText(annotation.selectedText)}
                  className="h-6 gap-1 px-2 text-xs"
                >
                  <Copy size={12} />
                  Copy
                </Button>

                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => handleQuote(annotation.selectedText)}
                  className="h-6 gap-1 px-2 text-xs"
                >
                  <MessageSquareQuote size={12} />
                  Quote
                </Button>

                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => handleStartEdit(annotation)}
                  className="h-6 gap-1 px-2 text-xs"
                >
                  <Edit2 size={12} />
                  {annotation.note ? 'Edit' : 'Add Note'}
                </Button>

                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => handleDelete(annotation.id)}
                  className="!hover:text-functional-red h-6 gap-1 px-2 text-xs !text-functional-red"
                >
                  <Trash2 size={12} />
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotationSidebar;
