import { FC } from 'react';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Calendar, Clock, Eye, MessageCircle, MessageSquare, Star, ThumbsUp } from 'lucide-react';

import { ArticleOut } from '@/api/schemas';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import { useAuthStore } from '@/stores/authStore';

interface ArticleStatsProps {
  article: ArticleOut;
}

const ArticleStats: FC<ArticleStatsProps> = ({ article }) => {
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, refetch } = useUsersCommonApiGetReactionCount(
    'articles.article',
    Number(article.id),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate } = useUsersCommonApiPostReaction({
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

  const formatDate = (date: string) => {
    return `${dayjs(date).format('Do MMM, YYYY')} (${dayjs(date).fromNow()})`;
  };

  return (
    <div className="rounded-lg border bg-white-secondary p-4 text-gray-900 shadow-sm res-text-sm">
      <h3 className="mb-4 font-bold res-text-base">Article Stats</h3>
      <div className="space-y-4 text-gray-700">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <ThumbsUp
              className={`mr-2 h-5 w-5 cursor-pointer ${
                data?.data.user_reaction === 1 ? 'text-blue-500' : 'text-gray-400'
              }`}
              onClick={() => handleReaction('upvote')}
            />
            <span>{data?.data.likes} likes</span>
          </div>
          <div className="flex items-center">
            <Eye className="mr-2 h-5 w-5 text-gray-400" />
            <span>0 views</span>
          </div>
        </div>
        <div className="flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-400" />
          <span>{article.total_reviews} Reviews and Ratings</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-green-500" />
            <span>{article.total_comments} comments</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
            <span>{article.total_discussions} discussions</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">Published:</span>
          <span className="text-gray-500">{formatDate(article.created_at)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <span className="font-semibold">Updated:</span>
          <span className="text-gray-500">{formatDate(article.updated_at)}</span>
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
            <ThumbsUp className="mr-2 h-5 w-5 text-gray-300" />
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
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 flex-shrink-0 text-gray-300" />
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-4 w-40 rounded bg-gray-200"></div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 flex-shrink-0 text-gray-300" />
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-4 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};
