'use client';

import { Suspense, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import ArticleReader from '@/components/feed/ArticleReader';
import FeedList from '@/components/feed/FeedList';
import ReaderHeader from '@/components/feed/ReaderHeader';
import RightPanel from '@/components/feed/RightPanel';
import TopicSidebar from '@/components/feed/TopicSidebar';
import { getArticleByKey, getFeedTopics, useMainFeedPage } from '@/lib/feed/handoffFeed';

const decodeArticleKey = (value: string | null): string | null => {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const FeedPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams?.get('topic') ?? null;
  const selectedKey = decodeArticleKey(searchParams?.get('article') ?? null);
  const { data: feedPage, isError, isPending } = useMainFeedPage({ source: 'all', limit: 40 });

  const articles = feedPage?.items ?? [];
  const topics = getFeedTopics(articles);
  const article = selectedKey ? getArticleByKey(articles, selectedKey) : undefined;

  const buildHref = useCallback(
    (articleKey: string | null) => {
      const params = new URLSearchParams();
      if (topic) params.set('topic', topic);
      if (articleKey) params.set('article', articleKey);
      const qs = params.toString();
      return qs ? `/feed?${qs}` : '/feed';
    },
    [topic]
  );

  // push (not replace) so Back returns to the feed list, as users expect.
  const openArticle = useCallback(
    (articleKey: string) => router.push(buildHref(articleKey), { scroll: false }),
    [router, buildHref]
  );
  const closeArticle = useCallback(
    () => router.push(buildHref(null), { scroll: false }),
    [router, buildHref]
  );

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-64 flex-none overflow-y-auto border-r border-common-contrast/40 md:block">
        <TopicSidebar articles={articles} />
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto">
        {isPending ? (
          <div className="p-6 text-sm text-text-tertiary">Loading feed...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-functional-red">Could not load the feed.</div>
        ) : selectedKey && !article ? (
          <div className="p-6 text-sm text-text-tertiary">This feed article was not found.</div>
        ) : article ? (
          <>
            <ReaderHeader article={article} onBack={closeArticle} />
            <ArticleReader article={article} />
          </>
        ) : (
          <FeedList articles={articles} topics={topics} topicId={topic} onSelect={openArticle} />
        )}
      </section>

      <aside className="hidden w-96 flex-none overflow-y-auto border-l border-common-contrast/40 lg:block">
        <RightPanel articleKey={article?.key} articles={articles} onSelectArticle={openArticle} />
      </aside>
    </div>
  );
};

const FeedPage = () => (
  <Suspense fallback={<div className="p-6 text-sm text-text-tertiary">Loading feed…</div>}>
    <FeedPageInner />
  </Suspense>
);

export default FeedPage;
