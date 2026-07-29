
'use client';

import { Suspense, useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import ArticleReader from '@/components/feed/ArticleReader';
import FeedList from '@/components/feed/FeedList';
import ReaderHeader from '@/components/feed/ReaderHeader';
import RightPanel from '@/components/feed/RightPanel';
import TopicSidebar from '@/components/feed/TopicSidebar';
import { getArticle } from '@/lib/feed/mockFeed';

const FeedPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams?.get('topic') ?? null;
  const selectedPmid = searchParams?.get('article') ?? null;

  const article = selectedPmid ? getArticle(selectedPmid) : undefined;

  const buildHref = useCallback(
    (pmid: string | null) => {
      const params = new URLSearchParams();
      if (topic) params.set('topic', topic);
      if (pmid) params.set('article', pmid);
      const qs = params.toString();
      return qs ? `/feed?${qs}` : '/feed';
    },
    [topic]
  );

  // push (not replace) so Back returns to the feed list, as users expect.
  const openArticle = useCallback(
    (pmid: string) => router.push(buildHref(pmid), { scroll: false }),
    [router, buildHref]
  );
  const closeArticle = useCallback(
    () => router.push(buildHref(null), { scroll: false }),
    [router, buildHref]
  );

  return (
    <div className="flex h-full min-h-0">
      <aside className="hidden w-64 flex-none overflow-y-auto border-r border-common-contrast/40 md:block">
        <TopicSidebar />
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto">
        {article ? (
          <>
            <ReaderHeader article={article} onBack={closeArticle} />
            <ArticleReader article={article} />
          </>
        ) : (
          <FeedList topicId={topic} onSelect={openArticle} />
        )}
      </section>

      <aside className="hidden w-96 flex-none overflow-y-auto border-l border-common-contrast/40 lg:block">
        <RightPanel pmid={article?.pmid} onSelectArticle={openArticle} />
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
