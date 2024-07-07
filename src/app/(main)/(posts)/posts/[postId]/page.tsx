'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageCircle, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';

import { usePostsApiGetPost } from '@/api/posts/posts';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import RedditStyleComments from '@/components/common/PostComments';
import { useAuthStore } from '@/stores/authStore';
import { Reaction } from '@/types';

const PostDetailPage = ({ params }: { params: { postId: number } }) => {
  dayjs.extend(relativeTime);

  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading } = usePostsApiGetPost(params.postId);

  const { data: reactions, refetch } = useUsersApiGetReactionCount(
    'posts.post',
    Number(params.postId),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

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
    <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-lg bg-white">
      {isLoading && <PostDetailSkeleton />}
      {data && (
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <Image
              src={data.data.author.profile_pic_url || 'https://picsum.photos/200/200'}
              alt={data.data.author.username}
              className="mr-3 h-10 w-10 rounded-full"
              width={40}
              height={40}
            />
            <div>
              <h2 className="font-semibold text-gray-800">{data.data.author.username}</h2>
              <p className="text-sm text-gray-500">{dayjs(data.data.created_at).fromNow()}</p>
            </div>
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">{data.data.title}</h1>
          <p className="mb-4 text-sm text-gray-700">{data.data.content}</p>
          <div className="mb-6 flex items-center space-x-4 text-gray-500">
            <button className="flex items-center space-x-1 transition hover:text-blue-500">
              {reactions?.data.user_reaction === 1 ? (
                <ThumbsUp
                  size={20}
                  className="text-blue-500"
                  onClick={() => handleReaction('upvote')}
                />
              ) : (
                <ThumbsUp size={20} onClick={() => handleReaction('upvote')} />
              )}
              <span>{reactions?.data.likes}</span>
            </button>
            <button className="flex items-center space-x-1 transition hover:text-red-500">
              {/* Thumbs Down */}
              {reactions?.data.user_reaction === -1 ? (
                <ThumbsDown
                  size={20}
                  className="text-red-500"
                  onClick={() => handleReaction('downvote')}
                />
              ) : (
                <ThumbsDown size={20} onClick={() => handleReaction('downvote')} />
              )}
              <span>{reactions?.data.dislikes}</span>
            </button>
            <button className="flex items-center space-x-1 transition hover:text-green-500">
              <MessageCircle size={20} />
              <span>{data.data.comments_count} comments</span>
            </button>
            <button className="flex items-center space-x-1 transition hover:text-purple-500">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Comments</h3>
            <div className="space-y-4">
              <RedditStyleComments postId={data.data.id ?? 0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;

const PostDetailSkeleton = () => (
  <div className="mx-auto mt-10 min-h-screen max-w-2xl overflow-hidden rounded-lg bg-white p-6">
    <div className="mb-4 flex items-center">
      <div className="mr-3 h-10 w-10 rounded-full bg-gray-300"></div>
      <div>
        <div className="h-4 w-24 rounded bg-gray-300"></div>
        <div className="mt-1 h-4 w-16 rounded bg-gray-300"></div>
      </div>
    </div>
    <div className="mb-2 h-8 w-3/4 rounded bg-gray-300"></div>
    <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
    <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
    <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
    <div className="mb-6 flex items-center space-x-4 text-gray-500">
      <div className="flex items-center space-x-1">
        <div className="h-5 w-5 rounded bg-gray-300"></div>
        <div className="h-4 w-6 rounded bg-gray-300"></div>
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
    <div className="border-t border-gray-200 pt-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Comments</h3>
      <div className="mb-4">
        <div className="h-12 rounded bg-gray-300"></div>
      </div>
    </div>
  </div>
);
