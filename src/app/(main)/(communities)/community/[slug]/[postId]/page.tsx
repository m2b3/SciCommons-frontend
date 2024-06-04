'use client';

import { FC } from 'react';

import DisplayArticle from '@/app/article/[slug]/DisplayArticle';
import ReviewForm from '@/app/article/[slug]/ReviewForm';
import Comment from '@/components/Comment';

import CommunityArticleStats from './CommunityArticleStats';
import CommunityRelevantArticles from './CommunityRelevantArticles';

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

const CommunityPost: FC = () => {
  return (
    <div className="container mx-auto flex flex-col space-y-2 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          <DisplayArticle
            imageUrl={articleData.imageUrl}
            title={articleData.title}
            abstract={articleData.abstract}
            authors={articleData.authors}
            keywords={articleData.keywords}
            articleLink={articleData.articleLink}
          />
        </div>
        <div className="p-2 md:w-1/3">
          <CommunityArticleStats
            likes={statsData.likes}
            views={statsData.views}
            reviews={statsData.reviews}
            comments={statsData.comments}
            publishedDate={statsData.publishedDate}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          <ReviewForm />
          <Comment {...reviewData} CommunityComment />
        </div>
        <div className="p-2 md:w-1/3">
          <CommunityRelevantArticles articles={articlesData} />
        </div>
      </div>
    </div>
  );
};

export default CommunityPost;
