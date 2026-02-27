'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PanelLeft } from 'lucide-react';

import ArticleContentView from '@/components/articles/ArticleContentView';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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

const DiscussionsPageClientInner: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedArticle, setSelectedArticle] = useState<SelectedArticle | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarScrollPositionRef = useRef<number>(0);
  const hasRestoredFromUrl = useRef(false);

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
    // Update URL with selected article ID
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('articleId', article.id.toString());
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
      const articleIdParam = searchParams?.get('articleId');
      // Only restore once when component mounts with URL param
      if (articleIdParam && !selectedArticle && !hasRestoredFromUrl.current) {
        const articleId = parseInt(articleIdParam, 10);
        const article = articles.find((a) => a.articleId === articleId);
        if (article) {
          hasRestoredFromUrl.current = true;
          setSelectedArticle({
            id: article.articleId,
            title: article.articleTitle,
            slug: article.articleSlug,
            abstract: article.articleAbstract,
            communityId: article.communityId,
            communityArticleId: article.communityArticleId,
            isAdmin: article.isAdmin,
            communityName: article.communityName,
          });
        }
      }
    },
    [searchParams, selectedArticle]
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
