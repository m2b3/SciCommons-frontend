'use client';

import React, { Suspense, useEffect, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { FileX2 } from 'lucide-react';

import { usePostsApiListPosts } from '@/api/posts/posts';
import Post, { PostSkeleton } from '@/components/posts/Post';

const PostListContent = () => {
  const searchParams = useSearchParams();
  const [hashtag, setHashtag] = useState<string>('');

  const queryParams = hashtag ? { hashtags: hashtag } : undefined;
  const { data, isPending } = usePostsApiListPosts(queryParams);

  useEffect(() => {
    const queryHashtag = searchParams.get('hashtag');
    queryHashtag && setHashtag(`#${queryHashtag}` || '');
  }, [searchParams]);

  if (isPending) {
    return Array.from({ length: 5 }).map((_, index) => <PostSkeleton key={index} />);
  }

  return data?.data?.items && data?.data?.items?.length > 0 ? (
    data?.data?.items?.map((post) => <Post key={post.id} {...post} />)
  ) : (
    <div className="flex w-full flex-col items-center pt-20">
      <FileX2 className="text-gray-400 dark:text-gray-700" size={100} strokeWidth={1.5} />
      <h1 className="mt-4 text-2xl font-bold text-gray-400 dark:text-gray-700">No Posts Yet!</h1>
    </div>
  );
};

const PostList = () => {
  return (
    <div className="mx-auto mt-10 min-h-screen max-w-[760px] px-4 md:px-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-primary">Posts</h1>
        <div className="ite flex gap-4">
          <Link href="/posts/createpost">
            <button className="flex cursor-pointer items-center rounded-full bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              <span className="mr-2">+</span> New Post
            </button>
          </Link>
        </div>
      </div>
      <Suspense fallback={<PostSkeleton />}>
        <PostListContent />
      </Suspense>
    </div>
  );
};

export default PostList;
