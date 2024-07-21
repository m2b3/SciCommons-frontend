import React from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChevronDown, ChevronUp, MessageSquare, MoreVertical, Share2 } from 'lucide-react';

import { DiscussionOut } from '@/api/schemas';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import { Reaction } from '@/types';

interface DiscussionCardProps {
  discussion: DiscussionOut;
  handleDiscussionClick: (id: number) => void;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({ discussion, handleDiscussionClick }) => {
  dayjs.extend(relativeTime);

  const accessToken = useAuthStore((state) => state.accessToken);
  const imageData = useIdenticon(40);

  const { data, refetch: refetchReactions } = useUsersApiGetReactionCount(
    'articles.discussion',
    Number(discussion.id),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate } = useUsersApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetchReactions();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote')
      mutate({
        data: { content_type: 'articles.discussion', object_id: Number(discussion.id), vote: 1 },
      });
    else if (reaction === 'downvote')
      mutate({
        data: { content_type: 'articles.discussion', object_id: Number(discussion.id), vote: -1 },
      });
  };

  return (
    <div
      key={discussion.id}
      className="mb-4 rounded bg-white p-4 shadow dark:bg-gray-800 dark:shadow-gray-700"
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <Image
              src={discussion.user.profile_pic_url || `data:image/png;base64,${imageData}`}
              alt={discussion.anonymous_name || discussion.user.username}
              width={32}
              height={32}
              className="mr-2 rounded-full"
            />
            <div>
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {discussion.anonymous_name}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                • {dayjs(discussion.created_at).fromNow()}
              </span>
            </div>
          </div>
          <p
            className="mr-4 flex-grow cursor-pointer font-bold text-gray-900 hover:text-blue-500 hover:underline dark:text-gray-100 dark:hover:text-blue-400"
            onClick={() => handleDiscussionClick(Number(discussion.id))}
          >
            {discussion.topic}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <button className="mr-4 flex items-center space-x-1">
              <MessageSquare size={16} />
              <span>{discussion.comments_count} comments</span>
            </button>
            <button className="flex items-center space-x-1">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <MoreVertical className="text-gray-500 dark:text-gray-400" />
          <div className="flex flex-col items-center">
            <button
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={() => handleReaction('upvote')}
            >
              <ChevronUp size={20} />
            </button>
            <span className="font-bold text-gray-700 dark:text-gray-300">{data?.data.likes}</span>
            <button
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={() => handleReaction('downvote')}
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;

export const DiscussionCardSkeleton: React.FC = () => {
  return (
    <div className="mb-4 animate-pulse rounded bg-white p-4 shadow dark:bg-gray-800 dark:shadow-gray-700">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <div className="mr-2 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div>
              <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="mt-1 h-2 w-10 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="flex flex-col items-center">
            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
