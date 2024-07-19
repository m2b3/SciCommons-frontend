'use client';

// Todo: Render this component on server side
import { useEffect } from 'react';

import toast from 'react-hot-toast';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import ArticleStats, { ArticleStatsSkeleton } from '@/components/articles/ArticleStats';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import DisplayFAQs from '@/components/articles/DisplayFAQs';
import ReviewCard, { ReviewCardSkeleton } from '@/components/articles/ReviewCard';
import ReviewForm from '@/components/articles/ReviewForm';
import TabNavigation from '@/components/ui/tab-navigation';
import { useAuthStore } from '@/stores/authStore';

import RelevantArticles from './RelevantArticles';

const articlesData = [
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
  {
    imageUrl: 'https://picsum.photos/200/202',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
];

const ArticleDisplayPage = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error, isPending } = useArticlesApiGetArticle(
    params.slug,
    {},
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
    {},
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
          <ReviewForm articleId={data?.data.id || 0} refetch={reviewsRefetch} />
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
      content: <DiscussionForum articleId={data?.data.id || 0} />,
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
    <div className="container mx-auto flex flex-col space-y-2 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          {isPending && <DisplayArticleSkeleton />}
          {data && <DisplayArticle article={data.data} />}
        </div>
        <div className="p-2 md:w-1/3">
          {isPending && <ArticleStatsSkeleton />}

          {data && <ArticleStats article={data.data} />}
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          <TabNavigation tabs={tabs} />
        </div>
        <div className="p-2 md:w-1/3">
          <RelevantArticles articles={articlesData} />
        </div>
      </div>
    </div>
  );
};

export default ArticleDisplayPage;
