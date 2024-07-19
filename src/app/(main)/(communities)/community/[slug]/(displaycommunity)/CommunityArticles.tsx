import React, { useEffect } from 'react';

import { toast } from 'sonner';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import SearchBar from '@/components/SearchBar';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import { useAuthStore } from '@/stores/authStore';

interface CommunityArticlesProps {
  communityId: number;
}

const CommunityArticles = ({ communityId }: CommunityArticlesProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isPending, error } = useArticlesApiGetArticles(
    { community_id: communityId },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="space-y-2">
      <SearchBar />
      <div className="flex flex-col space-y-4">
        {isPending && Array.from({ length: 5 }, (_, index) => <ArticleCardSkeleton key={index} />)}
        {data && data.data.items.length === 0 && (
          <p className="text-center text-gray-500">No articles found</p>
        )}
        {data &&
          data.data.items.map((article) => (
            <ArticleCard key={article.id} article={article} forCommunity />
          ))}
      </div>
    </div>
  );
};

export default CommunityArticles;
