'use client';

import { FC } from 'react';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import type { FeedArticle } from '@/lib/feed/handoffFeed';

import PostToCommunity from './PostToCommunity';

interface ReaderHeaderProps {
  article: FeedArticle;
  /** Inline reader: close and return to the list. */
  onBack?: () => void;
  /** Deep-link route: navigate back instead. */
  backHref?: string;
}

const ReaderHeader: FC<ReaderHeaderProps> = ({ article, onBack, backHref = '/feed' }) => {
  const label = (
    <>
      <ArrowLeft className="size-4" /> Back to feed
    </>
  );

  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
        >
          {label}
        </button>
      ) : (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
        >
          {label}
        </Link>
      )}

      <PostToCommunity article={article} />
    </div>
  );
};

export default ReaderHeader;
