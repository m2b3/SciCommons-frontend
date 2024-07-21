'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import toast from 'react-hot-toast';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import ArticleStats, { ArticleStatsSkeleton } from '@/components/articles/ArticleStats';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import DisplayFAQs from '@/components/articles/DisplayFAQs';
import RelevantArticles from '@/components/articles/RelevantArticles';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import TabNavigation from '@/components/ui/tab-navigation';
import { useAuthStore } from '@/stores/authStore';

const CommunityArticleDisplayPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ articleSlug: string; slug: string }>();

  const [isRightHovered, setIsRightHovered] = useState(false);

  const { data, error, isPending } = useArticlesApiGetArticle(
    params.articleSlug,
    { community_name: params.slug },
    {
      query: { enabled: !!accessToken },
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
    { community_id: data?.data.community_article_status?.community.id || 0 },
    {
      query: { enabled: !!accessToken && !!data },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message || 'An error occurred'}`);
    }
  }, [error]);

  useEffect(() => {
    if (reviewsError) {
      toast.error(`${reviewsError.response?.data.message || 'An error occurred'}`);
    }
  }, [reviewsError]);

  const tabs = [
    {
      title: 'Reviews',
      content: (
        <div className="flex flex-col gap-2">
          <ReviewForm
            articleId={data?.data.id || 0}
            refetch={reviewsRefetch}
            communityId={data?.data.community_article_status?.community.id}
          />
          {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
          {reviewsData &&
            reviewsData.data.items.map((item) => (
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
          communityId={data?.data.community_article_status?.community.id}
        />
      ),
    },
    {
      title: 'FAQs',
      content: <DisplayFAQs faqs={data?.data.faqs || []} />,
    },
  ];

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="container mx-auto">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">
          {isPending ? <DisplayArticleSkeleton /> : data && <DisplayArticle article={data.data} />}
        </div>
        {data && (
          <div className="p-4">
            <TabNavigation tabs={tabs} />
          </div>
        )}
        <div className="p-4">
          <RelevantArticles
            articleId={data?.data.id || 0}
            communityId={data?.data.community_article_status?.community.id || 0}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden h-screen lg:flex">
        {/* Left side */}
        <div className="scrollbar-hide w-2/3 overflow-y-auto p-4">
          {isPending ? <DisplayArticleSkeleton /> : data && <DisplayArticle article={data.data} />}
          {data && (
            <div className="mt-4">
              <TabNavigation tabs={tabs} />
            </div>
          )}
        </div>

        {/* Right side */}
        <div
          className={`w-1/3 p-4 transition-all duration-300 ${
            isRightHovered ? 'custom-scrollbar overflow-y-auto' : 'overflow-y-hidden'
          }`}
          onMouseEnter={() => setIsRightHovered(true)}
          onMouseLeave={() => setIsRightHovered(false)}
        >
          <div className="mb-4">
            {isPending ? <ArticleStatsSkeleton /> : data && <ArticleStats article={data.data} />}
          </div>
          <RelevantArticles articleId={data?.data.id || 0} />
        </div>
      </div>
    </div>
  );
};

export default CommunityArticleDisplayPage;
