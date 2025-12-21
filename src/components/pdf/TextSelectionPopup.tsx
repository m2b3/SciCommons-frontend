'use client';

import React, { useState } from 'react';

import { Check, Lock, MessageSquareQuote, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  ANNOTATION_COLORS,
  AnnotationColor,
  HighlightArea,
  usePdfAnnotationsStore,
} from '@/stores/pdfAnnotationsStore';

interface TextSelectionPopupProps {
  selectedText: string;
  highlightAreas: HighlightArea[];
  articleSlug: string;
  pdfUrl: string;
  pageIndex: number;
  selectionRegion?: HighlightArea;
  onClose: () => void;
  onQuoteSelect?: (text: string) => void;
}

const TextSelectionPopup: React.FC<TextSelectionPopupProps> = ({
  selectedText,
  highlightAreas,
  articleSlug,
  pdfUrl,
  pageIndex,
  selectionRegion,
  onClose,
  onQuoteSelect,
}) => {
  const [selectedColor, setSelectedColor] = useState<AnnotationColor>('yellow');
  const [note, setNote] = useState('');
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  const { addAnnotation } = usePdfAnnotationsStore();

  const colorOptions: AnnotationColor[] = [
    'red',
    'orange',
    'yellow',
    'teal',
    'blue',
    'purple',
    'pink',
    'gray',
  ];

  const handleHighlight = () => {
    addAnnotation({
      articleSlug,
      pdfUrl,
      pageIndex,
      highlightAreas,
      selectedText,
      note,
      color: selectedColor,
    });

    toast.success('Highlight saved');
    onClose();
  };

  const handleQuote = () => {
    const quoteText = `> ${selectedText.replace(/\n/g, '\n> ')}`;

    // Copy to clipboard
    navigator.clipboard.writeText(quoteText).then(() => {
      toast.success('Quote copied to clipboard');
    });

    // If onQuoteSelect is provided, call it to insert into review
    if (onQuoteSelect) {
      onQuoteSelect(quoteText);
    }

    onClose();
  };

  // Calculate position based on selection region
  const getPopupStyle = (): React.CSSProperties => {
    if (!selectionRegion) {
      return {};
    }

    // Estimate popup height (approximately 250px) as percentage
    // Assuming average page height, we'll use a conservative estimate
    const estimatedPopupHeightPercent = 15; // Rough estimate for popup height
    const gap = 0.2; // 0.2% gap - minimal gap for better visual connection
    const bottomThreshold = 75; // If selection bottom is below 75%, show above instead

    const selectionBottom = selectionRegion.top + selectionRegion.height;
    const shouldShowAbove = selectionBottom > bottomThreshold;

    // Calculate horizontal position (center of selection, but keep within bounds)
    let leftPercent = selectionRegion.left + selectionRegion.width / 2;
    const popupWidthPercent = 40; // Rough estimate for popup width
    const minLeft = popupWidthPercent / 2; // Keep at least half popup width from left edge
    const maxLeft = 100 - popupWidthPercent / 2; // Keep at least half popup width from right edge
    leftPercent = Math.max(minLeft, Math.min(maxLeft, leftPercent));

    // Calculate vertical position
    let topPercent: number;
    let transform: string;

    if (shouldShowAbove) {
      // Position above the selection
      topPercent = selectionRegion.top - estimatedPopupHeightPercent - gap;
      // Ensure it doesn't go above the page
      topPercent = Math.max(2, topPercent);
      transform = 'translate(-50%, -100%)'; // Center horizontally and position above
    } else {
      // Position below the selection
      topPercent = selectionBottom + gap;
      transform = 'translate(-50%, 2px)'; // Center horizontally with minimal gap (2px)
    }

    return {
      position: 'absolute',
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      transform,
      zIndex: 50,
    };
  };

  return (
    <div
      className="min-w-[280px] max-w-[320px] rounded-lg border border-common-minimal bg-common-cardBackground p-3 shadow-lg"
      style={getPopupStyle()}
    >
      {/* Header with close button */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-text-tertiary" />
          <span className="text-sm font-medium text-text-secondary">Private Note</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-text-tertiary transition-colors hover:bg-common-minimal hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      {/* Selected text preview */}
      <div className="mb-3 max-h-[60px] overflow-hidden rounded border border-common-minimal bg-common-background p-2">
        <p className="line-clamp-2 text-xs text-text-tertiary">{selectedText}</p>
      </div>

      {/* Note input */}
      <div className="mb-3">
        {isNoteExpanded ? (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add text here..."
            className="h-20 w-full resize-none rounded border border-common-minimal bg-common-background p-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-functional-blue focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsNoteExpanded(true)}
            className="w-full rounded border border-dashed border-common-minimal p-2 text-left text-sm text-text-tertiary transition-colors hover:border-common-contrast hover:bg-common-minimal"
          >
            Add text here...
          </button>
        )}
      </div>

      {/* Color picker */}
      <div className="mb-3 flex items-center gap-2">
        {colorOptions.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`relative h-6 w-6 rounded-full transition-transform hover:scale-110 ${
              selectedColor === color ? 'ring-2 ring-functional-blue ring-offset-2' : ''
            }`}
            style={{ backgroundColor: ANNOTATION_COLORS[color].hex }}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
          >
            {selectedColor === color && (
              <Check
                size={12}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-text-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleHighlight}
          variant="blue"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: ANNOTATION_COLORS[selectedColor].hex }}
          />
          Highlight
        </Button>

        <Button
          onClick={handleQuote}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          title="Use in Review"
        >
          <MessageSquareQuote size={14} />
          Quote
        </Button>
      </div>
    </div>
  );
};

export default TextSelectionPopup;
