const SITE_NAME = 'SciCommons';
const DEFAULT_DYNAMIC_TITLE_MAX_LENGTH = 55;

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

/* Fixed by Codex on 2026-03-08
   Who: Codex
   What: Added shared page-title helpers for route metadata and client-side title updates.
   Why: SciCommons needs consistent "<Section>: SciCommons" tab titles with safe truncation for long article/post/community names.
   How: Centralized whitespace normalization, slug humanization, word-aware truncation, and final title composition in one utility module. */
export const truncateTitleSegment = (
  value: string,
  maxLength: number = DEFAULT_DYNAMIC_TITLE_MAX_LENGTH
): string => {
  const normalizedValue = normalizeWhitespace(value);
  if (!normalizedValue || normalizedValue.length <= maxLength || maxLength < 4) {
    return normalizedValue;
  }

  const maxWithoutEllipsis = maxLength - 3;
  const hardClippedValue = normalizedValue.slice(0, maxWithoutEllipsis).trimEnd();
  const wordBoundaryIndex = hardClippedValue.lastIndexOf(' ');
  const minWordBoundary = Math.floor(maxWithoutEllipsis * 0.6);
  const clippedValue =
    wordBoundaryIndex >= minWordBoundary
      ? hardClippedValue.slice(0, wordBoundaryIndex).trimEnd()
      : hardClippedValue;

  return `${clippedValue}...`;
};

export const humanizeSlug = (slug: string): string => {
  const normalizedSlug = normalizeWhitespace(slug.replace(/[-_]+/g, ' '));
  if (!normalizedSlug) return '';

  return normalizedSlug.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

interface BuildSciCommonsTitleOptions {
  fallbackSegment?: string;
  truncate?: boolean;
  maxLength?: number;
}

export const buildSciCommonsTitle = (
  segment: string,
  options: BuildSciCommonsTitleOptions = {}
): string => {
  const fallbackSegment = options.fallbackSegment ?? SITE_NAME;
  let resolvedSegment = normalizeWhitespace(segment) || normalizeWhitespace(fallbackSegment);
  if (!resolvedSegment) {
    resolvedSegment = SITE_NAME;
  }

  if (options.truncate) {
    resolvedSegment = truncateTitleSegment(resolvedSegment, options.maxLength);
  }

  return resolvedSegment === SITE_NAME ? SITE_NAME : `${resolvedSegment}: ${SITE_NAME}`;
};
