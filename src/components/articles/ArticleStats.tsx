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
    <div className="rounded-md p-0 res-text-sm">
      <div className="flex flex-wrap gap-2 text-xs text-text-secondary md:gap-12">
        <div className="flex gap-2">
          <span className="font-bold">Published:</span>
          <span>{formatDate(article.created_at)}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-bold">Updated:</span>
          <span>{formatDate(article.updated_at)}</span>
        </div>
      </div>
      <div className="mt-4 flex w-4/5 flex-wrap">
        {/* <Button
          variant={'transparent'}
          className={cn(
            'gap-0 rounded-md bg-functional-blue/20 px-2 py-1 text-xs hover:bg-functional-blue/10'
          )}
          onClick={() => handleReaction('upvote')}
        >
          <ButtonIcon>
            <ThumbsUp
              className={`mr-0 size-4 cursor-pointer text-functional-blue`}
              fill={data?.data.user_reaction === 1 ? 'currentColor' : 'transparent'}
            />
          </ButtonIcon>
          <ButtonTitle className="text-xs font-normal text-text-secondary">
            {data?.data.likes} likes
          </ButtonTitle>
        </Button> */}
        <div className="flex items-center p-1 px-2 text-xs">
          <Star
            className="mr-1 size-4 text-functional-yellow"
            fill="currentColor"
            strokeWidth={0}
          />
          <span className="text-text-secondary">
            {article.total_reviews > 0 && `Avg. Rating: ${article.total_ratings} |`} Reviews:{' '}
            {article.total_reviews}
          </span>
        </div>
        <div className="flex items-center p-1 px-2 text-xs">
          <MessageCircle className="mr-1 size-4 text-text-secondary" />
          <span className="text-text-secondary">{article.total_comments} Comments</span>
        </div>
        <div className="flex items-center p-1 px-2 text-xs">
          <MessageSquare className="mr-1 size-4 text-text-secondary" />
          <span className="text-text-secondary">{article.total_discussions} Discussions</span>
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
