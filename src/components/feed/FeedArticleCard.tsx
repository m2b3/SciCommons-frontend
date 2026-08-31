'use client';

import { FC, MouseEvent, useEffect, useState } from 'react';

import Link from 'next/link';

import { ArrowRight, BookOpen, Bookmark, ThumbsUp } from 'lucide-react';

import AbstractText from '@/components/articles/AbstractText';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import type { FeedArticle } from '@/lib/feed/handoffFeed';
import { cn } from '@/lib/utils';
import { useDemoFeedStore } from '@/stores/demoFeedStore';

import { formatAuthors, sourceBadge } from './feedFormat';

interface FeedArticleCardProps {
  article: FeedArticle;
  /** When provided, a plain left-click opens the reader in place instead of navigating. */
  onSelect?: (articleKey: string) => void;
}

const FeedArticleCard: FC<FeedArticleCardProps> = ({ article, onSelect }) => {
  const href = `/feed/article/${encodeURIComponent(article.key)}`;
  const badge = sourceBadge(article.source);

  // Keep the real href on every link and only intercept unmodified left-clicks, so
  // ⌘-click, middle-click and "copy link address" still reach the deep-link route.
  const handleOpen = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onSelect(article.key);
  };

  // Persisted like/bookmark state. Guard with a mounted flag so the server render
  // (empty store) matches the first client render, avoiding hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const state = useDemoFeedStore((s) => s.byArticle[article.key]);
  const toggleLike = useDemoFeedStore((s) => s.toggleLike);
  const toggleBookmark = useDemoFeedStore((s) => s.toggleBookmark);
  const liked = mounted && !!state?.liked;
  const likeCount = mounted ? (state?.likeCount ?? 0) : 0;
  const bookmarked = mounted && !!state?.bookmarked;

  return (
    <article className="group rounded-2xl border border-common-contrast/40 bg-common-cardBackground p-5 transition-colors hover:border-common-contrast">
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          {/* meta row */}
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
            <span
              className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.className)}
            >
              {badge.label}
            </span>
            <span>{article.pubDate}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{formatAuthors(article.authors)}</span>
          </div>

          {/* title */}
          <Link href={href} onClick={handleOpen} className="inline-block max-w-full">
            <RenderParsedHTML
              rawContent={article.title}
              supportLatex
              supportMarkdown={false}
              contentClassName="text-base font-semibold leading-snug text-text-primary [overflow-wrap:anywhere] group-hover:text-functional-green"
              containerClassName="mb-0"
            />
          </Link>

          {/* abstract snippet */}
          {article.abstract && (
            <AbstractText
              text={article.abstract}
              className="mt-2 line-clamp-3 text-sm text-text-secondary"
              containerClassName="mb-0"
            />
          )}

          {/* tags */}
          {article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-common-minimal px-2 py-0.5 text-[11px] text-text-secondary"
                >
                  #{tag.replace(/\s+/g, '-').toLowerCase()}
                </span>
              ))}
            </div>
          )}

          {/* actions */}
          <div className="mt-4 flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => toggleLike(article.key)}
              aria-pressed={liked}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-common-contrast/50 px-3 py-1 transition-colors hover:bg-common-minimal',
                liked && 'border-functional-green/40 text-functional-green'
              )}
            >
              <ThumbsUp className={cn('size-3.5', liked && 'fill-functional-green')} />
              {likeCount}
            </button>
            <button
              type="button"
              onClick={() => toggleBookmark(article.key)}
              aria-pressed={bookmarked}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-common-contrast/50 px-3 py-1 transition-colors hover:bg-common-minimal',
                bookmarked && 'border-functional-yellow/40 text-functional-yellow'
              )}
            >
              <Bookmark className={cn('size-3.5', bookmarked && 'fill-functional-yellow')} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <Link
              href={href}
              onClick={handleOpen}
              className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
            >
              <BookOpen className="size-3.5" />
              {article.pmcid ? 'Read full text' : 'Read'}
            </Link>
          </div>
        </div>

        {/* thumbnail / paper monogram (PubMed has no page image, so we render a stylized block) */}
        <Link
          href={href}
          onClick={handleOpen}
          aria-label={`Open ${article.title}`}
          className="relative hidden h-36 w-28 flex-none overflow-hidden rounded-lg border border-common-contrast/40 bg-common-minimal/60 sm:block"
        >
          <div className="flex h-full flex-col justify-between p-2.5">
            <span className="text-3xl font-bold uppercase text-text-tertiary/50">
              {article.journal?.[0] ?? 'P'}
            </span>
            <span className="line-clamp-3 text-[9px] leading-tight text-text-tertiary">
              {article.journal}
            </span>
          </div>
          <span className="absolute bottom-2 right-2 grid size-6 place-items-center rounded-full bg-common-background/80 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowRight className="size-3.5" />
          </span>
        </Link>
      </div>
    </article>
  );
};

export default FeedArticleCard;
