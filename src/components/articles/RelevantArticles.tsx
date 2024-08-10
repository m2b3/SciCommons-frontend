import { FC } from 'react';

import { useArticlesApiGetRelevantArticles } from '@/api/articles/articles';
import ArticleHighlightCard, {
  ArticleHighlightCardSkeleton,
} from '@/components/articles/ArticleHighlightCard';
import { useAuthStore } from '@/stores/authStore';

interface RelevantArticlesProps {
  articleId: number;
  communityId?: number;
}

const RelevantArticles: FC<RelevantArticlesProps> = ({ articleId }) => {
  console.log(articleId);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isPending } = useArticlesApiGetRelevantArticles(
    articleId,
    { filter_type: 'recent' },
    { request: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  return (
    <div className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold dark:text-white">Relevant Articles</h3>
      {isPending &&
        Array.from({ length: 3 }).map((_, index) => <ArticleHighlightCardSkeleton key={index} />)}
      {data && data.data.length === 0 && (
        <div className="rounded-md bg-white py-4 dark:bg-gray-700">
          <p className="text-gray-700 dark:text-gray-300">No relevant articles found.</p>
        </div>
      )}
      {data &&
        data.data.map((article, index) => <ArticleHighlightCard key={index} article={article} />)}
    </div>
  );
};

export default RelevantArticles;
