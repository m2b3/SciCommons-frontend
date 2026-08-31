'use client';

import { FC } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { ExternalLink, Layers, Sparkles } from 'lucide-react';

import { type FeedArticle, getFeedTopics, getTopicCounts } from '@/lib/feed/handoffFeed';
import { cn } from '@/lib/utils';

interface TopicSidebarProps {
  articles: FeedArticle[];
}

const TopicSidebar: FC<TopicSidebarProps> = ({ articles }) => {
  const pathname = usePathname() ?? '/feed';
  const searchParams = useSearchParams();
  const active = searchParams?.get('topic') ?? null;
  const topics = getFeedTopics(articles);
  const counts = getTopicCounts(articles);

  const hrefFor = (topicId?: string) => {
    const params = new URLSearchParams();
    if (topicId) params.set('topic', topicId);
    // Keep the open article so changing topic doesn't close the reader.
    const article = searchParams?.get('article');
    if (article) params.set('article', article);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const rowClass = (isActive: boolean) =>
    cn(
      'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
      isActive
        ? 'bg-functional-green/10 text-functional-green'
        : 'text-text-secondary hover:bg-common-minimal'
    );

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        Feed
      </p>

      <Link href={hrefFor()} className={rowClass(!active)}>
        <span className="flex items-center gap-2">
          <Sparkles className="size-4" />
          All articles
        </span>
        <span className="text-xs text-text-tertiary">{articles.length}</span>
      </Link>

      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        Topics
      </p>
      {topics.map((topic) => {
        const isActive = active === topic.id;
        return (
          <Link key={topic.id} href={hrefFor(topic.id)} className={rowClass(isActive)}>
            <span className="flex min-w-0 items-center gap-2">
              <Layers className="size-4 flex-none" />
              <span className="truncate">{topic.name}</span>
            </span>
            <span className="text-xs text-text-tertiary">{counts[topic.id] ?? 0}</span>
          </Link>
        );
      })}

      <div className="mt-auto border-t border-common-contrast/40 pt-2">
        {/* The existing SciCommons app stays fully available; we may wean off it later. */}
        <Link
          href="/articles"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-tertiary transition-colors hover:bg-common-minimal hover:text-text-secondary"
        >
          <ExternalLink className="size-4" />
          Open classic SciCommons
        </Link>
      </div>
    </nav>
  );
};

export default TopicSidebar;
