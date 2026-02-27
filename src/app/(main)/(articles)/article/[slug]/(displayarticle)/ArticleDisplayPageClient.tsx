'use client';

// Client component for displaying article page
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { MDXEditorMethods } from '@mdxeditor/editor';
import { BookOpen, FileText, X } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import ReviewsTabBody from '@/components/articles/ReviewsTabBody';
import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import TabNavigation from '@/components/ui/tab-navigation';
import {
  FIVE_MINUTES_IN_MS,
  SCREEN_WIDTH_LG,
  TEN_MINUTES_IN_MS,
} from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

// Dynamically import PDF components to avoid SSR issues
const PDFViewerContainer = dynamic(() => import('@/components/pdf/PDFViewerContainer'), {
  ssr: false,
  loading: () => (
    <Skeleton className="flex h-full w-full items-center justify-center">
      <BlockSkeleton className="h-full w-full" />
    </Skeleton>
  ),
});

const AnnotationSidebar = dynamic(() => import('@/components/pdf/AnnotationSidebar'), {
  ssr: false,
});

interface Props {
  params: { slug: string };
}

function ArticleDisplayPageClientInner({ params }: Props) {
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
  const [submitReview, setSubmitReview] = useState(false);

  // PDF viewer state
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [pendingQuote, setPendingQuote] = useState<string | null>(null);
  const [jumpToAnnotation, setJumpToAnnotation] = useState<
    | ((area: {
        pageIndex: number;
        top: number;
        left: number;
        height: number;
        width: number;
      }) => void)
    | null
  >(null);

  // Responsive check - PDF feature only available on lg and above (1024px+)
  const isPdfEnabled = useMediaQuery(`(min-width: ${SCREEN_WIDTH_LG}px)`);

  // Reference for the review editor
  const _reviewEditorRef = useRef<MDXEditorMethods>(null);

  const { data, error, isPending } = useArticlesApiGetArticle(
    params.slug,
    {},
    {
      request: axiosConfig,
      query: {
        enabled: !!accessToken,
        staleTime: TEN_MINUTES_IN_MS,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      },
    }
  );

  // Performance: Fetch reviews in parallel with article content loading
  // Previously: enabled: !!accessToken && !!data (waited for full article)
  // Now: enabled: !!accessToken && !!data?.data.id (starts as soon as ID available)
  // This eliminates the waterfall effect and reduces perceived load time
  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(
    data?.data.id || 0,
    {},
    {
      query: {
        enabled: !!accessToken && !!data?.data.id,
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) showErrorToast(error);
  }, [error]);

  useEffect(() => {
    if (reviewsError) showErrorToast(reviewsError);
  }, [reviewsError]);

  // Auto-select first PDF if available
  useEffect(() => {
    if (data?.data.article_pdf_urls && data.data.article_pdf_urls.length > 0 && !selectedPdfUrl) {
      setSelectedPdfUrl(data.data.article_pdf_urls[0]);
    }
  }, [data?.data.article_pdf_urls, selectedPdfUrl]);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking "View PDF" from sidebar required second click on article page
     Solution: Detect openPdfViewer=true URL parameter and auto-open PDF viewer
     Result: PDF viewer opens automatically when navigating from sidebar */
  useEffect(() => {
    const openPdfParam = searchParams?.get('openPdfViewer');
    if (openPdfParam === 'true' && data && isPdfEnabled && !showPdfViewer) {
      setShowPdfViewer(true);
    }
  }, [searchParams, data, isPdfEnabled, showPdfViewer]);

  const hasUserReviewed = reviewsData?.data.items.some((review) => review.is_author) || false;

  // Handle quote selection from PDF viewer
  const handleQuoteSelect = useCallback((quoteText: string) => {
    setPendingQuote(quoteText);
    // Open review form if not already open
    setSubmitReview(true);
  }, []);

  // Handle opening PDF viewer
  const handleOpenPdfViewer = (pdfUrl?: string) => {
    if (pdfUrl) {
      setSelectedPdfUrl(pdfUrl);
    }
    setShowPdfViewer(true);
  };

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Added redundant "Back to Discussions" button when browser back already exists
     Solution: Removed custom back button and returnTo handling, let browser back handle it naturally
     Result: Cleaner UI, no duplicate navigation controls */
  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
  };

  // Handle jump to annotation ready callback
  const handleJumpToAnnotationReady = useCallback(
    (
      jumpFn: (area: {
        pageIndex: number;
        top: number;
        left: number;
        height: number;
        width: number;
      }) => void
    ) => {
      setJumpToAnnotation(() => jumpFn);
    },
    []
  );

  // Check if article has PDFs
  // const hasPdfs = data?.data.article_pdf_urls && data.data.article_pdf_urls.length > 0;

  // Performance: Use function content for lazy loading with TabNavigation
  // Functions prevent component instantiation until tab is active
  // Reviews tab loads first (default), Discussions only load when user clicks that tab
  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: () => (
            /* Fixed by Codex on 2026-02-21
               Who: Codex
               What: Switched the article-page review tab to shared ReviewsTabBody.
               Why: Avoid route-level duplication while preserving PDF quote-specific UX.
               How: Pass route-specific quote notice via afterReviewFormContent prop. */
            <ReviewsTabBody
              articleId={Number(data.data.id)}
              reviews={reviewsData?.data.items}
              reviewsIsPending={reviewsIsPending}
              reviewsRefetch={reviewsRefetch}
              hasUserReviewed={hasUserReviewed}
              isReviewFormOpen={submitReview}
              onReviewFormToggle={() => setSubmitReview((prev) => !prev)}
              onReviewSubmitSuccess={() => {
                setSubmitReview(false);
                setPendingQuote(null);
              }}
              isSubmitter={data.data.is_submitter}
              reviewFormContainerId="article-review-form"
              afterReviewFormContent={
                pendingQuote && submitReview ? (
                  <div className="mb-4 flex items-center justify-between rounded-md bg-functional-blue/10 px-4 py-2">
                    <span className="text-sm text-functional-blue">
                      Quote copied! Paste it in your review with Ctrl+V / Cmd+V
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingQuote(null)}
                      className="text-functional-blue hover:text-functional-blue/80"
                      aria-label="Dismiss quote notice"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null
              }
            />
          ),
        },
        {
          title: 'Discussions',
          content: () => <DiscussionForum articleId={Number(data.data.id)} />,
        },
      ]
    : [];

  // Render article content
  const renderArticleContent = () => (
    <div className="h-full overflow-y-auto p-4 md:px-6">
      {isPending ? (
        <DisplayArticleSkeleton />
      ) : (
        data && (
          <DisplayArticle
            article={data.data}
            showPdfViewerButton={isPdfEnabled && !showPdfViewer}
            handleOpenPdfViewer={handleOpenPdfViewer}
          />
        )
      )}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </div>
  );

  // Split view with PDF (only on md+ viewports)
  if (isPdfEnabled && showPdfViewer && selectedPdfUrl) {
    return (
      <div className="h-[calc(100vh-64px)] w-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* PDF Viewer Panel */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="flex h-full flex-col">
              {/* PDF Panel Header */}
              <div className="flex items-center justify-between border-b border-common-minimal bg-common-cardBackground px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">PDF Viewer</span>

                  {/* PDF selector if multiple PDFs */}
                  {data?.data.article_pdf_urls && data.data.article_pdf_urls.length > 1 && (
                    <select
                      value={selectedPdfUrl}
                      onChange={(e) => setSelectedPdfUrl(e.target.value)}
                      className="ml-2 rounded border border-common-minimal bg-common-background px-2 py-1 text-xs text-text-primary"
                    >
                      {data.data.article_pdf_urls.map((url, idx) => (
                        <option key={url} value={url}>
                          PDF {idx + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="transparent"
                    size="sm"
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className={`h-8 gap-1 px-2 text-xs ${showAnnotations ? 'bg-common-minimal' : ''}`}
                    aria-pressed={showAnnotations}
                    aria-controls="article-annotation-sidebar"
                  >
                    <BookOpen size={14} />
                    Notes
                  </Button>
                  <Button
                    variant="transparent"
                    size="sm"
                    onClick={handleClosePdfViewer}
                    className="h-8 w-8 p-0"
                    aria-label="Close PDF viewer"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* PDF Viewer Content */}
              <div className="flex flex-1 overflow-hidden">
                <div
                  className={`flex-1 ${showAnnotations ? 'border-r border-common-minimal' : ''}`}
                >
                  <PDFViewerContainer
                    pdfUrl={selectedPdfUrl}
                    articleSlug={params.slug}
                    onQuoteSelect={handleQuoteSelect}
                    onJumpToAnnotationReady={handleJumpToAnnotationReady}
                  />
                </div>

                {/* Annotation Sidebar */}
                {showAnnotations && (
                  <div
                    id="article-annotation-sidebar"
                    className="w-72 overflow-hidden bg-common-cardBackground"
                  >
                    <AnnotationSidebar
                      articleSlug={params.slug}
                      pdfUrl={selectedPdfUrl}
                      onQuoteSelect={handleQuoteSelect}
                      onJumpToAnnotation={jumpToAnnotation || undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Article Content Panel */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            {renderArticleContent()}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  // Default view (mobile or when PDF viewer is closed)
  return <div className="container w-full py-4">{renderArticleContent()}</div>;
}

function ArticleDisplayPageClient({ params }: Props) {
  return (
    <Suspense fallback={<div className="container w-full py-4">Loading...</div>}>
      <ArticleDisplayPageClientInner params={params} />
    </Suspense>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default withAuthRedirect(ArticleDisplayPageClient, { requireAuth: true });
