'use client';

// Todo: Render this component on server side
import { useEffect } from 'react';

import { useSession } from 'next-auth/react';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import ArticleStats, { ArticleStatsSkeleton } from '@/components/articles/ArticleStats';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import DisplayFAQs from '@/components/articles/DisplayFAQs';
import RelevantArticles from '@/components/articles/RelevantArticles';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import EmptyState from '@/components/common/EmptyState';
import SplitScreenLayout from '@/components/common/SplitScreenLayout';
import TabNavigation from '@/components/ui/tab-navigation';
import { showErrorToast } from '@/lib/toastHelpers';

const ArticleDisplayPage = ({ params }: { params: { slug: string } }) => {
  const { data: session } = useSession();

  const { data, error, isPending } = useArticlesApiGetArticle(params.slug);

  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(
    data?.data.id || 0,
    {},
    {
      query: { enabled: !!session && !!data },
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
              <ReviewForm articleId={Number(data.data.id)} refetch={reviewsRefetch} />
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
        {
          title: 'FAQs',
          content: <DisplayFAQs faqs={data.data.faqs || []} />,
        },
      ]
    : [];

  const LeftSide = (
    <>
      {isPending ? <DisplayArticleSkeleton /> : data && <DisplayArticle article={data.data} />}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </>
  );

  const RightSide = (
    <>
      <div className="mb-4">
        {isPending ? <ArticleStatsSkeleton /> : data && <ArticleStats article={data.data} />}
      </div>
      <RelevantArticles articleId={data?.data.id || 0} />
    </>
  );
  return <SplitScreenLayout leftSide={LeftSide} rightSide={RightSide} />;
};

// export default withAuthRedirect(ArticleDisplayPage, { requireAuth: true });
export default ArticleDisplayPage;
