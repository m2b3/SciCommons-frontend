'use client';

// Client component for displaying article page
import { useCallback, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';

import { MDXEditorMethods } from '@mdxeditor/editor';
import { BookOpen, FileText, X } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import EmptyState from '@/components/common/EmptyState';
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

function ArticleDisplayPageClient({ params }: Props) {
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
  const reviewEditorRef = useRef<MDXEditorMethods>(null);

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
        enabled: !!accessToken && !!data,
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

  // Handle closing PDF viewer
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

  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: (
            <div className="flex flex-col">
              {!hasUserReviewed && (
                <div className="flex items-center justify-between rounded-md bg-functional-green/5 px-4 py-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    Have your reviews? (You can add a review only once.)
                  </span>
                  <span
                    className="cursor-pointer text-xs text-functional-green hover:underline"
                    onClick={() => setSubmitReview(!submitReview)}
                  >
                    {submitReview ? 'Cancel' : 'Add review'}
                  </span>
                </div>
              )}
              {submitReview && !hasUserReviewed && (
                <ReviewForm
                  articleId={Number(data.data.id)}
                  refetch={reviewsRefetch}
                  is_submitter={data.data.is_submitter}
                  onSubmitSuccess={() => {
                    setSubmitReview(false);
                    setPendingQuote(null);
                  }}
                />
              )}
              {/* Show pending quote notice */}
              {pendingQuote && submitReview && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-functional-blue/10 px-4 py-2">
                  <span className="text-sm text-functional-blue">
                    Quote copied! Paste it in your review with Ctrl+V / Cmd+V
                  </span>
                  <button
                    onClick={() => setPendingQuote(null)}
                    className="text-functional-blue hover:text-functional-blue/80"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <span className="mb-4 border-b border-common-minimal pb-2 text-base font-bold text-text-secondary">
                Reviews
              </span>
              {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
              {reviewsData?.data.items.length === 0 && (
                <EmptyState
                  content="No reviews yet"
                  subcontent="Be the first to review this article"
                />
              )}
              {reviewsData?.data.items.map((item) => (
                <ReviewCard key={item.id} review={item} refetch={reviewsRefetch} />
              ))}
            </div>
          ),
        },
        {
          title: 'Discussions',
          content: <DiscussionForum articleId={Number(data.data.id)} />,
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
                  >
                    <BookOpen size={14} />
                    Notes
                  </Button>
                  <Button
                    variant="transparent"
                    size="sm"
                    onClick={handleClosePdfViewer}
                    className="h-8 w-8 p-0"
                    title="Close PDF viewer"
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
                  <div className="w-72 overflow-hidden bg-common-cardBackground">
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default withAuthRedirect(ArticleDisplayPageClient, { requireAuth: true });
