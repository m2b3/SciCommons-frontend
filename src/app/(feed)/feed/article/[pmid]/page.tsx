'use client';

import ArticleReader from '@/components/feed/ArticleReader';
import ReaderHeader from '@/components/feed/ReaderHeader';
import RightPanel from '@/components/feed/RightPanel';
import { getArticleByKey, useMainFeedPage } from '@/lib/feed/handoffFeed';

const decodeArticleKey = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const ArticlePage = ({ params }: { params: { pmid: string } }) => {
  const { data: feedPage, isError, isPending } = useMainFeedPage({ source: 'all', limit: 100 });
  const articleKey = decodeArticleKey(params.pmid);
  const articles = feedPage?.items ?? [];
  const article = getArticleByKey(articles, articleKey);

  if (isPending) {
    return <div className="p-6 text-sm text-text-tertiary">Loading feed...</div>;
  }

  if (isError) {
    return <div className="p-6 text-sm text-functional-red">Could not load the feed.</div>;
  }

  if (!article) {
    return <div className="p-6 text-sm text-text-tertiary">This feed article was not found.</div>;
  }

  return (
    <div className="flex h-full min-h-0">
      <section className="min-w-0 flex-1 overflow-y-auto">
        <ReaderHeader article={article} backHref="/feed" />
        <ArticleReader article={article} />
      </section>

      <aside className="hidden w-96 flex-none overflow-y-auto border-l border-common-contrast/40 lg:block">
        <RightPanel articleKey={article.key} articles={articles} />
      </aside>
    </div>
  );
};

export default ArticlePage;
