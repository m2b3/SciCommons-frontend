'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import { useUsersApiListMyArticles } from '@/api/users/users';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import ArticlePreviewSection from '@/components/articles/ArticlePreviewSection';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import TabComponent from '@/components/communities/TabComponent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { FIVE_MINUTES_IN_MS, SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
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
  viewType: 'grid' | 'list' | 'preview';
  setViewType: (viewType: 'grid' | 'list' | 'preview') => void;
}

const TabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
  viewType,
  setViewType,
}) => {
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.INFINITE_SCROLL;
  const [selectedPreviewArticle, setSelectedPreviewArticle] = useState<ArticlesListOut | null>(
    null
  );
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);

  useKeyboardNavigation({
    items: articles,
    selectedItem: selectedPreviewArticle,
    setSelectedItem: setSelectedPreviewArticle,
    isEnabled: viewType === 'preview' && isActive,
    getItemId: (article) => article.id,
    autoSelectFirst: true,
    getItemElement: (item) => {
      const root = document.querySelector('[data-slot="articles-tab"]');
      return root
        ? (root.querySelector(`[data-article-id="${String(item.id)}"]`) as HTMLElement | null)
        : null;
    },
    hasMore: articles.length < totalItems,
    requestMore: () => {
      if (page < totalPages) setPage(page + 1);
    },
    scrollContainer:
      viewType === 'preview'
        ? () => {
            // Scope to Articles tab container using its data-slot
            const root = document.querySelector('[data-slot="articles-tab"]');
            if (!root) return null;
            const panels = root.querySelectorAll('[data-slot="resizable-panel"]');
            for (const panel of panels) {
              if (
                panel.querySelector('[data-article-id]') &&
                (panel as HTMLElement).classList.contains('overflow-y-auto')
              ) {
                return panel as HTMLElement;
              }
            }
            return null;
          }
        : undefined,
  });

  const { data, isPending, error } = useArticlesApiGetArticles<ArticlesResponse>(
    {
      page,
      per_page: 50,
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
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1) {
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
      setSelectedPreviewArticle(null);
    },
    [setSearch, setPage, setSelectedPreviewArticle]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderArticle = useCallback(
    (article: ArticlesListOut) => (
      <div data-article-id={String(article.id)}>
        <ArticleCard
          article={article}
          className={cn(
            'h-full',
            viewType === 'preview' &&
              selectedPreviewArticle?.id === article.id &&
              'border-functional-green/50 bg-functional-green/10'
          )}
          compactType={viewType === 'grid' || viewType === 'preview' ? 'default' : 'minimal'}
          handleArticlePreview={() => {
            setSelectedPreviewArticle(article);
          }}
        />
      </div>
    ),
    [viewType, selectedPreviewArticle]
  );
  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div
      data-slot="articles-tab"
      className={cn(
        'h-full transition-opacity duration-200',
        isActive ? 'opacity-100' : 'hidden opacity-0',
        isActive && viewType === 'preview' && 'flex flex-row'
      )}
    >
      <ResizablePanelGroup
        direction="horizontal"
        className={cn('h-full w-full', viewType === 'preview' ? 'pl-2' : '')}
        autoSaveId="articles-list-panel"
      >
        <ResizablePanel
          className={cn(
            'h-[calc(100vh-130px)] overflow-y-auto',
            viewType === 'preview' ? 'pr-2' : 'p-4 md:p-4'
          )}
          style={{ overflow: 'auto' }}
          defaultSize={60}
          minSize={30}
          maxSize={70}
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
            listContainerClassName={cn(
              'grid grid-cols-1 gap-3',
              viewType === 'preview'
                ? 'h-full md:grid-cols-1 lg:grid-cols-1'
                : 'md:grid-cols-2 lg:grid-cols-3'
            )}
            showViewTypeIcons={true}
            setViewType={setViewType}
            viewType={viewType}
          />
        </ResizablePanel>
        {viewType === 'preview' && (
          <>
            <ResizableHandle withHandle={true} className="bg-common-cardBackground" />
            <ResizablePanel
              className="ml-2 hidden lg:block"
              defaultSize={40}
              minSize={30}
              maxSize={70}
            >
              <ArticlePreviewSection
                article={selectedPreviewArticle}
                className="h-[calc(100vh-130px)]"
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
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
  viewType,
  setViewType,
}) => {
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.INFINITE_SCROLL;
  const [selectedPreviewArticle, setSelectedPreviewArticle] = useState<ArticlesListOut | null>(
    null
  );
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);

  useKeyboardNavigation({
    items: articles,
    selectedItem: selectedPreviewArticle,
    setSelectedItem: setSelectedPreviewArticle,
    isEnabled: viewType === 'preview' && isActive,
    getItemId: (article) => article.id,
    autoSelectFirst: true,
    getItemElement: (item) => {
      const root = document.querySelector('[data-slot="my-articles-tab"]');
      return root
        ? (root.querySelector(`[data-article-id="${String(item.id)}"]`) as HTMLElement | null)
        : null;
    },
    hasMore: articles.length < totalItems,
    requestMore: () => {
      if (page < totalPages) setPage(page + 1);
    },
    scrollContainer:
      viewType === 'preview'
        ? () => {
            // Scope to My Articles tab container using its data-slot
            const root = document.querySelector('[data-slot="my-articles-tab"]');
            if (!root) return null;
            const panels = root.querySelectorAll('[data-slot="resizable-panel"]');
            for (const panel of panels) {
              if (
                panel.querySelector('[data-article-id]') &&
                (panel as HTMLElement).classList.contains('overflow-y-auto')
              ) {
                return panel as HTMLElement;
              }
            }
            return null;
          }
        : undefined,
  });

  const { data, isPending, error } = useUsersApiListMyArticles<ArticlesResponse>(
    {
      page,
      per_page: 50,
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
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1) {
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
      setSelectedPreviewArticle(null);
    },
    [setSearch, setPage, setSelectedPreviewArticle]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderArticle = useCallback(
    (article: ArticlesListOut) => (
      <div data-article-id={String(article.id)}>
        <ArticleCard
          article={article}
          className={cn(
            'h-full',
            viewType === 'preview' &&
              selectedPreviewArticle?.id === article.id &&
              'border-functional-green bg-functional-green/15'
          )}
          compactType={viewType === 'grid' || viewType === 'preview' ? 'default' : 'minimal'}
          handleArticlePreview={() => {
            setSelectedPreviewArticle(article);
          }}
        />
      </div>
    ),
    [viewType, selectedPreviewArticle]
  );
  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div
      data-slot="my-articles-tab"
      className={cn(
        'h-full transition-opacity duration-200',
        isActive ? 'opacity-100' : 'hidden opacity-0',
        isActive && viewType === 'preview' && 'flex flex-row'
      )}
    >
      <ResizablePanelGroup
        direction="horizontal"
        className={cn('h-full w-full', viewType === 'preview' ? 'pl-2' : '')}
        autoSaveId="my-articles-list-panel"
      >
        <ResizablePanel
          className={cn(
            'h-[calc(100vh-130px)] overflow-y-auto',
            viewType === 'preview' ? 'pr-2' : 'p-4 md:p-4'
          )}
          style={{ overflow: 'auto' }}
          defaultSize={60}
          minSize={30}
          maxSize={70}
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
            listContainerClassName={cn(
              'grid grid-cols-1 gap-3',
              viewType === 'preview'
                ? 'h-full md:grid-cols-1 lg:grid-cols-1'
                : 'md:grid-cols-2 lg:grid-cols-3'
            )}
            showViewTypeIcons={true}
            setViewType={setViewType}
            viewType={viewType}
          />
        </ResizablePanel>
        {viewType === 'preview' && (
          <>
            <ResizableHandle withHandle={true} className="bg-common-cardBackground" />
            <ResizablePanel
              className="ml-2 hidden lg:block"
              defaultSize={40}
              minSize={30}
              maxSize={70}
            >
              <ArticlePreviewSection
                article={selectedPreviewArticle}
                className="h-[calc(100vh-130px)]"
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

const Articles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.ARTICLES);
  const [articlesPage, setArticlesPage] = useState<number>(1);
  const [myArticlesPage, setMyArticlesPage] = useState<number>(1);
  const [articlesSearch, setArticlesSearch] = useState<string>('');
  const [myArticlesSearch, setMyArticlesSearch] = useState<string>('');
  const [viewType, setViewType] = useState<'grid' | 'list' | 'preview'>('grid');

  const handleViewTypeChange = useCallback((newViewType: 'grid' | 'list' | 'preview') => {
    setViewType(newViewType);
    window.localStorage.setItem('articles-layout-type', newViewType);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('articles-layout-type');
    if (saved === 'grid' || saved === 'list' || saved === 'preview') {
      setViewType(saved);
    }
  }, []);

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-2 py-8 pt-4 md:pb-0 md:pt-4">
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
          viewType={viewType}
          setViewType={handleViewTypeChange}
        />
        {user && accessToken && (
          <MyArticlesTabContent
            search={myArticlesSearch}
            setSearch={setMyArticlesSearch}
            page={myArticlesPage}
            setPage={setMyArticlesPage}
            accessToken={accessToken}
            isActive={activeTab === Tabs.MY_ARTICLES}
            viewType={viewType}
            setViewType={handleViewTypeChange}
          />
        )}
      </div>
    </div>
  );
};

export default Articles;
