import React, { useEffect, useMemo, useRef, useState } from 'react';

import DOMPurify from 'dompurify';
import katex, { KatexOptions } from 'katex';
import { ChevronsDown } from 'lucide-react';
import { Renderer, marked } from 'marked';

import { ENABLE_SHOW_MORE, markdownStyles } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

// NOTE(bsureshkrishna, 2026-02-07): Centralized safe markdown/LaTeX rendering after baseline 5271498.
// Uses DOMPurify for XSS protection and optional "show more" truncation for long content.
// Type to ensure at least one of supportMarkdown or supportLatex is true
type SupportConfig =
  | { supportMarkdown: true; supportLatex?: boolean }
  | { supportMarkdown?: boolean; supportLatex: true };

const RenderParsedHTML = ({
  rawContent,
  isShrinked = false,
  containerClassName,
  contentClassName,
  gradientClassName,
  supportMarkdown = true,
  supportLatex = true,
  flattenHeadings = false,
}: {
  rawContent: string;
  isShrinked?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  gradientClassName?: string;
  flattenHeadings?: boolean;
} & SupportConfig) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const processLatex = (content: string): string => {
    try {
      let processedContent = content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '');

      const katexOptions: KatexOptions = {
        displayMode: true,
        output: 'mathml' as const,
        trust: false,
        strict: false,
        throwOnError: false,
        macros: {
          '\\idotsint': '\\int\\cdots\\int',
          '\\iiiint': '\\int\\int\\int\\int',
          '\\iiint': '\\int\\int\\int',
          '\\iint': '\\int\\int',
        },
        maxSize: 10,
        maxExpand: 1000,
        fleqn: false,
        leqno: false,
        minRuleThickness: 0.05,
        colorIsTextColor: false,
      };

      // Process LaTeX environments (equation, equation*, align, align*, gather, gather*, etc.)
      // This regex matches \begin{envname}...\end{envname} environments
      processedContent = processedContent.replace(
        /\\begin\{(equation\*?|align\*?|gather\*?|split|multline\*?|alignat\*?|flalign\*?|eqnarray\*?)\}([\s\S]*?)\\end\{\1\}/g,
        (match, _envName, _expr) => {
          try {
            return katex.renderToString(match, {
              ...katexOptions,
              displayMode: true,
            });
          } catch (e) {
            // Return the original LaTeX expression as-is
            console.warn('LaTeX environment rendering failed:', e);
            return match;
          }
        }
      );

      // Process block math
      processedContent = processedContent.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
        try {
          return katex.renderToString(expr, {
            ...katexOptions,
            displayMode: true,
          });
        } catch (e) {
          // Return the original LaTeX expression as-is
          console.warn('Block math rendering failed:', e);
          return match;
        }
      });

      // Process inline math
      processedContent = processedContent.replace(/(?<!\\)\$(.+?)(?<!\\)\$/g, (match, expr) => {
        try {
          return katex.renderToString(expr, {
            ...katexOptions,
            displayMode: false,
          });
        } catch (e) {
          // Return the original LaTeX expression as-is
          console.warn('Inline math rendering failed:', e);
          return match;
        }
      });

      return processedContent;
    } catch (error) {
      // If entire latex processing fails, return original content
      console.error('LaTeX processing failed completely:', error);
      return content;
    }
  };

  const processContent = (content: string): string => {
    try {
      let processedContent = content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '');

      // Create custom renderer
      let renderer: Renderer | undefined;
      if (supportMarkdown) {
        renderer = new Renderer();

        // Fix links without protocols
        renderer.link = ({ href, title, tokens }) => {
          // Extract text from tokens
          const text = tokens.map((t) => ('text' in t ? t.text : '')).join('');

          // If href doesn't start with a protocol or /, assume it's an external link
          if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#|\/)/i)) {
            // Check if it looks like a domain (contains a dot)
            if (href.includes('.') || href.includes('://')) {
              href = `https://${href}`;
            }
          }

          const titleAttr = title ? ` title="${title}"` : '';
          return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        };

        // Flatten headings if needed
        if (flattenHeadings) {
          renderer.heading = ({ text }) => {
            return `<strong>${text}</strong> `;
          };
        }
      }

      // If only markdown is supported
      if (supportMarkdown && !supportLatex) {
        try {
          return marked.parse(processedContent, renderer ? { renderer } : {}) as string;
        } catch (e) {
          console.warn('Markdown parsing failed:', e);
          return processedContent;
        }
      }

      // If only latex is supported
      if (!supportMarkdown && supportLatex) {
        // Process block math
        processedContent = processLatex(processedContent);
        return processedContent;
      }

      // If both are supported
      if (supportMarkdown && supportLatex) {
        // First process block math
        processedContent = processLatex(processedContent);

        // Finally process markdown
        try {
          return marked.parse(processedContent, renderer ? { renderer } : {}) as string;
        } catch (e) {
          console.warn('Markdown parsing failed:', e);
          return processedContent;
        }
      }

      return processedContent;
    } catch (error) {
      // If everything fails, return original content
      console.error('Content processing failed completely:', error);
      return content;
    }
  };

  const html = useMemo(() => {
    try {
      return DOMPurify.sanitize(processContent(rawContent));
    } catch (error) {
      // If sanitization fails, return escaped original content to prevent XSS
      console.error('Content sanitization failed:', error);
      return rawContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawContent, supportMarkdown, supportLatex, flattenHeadings]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ENABLE_SHOW_MORE) {
      setIsOverflowing(false);
      return;
    }
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > 100);
    }
  }, [rawContent]);

  return (
    <div className={cn('relative mb-10 w-full min-w-0 sm:mb-0', containerClassName)}>
      <div
        className={cn(
          'w-full min-w-0 overflow-hidden transition-all duration-300 ease-in-out',
          ENABLE_SHOW_MORE && isShrinked && !isExpanded && isOverflowing && 'h-fit max-h-[100px]'
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            markdownStyles,
            'w-full min-w-0 break-words [overflow-wrap:anywhere]',
            contentClassName
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {ENABLE_SHOW_MORE && isShrinked && isOverflowing && (
        <>
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-common-background to-transparent sm:from-common-cardBackground',
              isExpanded ? 'opacity-0' : 'opacity-100',
              gradientClassName
            )}
          />

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 select-none items-center rounded text-xs text-text-tertiary transition-colors duration-200 ease-in-out hover:text-text-secondary"
          >
            <ChevronsDown className={cn('mr-1 h-4 w-4', isExpanded && 'rotate-180')} />
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </>
      )}
    </div>
  );
};

export default RenderParsedHTML;
