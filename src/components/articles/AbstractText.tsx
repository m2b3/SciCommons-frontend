import React from 'react';

import { getArticleSourceFormat } from '@/lib/articleSourceFormat';
import { cn } from '@/lib/utils';

import { ForwardRefEditor } from '../common/MarkdownEditor/ForwardRefEditor';
import RenderParsedHTML from '../common/RenderParsedHTML';

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Added AbstractText wrapper for consistent abstract rendering.
   Why: Preserve author paragraph breaks without repeating RenderParsedHTML flags everywhere.
   How: Wrap RenderParsedHTML with fixed flags and controlled whitespace handling. */
interface AbstractTextProps {
  text: string;
  /** Pass the article's external link to determine format. Omit if link data unavailable. */
  articleLink?: string | null;
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
const normalizePlainText = (input: string) => {
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
  articleLink,
  className,
  containerClassName,
  isShrinked,
  gradientClassName,
}) => {
  const linkKnown = articleLink !== undefined;
  const format = getArticleSourceFormat(articleLink, linkKnown);

  // Use MDXEditor for markdown-only content (syntax highlighting, code blocks, etc.)
  // Fall back to RenderParsedHTML when LaTeX is needed since MDXEditor doesn't support it.
  if (format.supportMarkdown && !format.supportLatex) {
    return (
      <div className={cn('relative', containerClassName)}>
        <ForwardRefEditor markdown={text} readOnly hideToolbar className={className} />
      </div>
    );
  }

  return (
    <RenderParsedHTML
      rawContent={format.supportMarkdown ? text : normalizePlainText(text)}
      {...format}
      isShrinked={isShrinked}
      gradientClassName={gradientClassName}
      containerClassName={containerClassName}
      contentClassName={cn({ 'whitespace-pre-line': !format.supportMarkdown }, className)}
    />
  );
};

export default AbstractText;
