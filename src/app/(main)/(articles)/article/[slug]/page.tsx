'use client';

// Todo: Render this component on server side
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import DisplayArticleSkeletonLoader from '@/components/loaders/DisplayArticleSkeletonLoader';
import { useAuthStore } from '@/stores/authStore';

import ArticleStats from './ArticleStats';
import DisplayArticle from './DisplayArticle';
import RelevantArticles from './RelevantArticles';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const articleData = {
  imageUrl: 'https://source.unsplash.com/random/400x400',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  abstract:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quis nibh a neque consectetur tincidunt eget id orci. Suspendisse orci lacus, rhoncus sed velit in, condimentum vestibulum lorem. Proin a aliquet ligula, at fermentum ipsum. Etiam eleifend gravida augue, vitae vestibulum ipsum elementum a.',
  authors: 'Lorem ipsum, Ut lobortis',
  keywords: 'Nullam, vulputate, libero, quis, mollis, efficitur',
  articleLink: 'https://dinakar.co.in',
};

const statsData = {
  likes: '1.2k',
  views: '2k',
  reviews: '3k',
  comments: '4k',
  discussions: '10',
  publishedDate: '13th Mar, 2021 (3 years ago)',
};

const reviewData = {
  author: 'Lorem Ipsum',
  rating: 3,
  date: '10:11 am, 13th Mar 2021',
  timeAgo: '1 month ago',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  content:
    'Ut id diam velit. Nam pulvinar, eros vitae egestas volutpat, enim purus commodo nisl, ac placerat neque eros id ex. In hac habitasse platea dictumst. Fusce non diam enim. Duis volutpat neque et ullamcorper rutrum. Sed vitae nibh quis justo sollicitudin sodales. Sed vehicula dolor orci, at consectetur lectus consectetur eget. Phasellus suscipit maximus nulla ut congue. Aenean aliquet ante a ipsum lacinia dapibus vel tempus erat.',
  likes: 100,
  dislikes: 0,
  replies: 10,
};

const articlesData = [
  {
    imageUrl: 'https://source.unsplash.com/random/400x400',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
  {
    imageUrl: 'https://source.unsplash.com/random/400x401',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
  {
    imageUrl: 'https://source.unsplash.com/random/400x402',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
];

const ArticleDisplayPage = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, error, isPending } = useArticlesApiGetArticle(
    Number(params.slug),
    {},
    {
      axios: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto flex flex-col space-y-2 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          {isPending ? (
            <DisplayArticleSkeletonLoader />
          ) : (
            <DisplayArticle
              imageUrl={data.data.image ? data.data.image : articleData.imageUrl}
              title={data.data.title}
              abstract={articleData.abstract}
              authors={JSON.parse(data.data.authors)
                .map((author: { value: string; label: string }) => author.label)
                .join(', ')}
              keywords={JSON.parse(data.data.keywords)
                .map((keyword: { value: string; label: string }) => keyword.label)
                .join(', ')}
              articleLink={data.data.pdf_file ? data.data.pdf_file : '#'}
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
          <ReviewForm articleId={data ? data.data.id : 0} />
          <ReviewCard {...reviewData} />
        </div>
        <div className="p-2 md:w-1/3">
          <RelevantArticles articles={articlesData} />
        </div>
      </div>
    </div>
  );
};

export default ArticleDisplayPage;
