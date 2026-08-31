'use client';

import { FC, useMemo } from 'react';

import { type FeedArticle, type FeedTopic, filterFeedArticles } from '@/lib/feed/handoffFeed';

import FeedArticleCard from './FeedArticleCard';

interface FeedListProps {
  articles: FeedArticle[];
  topics: FeedTopic[];
  topicId?: string | null;
  query?: string;
  /** When provided, cards open the reader in place rather than navigating. */
  onSelect?: (articleKey: string) => void;
}

const FeedList: FC<FeedListProps> = ({ articles, topics, topicId, query, onSelect }) => {
  const visibleArticles = useMemo(
    () => filterFeedArticles(articles, { topicId, query }),
    [articles, topicId, query]
  );
  const topic = topics.find((t) => t.id === topicId);
  const heading = topic ? topic.name : 'All articles';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-text-primary">{heading}</h1>
        <span className="text-xs text-text-tertiary">{visibleArticles.length} articles</span>
      </div>

      {visibleArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-common-contrast/50 p-10 text-center text-sm text-text-tertiary">
          No articles match this view yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleArticles.map((article) => (
            <FeedArticleCard key={article.key} article={article} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedList;
