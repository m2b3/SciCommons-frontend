import React from 'react';

import { useArticlesApiReviewListReviews } from '@/api/reviews/reviews';
import { useAuthStore } from '@/stores/authStore';

import ReviewCard, { ReviewCardSkeleton } from './ReviewCard';
import ReviewForm from './ReviewForm';

interface ReviewsAndCommentsProps {
  articleId: number;
}

const ReviewsAndComments: React.FC<ReviewsAndCommentsProps> = ({ articleId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    data: reviewsData,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesApiReviewListReviews(
    articleId,
    {},
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  return (
    <div className="flex flex-col gap-2">
      <ReviewForm articleId={articleId} refetch={reviewsRefetch} />
      {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
      {reviewsData &&
        reviewsData.data.items.map((item) => (
          <ReviewCard key={item.id} review={item} refetch={reviewsRefetch} />
        ))}
    </div>
  );
};

export default ReviewsAndComments;
