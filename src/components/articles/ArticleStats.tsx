import { FC } from 'react';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Calendar, Eye, Heart, MessageCircle, MessageSquare, Star } from 'lucide-react';

import { ArticleOut } from '@/api/schemas';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import { useAuthStore } from '@/stores/authStore';

interface ArticleStatsProps {
  article: ArticleOut;
}

const ArticleStats: FC<ArticleStatsProps> = ({ article }) => {
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, refetch } = useUsersApiGetReactionCount('articles.article', Number(article.id), {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { mutate } = useUsersApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error(error);
      },
    },
  });

  const handleReaction = (reaction: 'upvote') => {
    if (reaction === 'upvote')
      mutate({
        data: { content_type: 'articles.article', object_id: Number(article.id), vote: 1 },
      });
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Article Stats</h3>
      <div className="space-y-4 text-gray-700">
        <div className="flex space-x-4">
          <div className="flex items-center">
            {/* Fill it if the user is already liked (data.data.user_reaction === 1) */}
            {data?.data.user_reaction === 1 ? (
              <Heart
                className="mr-2 h-5 w-5 cursor-pointer text-red-500"
                onClick={() => handleReaction('upvote')}
              />
            ) : (
              <Heart
                className="mr-2 h-5 w-5 cursor-pointer"
                onClick={() => handleReaction('upvote')}
              />
            )}

            <span>{data?.data.likes} likes</span>
          </div>
          <div className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            <span>0 views</span>
          </div>
        </div>
        <div className="flex items-center">
          <Star className="mr-2 h-5 w-5" />
          <span>{article.total_reviews} Reviews and Ratings</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            <span>{article.total_comments} comments</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            <span>{0} discussions</span>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          <span>Published On</span>
        </div>
        <div className="ml-7 text-gray-500">
          {/* Ex: 13th Mar, 2021 (3 years ago) */}
          <span>
            {dayjs(article.created_at).format('Do MMM, YYYY')} (
            {dayjs(article.created_at).fromNow()})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleStats;

export const ArticleStatsSkeleton = () => {
  return (
    <div className="animate-pulse rounded-lg border p-4 shadow-sm">
      <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-gray-300" />
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center">
            <Eye className="mr-2 h-5 w-5 text-gray-300" />
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex items-center">
          <Star className="mr-2 h-5 w-5 text-gray-300" />
          <div className="h-4 w-40 rounded bg-gray-200"></div>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-gray-300" />
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-gray-300" />
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-gray-300" />
          <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
        <div className="ml-7">
          <div className="h-4 w-48 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};
