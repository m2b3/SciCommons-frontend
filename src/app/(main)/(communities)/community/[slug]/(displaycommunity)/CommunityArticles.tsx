import React, { Suspense, useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FileX2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import ArticleContentView from '@/components/articles/ArticleContentView';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { FIVE_MINUTES_IN_MS, SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { cn } from '@/lib/utils';
import { useArticlesViewStore } from '@/stores/articlesViewStore';
import { useAuthStore } from '@/stores/authStore';

interface CommunityArticlesProps {
  communityId: number;
  communityName: string;
}

const CommunityArticlesInner: React.FC<CommunityArticlesProps> = ({
  communityId,
  communityName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const viewType = useArticlesViewStore((s) => s.viewType as 'grid' | 'list' | 'preview');
  const setViewType = useArticlesViewStore((s) => s.setViewType);
  const gridCount = useArticlesViewStore((s) => s.gridCount);
  const setGridCount = useArticlesViewStore((s) => s.setGridCount);
  const [selectedPreviewArticle, setSelectedPreviewArticle] = useState<ArticlesListOut | null>(
    null
  );
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);
  const requestedArticleId = React.useMemo(() => {
    const articleIdParam = searchParams?.get('articleId');
    if (!articleIdParam) return null;
    const parsedArticleId = Number(articleIdParam);
    return Number.isInteger(parsedArticleId) ? parsedArticleId : null;
  }, [searchParams]);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking article and navigating to PDF viewer should return to community page with same article selected
     Solution: Navigate to article page with returnTo=community parameter and openPdfViewer=true to auto-open PDF
     Result: Browser back naturally returns with preserved article selection, PDF opens automatically */
  const handleOpenPdfViewer = () => {
    if (selectedPreviewArticle && pathname) {
      const params = new URLSearchParams();
      params.set('returnTo', 'community');
      params.set('communityName', communityName);
      params.set('articleId', selectedPreviewArticle.id.toString());
      params.set('openPdfViewer', 'true');
      router.push(`/article/${selectedPreviewArticle.slug}?${params.toString()}`);
    }
  };

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Selected article resets to top when navigating back from article page
     Solution: Persist selected article ID in URL params using router.replace
     Result: Article selection preserved across navigation with browser back button */
  const handleArticleSelect = React.useCallback(
    (article: ArticlesListOut | null) => {
      setSelectedPreviewArticle(article);
      if (article && pathname) {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('articleId', article.id.toString());
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType, setViewType]);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Intermittent logout on first community entry
     Solution: Add retry: false to prevent multiple unauthorized attempts if timing issue occurs
     Result: Single failed request won't trigger multiple 401s and logout loops */
  const { data, isPending, error } = useArticlesApiGetArticles(
    {
      community_id: communityId,
      page: page,
      per_page: 50,
      search: search,
    },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: false, // Don't retry failed requests to prevent multiple 401s
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

  useEffect(() => {
    if (!requestedArticleId || articles.length === 0) return;
    const articleToRestore = articles.find((article) => article.id === requestedArticleId);
    if (!articleToRestore) return;
    if (selectedPreviewArticle?.id === requestedArticleId) return;

    /* Fixed by Codex on 2026-02-19
       Problem: Community URL articleId deep-link always previewed the first list item.
       Root cause: Keyboard navigation auto-selected the first article before URL param restoration.
       Solution: Restore preview selection from query param once list data is available.
       Result: /community/{slug}?articleId={id} now opens the requested article in preview. */
    handleArticleSelect(articleToRestore);
  }, [requestedArticleId, articles, selectedPreviewArticle?.id, handleArticleSelect]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      setArticles([]);
      handleArticleSelect(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
    // handleArticleSelect is stable useCallback, setState functions are stable - omitting to prevent unnecessary re-renders
  );

  const handleLoadMore = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  useKeyboardNavigation<ArticlesListOut>({
    items: articles,
    selectedItem: selectedPreviewArticle,
    setSelectedItem: handleArticleSelect,
    isEnabled: viewType === 'preview',
    getItemId: (article) => article.id,
    autoSelectFirst: !requestedArticleId,
    getItemElement: (item) =>
      document.querySelector(`[data-article-id="${String(item.id)}"]`) as HTMLElement | null,
    hasMore: false,
  });

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking articles in grid view does nothing - navigation broken
     Root cause: onClick wrapper intercepts all clicks, prevents ArticleCard navigation
     Solution: Only intercept clicks in preview mode, let ArticleCard navigate in grid mode
     Result: Grid view navigates to article page, preview mode selects for sidebar */
  const renderArticle = useCallback(
    (article: ArticlesListOut) => (
      <div
        data-article-id={String(article.id)}
        /* Fixed by Codex on 2026-02-15
           Who: Codex
           What: Make preview selection keyboard accessible.
           Why: Div click handlers are not focusable for keyboard users.
           How: Add role, tabIndex, and key handling when preview mode is active. */
        role={viewType === 'preview' ? 'button' : undefined}
        tabIndex={viewType === 'preview' ? 0 : undefined}
        aria-label={viewType === 'preview' ? 'Select article for preview' : undefined}
        onClick={viewType === 'preview' ? () => handleArticleSelect(article) : undefined}
        onKeyDown={(event) => {
          if (viewType !== 'preview') return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleArticleSelect(article);
          }
        }}
        className={
          viewType === 'preview'
            ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/50'
            : undefined
        }
      >
        <ArticleCard
          article={article}
          forCommunity
          compactType={'full'}
          className={cn(
            'h-full',
            viewType === 'preview' &&
              selectedPreviewArticle?.id === article.id &&
              'border-functional-green/50 bg-functional-green/10'
          )}
          handleArticlePreview={() => handleArticleSelect(article)}
        />
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewType, selectedPreviewArticle]
    // handleArticleSelect is stable useCallback - omitting to prevent unnecessary re-renders
  );

  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div className="h-[calc(100vh-130px)] space-y-2">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full"
        autoSaveId="community-articles-list-panel"
      >
        <ResizablePanel
          className={cn(
            'h-[calc(100vh-130px)] overflow-y-auto',
            viewType === 'preview' ? 'pr-2' : ''
          )}
          /* Fixed by Codex on 2026-02-19
             Problem: Community articles left panel had no visible scrollbar in split view.
             Root cause: ResizablePanel applies inline overflow hidden and this panel only used class-based overflow.
             Solution: Set a fixed panel height and explicitly override inline overflow to auto.
             Result: Mouse/trackpad scrolling and scrollbar visibility work for long article lists. */
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
            totalItems={data?.data.total || 0}
            totalPages={data?.data.num_pages || 1}
            currentPage={page}
            itemsPerPage={50}
            loadingType={LoadingType.INFINITE_SCROLL}
            searchPlaceholder="Search articles..."
            emptyStateContent="No articles found"
            emptyStateSubcontent="Be the first to create an article in this community"
            emptyStateLogo={<FileX2 size={64} />}
            showViewTypeIcons={true}
            viewType={viewType}
            setViewType={setViewType}
            setGridCount={setGridCount}
            allowedViewTypes={['grid', 'preview']}
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
              <div className="h-[calc(100vh-90px)] overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-4">
                {selectedPreviewArticle ? (
                  <ArticleContentView
                    articleSlug={selectedPreviewArticle.slug}
                    articleId={selectedPreviewArticle.id}
                    communityId={communityId}
                    communityArticleId={
                      selectedPreviewArticle.community_article?.id
                        ? Number(selectedPreviewArticle.community_article.id)
                        : null
                    }
                    communityName={communityName}
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

const CommunityArticles: React.FC<CommunityArticlesProps> = (props) => {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <CommunityArticlesInner {...props} />
    </Suspense>
  );
};

export default CommunityArticles;
