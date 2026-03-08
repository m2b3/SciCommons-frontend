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
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Replace post highlight card grays with tokens.
          Why: Keep post highlights consistent across skins.
          How: Swap gray utilities for semantic classes. */}
      <div className="mb-2 border-b border-common-minimal pb-2 last:border-b-0">
        <div className="flex items-center space-x-3">
          <Image
            src={post.author.profile_pic_url || `data:image/png;base64,${imageData}`}
            alt={`Profile of ${post.author.username}`}
            className="h-8 w-8 rounded-full object-cover"
            width={32}
            height={32}
            quality={75}
            sizes="32px"
            loading="lazy"
          />
          <div className="flex-grow">
            <Link href={`/posts/${post.id}`} className="block">
              <h3 className="font-semibold text-text-primary res-text-xs hover:underline">
                {post.title}
              </h3>
            </Link>
            <div className="mt-1 flex items-center text-text-tertiary res-text-xs">
              <span>{post.author.username}</span>
              <span className="mx-1">&middot;</span>
              <span>{dayjs(post.created_at).fromNow()}</span>
            </div>
          </div>
        </div>
        <div className="mt-1 pl-11">
          <div className="line-clamp-1 text-text-secondary res-text-xs">{post.content}</div>
          <div className="mt-1 flex items-center space-x-4 text-text-tertiary res-text-xs">
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
    </>
  );
};

export default PostHighlightCard;

export const PostHighlightCardSkeleton: React.FC = () => {
  return (
    <div className="mb-2 animate-pulse border-b border-common-minimal pb-2 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-common-minimal" />
        <div className="flex-grow">
          <div className="h-4 w-3/4 rounded bg-common-minimal" />
          <div className="mt-1 flex items-center space-x-2">
            <div className="h-3 w-20 rounded bg-common-minimal" />
            <div className="h-3 w-24 rounded bg-common-minimal" />
          </div>
        </div>
      </div>
      <div className="mt-1 pl-11">
        <div className="h-3 w-full rounded bg-common-minimal" />
        <div className="mt-1 flex items-center space-x-4">
          <div className="h-3 w-12 rounded bg-common-minimal" />
          <div className="h-3 w-16 rounded bg-common-minimal" />
        </div>
      </div>
    </div>
  );
};
