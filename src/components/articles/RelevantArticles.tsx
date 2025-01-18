import { FC } from 'react';

import { useArticlesApiGetRelevantArticles } from '@/api/articles/articles';
import ArticleHighlightCard, {
  ArticleHighlightCardSkeleton,
} from '@/components/articles/ArticleHighlightCard';

interface RelevantArticlesProps {
  articleId: number;
  communityId?: number;
}

const RelevantArticles: FC<RelevantArticlesProps> = ({ articleId }) => {
  console.log(articleId);
  const { data, isPending } = useArticlesApiGetRelevantArticles(articleId, {
    filter_type: 'recent',
  });

  return (
    <div className="rounded-lg border bg-white-secondary p-4 text-gray-900 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Relevant Articles</h3>
      {isPending &&
        Array.from({ length: 3 }).map((_, index) => <ArticleHighlightCardSkeleton key={index} />)}
      {data && data.data.length === 0 && (
        <div className="rounded-md bg-white py-4">
          <p className="text-gray-700">No relevant articles found.</p>
        </div>
      )}
      {data &&
        data.data.map((article, index) => <ArticleHighlightCard key={index} article={article} />)}
    </div>
  );
};

export default RelevantArticles;
