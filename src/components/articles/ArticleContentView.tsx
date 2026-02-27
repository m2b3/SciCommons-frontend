/* Created by Claude Sonnet 4.5 on 2026-02-09
   Problem: Article display logic duplicated between ArticleDisplayPageClient and DiscussionsPageClient
   Solution: Extracted shared logic into reusable ArticleContentView component
   Result: ~180 lines of shared logic, eliminated ~100 lines of duplication, single source of truth */
import React, { useEffect, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import { FIVE_MINUTES_IN_MS, TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import EmptyState from '../common/EmptyState';
import TabNavigation from '../ui/tab-navigation';
import DiscussionForum from './DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from './DisplayArticle';
import ReviewsTabBody from './ReviewsTabBody';

interface ArticleContentViewProps {
  articleSlug: string;
  articleId?: number;
  communityId?: number | null;
  communityArticleId?: number | null;
  communityName?: string | null;
  isAdmin?: boolean;
  showPdfViewerButton?: boolean;
  handleOpenPdfViewer?: () => void;
  onReviewFormToggle?: (show: boolean) => void;
  submitReviewExternal?: boolean;
  defaultTab?: 'reviews' | 'discussions';
  tabResetKey?: string | number;
}

/**
 * Shared component for displaying article content with reviews and discussions tabs.
 * Used by both ArticleDisplayPageClient and DiscussionsPageClient to avoid duplication.
 *
 * @param articleSlug - The article slug for fetching article data
 * @param articleId - Optional article ID (used when available to avoid waiting for fetch)
 * @param communityId - Optional community ID for discussions
 * @param communityArticleId - Optional community article ID for discussions
 * @param isAdmin - Optional admin flag for discussions
 * @param showPdfViewerButton - Whether to show the PDF viewer button
 * @param handleOpenPdfViewer - Handler for opening PDF viewer
 * @param onReviewFormToggle - Callback when review form is toggled (for parent state management)
 * @param submitReviewExternal - External control for showing review form
 * @param defaultTab - Optional default tab selection ("reviews" or "discussions")
 * @param tabResetKey - Optional key to reset tab state when the parent selection changes
 */
const ArticleContentView: React.FC<ArticleContentViewProps> = ({
  articleSlug,
  articleId: externalArticleId,
  communityId,
  communityArticleId,
  communityName,
  isAdmin,
  showPdfViewerButton = false,
  handleOpenPdfViewer,
  onReviewFormToggle,
  submitReviewExternal,
  defaultTab = 'reviews',
  tabResetKey,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submitReviewInternal, setSubmitReviewInternal] = useState(false);

  // Fetch full article data
  const isQueryEnabled = !!articleSlug && !!accessToken;

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Sidebar shows 403 error for community articles while article page works
     Root cause: Community articles require community_name parameter, sidebar wasn't sending it
     Solution: Pass community_name when available (for community articles)
     Result: Sidebar now works for both regular and community articles */
  const {
    data: articleData,
    error: articleError,
    isPending: articleIsPending,
  } = useArticlesApiGetArticle(
    articleSlug,
    communityName ? { community_name: communityName } : {},
    {
      request: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
      query: {
        enabled: isQueryEnabled,
        staleTime: TEN_MINUTES_IN_MS,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      },
    }
  );

  // Use external articleId if provided, otherwise use fetched data
  const articleId = externalArticleId || articleData?.data?.id;

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Keep review listing in the same community scope used for review creation.
     Why: Sidebar submissions can be community-scoped; listing without community_id can omit the new review.
     How: Derive list params from resolved community context and pass them into the reviews query key/request. */
  const resolvedCommunityId =
    communityId ?? articleData?.data?.community_article?.community?.id ?? null;
  const reviewListParams = resolvedCommunityId ? { community_id: resolvedCommunityId } : {};

  // Fetch reviews for the article
  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(articleId || 0, reviewListParams, {
    query: {
      enabled: !!articleId && !!accessToken,
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  // Show errors
  useEffect(() => {
    if (articleError) showErrorToast(articleError);
  }, [articleError]);

  useEffect(() => {
    if (reviewsError) showErrorToast(reviewsError);
  }, [reviewsError]);

  // Check if user has reviewed
  const hasUserReviewed = reviewsData?.data.items.some((review) => review.is_author) || false;

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Resolve community identifiers from fetched article data when parent lacks them.
     Why: Articles tab previews may not include community metadata, hiding the subscribe button.
     How: Fall back to articleData.community_article values and pass them into discussions. */
  const resolvedCommunityArticleId =
    communityArticleId ?? articleData?.data?.community_article?.id ?? null;
  const isReviewFormControlled = typeof submitReviewExternal === 'boolean';
  const isReviewFormOpen = isReviewFormControlled ? !!submitReviewExternal : submitReviewInternal;

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Added an internal review-form fallback for right-panel article previews.
     Why: Preview contexts do not always provide parent-controlled review toggle state, so Add review did nothing.
     How: Track local review-form state when external control is absent and unify toggle handling. */
  const handleReviewFormToggle = () => {
    const nextState = !isReviewFormOpen;
    if (isReviewFormControlled && onReviewFormToggle) {
      onReviewFormToggle(nextState);
      return;
    }
    setSubmitReviewInternal(nextState);
  };

  useEffect(() => {
    // Reset local form-open state when switching articles to avoid stale UI carryover.
    setSubmitReviewInternal(false);
  }, [articleSlug]);

  const shouldShowSubscribeButton = !!resolvedCommunityArticleId && !!resolvedCommunityId;
  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Support a default tab override for article content views.
     Why: Discussions page should open with the Discussions tab selected by default.
     How: Convert the defaultTab name into a stable tab index for TabNavigation. */
  const initialTabIndex = defaultTab === 'discussions' ? 1 : 0;

  /* Fixed by Codex on 2026-02-19
     Who: Codex
     What: Build a context-preserving return path for article settings.
     Why: Editing from list/preview contexts should return users to the same panel and selected article.
     How: Reuse current pathname/query params and enforce articleId in the generated return URL. */
  const editReturnPath = React.useMemo(() => {
    if (!pathname || !articleId) return null;
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('articleId', String(articleId));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams, articleId]);

  // Create tabs configuration
  const tabs = articleData
    ? [
        {
          title: 'Reviews',
          content: () => (
            /* Fixed by Codex on 2026-02-21
               Who: Codex
               What: Replaced inline review-tab rendering with shared ReviewsTabBody.
               Why: Keep article/discussions review UI behavior consistent without copy drift.
               How: Delegate notice, form toggle, and review list states to a shared component. */
            <ReviewsTabBody
              articleId={Number(articleId)}
              reviews={reviewsData?.data.items}
              reviewsIsPending={reviewsIsPending}
              reviewsRefetch={reviewsRefetch}
              hasUserReviewed={hasUserReviewed}
              isReviewFormOpen={isReviewFormOpen}
              onReviewFormToggle={handleReviewFormToggle}
              onReviewSubmitSuccess={() => {
                if (isReviewFormControlled && onReviewFormToggle) {
                  onReviewFormToggle(false);
                  return;
                }
                setSubmitReviewInternal(false);
              }}
              communityId={resolvedCommunityId}
              isSubmitter={articleData.data.is_submitter}
              reviewFormContainerId="article-content-view-review-form"
            />
          ),
        },
        {
          title: 'Discussions',
          content: () =>
            articleData.data.id ? (
              <DiscussionForum
                articleId={Number(articleData.data.id)}
                communityId={resolvedCommunityId}
                communityArticleId={resolvedCommunityArticleId}
                showSubscribeButton={shouldShowSubscribeButton}
                isAdmin={isAdmin}
              />
            ) : null,
        },
      ]
    : [];

  if (articleIsPending) {
    return <DisplayArticleSkeleton />;
  }

  if (!articleData) {
    return <EmptyState content="Article not found" subcontent="The article could not be loaded" />;
  }

  return (
    <>
      <DisplayArticle
        article={articleData.data}
        editCommunityName={
          communityName ?? articleData.data.community_article?.community?.name ?? null
        }
        editReturnPath={editReturnPath}
        showPdfViewerButton={showPdfViewerButton}
        handleOpenPdfViewer={handleOpenPdfViewer}
      />
      <div className="mt-4">
        <TabNavigation tabs={tabs} initialActiveTab={initialTabIndex} resetKey={tabResetKey} />
      </div>
    </>
  );
};

export default ArticleContentView;
