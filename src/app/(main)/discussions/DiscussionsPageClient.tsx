'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PanelLeft } from 'lucide-react';

import ArticleContentView from '@/components/articles/ArticleContentView';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useReadItemsStore } from '@/stores/readItemsStore';

import DiscussionsSidebar from './DiscussionsSidebar';

interface SelectedArticle {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  communityId: number | null;
  communityArticleId: number | null;
  isAdmin: boolean;
  communityName: string;
}

const LAST_SELECTED_DISCUSSION_ARTICLE_ID_KEY = 'discussions-last-selected-article-id';

const parsePositiveIntegerParam = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
};

const DiscussionsPageClientInner: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedArticle, setSelectedArticle] = useState<SelectedArticle | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarScrollPositionRef = useRef<number>(0);
  const hasInitializedSelection = useRef(false);

  const urlArticleId = parsePositiveIntegerParam(searchParams?.get('articleId') ?? null);
  const urlDiscussionId = parsePositiveIntegerParam(searchParams?.get('discussionId') ?? null);
  /* Fixed by Codex on 2026-02-26
     Who: Codex
     What: Added comment-level deep-link query parsing for discussion mentions.
     Why: Mention links can now target a specific comment, not just the discussion container.
     How: Parse `commentId` from URL and pass it downstream only when it matches the selected article context. */
  const urlCommentId = parsePositiveIntegerParam(searchParams?.get('commentId') ?? null);
  const initialDiscussionId =
    selectedArticle && urlArticleId === selectedArticle.id ? urlDiscussionId : null;
  const initialCommentId =
    initialDiscussionId !== null && selectedArticle && urlArticleId === selectedArticle.id
      ? urlCommentId
      : null;

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: When navigating to article page and using back button, sidebar resets to top article
     Solution: Store selected article ID in URL params and restore scroll position
     Result: Selected article and scroll position preserved across navigation */

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleArticleSelect = (article: SelectedArticle) => {
    setSelectedArticle(article);
    sessionStorage.setItem(LAST_SELECTED_DISCUSSION_ARTICLE_ID_KEY, article.id.toString());
    // Update URL with selected article ID
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('articleId', article.id.toString());
    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Clear stale discussion deep-link params on manual article switches.
       Why: `discussionId`/`commentId` from a prior mention link can point to a different article and reopen the wrong target.
       How: Remove deep-link params whenever the user explicitly selects a different article tile. */
    params.delete('discussionId');
    params.delete('commentId');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Close mobile sidebar when article is selected
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Handle articles loaded - restore selected article from URL
  const handleArticlesLoaded = React.useCallback(
    (
      articles: Array<{
        articleId: number;
        articleTitle: string;
        articleSlug: string;
        articleAbstract: string;
        communityArticleId: number | null;
        communityId: number;
        communityName: string;
        isAdmin: boolean;
      }>
    ) => {
      if (hasInitializedSelection.current || selectedArticle || articles.length === 0) {
        return;
      }

      const mapToSelectedArticle = (article: (typeof articles)[number]): SelectedArticle => ({
        id: article.articleId,
        title: article.articleTitle,
        slug: article.articleSlug,
        abstract: article.articleAbstract,
        communityId: article.communityId,
        communityArticleId: article.communityArticleId,
        isAdmin: article.isAdmin,
        communityName: article.communityName,
      });

      const getArticleById = (articleId: number | null) => {
        if (!articleId) return null;
        return articles.find((article) => article.articleId === articleId) ?? null;
      };

      const urlArticleId = parsePositiveIntegerParam(searchParams?.get('articleId') ?? null);

      let lastSelectedArticleId: number | null = null;
      const savedLastSelectedArticleId = sessionStorage.getItem(
        LAST_SELECTED_DISCUSSION_ARTICLE_ID_KEY
      );
      lastSelectedArticleId = parsePositiveIntegerParam(savedLastSelectedArticleId);

      const clearedArticles = useReadItemsStore.getState().clearedArticles;
      const previouslyReadArticle =
        articles.find((article) =>
          clearedArticles.has(`${article.communityId}-${article.articleId}`)
        ) ?? null;

      const preferredArticle =
        getArticleById(urlArticleId) ??
        getArticleById(lastSelectedArticleId) ??
        previouslyReadArticle ??
        articles[0] ??
        null;

      if (!preferredArticle) return;

      /* Fixed by Codex on 2026-02-25
         Who: Codex
         What: Added deterministic default article selection for discussions split view.
         Why: First load could leave the right panel empty until a manual click.
         How: Initialize selection once from URL articleId, then session last-selected article, then previously read article, then first article. */
      hasInitializedSelection.current = true;
      const nextSelectedArticle = mapToSelectedArticle(preferredArticle);
      setSelectedArticle(nextSelectedArticle);
      sessionStorage.setItem(
        LAST_SELECTED_DISCUSSION_ARTICLE_ID_KEY,
        nextSelectedArticle.id.toString()
      );

      if (pathname && urlArticleId !== nextSelectedArticle.id) {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('articleId', nextSelectedArticle.id.toString());
        params.delete('discussionId');
        params.delete('commentId');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router, searchParams, selectedArticle]
  );

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking PDF viewer in discussions should open article page, then back button should return
     Solution: Navigate to article page with returnTo=discussions and articleId params
     Result: Browser back naturally returns to discussions with preserved article selection */
  const handleOpenPdfViewer = () => {
    if (selectedArticle) {
      const params = new URLSearchParams();
      params.set('returnTo', 'discussions');
      params.set('articleId', selectedArticle.id.toString());
      router.push(`/article/${selectedArticle.slug}?${params.toString()}`);
    }
  };

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Default the discussions view to the Discussions tab and reset per article.
     Why: Clicking a sidebar discussion should open its discussions, not reviews.
     How: Provide defaultTab and a reset key tied to the selected article. */
  const discussionTabDefaults = {
    defaultTab: 'discussions' as const,
    tabResetKey: selectedArticle?.id,
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="flex items-center gap-2 border-b border-common-contrast bg-common-background px-4 py-3">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" isOpen={isMobileSidebarOpen} className="w-80 p-0">
              <SheetTitle className="sr-only">Discussions Sidebar</SheetTitle>
              <DiscussionsSidebar
                onArticleSelect={handleArticleSelect}
                selectedArticle={selectedArticle}
                onArticlesLoaded={handleArticlesLoaded}
                scrollPositionRef={sidebarScrollPositionRef}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-text-primary">
            {selectedArticle ? selectedArticle.title : 'Discussions'}
          </h1>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          {selectedArticle ? (
            <div className="p-4">
              {/* Refactored by Claude Sonnet 4.5 on 2026-02-09: Use shared ArticleContentView
                  instead of duplicating article fetching, reviews, and tabs logic */}
              <ArticleContentView
                articleSlug={selectedArticle.slug}
                articleId={selectedArticle.id}
                communityId={selectedArticle.communityId}
                communityArticleId={selectedArticle.communityArticleId}
                communityName={selectedArticle.communityName}
                isAdmin={selectedArticle.isAdmin}
                showPdfViewerButton={true}
                handleOpenPdfViewer={handleOpenPdfViewer}
                initialDiscussionId={initialDiscussionId}
                initialCommentId={initialCommentId}
                {...discussionTabDefaults}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <EmptyState
                content="Select an article to view discussions"
                subcontent="Choose an article from the sidebar to see its discussions"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Resizable Sidebar */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full border-r border-common-contrast bg-common-cardBackground">
            <DiscussionsSidebar
              onArticleSelect={handleArticleSelect}
              selectedArticle={selectedArticle}
              onArticlesLoaded={handleArticlesLoaded}
              scrollPositionRef={sidebarScrollPositionRef}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="h-full overflow-auto">
            {selectedArticle ? (
              <div className="p-4 md:p-6">
                {/* Refactored by Claude Sonnet 4.5 on 2026-02-09: Use shared ArticleContentView
                    instead of duplicating article fetching, reviews, and tabs logic */}
                <ArticleContentView
                  articleSlug={selectedArticle.slug}
                  articleId={selectedArticle.id}
                  communityId={selectedArticle.communityId}
                  communityArticleId={selectedArticle.communityArticleId}
                  communityName={selectedArticle.communityName}
                  isAdmin={selectedArticle.isAdmin}
                  showPdfViewerButton={true}
                  handleOpenPdfViewer={handleOpenPdfViewer}
                  initialDiscussionId={initialDiscussionId}
                  initialCommentId={initialCommentId}
                  {...discussionTabDefaults}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  content="Select an article to view discussions"
                  subcontent="Choose an article from the sidebar to see its discussions"
                />
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

const DiscussionsPageClient: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
          <EmptyState
            content="Loading discussions..."
            subcontent="Please wait while we load your subscriptions"
          />
        </div>
      }
    >
      <DiscussionsPageClientInner />
    </Suspense>
  );
};

export default DiscussionsPageClient;
