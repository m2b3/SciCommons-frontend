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
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isPending } = useArticlesApiGetRelevantArticles(
    articleId,
    { filter_type: 'recent' },
    { request: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  return (
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Tokenize relevant articles panel colors.
          Why: Keep sidebar panels aligned with UI skins.
          How: Replace gray/white utilities with semantic tokens. */}
      <div className="rounded-lg border bg-common-cardBackground p-4 text-text-primary shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Relevant Articles</h3>
        {isPending &&
          Array.from({ length: 3 }).map((_, index) => <ArticleHighlightCardSkeleton key={index} />)}
        {data && data.data.length === 0 && (
          <div className="rounded-md bg-common-cardBackground py-4">
            <p className="text-text-secondary">No relevant articles found.</p>
          </div>
        )}
        {data &&
          data.data.map((article, index) => <ArticleHighlightCard key={index} article={article} />)}
      </div>
    </>
  );
};

export default RelevantArticles;
