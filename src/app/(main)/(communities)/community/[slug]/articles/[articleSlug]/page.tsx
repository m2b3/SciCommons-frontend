'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useParams } from 'next/navigation';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import DisplayFAQs from '@/components/articles/DisplayFAQs';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import EmptyState from '@/components/common/EmptyState';
import TabNavigation from '@/components/ui/tab-navigation';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityArticleDisplayPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ articleSlug: string; slug: string }>();

  // State to manage review order, defaulting to 'latest'
  const [reviewOrder, setReviewOrder] = useState<'latest' | 'oldest'>('latest');

  const { data, error, isPending } = useArticlesApiGetArticle(
    params?.articleSlug || '',
    { community_name: params?.slug || '' },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
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
      query: { enabled: !!accessToken && !!data },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) showErrorToast(error);
  }, [error]);

  useEffect(() => {
    if (reviewsError) showErrorToast(reviewsError);
  }, [reviewsError]);

  // UseMemo to sort reviews based on reviewOrder
  const orderedReviews = useMemo(() => {
    if (!reviewsData?.data.items) return [];
    const reviewsArray = [...reviewsData.data.items];
    if (reviewOrder === 'latest') {
      // Sort by updated_at, fallback to created_at (descending)
      return reviewsArray.sort(
        (a, b) =>
          new Date(b.updated_at ?? b.created_at).getTime() -
          new Date(a.updated_at ?? a.created_at).getTime()
      );
    }
    // 'oldest' - ascending
    return reviewsArray.sort(
      (a, b) =>
        new Date(a.updated_at ?? a.created_at).getTime() -
        new Date(b.updated_at ?? b.created_at).getTime()
    );
  }, [reviewsData, reviewOrder]);

  // When a review is created or updated, force filter to "latest" and refetch
  const handleReviewsRefresh = () => {
    setReviewOrder('latest');
    reviewsRefetch && reviewsRefetch();
  };

  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: (
            <div className="flex flex-col gap-2">
              <ReviewForm
                articleId={Number(data.data.id)}
                refetch={handleReviewsRefresh}
                is_submitter={data.data.is_submitter}
                communityId={data?.data.community_article?.community.id}
              />
              <div className="mb-2 flex justify-end">
                <select
                  value={reviewOrder}
                  onChange={(e) => setReviewOrder(e.target.value as 'latest' | 'oldest')}
                  className="rounded border bg-common-background p-1 text-sm"
                  style={{ minWidth: 100 }}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
              {orderedReviews.length === 0 && (
                <EmptyState
                  content="No reviews yet"
                  subcontent="Be the first to review this article"
                />
              )}
              {orderedReviews.map((item) => (
                <ReviewCard key={item.id} review={item} refetch={handleReviewsRefresh} />
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
            />
          ),
        },
        {
          title: 'FAQs',
          content: <DisplayFAQs faqs={data.data.faqs || []} />,
        },
      ]
    : [];

  return (
    <div className="w-full p-4 py-4 md:px-6">
      {isPending ? (
        <DisplayArticleSkeleton />
      ) : (
        data && (
          <div className="flex flex-col">
            <DisplayArticle article={data.data} />
            <div className="-z-10 rounded-md bg-functional-blue/10 px-3 py-1 sm:-mt-6 sm:rounded-xl sm:px-4 sm:py-2 sm:pt-7">
              <span className="text-xs text-functional-blueContrast">
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
