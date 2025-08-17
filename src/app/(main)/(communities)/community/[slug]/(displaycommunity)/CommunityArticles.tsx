import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';
import { toast } from 'sonner';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import { useAuthStore } from '@/stores/authStore';

interface CommunityArticlesProps {
  communityId: number;
}

const CommunityArticles: React.FC<CommunityArticlesProps> = ({ communityId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);

  const { data, isPending, error } = useArticlesApiGetArticles(
    {
      community_id: communityId,
      page: page,
      per_page: 12,
      search: search,
    },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
      },
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
    if (data) {
      setArticles(data.data.items);
    }
  }, [data, error]);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const renderArticle = useCallback(
main
    (article: ArticleOut) => <ArticleCard article={article} forCommunity isCompact={true} />,

    (article: ArticlesListOut) => <ArticleCard article={article} forCommunity />,
test
    []
  );

  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div className="space-y-2">
      <SearchableList<ArticlesListOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderArticle}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={articles}
        totalItems={data?.data.total || 0}
        totalPages={data?.data.num_pages || 1}
        currentPage={page}
        itemsPerPage={12}
        loadingType={LoadingType.PAGINATION}
        searchPlaceholder="Search articles..."
        emptyStateContent="No articles found"
        emptyStateSubcontent="Be the first to create an article in this community"
        emptyStateLogo={<FileX2 size={64} />}
        listContainerClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      />
    </div>
  );
};

export default CommunityArticles;
