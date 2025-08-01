'use client';

// Client component for displaying article page
import { useEffect, useState } from 'react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import EmptyState from '@/components/common/EmptyState';
import TabNavigation from '@/components/ui/tab-navigation';
import { FIVE_MINUTES_IN_MS, TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  params: { slug: string };
}

function ArticleDisplayPageClient({ params }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
  const [submitReview, setSubmitReview] = useState(false);

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

  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-md bg-functional-green/5 px-4 py-2">
                <span className="text-sm font-semibold text-text-secondary">
                  Have your reviews?
                </span>
                <span
                  className="cursor-pointer text-xs text-functional-green hover:underline"
                  onClick={() => setSubmitReview(!submitReview)}
                >
                  {submitReview ? 'Cancel' : 'Add review'}
                </span>
              </div>
              {submitReview && (
                <ReviewForm
                  articleId={Number(data.data.id)}
                  refetch={reviewsRefetch}
                  is_submitter={data.data.is_submitter}
                />
              )}
              <span className="border-b border-common-minimal pb-2 text-base font-bold text-text-secondary">
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

  return (
    <div className="container w-full p-4 py-4 md:px-6">
      {isPending ? <DisplayArticleSkeleton /> : data && <DisplayArticle article={data.data} />}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default withAuthRedirect(ArticleDisplayPageClient, { requireAuth: true });
