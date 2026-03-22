'use client';

import React from 'react';

import { MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface QuoteToReviewButtonProps {
  selectedText: string;
  onQuoteSelect?: (quoteText: string) => void;
  className?: string;
  variant?: 'default' | 'transparent' | 'outline' | 'blue';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

/**
 * Button component that converts selected text to a markdown blockquote
 * and optionally inserts it into the review form.
 */
const QuoteToReviewButton: React.FC<QuoteToReviewButtonProps> = ({
  selectedText,
  onQuoteSelect,
  className = '',
  variant = 'transparent',
  size = 'sm',
  showLabel = true,
}) => {
  const handleQuote = () => {
    if (!selectedText.trim()) {
      toast.error('No text selected');
      return;
    }

    // Format as markdown blockquote
    // Handle multi-line text by prefixing each line with >
    const lines = selectedText.trim().split('\n');
    const quoteText = lines.map((line) => `> ${line}`).join('\n');

    // Copy to clipboard
    navigator.clipboard
      .writeText(quoteText)
      .then(() => {
        toast.success('Quote copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy quote');
      });

    // Call the callback to insert into review form if provided
    if (onQuoteSelect) {
      onQuoteSelect(quoteText);
    }
  };

  return (
    <Button
      onClick={handleQuote}
      variant={variant}
      size={size}
      className={`gap-1.5 ${className}`}
      disabled={!selectedText.trim()}
      title="Copy as markdown quote for review"
    >
      <MessageSquareQuote size={14} />
      {showLabel && <span>Quote</span>}
    </Button>
  );
};

export default QuoteToReviewButton;

/**
 * Utility function to format text as a markdown blockquote
 */
export const formatAsBlockquote = (text: string): string => {
  if (!text.trim()) return '';
  const lines = text.trim().split('\n');
  return lines.map((line) => `> ${line}`).join('\n');
};

/**
 * Hook to manage quote selection state and integrate with review forms
 */
export const useQuoteToReview = () => {
  const [pendingQuote, setPendingQuote] = React.useState<string | null>(null);

  const handleQuoteSelect = React.useCallback((quoteText: string) => {
    setPendingQuote(quoteText);
  }, []);

  const consumeQuote = React.useCallback(() => {
    const quote = pendingQuote;
    setPendingQuote(null);
    return quote;
  }, [pendingQuote]);

  const clearQuote = React.useCallback(() => {
    setPendingQuote(null);
  }, []);

  return {
    pendingQuote,
    handleQuoteSelect,
    consumeQuote,
    clearQuote,
    hasQuote: pendingQuote !== null,
  };
};
