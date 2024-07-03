'use client';

// Todo: Render this component on server side
import { useEffect } from 'react';

import toast from 'react-hot-toast';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesApiReviewGetReviews } from '@/api/reviews/reviews';
import DisplayArticleSkeletonLoader from '@/components/loaders/DisplayArticleSkeletonLoader';
import TabNavigation from '@/components/ui/tab-navigation';
import { useAuthStore } from '@/stores/authStore';

import ArticleStats from './ArticleStats';
import DisplayArticle from './DisplayArticle';
import DisplayFAQs from './DisplayFAQs';
import RelevantArticles from './RelevantArticles';
import ReviewCard, { ReviewCardSkeleton } from './ReviewCard';
import ReviewForm from './ReviewForm';

const statsData = {
  likes: '1.2k',
  views: '2k',
  reviews: '3k',
  comments: '4k',
  discussions: '10',
  publishedDate: '13th Mar, 2021 (3 years ago)',
};

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

  const { data, error, isPending } = useArticlesApiGetArticle(params.slug, {
    query: { enabled: !!accessToken },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesApiReviewGetReviews(
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
            reviewsData.data.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} refetch={reviewsRefetch} />
            ))}
        </div>
      ),
    },
    {
      title: 'Discussions',
      content: (
        <div className="flex flex-col space-y-4">
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra, erat vitae
            condimentum luctus, velit purus lacinia nunc, id suscipit mi purus et odio. Vestibulum
            ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed
            convallis, neque in placerat egestas, libero diam finibus turpis, a ultricies justo
            tortor nec purus. Sed convallis, neque in placerat egestas, libero diam finibus turpis,
            a ultricies justo tortor nec purus. Sed convallis, neque in placerat egestas, libero
            diam finibus turpis, a ultricies justo tortor nec purus.
          </p>
        </div>
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
    <div className="container mx-auto flex flex-col space-y-2 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          {isPending && <DisplayArticleSkeletonLoader />}
          {data && (
            <DisplayArticle
              imageUrl={data.data.article_image_url ? data.data.article_image_url : ''}
              title={data.data.title}
              abstract={data.data.abstract}
              authors={data.data.authors
                .map((author: { value: string; label: string }) => author.label)
                .join(', ')}
              keywords={data.data.keywords
                .map((keyword: { value: string; label: string }) => keyword.label)
                .join(', ')}
              articleLink={data.data.article_pdf_file_url ? data.data.article_pdf_file_url : ''}
              slug={data.data.slug}
              isSubmitter={data.data.is_submitter || false}
            />
          )}
        </div>
        <div className="p-2 md:w-1/3">
          <ArticleStats
            likes={statsData.likes}
            views={statsData.views}
            reviews={statsData.reviews}
            comments={statsData.comments}
            discussions={statsData.discussions}
            publishedDate={statsData.publishedDate}
          />
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
