'use client';

// src/components/InfiniteScroll.js
import React, { useCallback, useEffect, useState } from 'react';

import axios from 'axios';

const InfiniteScroll = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
        params: { _page: page, _limit: 10 },
      });
      setPosts((prevPosts) => [...prevPosts, ...response.data]);
      setHasMore(response.data.length > 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 5 &&
      hasMore &&
      !loading
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="p-4">
      {posts.map((post) => (
        <div key={post.id} className="mb-4 rounded border p-4 shadow">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
      {loading && Array.from({ length: 10 }).map((_, index) => <SkeletonLoader key={index} />)}
      {!hasMore && <div className="text-center">No more posts</div>}
    </div>
  );
};

export default InfiniteScroll;

// src/components/SkeletonLoader.js

const SkeletonLoader = () => {
  return (
    <div className="mb-4 animate-pulse rounded border p-4 shadow">
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
      <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
      <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
      <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
    </div>
  );
};
