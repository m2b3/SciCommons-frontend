'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FileX2, MessageCircle, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';

import { usePostsApiGetPost, usePostsApiListPosts } from '@/api/posts/posts';
import { PostOut } from '@/api/schemas';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import RedditStyleComments from '@/components/common/PostComments';
import Hashtag from '@/components/posts/Hashtag';
import Post, { PostSkeleton } from '@/components/posts/Post';
import useIdenticon from '@/hooks/useIdenticons';
import { useAuthStore } from '@/stores/authStore';
import { Reaction } from '@/types';

const PostDetailPage = ({ params }: { params: { postId: number } }) => {
  dayjs.extend(relativeTime);

  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading } = usePostsApiGetPost(params.postId);
  const imageData = useIdenticon(40);

  const { data: reactions, refetch } = useUsersApiGetReactionCount(
    'posts.post',
    Number(params.postId),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { data: userPostData, isPending: userPostDataPending } = usePostsApiListPosts({
    hashtag: data?.data?.hashtags && data?.data?.hashtags[0],
  });

  // Todo: Try using useState Hook
  useEffect(() => {
    if (accessToken) {
      console.log(accessToken);
      refetch();
    }
  }, [accessToken, refetch]);

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

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote')
      mutate({ data: { content_type: 'posts.post', object_id: params.postId, vote: 1 } });
    else if (reaction === 'downvote')
      mutate({ data: { content_type: 'posts.post', object_id: params.postId, vote: -1 } });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[1fr_520px]">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center sm:mt-10 md:px-8">
        {isLoading && <PostDetailSkeleton />}
        {data && (
          <div className="x-auto min-h-screen w-full max-w-[720px] border-gray-100 bg-gray-50 p-6 shadow-common dark:border-gray-800 dark:bg-white/5 sm:min-h-fit sm:rounded-common-xl sm:border">
            <div className="mb-4 flex items-center">
              <Image
                src={data.data.author.profile_pic_url || `data:image/png;base64,${imageData}`}
                alt={data.data.author.username}
                className="mr-3 h-10 w-10 rounded-full"
                width={40}
                height={40}
              />
              <div>
                <h2 className="font-semibold text-gray-950 dark:text-gray-300">
                  {data.data.author.username}
                </h2>
                <p className="text-sm text-gray-400">{dayjs(data.data.created_at).fromNow()}</p>
              </div>
            </div>
            <h1 className="mb-2 text-xl font-bold text-primary">{data.data.title}</h1>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{data.data.content}</p>
            {data?.data?.hashtags && data?.data?.hashtags?.length > 0 && (
              <div className="mb-4 flex w-full flex-wrap gap-1">
                {data?.data?.hashtags?.map((hashtag) => (
                  <Hashtag key={hashtag} hashtag={hashtag} />
                ))}
              </div>
            )}
            <div className="mb-6 flex items-center space-x-4 text-gray-500">
              <button className="flex items-center space-x-1 transition hover:text-blue-500">
                {reactions?.data.user_reaction === 1 ? (
                  <ThumbsUp
                    size={16}
                    className="text-blue-500"
                    onClick={() => handleReaction('upvote')}
                  />
                ) : (
                  <ThumbsUp size={16} onClick={() => handleReaction('upvote')} />
                )}
                <span className="text-xs">{reactions?.data.likes}</span>
              </button>
              <button className="flex items-center space-x-1 transition hover:text-red-500">
                {/* Thumbs Down */}
                {reactions?.data.user_reaction === -1 ? (
                  <ThumbsDown
                    size={16}
                    className="text-red-500"
                    onClick={() => handleReaction('downvote')}
                  />
                ) : (
                  <ThumbsDown size={16} onClick={() => handleReaction('downvote')} />
                )}
                <span className="text-xs">{reactions?.data.dislikes}</span>
              </button>
              <button className="flex items-center space-x-1 transition hover:text-green-500">
                <MessageCircle size={16} />
                <span className="text-xs">{data.data.comments_count} comments</span>
              </button>
              <button className="flex items-center space-x-1 transition hover:text-purple-500">
                <Share2 size={16} />
                <span className="text-xs">Share</span>
              </button>
            </div>
            <div className="border-t border-gray-300 pt-4 dark:border-gray-700">
              <h3 className="text-2lg mb-4 font-semibold text-gray-500">Comments</h3>
              <div className="space-y-4">
                <RedditStyleComments postId={data.data.id ?? 0} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="hidden w-full py-10 pr-10 lg:flex lg:flex-col">
        {!userPostDataPending ? (
          userPostData?.data?.items?.map((post: PostOut) => <Post key={post?.id} {...post} />)
        ) : (
          <PostSkeleton />
        )}
        {userPostData?.data?.items.length === 0 && (
          <div className="flex w-full flex-col items-center pt-20">
            <FileX2 className="text-gray-400 dark:text-gray-700" size={50} strokeWidth={1.5} />
            <h1 className="mt-4 text-lg font-bold text-gray-400 dark:text-gray-700">
              No Popular posts by user!
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;

const PostDetailSkeleton = () => (
  <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg bg-white p-6 dark:bg-gray-800">
    <div className="mb-4 flex items-center">
      <div className="mr-3 h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      <div>
        <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="mt-1 h-4 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
    <div className="mb-2 h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
    <div className="mb-4 h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
    <div className="mb-4 h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
    <div className="mb-4 h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
    <div className="mb-6 flex items-center space-x-4 text-gray-500">
      <div className="flex items-center space-x-1">
        <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-4 w-6 rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-4 w-12 rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-4 w-12 rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
    <div className="border-t border-gray-200 pt-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Comments</h3>
      <div className="mb-4">
        <div className="h-12 rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);
