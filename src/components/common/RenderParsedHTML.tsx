import React, { useEffect, useMemo, useRef, useState } from 'react';

import DOMPurify from 'dompurify';
import katex, { KatexOptions } from 'katex';
import { ChevronsDown } from 'lucide-react';
import { marked } from 'marked';

import { markdownStyles } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

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
}: {
  rawContent: string;
  isShrinked?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  gradientClassName?: string;
} & SupportConfig) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const processLatex = (content: string): string => {
    let processedContent = content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '');

    const katexOptions: KatexOptions = {
      displayMode: true,
      output: 'mathml' as const,
      trust: true,
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

    // Process block math
    processedContent = processedContent.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
      try {
        return katex.renderToString(expr, {
          ...katexOptions,
          displayMode: true,
        });
      } catch (e) {
        // Return the original LaTeX expression in red
        return `<span class="text-red-500">${match}</span>`;
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
        // Return the original LaTeX expression in red
        return `<span class="text-red-500">${match}</span>`;
      }
    });

    return processedContent;
  };

  const processContent = (content: string): string => {
    let processedContent = content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '');

    // If only markdown is supported
    if (supportMarkdown && !supportLatex) {
      return marked.parse(processedContent) as string;
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
      return marked.parse(processedContent) as string;
    }

    return processedContent;
  };

  const html = useMemo(
    () => DOMPurify.sanitize(processContent(rawContent)),
    [rawContent, supportMarkdown, supportLatex]
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > 100);
    }
  }, [rawContent]);

  return (
    <div className={cn('relative mb-10 sm:mb-0', containerClassName)}>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isShrinked && !isExpanded && isOverflowing && 'h-fit max-h-[100px]'
        )}
      >
        <div
          ref={contentRef}
          className={cn(markdownStyles, contentClassName)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {isShrinked && isOverflowing && (
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
