import Image from 'next/image';
import Link from 'next/link';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageCircle, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';

import { PostOut } from '@/api/schemas';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import TruncateText from '@/components/common/TruncateText';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';

import Hashtag from './Hashtag';

type Reaction = 'upvote' | 'downvote';

const PostCard = (post: PostOut) => {
  dayjs.extend(relativeTime);
  const imageData = useIdenticon(40);

  const { data, refetch } = useUsersCommonApiGetReactionCount('posts.post', Number(post.id));

  const { mutate } = useUsersCommonApiPostReaction({
    mutation: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote' && post.id)
      mutate({ data: { content_type: 'posts.post', object_id: post.id, vote: 1 } });
    else if (reaction === 'downvote' && post.id)
      mutate({ data: { content_type: 'posts.post', object_id: post.id, vote: -1 } });
  };

  return (
    <div className="mb-6 overflow-hidden rounded-common-xl border border-gray-100 bg-white-secondary shadow-md res-text-xs">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src={post.author.profile_pic_url || `data:image/png;base64,${imageData}`}
              alt={`Profile picture of ${post.author.username}`}
              className="mr-3 h-10 w-10 rounded-full"
              width={36}
              height={36}
            />
            <div className="flex items-center">
              <h3 className="font-semibold text-gray-900 res-text-sm">{post.author.username}</h3>
              <span className="mx-2 text-gray-400">&middot;</span>
              <p className="text-gray-400">{dayjs(post?.created_at).fromNow()}</p>
            </div>
          </div>
          {/* <div className="flex items-center space-x-2">
            <button className="text-gray-500 transition hover:text-gray-700">
              <MoreHorizontal size={20} />
            </button>
          </div> */}
        </div>
        <Link href={`/posts/${post.id}`}>
          <h2 className="mb-2 cursor-pointer font-bold text-primary res-text-base">
            {post?.title}
          </h2>
        </Link>
        <div className="mb-4 text-gray-800">
          <TruncateText text={post?.content} maxLines={3} />
        </div>

        {post?.hashtags && post?.hashtags?.length > 0 && (
          <div className="mb-4 flex w-full flex-wrap gap-1">
            {post?.hashtags?.map((hashtag) => <Hashtag key={hashtag} hashtag={hashtag} />)}
          </div>
        )}

        <div className="flex items-center space-x-6 text-gray-500">
          <button className="flex items-center space-x-1 transition hover:text-blue-500">
            {data?.data?.user_reaction === 1 ? (
              <ThumbsUp
                size={20}
                className="text-blue-500"
                onClick={() => handleReaction('upvote')}
              />
            ) : (
              <ThumbsUp size={20} onClick={() => handleReaction('upvote')} />
            )}
            <span>{data?.data?.likes}</span>
          </button>
          <button className="flex items-center space-x-1 transition hover:text-red-500">
            {data?.data.user_reaction === -1 ? (
              <ThumbsDown
                size={20}
                className="text-red-500"
                onClick={() => handleReaction('downvote')}
              />
            ) : (
              <ThumbsDown size={20} onClick={() => handleReaction('downvote')} />
            )}
          </button>
          <button className="flex items-center space-x-1 transition hover:text-green-500">
            <MessageCircle size={16} />
            <span>{post.comments_count} comments</span>
          </button>
          <button className="flex items-center space-x-1 transition hover:text-purple-500">
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

export const PostCardSkeleton = () => (
  <div className="mb-6 overflow-hidden rounded-common-xl bg-gray-100 shadow-md">
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex flex-col">
            <div className="h-4 w-24 rounded bg-gray-300"></div>
            <div className="mt-1 h-4 w-16 rounded bg-gray-300"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded bg-gray-300"></div>
          <div className="h-5 w-5 rounded bg-gray-300"></div>
        </div>
      </div>
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
      <div className="flex items-center space-x-6 text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-gray-300"></div>
          <div className="h-4 w-6 rounded bg-gray-300"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-gray-300"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-gray-300"></div>
          <div className="h-4 w-12 rounded bg-gray-300"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-gray-300"></div>
          <div className="h-4 w-12 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  </div>
);
