
'use client';

import { FC, useMemo } from 'react';

import { getFeed, getTopics } from '@/lib/feed/mockFeed';

import FeedArticleCard from './FeedArticleCard';

interface FeedListProps {
  topicId?: string | null;
  query?: string;
  /** When provided, cards open the reader in place rather than navigating. */
  onSelect?: (pmid: string) => void;
}

const FeedList: FC<FeedListProps> = ({ topicId, query, onSelect }) => {
  const articles = useMemo(() => getFeed(topicId, query), [topicId, query]);
  const topic = getTopics().find((t) => t.id === topicId);
  const heading = topic ? topic.name : 'All articles';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-text-primary">{heading}</h1>
        <span className="text-xs text-text-tertiary">{articles.length} articles</span>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-common-contrast/50 p-10 text-center text-sm text-text-tertiary">
          No articles match this view yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <FeedArticleCard key={article.pmid} article={article} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedList;
