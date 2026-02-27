import React from 'react';

import { cn } from '@/lib/utils';

import RenderParsedHTML from '../common/RenderParsedHTML';

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Added AbstractText wrapper for consistent abstract rendering.
   Why: Preserve author paragraph breaks without repeating RenderParsedHTML flags everywhere.
   How: Wrap RenderParsedHTML with fixed flags and controlled whitespace handling. */
interface AbstractTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
  isShrinked?: boolean;
  gradientClassName?: string;
}

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Normalize hard-wrapped abstract text before rendering.
   Why: Imported abstracts often include single line breaks that force a narrow column layout.
   How: Replace single newlines with spaces while preserving consecutive blank lines. */
const normalizeAbstractText = (input: string) => {
  const normalizedInput = input.replace(/\r\n/g, '\n');
  const preservedBreaks: string[] = [];
  const breakToken = '__SC_ABSTRACT_BREAK__';
  const withTokens = normalizedInput.replace(/\n{2,}/g, (match) => {
    const index = preservedBreaks.push(match) - 1;
    return `${breakToken}${index}${breakToken}`;
  });
  const softened = withTokens.replace(/\n/g, ' ');
  return softened.replace(new RegExp(`${breakToken}(\\d+)${breakToken}`, 'g'), (_match, index) => {
    return preservedBreaks[Number(index)];
  });
};

const AbstractText: React.FC<AbstractTextProps> = ({
  text,
  className,
  containerClassName,
  isShrinked,
  gradientClassName,
}) => {
  return (
    <RenderParsedHTML
      rawContent={normalizeAbstractText(text)}
      supportLatex={true}
      supportMarkdown={false}
      isShrinked={isShrinked}
      gradientClassName={gradientClassName}
      containerClassName={containerClassName}
      /* Fixed by Codex on 2026-02-15
         Who: Codex
         What: Preserve paragraph breaks without enforcing hard wraps.
         Why: Abstracts should reflow to window width while keeping intentional blank lines.
         How: Use pre-line spacing so double newlines render as paragraphs. */
      contentClassName={cn('whitespace-pre-line', className)}
    />
  );
};

export default AbstractText;
