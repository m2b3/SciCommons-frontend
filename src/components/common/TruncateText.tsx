import React, { useEffect, useRef, useState } from 'react';

import DOMPurify from 'dompurify';

import { ENABLE_SHOW_MORE } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

const TruncateText = ({
  text,
  maxLines,
  hideButton = false,
  isHTML = false,
  textClassName,
}: {
  text: string;
  maxLines: number;
  hideButton?: boolean;
  isHTML?: boolean;
  textClassName?: string;
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ENABLE_SHOW_MORE) {
      setIsTruncated(false);
      return;
    }

    const checkTruncation = () => {
      if (textRef.current) {
        const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
        const maxHeight = lineHeight * maxLines;
        setIsTruncated(textRef.current.scrollHeight > maxHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [maxLines, text]);

  const safeHtml = isHTML ? DOMPurify.sanitize(text) : '';
  const contentProps = isHTML
    ? { dangerouslySetInnerHTML: { __html: safeHtml } }
    : { children: text };
  const shouldClamp = ENABLE_SHOW_MORE && !isExpanded && isTruncated;
  /* Fixed by Codex on 2026-02-20
     Who: Codex
     What: Removed global forced word breaking from the shared truncation helper.
     Why: The PR #271 overflow fix added `break-all` at the utility level, which affected typography in non-discussion surfaces.
     How: Keep TruncateText neutral and let callers opt-in to aggressive wrapping only where overflow is observed. */
  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Apply WebKit line-clamp styles only when truncation is actively enabled.
     Why: Keeping `display: -webkit-box` always-on can render clipped/ellipsis-only text on some mobile browsers.
     How: Gate clamp-specific CSS behind a dedicated `shouldClamp` flag and use normal flow otherwise. */
  const clampStyle = shouldClamp
    ? {
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical' as const,
      }
    : undefined;

  return (
    <div>
      <span
        ref={textRef}
        className={cn('text-text-primary', textClassName, {
          'overflow-hidden': shouldClamp,
        })}
        style={clampStyle}
        {...contentProps}
      />
      {ENABLE_SHOW_MORE && isTruncated && !hideButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-functional-blue res-text-xs hover:underline"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default TruncateText;
