'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { ArticlesListOut } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import ArticlePreviewSection from '@/components/articles/ArticlePreviewSection';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import TabComponent from '@/components/communities/TabComponent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { cn } from '@/lib/utils';
import { useArticlesViewStore } from '@/stores/articlesViewStore';
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
  gridCount: number;
  setGridCount: (gridCount: number) => void;
  headerTabs?: React.ReactNode;
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
  gridCount,
  setGridCount,
  headerTabs,
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!isActive) return;
      try {
        setLoading(true);
        setError(null);

        const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/articles?page=${page}&per_page=50&search=${search}`;
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load data');
        const result = await response.json();

        setData(result.data?.items || []);

        if (page === 1) {
          setArticles(result.data?.items || []);
        } else {
          setArticles((prevArticles) => [...prevArticles, ...(result.data?.items || [])]);
        }
        setTotalItems(result.data?.total || 0);
        setTotalPages(result.data?.num_pages || 1);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, search, isActive, loadingType]);

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

  if (loading && page === 1) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

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
            'h-[calc(100vh-80px)] overflow-y-auto',
            viewType === 'preview' ? 'pr-2 pt-4' : 'p-4 md:p-4'
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
            isLoading={loading}
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
            headerTabs={headerTabs}
            listContainerClassName={cn(
              'grid grid-cols-1',
              viewType === 'preview'
                ? 'h-full md:grid-cols-1 lg:grid-cols-1'
                : {
                    'md:grid-cols-1 lg:grid-cols-1': gridCount === 1,
                    'md:grid-cols-2 lg:grid-cols-2': gridCount === 2,
                    'md:grid-cols-2 lg:grid-cols-3': gridCount === 3,
                  }
            )}
            showViewTypeIcons={true}
            setViewType={setViewType}
            setGridCount={setGridCount}
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
                className="mt-2 h-[calc(100vh-80px)]"
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
  gridCount,
  setGridCount,
  headerTabs,
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!isActive) return;
      try {
        setLoading(true);
        setError(null);

        const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/users/me_articles?page=${page}&per_page=50&search=${search}`;
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error('Failed to load data');
        const result = await response.json();

        setData(result.data?.items || []);

        if (page === 1) {
          setArticles(result.data?.items || []);
        } else {
          setArticles((prevArticles) => [...prevArticles, ...(result.data?.items || [])]);
        }
        setTotalItems(result.data?.total || 0);
        setTotalPages(result.data?.num_pages || 1);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, search, isActive, loadingType]);

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

  if (loading && page === 1) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

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
            'h-[calc(100vh-80px)] overflow-y-auto',
            viewType === 'preview' ? 'pr-2 pt-4' : 'p-4 md:p-4'
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
            isLoading={loading}
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
            headerTabs={headerTabs}
            listContainerClassName={cn(
              'grid grid-cols-1',
              viewType === 'preview'
                ? 'h-full md:grid-cols-1 lg:grid-cols-1'
                : {
                    'md:grid-cols-1 lg:grid-cols-1': gridCount === 1,
                    'md:grid-cols-2 lg:grid-cols-2': gridCount === 2,
                    'md:grid-cols-2 lg:grid-cols-3': gridCount === 3,
                  }
            )}
            showViewTypeIcons={true}
            setViewType={setViewType}
            setGridCount={setGridCount}
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
                className="mt-2 h-[calc(100vh-80px)]"
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

interface ArticlesTabsProps {
  activeTab: Tabs;
  onTabChange: React.Dispatch<React.SetStateAction<Tabs>>;
}

const ArticlesTabs: React.FC<ArticlesTabsProps> = ({ activeTab, onTabChange }) => {
  const user = useAuthStore((state) => state.user);
  const tabsList = user ? [Tabs.ARTICLES, Tabs.MY_ARTICLES] : [Tabs.ARTICLES];
  return (
    <div className="md:px-2">
      <TabComponent tabs={tabsList} activeTab={activeTab} setActiveTab={onTabChange} />
    </div>
  );
};

const Articles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.ARTICLES);
  const [articlesPage, setArticlesPage] = useState<number>(1);
  const [myArticlesPage, setMyArticlesPage] = useState<number>(1);
  const [articlesSearch, setArticlesSearch] = useState<string>('');
  const [myArticlesSearch, setMyArticlesSearch] = useState<string>('');
  const viewType = useArticlesViewStore((state) => state.viewType);
  const setViewType = useArticlesViewStore((state) => state.setViewType);
  const gridCount = useArticlesViewStore((state) => state.gridCount);
  const setGridCount = useArticlesViewStore((state) => state.setGridCount);

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto">
      <div className="relative">
        <TabContent
          search={articlesSearch}
          setSearch={setArticlesSearch}
          page={articlesPage}
          setPage={setArticlesPage}
          isActive={activeTab === Tabs.ARTICLES}
          viewType={viewType}
          setViewType={setViewType}
          gridCount={gridCount}
          setGridCount={setGridCount}
          headerTabs={<ArticlesTabs activeTab={activeTab} onTabChange={setActiveTab} />}
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
            setViewType={setViewType}
            gridCount={gridCount}
            setGridCount={setGridCount}
            headerTabs={<ArticlesTabs activeTab={activeTab} onTabChange={setActiveTab} />}
          />
        )}
      </div>
    </div>
  );
};

export default Articles;
