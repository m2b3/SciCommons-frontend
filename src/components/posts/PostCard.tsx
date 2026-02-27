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
import { useAuthStore } from '@/stores/authStore';

import Hashtag from './Hashtag';

type Reaction = 'upvote' | 'downvote';

const PostCard = (post: PostOut) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);
  const imageData = useIdenticon(40);

  const requestConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const { data, refetch } = useUsersCommonApiGetReactionCount('posts.post', Number(post.id), {
    request: requestConfig,
  });

  const { mutate } = useUsersCommonApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
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
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Replace post card hard-coded grays with semantic tokens.
          Why: Keep post surfaces and reactions consistent across skins.
          How: Swap gray/blue/red utilities for functional + text tokens. */}
      <div className="mb-6 overflow-hidden rounded-common-xl border border-common-minimal bg-common-cardBackground shadow-md res-text-xs">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={post.author.profile_pic_url || `data:image/png;base64,${imageData}`}
                alt={`Profile picture of ${post.author.username}`}
                className="mr-3 h-10 w-10 rounded-full object-cover"
                width={40}
                height={40}
                quality={75}
                sizes="40px"
                loading="lazy"
              />
              <div className="flex items-center">
                <h3 className="font-semibold text-text-primary res-text-sm">
                  {post.author.username}
                </h3>
                <span className="mx-2 text-text-tertiary">&middot;</span>
                <p className="text-text-tertiary">{dayjs(post?.created_at).fromNow()}</p>
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
          <div className="mb-4 text-text-secondary">
            <TruncateText text={post?.content} maxLines={3} />
          </div>

          {post?.hashtags && post?.hashtags?.length > 0 && (
            <div className="mb-4 flex w-full flex-wrap gap-1">
              {post?.hashtags?.map((hashtag) => <Hashtag key={hashtag} hashtag={hashtag} />)}
            </div>
          )}

          <div className="flex items-center space-x-6 text-text-tertiary">
            {/* Fixed by Codex on 2026-02-15
             Who: Codex
             What: Make reaction buttons accessible and keyboard friendly.
             Why: Icon-only clicks were not focusable or labeled for screen readers.
             How: Move handlers to the button and add aria-label/aria-pressed. */}
            <button
              type="button"
              aria-label="Upvote post"
              aria-pressed={data?.data?.user_reaction === 1}
              className="flex items-center space-x-1 transition hover:text-functional-blue"
              onClick={() => handleReaction('upvote')}
            >
              {data?.data?.user_reaction === 1 ? (
                <ThumbsUp size={20} className="text-functional-blue" />
              ) : (
                <ThumbsUp size={20} />
              )}
              <span>{data?.data?.likes}</span>
            </button>
            <button
              type="button"
              aria-label="Downvote post"
              aria-pressed={data?.data?.user_reaction === -1}
              className="flex items-center space-x-1 transition hover:text-functional-red"
              onClick={() => handleReaction('downvote')}
            >
              {data?.data.user_reaction === -1 ? (
                <ThumbsDown size={20} className="text-functional-red" />
              ) : (
                <ThumbsDown size={20} />
              )}
            </button>
            <button className="flex items-center space-x-1 transition hover:text-functional-green">
              <MessageCircle size={16} />
              <span>{post.comments_count} comments</span>
            </button>
            <button className="flex items-center space-x-1 transition hover:text-functional-yellow">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCard;

export const PostCardSkeleton = () => (
  <div className="mb-6 overflow-hidden rounded-common-xl bg-common-minimal shadow-md">
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 h-10 w-10 rounded-full bg-common-contrast"></div>
          <div className="flex flex-col">
            <div className="h-4 w-24 rounded bg-common-contrast"></div>
            <div className="mt-1 h-4 w-16 rounded bg-common-contrast"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded bg-common-contrast"></div>
          <div className="h-5 w-5 rounded bg-common-contrast"></div>
        </div>
      </div>
      <div className="mb-2 h-6 w-3/4 rounded bg-common-contrast"></div>
      <div className="mb-4 h-4 w-full rounded bg-common-contrast"></div>
      <div className="mb-4 h-4 w-full rounded bg-common-contrast"></div>
      <div className="flex items-center space-x-6 text-text-tertiary">
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-common-contrast"></div>
          <div className="h-4 w-6 rounded bg-common-contrast"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-common-contrast"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-common-contrast"></div>
          <div className="h-4 w-12 rounded bg-common-contrast"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-5 w-5 rounded bg-common-contrast"></div>
          <div className="h-4 w-12 rounded bg-common-contrast"></div>
        </div>
      </div>
    </div>
  </div>
);
