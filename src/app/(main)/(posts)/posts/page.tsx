'use client';

import React from 'react';

import Link from 'next/link';

import { usePostsApiListPosts } from '@/api/posts/posts';
import Post, { PostSkeleton } from '@/components/posts/Post';

const PostList = () => {
  const { data, isPending } = usePostsApiListPosts();

  return (
    <div className="mx-auto mt-10 min-h-screen max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/posts/createpost">
          <button className="flex cursor-pointer items-center rounded-full bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            <span className="mr-2">+</span> New Post
          </button>
        </Link>
      </div>
      {isPending && Array.from({ length: 5 }).map((_, index) => <PostSkeleton key={index} />)}
      {data?.data.items.map((post) => <Post key={post.id} {...post} />)}
    </div>
  );
};

export default PostList;
