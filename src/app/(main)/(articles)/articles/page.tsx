'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import { useUsersApiListMyArticles } from '@/api/users/users';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import TabComponent from '@/components/communities/TabComponent';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface ArticlesResponse {
  data: {
    items: ArticlesListOut[];
    num_pages: number;
    total: number;
  };
}

enum Tabs {
  ARTICLES = 'Articles',
  MY_ARTICLES = 'My Articles',
}

interface TabContentProps {
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  accessToken?: string;
  isActive: boolean;
}

const TabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
}) => {
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;

  const { data, isPending, error } = useArticlesApiGetArticles<ArticlesResponse>(
    {
      page,
      per_page: 10,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['articles', page, search],
        enabled: isActive,
      },
    }
  );

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

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      setArticles([]);
    },
    [setSearch, setPage]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderArticle = useCallback(
    (article: ArticlesListOut) => <ArticleCard article={article} />,
    []
  );
  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      <SearchableList<ArticlesListOut>
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
        title={Tabs.ARTICLES}
      />
    </div>
  );
};

const MyArticlesTabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
}) => {
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;

  const { data, isPending, error } = useUsersApiListMyArticles<ArticlesResponse>(
    {
      page,
      per_page: 10,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['my_articles', page, search],
        enabled: isActive,
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

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

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      setArticles([]);
    },
    [setSearch, setPage]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderArticle = useCallback(
    (article: ArticlesListOut) => <ArticleCard article={article} />,
    []
  );
  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      <SearchableList<ArticlesListOut>
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
        searchPlaceholder="Search your articles..."
        emptyStateContent="No Articles Found"
        emptyStateSubcontent="Try searching for something else"
        emptyStateLogo={<FileX2 size={64} />}
        title={Tabs.MY_ARTICLES}
      />
    </div>
  );
};

const Articles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.ARTICLES);
  const [articlesPage, setArticlesPage] = useState<number>(1);
  const [myArticlesPage, setMyArticlesPage] = useState<number>(1);
  const [articlesSearch, setArticlesSearch] = useState<string>('');
  const [myArticlesSearch, setMyArticlesSearch] = useState<string>('');

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto p-2 py-8 pt-4 md:p-8 md:pt-4">
      <div className="pb-4">
        {user && (
          <TabComponent
            tabs={[Tabs.ARTICLES, Tabs.MY_ARTICLES]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
      <div className="relative">
        <TabContent
          search={articlesSearch}
          setSearch={setArticlesSearch}
          page={articlesPage}
          setPage={setArticlesPage}
          isActive={activeTab === Tabs.ARTICLES}
        />
        {user && accessToken && (
          <MyArticlesTabContent
            search={myArticlesSearch}
            setSearch={setMyArticlesSearch}
            page={myArticlesPage}
            setPage={setMyArticlesPage}
            accessToken={accessToken}
            isActive={activeTab === Tabs.MY_ARTICLES}
          />
        )}
      </div>
    </div>
  );
};

export default Articles;
