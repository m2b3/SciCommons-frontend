'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import EmptyState from '@/components/common/EmptyState';
import TabNavigation from '@/components/ui/tab-navigation';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityArticleDisplayPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ articleSlug: string; slug: string }>();
  const [submitReview, setSubmitReview] = useState(false);

  const { data, error, isPending } = useArticlesApiGetArticle(
    params?.articleSlug || '',
    { community_name: params?.slug || '' },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
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
    { community_id: data?.data.community_article?.community.id || 0 },
    {
      query: {
        enabled: !!accessToken && !!data,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: FIFTEEN_MINUTES_IN_MS,
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (reviewsError) {
      showErrorToast(reviewsError);
    }
  }, [reviewsError]);

  const hasUserReviewed = reviewsData?.data.items.some((review) => review.is_author) || false;

  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: (
            <div className="flex flex-col gap-2">
              {/* Todo: Uncomment this after testing */}
              {/* {!data.data.is_submitter && (
                <ReviewForm
                  articleId={data?.data.id || 0}
                  refetch={reviewsRefetch}
                  communityId={data?.data.community_article?.community.id}
                />
              )} */}
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
                  communityId={data?.data.community_article?.community.id}
                  onSubmitSuccess={() => setSubmitReview(false)}
                />
              )}
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
          content: (
            <DiscussionForum
              articleId={data?.data.id || 0}
              communityId={data?.data.community_article?.community.id}
              communityArticleId={data?.data.community_article?.id}
              showSubscribeButton={true}
              isAdmin={data?.data.community_article?.is_admin || false}
            />
          ),
        },
        // {
        //   title: 'FAQs',
        //   content: <DisplayFAQs faqs={data.data.faqs || []} />,
        // },
      ]
    : [];

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="w-full p-4 py-4 md:px-6">
      {isPending ? (
        <DisplayArticleSkeleton />
      ) : (
        data && (
          <div className="flex flex-col">
            <DisplayArticle article={data.data} />
            <div className="mt-3 inline-block rounded-md bg-functional-blue/10 px-2 py-0.5 sm:mt-5 sm:rounded-xl sm:px-3 sm:py-1">
              <span className="text-xs leading-snug text-functional-blueContrast">
                {data.data.community_article?.is_pseudonymous
                  ? 'Community admin has enabled pseudonymous reviews & discussions. Your name won’t be shown.'
                  : 'Community admin has disabled pseudonymous reviews & discussions. Your name will be visible.'}
              </span>
            </div>
          </div>
        )
      )}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </div>
  );
};

export default withAuthRedirect(CommunityArticleDisplayPage, { requireAuth: true });
