import { notFound } from 'next/navigation';

import ArticleReader from '@/components/feed/ArticleReader';
import ReaderHeader from '@/components/feed/ReaderHeader';
import RightPanel from '@/components/feed/RightPanel';
import { getArticle } from '@/lib/feed/mockFeed';

const ArticlePage = ({ params }: { params: { pmid: string } }) => {
  const article = getArticle(params.pmid);
  if (!article) {
    notFound();
  }

  return (
    <div className="flex h-full min-h-0">
      <section className="min-w-0 flex-1 overflow-y-auto">
        <ReaderHeader article={article} backHref="/feed" />
        <ArticleReader article={article} />
      </section>

      <aside className="hidden w-96 flex-none overflow-y-auto border-l border-common-contrast/40 lg:block">
        <RightPanel pmid={article.pmid} />
      </aside>
    </div>
  );
};

export default ArticlePage;
