import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageCircle, ThumbsUp } from 'lucide-react';

import { PostOut } from '@/api/schemas';
import useIdenticon from '@/hooks/useIdenticons';

dayjs.extend(relativeTime);

const PostHighlightCard: React.FC<{ post: PostOut }> = ({ post }) => {
  const imageData = useIdenticon(32);

  return (
    <div className="mb-2 border-b border-gray-200 pb-2 last:border-b-0">
      <div className="flex items-center space-x-3">
        <Image
          src={post.author.profile_pic_url || `data:image/png;base64,${imageData}`}
          alt={`Profile of ${post.author.username}`}
          className="h-8 w-8 rounded-full"
          width={32}
          height={32}
        />
        <div className="flex-grow">
          <Link href={`/posts/${post.id}`} className="block">
            <h3 className="font-semibold text-gray-900 res-text-xs hover:underline">
              {post.title}
            </h3>
          </Link>
          <div className="mt-1 flex items-center text-gray-500 res-text-xs">
            <span>{post.author.username}</span>
            <span className="mx-1">&middot;</span>
            <span>{dayjs(post.created_at).fromNow()}</span>
          </div>
        </div>
      </div>
      <div className="mt-1 pl-11">
        <div className="line-clamp-1 text-gray-600 res-text-xs">{post.content}</div>
        <div className="mt-1 flex items-center space-x-4 text-gray-500 res-text-xs">
          <div className="flex items-center space-x-1">
            <ThumbsUp size={12} />
            <span>{post.upvotes || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle size={12} />
            <span>{post.comments_count} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHighlightCard;

export const PostHighlightCardSkeleton: React.FC = () => {
  return (
    <div className="mb-2 animate-pulse border-b border-gray-200 pb-2 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="flex-grow">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-1 flex items-center space-x-2">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="mt-1 pl-11">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="mt-1 flex items-center space-x-4">
          <div className="h-3 w-12 rounded bg-gray-200" />
          <div className="h-3 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
};
