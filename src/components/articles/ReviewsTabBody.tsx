import React from 'react';

import type { ReviewOut } from '@/api/schemas';
import { cn } from '@/lib/utils';

import EmptyState from '../common/EmptyState';
import ReviewCard, { ReviewCardSkeleton } from './ReviewCard';
import ReviewForm from './ReviewForm';

export const REVIEW_NOTICE_TEXT =
  'For now, only 1 review per person. You may edit your review if you wish, and previous versions will remain saved and visible.';

interface ReviewsTabBodyProps {
  articleId: number;
  reviews?: ReviewOut[];
  reviewsIsPending: boolean;
  reviewsRefetch?: () => void;
  hasUserReviewed: boolean;
  isReviewFormOpen: boolean;
  onReviewFormToggle: () => void;
  onReviewSubmitSuccess?: () => void;
  communityId?: number | null;
  isSubmitter?: boolean;
  reviewFormContainerId: string;
  className?: string;
  showHeading?: boolean;
  afterReviewFormContent?: React.ReactNode;
}

/* Fixed by Codex on 2026-02-21
   Who: Codex
   What: Centralized shared review-tab rendering into one reusable component.
   Why: Review notice, add-review controls, and list states were duplicated across article/community/discussions surfaces.
   How: Provide a configurable body component with route-level hooks for form state, community scope, and optional extra UI. */
const ReviewsTabBody: React.FC<ReviewsTabBodyProps> = ({
  articleId,
  reviews,
  reviewsIsPending,
  reviewsRefetch,
  hasUserReviewed,
  isReviewFormOpen,
  onReviewFormToggle,
  onReviewSubmitSuccess,
  communityId,
  isSubmitter = false,
  reviewFormContainerId,
  className,
  showHeading = true,
  afterReviewFormContent,
}) => {
  return (
    <div className={cn('flex flex-col', className)}>
      {!hasUserReviewed && (
        <div className="flex items-center justify-between rounded-md bg-functional-green/5 px-4 py-2">
          <span className="text-xs leading-snug text-text-secondary">{REVIEW_NOTICE_TEXT}</span>
          <button
            type="button"
            className="text-xs text-functional-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-blue"
            onClick={onReviewFormToggle}
            aria-expanded={isReviewFormOpen}
            aria-controls={reviewFormContainerId}
          >
            {isReviewFormOpen ? 'Cancel' : 'Add review'}
          </button>
        </div>
      )}

      {isReviewFormOpen && !hasUserReviewed && (
        <div id={reviewFormContainerId}>
          <ReviewForm
            articleId={articleId}
            refetch={reviewsRefetch}
            communityId={communityId}
            is_submitter={isSubmitter}
            onSubmitSuccess={onReviewSubmitSuccess}
          />
        </div>
      )}

      {afterReviewFormContent}

      {showHeading && (
        <span className="mb-4 border-b border-common-minimal pb-2 text-base font-bold text-text-secondary">
          Reviews
        </span>
      )}

      {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}

      {reviews && reviews.length === 0 && (
        <EmptyState content="No reviews yet" subcontent="Be the first to review this article" />
      )}

      {reviews?.map((item) => <ReviewCard key={item.id} review={item} refetch={reviewsRefetch} />)}
    </div>
  );
};

export default ReviewsTabBody;
