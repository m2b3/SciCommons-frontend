import type { FeedArticle } from '@/lib/feed/handoffFeed';

/** "A. Smith, B. Lee, C. Doe +3" style author line. */
export const formatAuthors = (authors: string[], max = 3): string => {
  if (!authors.length) return 'Unknown authors';
  const shown = authors.slice(0, max).join(', ');
  const extra = authors.length - max;
  return extra > 0 ? `${shown} +${extra}` : shown;
};

export interface SourceBadge {
  label: string;
  className: string;
}

/* Groundwork for the multi-source, color-coded feed in notes/Possibilities.md
   (RSS / blogs / Mastodon / Bluesky each get their own color later). */
export const sourceBadge = (source: FeedArticle['source']): SourceBadge => {
  switch (source) {
    case 'pubmed':
      return {
        label: 'PubMed',
        className: 'bg-functional-green/10 text-functional-green ring-1 ring-functional-green/20',
      };
    case 'blog':
      return {
        label: 'Blog',
        className: 'bg-functional-blue/10 text-functional-blue ring-1 ring-functional-blue/20',
      };
    default:
      return {
        label: source,
        className: 'bg-common-minimal text-text-secondary ring-1 ring-common-contrast/30',
      };
  }
};
