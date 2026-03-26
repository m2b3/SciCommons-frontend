'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FileX2 } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import { useUsersApiListMyArticles } from '@/api/users/users';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import ArticleContentView from '@/components/articles/ArticleContentView';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import TabComponent from '@/components/communities/TabComponent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { FIVE_MINUTES_IN_MS, SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { useFilteredList } from '@/hooks/useFilteredList';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { showErrorToast } from '@/lib/toastHelpers';
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

enum ArticleFilters {
  ALL = 'all',
  BOOKMARKED = 'bookmarked',
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
  router: ReturnType<typeof useRouter>;
  pathname: string | null;
  selectedPreviewArticle: ArticlesListOut | null;
  setSelectedPreviewArticle: (article: ArticlesListOut | null) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  // NOTE(bsureshkrishna, 2026-02-09): accessToken is required for authenticated queries.
  // This fixes a missing destructure that caused TS errors and unauthenticated requests.
  accessToken,
  isActive,
  viewType,
  setViewType,
  gridCount,
  setGridCount,
  headerTabs,
  router,
  pathname: _pathname,
  selectedPreviewArticle,
  setSelectedPreviewArticle,
}) => {
  const searchParams = useSearchParams();
  const hasRestoredRef = React.useRef(false);
  const { displayedItems, setItems, appendItems, setFilter, activeFilter, reset } =
    useFilteredList<ArticlesListOut>({
      filters: {
        [ArticleFilters.ALL]: () => true,
        [ArticleFilters.BOOKMARKED]: (article) => article.is_bookmarked === true,
      },
      defaultFilter: ArticleFilters.ALL,
    });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.INFINITE_SCROLL;
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking article and navigating to PDF viewer should return to articles page with same article selected
     Solution: Navigate to article page with returnTo=articles parameter and openPdfViewer=true to auto-open PDF
     Result: Browser back naturally returns with preserved article selection, PDF opens automatically */
  const handleOpenPdfViewer = () => {
    if (selectedPreviewArticle) {
      const params = new URLSearchParams();
      params.set('returnTo', 'articles');
      params.set('articleId', selectedPreviewArticle.id.toString());
      params.set('openPdfViewer', 'true');
      router.push(`/article/${selectedPreviewArticle.slug}?${params.toString()}`);
    }
  };

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Restoration useEffect interfered with normal clicks, always selecting first article
     Solution: Only restore from URL once on mount when data loads, not on every searchParams change
     Result: Normal article selection works, AND back button restoration works */
  useEffect(() => {
    const articleIdParam = searchParams?.get('articleId');
    // Only restore once when data first loads with a URL param, don't interfere with normal clicks
    if (articleIdParam && displayedItems.length > 0 && isActive && !hasRestoredRef.current) {
      const articleId = parseInt(articleIdParam, 10);
      const article = displayedItems.find((a) => a.id === articleId);
      if (article) {
        setSelectedPreviewArticle(article);
        hasRestoredRef.current = true;
      }
    }
    // Reset restoration flag when tab becomes inactive (allows restoration when switching back)
    if (!isActive) {
      hasRestoredRef.current = false;
    }
  }, [displayedItems, searchParams, isActive, setSelectedPreviewArticle]);

  useKeyboardNavigation({
    items: displayedItems,
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
    hasMore: displayedItems.length < totalItems,
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

  const requestConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

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
        queryKey: ['articles', page, search, accessToken ? 'authenticated' : 'public'],
        enabled: isActive,
      },
      request: requestConfig,
    }
  );

  useEffect(() => {
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType, setViewType]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1) {
        setItems(data.data.items);
      } else {
        appendItems(data.data.items);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType, setItems, appendItems]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      reset();
      setSelectedPreviewArticle(null);
    },
    [setSearch, setPage, reset, setSelectedPreviewArticle]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewType, selectedPreviewArticle]
    // setSelectedPreviewArticle is a stable setState function passed as prop - omitting to prevent infinite re-renders
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
            isLoading={isPending}
            items={displayedItems}
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
            filters={[
              { label: 'All', value: ArticleFilters.ALL },
              { label: 'Bookmarked', value: ArticleFilters.BOOKMARKED },
            ]}
            activeFilter={activeFilter}
            onSelectFilter={(filter) => {
              setFilter(filter);
            }}
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
              {/* Refactored by Claude Sonnet 4.5 on 2026-02-09: Use shared ArticleContentView
                  instead of ArticlePreviewSection for consistent full article display across all sidebars */}
              <div className="mt-2 h-[calc(100vh-80px)] overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-4">
                {selectedPreviewArticle ? (
                  <ArticleContentView
                    articleSlug={selectedPreviewArticle.slug}
                    articleId={selectedPreviewArticle.id}
                    communityId={
                      selectedPreviewArticle.community_article?.community.id
                        ? Number(selectedPreviewArticle.community_article.community.id)
                        : null
                    }
                    communityArticleId={
                      selectedPreviewArticle.community_article?.id
                        ? Number(selectedPreviewArticle.community_article.id)
                        : null
                    }
                    communityName={selectedPreviewArticle.community_article?.community.name || null}
                    isAdmin={false}
                    showPdfViewerButton={true}
                    handleOpenPdfViewer={handleOpenPdfViewer}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-text-tertiary/50">
                      No article selected
                    </h1>
                    <p className="text-text-tertiary/50">Select an article to preview</p>
                  </div>
                )}
              </div>
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
  router,
  pathname: _pathname,
  selectedPreviewArticle,
  setSelectedPreviewArticle,
}) => {
  const searchParams = useSearchParams();
  const hasRestoredRef = React.useRef(false);
  const { displayedItems, setItems, appendItems, setFilter, activeFilter, reset } =
    useFilteredList<ArticlesListOut>({
      filters: {
        [ArticleFilters.ALL]: () => true,
        [ArticleFilters.BOOKMARKED]: (article) => article.is_bookmarked === true,
      },
      defaultFilter: ArticleFilters.ALL,
    });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.INFINITE_SCROLL;
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking "View PDF" requires second click on article page
     Solution: Add openPdfViewer=true parameter to auto-open PDF viewer on article page
     Result: PDF viewer opens automatically without second click */
  const handleOpenPdfViewer = () => {
    if (selectedPreviewArticle) {
      const params = new URLSearchParams();
      params.set('returnTo', 'articles');
      params.set('articleId', selectedPreviewArticle.id.toString());
      params.set('openPdfViewer', 'true');
      router.push(`/article/${selectedPreviewArticle.slug}?${params.toString()}`);
    }
  };

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Restoration useEffect interfered with normal clicks, always selecting first article
     Solution: Only restore from URL once on mount when data loads, not on every searchParams change
     Result: Normal article selection works, AND back button restoration works */
  useEffect(() => {
    const articleIdParam = searchParams?.get('articleId');
    // Only restore once when data first loads with a URL param, don't interfere with normal clicks
    if (articleIdParam && displayedItems.length > 0 && isActive && !hasRestoredRef.current) {
      const articleId = parseInt(articleIdParam, 10);
      const article = displayedItems.find((a) => a.id === articleId);
      if (article) {
        setSelectedPreviewArticle(article);
        hasRestoredRef.current = true;
      }
    }
    // Reset restoration flag when tab becomes inactive (allows restoration when switching back)
    if (!isActive) {
      hasRestoredRef.current = false;
    }
  }, [displayedItems, searchParams, isActive, setSelectedPreviewArticle]);

  useKeyboardNavigation({
    items: displayedItems,
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
    hasMore: displayedItems.length < totalItems,
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
  }, [isDesktop, viewType, setViewType]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1) {
        setItems(data.data.items);
      } else {
        appendItems(data.data.items);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType, setItems, appendItems]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      reset();
      setSelectedPreviewArticle(null);
    },
    [setSearch, setPage, reset, setSelectedPreviewArticle]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewType, selectedPreviewArticle]
    // setSelectedPreviewArticle is a stable setState function passed as prop - omitting to prevent infinite re-renders
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
            isLoading={isPending}
            items={displayedItems}
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
            filters={[
              { label: 'All', value: ArticleFilters.ALL },
              { label: 'Bookmarked', value: ArticleFilters.BOOKMARKED },
            ]}
            activeFilter={activeFilter}
            onSelectFilter={(filter) => {
              setFilter(filter);
            }}
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
              {/* Refactored by Claude Sonnet 4.5 on 2026-02-09: Use shared ArticleContentView
                  instead of ArticlePreviewSection for consistent full article display across all sidebars */}
              <div className="mt-2 h-[calc(100vh-80px)] overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-4">
                {selectedPreviewArticle ? (
                  <ArticleContentView
                    articleSlug={selectedPreviewArticle.slug}
                    articleId={selectedPreviewArticle.id}
                    communityId={
                      selectedPreviewArticle.community_article?.community.id
                        ? Number(selectedPreviewArticle.community_article.community.id)
                        : null
                    }
                    communityArticleId={
                      selectedPreviewArticle.community_article?.id
                        ? Number(selectedPreviewArticle.community_article.id)
                        : null
                    }
                    communityName={selectedPreviewArticle.community_article?.community.name || null}
                    isAdmin={false}
                    showPdfViewerButton={true}
                    handleOpenPdfViewer={handleOpenPdfViewer}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-text-tertiary/50">
                      No article selected
                    </h1>
                    <p className="text-text-tertiary/50">Select an article to preview</p>
                  </div>
                )}
              </div>
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

