import React, { useState } from 'react';

import DOMPurify from 'dompurify';
import { ChevronsDown } from 'lucide-react';
import { marked } from 'marked';

import { markdownStyles } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

const ParsedMarkdownHTML = ({
  markdown,
  isShrinked = false,
}: {
  markdown: string;
  isShrinked?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const html = DOMPurify.sanitize(
    marked.parse(markdown.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')) as string
  );

  return (
    <div className="relative">
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isShrinked && !isExpanded && 'h-[100px]'
        )}
      >
        <div className={cn(markdownStyles)} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {isShrinked && (
        <>
          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-common-background to-transparent sm:from-common-cardBackground ${
              isExpanded ? 'opacity-0' : 'opacity-100'
            }`}
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

export default ParsedMarkdownHTML;
