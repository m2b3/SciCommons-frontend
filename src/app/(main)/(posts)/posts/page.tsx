'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { FileX2 } from 'lucide-react';

import { usePostsApiListPosts } from '@/api/posts/posts';
import { PostOut } from '@/api/schemas';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import Post, { PostSkeleton } from '@/components/posts/Post';
import { showErrorToast } from '@/lib/toastHelpers';

interface PostsResponse {
  data: {
    items: PostOut[];
    total: number;
    page: number;
    size: number;
    num_pages: number;
  };
}

const PostListContent = () => {
  const searchParams = useSearchParams();
  const [hashtag, setHashtag] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [posts, setPosts] = useState<PostOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const queryParams = {
    hashtag: hashtag,
    page: page,
    per_page: 10,
    search: search,
  };

  const { data, isPending, error } = usePostsApiListPosts<PostsResponse>(queryParams);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    const queryHashtag = searchParams.get('hashtag');
    queryHashtag && setHashtag(`#${queryHashtag}`);
  }, [searchParams]);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setPosts(data.data.items);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data.data.items]);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, page]);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
    setPosts([]); // Clear existing posts when starting a new search
  }, []);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [page, totalPages]);

  const renderPost = useCallback((post: PostOut) => <Post key={post.id} {...post} />, []);

  const renderSkeleton = useCallback(() => <PostSkeleton />, []);

  return (
    <div className="mx-auto mt-10 min-h-screen max-w-[760px] px-4 md:px-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-primary">Posts</h1>
        <div className="flex items-center gap-4">
          <Link href="/posts/createpost">
            <button className="flex cursor-pointer items-center rounded-full bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              <span className="mr-2">+</span> New Post
            </button>
          </Link>
        </div>
      </div>
      <SearchableList<PostOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderPost}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={posts}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        itemsPerPage={10}
        loadingType={LoadingType.INFINITE_SCROLL}
        searchPlaceholder="Search posts..."
        emptyStateContent="No posts found"
        emptyStateSubcontent="Try searching for something else"
        emptyStateLogo={<FileX2 size={64} />}
      />
    </div>
  );
};

const PostList = () => {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostListContent />
    </Suspense>
  );
};

export default PostList;
