'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticleOut } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import { showErrorToast } from '@/lib/toastHelpers';

interface ArticlesResponse {
  data: {
    items: ArticleOut[];
    num_pages: number;
    total: number;
  };
}

const Articles: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [articles, setArticles] = useState<ArticleOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadingType = LoadingType.PAGINATION;

  const { data, isPending, error } = useArticlesApiGetArticles<ArticlesResponse>({
    page: page,
    per_page: 10,
    search: search,
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1 || loadingType === LoadingType.PAGINATION) {
        setArticles(data.data.items);
      } else {
        setArticles((prevArticles) => [...prevArticles, ...data.data.items]);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType]);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
    setArticles([]);
  }, []);

  const handleLoadMore = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const renderArticle = useCallback((article: ArticleOut) => <ArticleCard article={article} />, []);

  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div className="container mx-auto p-2 py-8 md:p-8">
      <SearchableList<ArticleOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderArticle}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={articles}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        loadingType={loadingType}
        searchPlaceholder="Search articles..."
        emptyStateContent="No Articles Found"
        emptyStateSubcontent="Try searching for something else"
        emptyStateLogo={<FileX2 size={64} />}
        title="Articles"
      />
    </div>
  );
};

export default Articles;
