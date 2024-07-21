import { FC } from 'react';

import { useUsersCommonApiGetRelevantArticles } from '@/api/users-common-api/users-common-api';
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
  const { data, isPending } = useUsersCommonApiGetRelevantArticles(
    { filter_type: 'recent' },
    { request: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Relevant Articles</h3>
      {isPending &&
        Array.from({ length: 3 }).map((_, index) => <ArticleHighlightCardSkeleton key={index} />)}
      {data && data.data.length === 0 && (
        <div className="rounded-md bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">No Articles</h2>
          <p className="text-gray-700">No relevant articles found.</p>
        </div>
      )}
      {data &&
        data.data.map((article, index) => <ArticleHighlightCard key={index} article={article} />)}
    </div>
  );
};

export default RelevantArticles;
