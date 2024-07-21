import React, { useEffect } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  Share2,
} from 'lucide-react';

import { useArticlesDiscussionApiGetDiscussion } from '@/api/discussions/discussions';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import { Reaction } from '@/types';

import DiscussionComments from './DiscussionComments';

interface DiscussionThreadProps {
  discussionId: number;
  setDiscussionId: (discussionId: React.SetStateAction<number | null>) => void;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({ discussionId, setDiscussionId }) => {
  dayjs.extend(relativeTime);
  const imageData = useIdenticon(40);
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error } = useArticlesDiscussionApiGetDiscussion(discussionId, {
    query: { enabled: discussionId !== null },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const { data: reactions, refetch: refetchReactions } = useUsersApiGetReactionCount(
    'articles.discussion',
    Number(discussionId),
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
        data: { content_type: 'articles.discussion', object_id: Number(discussionId), vote: 1 },
      });
    else if (reaction === 'downvote')
      mutate({
        data: { content_type: 'articles.discussion', object_id: Number(discussionId), vote: -1 },
      });
  };

  const discussion = data?.data;

  return (
    discussion && (
      <div className="text-gray-900 dark:text-gray-100">
        <button
          onClick={() => setDiscussionId(null)}
          className="mb-4 flex items-center text-sm text-gray-600 hover:text-blue-500 hover:underline dark:text-gray-300 dark:hover:text-blue-400"
        >
          <ArrowLeft className="mr-2" size={16} /> Back to Discussions
        </button>
        <div className="mb-4 rounded bg-white p-4 shadow dark:bg-gray-800 dark:shadow-gray-700">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src={discussion.user.profile_pic_url || `data:image/png;base64,${imageData}`}
                  alt={discussion.anonymous_name || discussion.user.username}
                  width={32}
                  height={32}
                  className="mr-2 rounded-full"
                />
                <div>
                  <span className="text-sm">{discussion.anonymous_name}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    • {dayjs(discussion.created_at).fromNow()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="mr-4 flex-grow cursor-pointer font-bold">{discussion.topic}</p>
                <p className="text-sm">{discussion.content}</p>
              </div>
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
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {reactions?.data.likes}
                </span>
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
        <h3 className="mb-2 text-lg font-bold">Comments</h3>
        <DiscussionComments discussionId={discussionId} />
      </div>
    )
  );
};

export default DiscussionThread;