const ArticlesInner: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.ARTICLES);
  const [articlesPage, setArticlesPage] = useState<number>(1);
  const [myArticlesPage, setMyArticlesPage] = useState<number>(1);
  const [articlesSearch, setArticlesSearch] = useState<string>('');
  const [myArticlesSearch, setMyArticlesSearch] = useState<string>('');
  const [selectedPreviewArticle, setSelectedPreviewArticle] = useState<ArticlesListOut | null>(
    null
  );

  const viewType = useArticlesViewStore((state) => state.viewType);
  const setViewType = useArticlesViewStore((state) => state.setViewType);
  const gridCount = useArticlesViewStore((state) => state.gridCount);
  const setGridCount = useArticlesViewStore((state) => state.setGridCount);

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Selected article state not preserved in URL for back button navigation
     Solution: Update URL when article selected, manage state at parent level
     Result: Article selection preserved across tabs and navigation */
  const handleArticleSelect = React.useCallback(
    (article: ArticlesListOut | null) => {
      setSelectedPreviewArticle(article);
      if (article && pathname) {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('articleId', article.id.toString());
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, pathname]
    // searchParams omitted to prevent infinite loop - we read current value but don't depend on it
  );

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
          accessToken={accessToken ?? undefined}
          router={router}
          pathname={pathname}
          selectedPreviewArticle={selectedPreviewArticle}
          setSelectedPreviewArticle={handleArticleSelect}
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
            router={router}
            pathname={pathname}
            selectedPreviewArticle={selectedPreviewArticle}
            setSelectedPreviewArticle={handleArticleSelect}
          />
        )}
      </div>
    </div>
  );
};

const Articles: React.FC = () => {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
      <ArticlesInner />
    </Suspense>
  );
};

export default Articles;
