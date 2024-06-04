import React from 'react';

const DisplayArticleSkeletonLoader: React.FC = () => {
  return (
    <div className="flex animate-pulse items-start rounded-lg border p-4 shadow-sm">
      <div className="mr-4 h-auto w-1/3">
        <div className="h-52 w-full rounded-lg bg-gray-300"></div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-6 rounded bg-gray-300"></div>
        <div className="h-4 w-3/4 rounded bg-gray-300"></div>
        <div className="h-4 rounded bg-gray-300"></div>
        <div className="h-4 w-1/2 rounded bg-gray-300"></div>
        <div className="h-4 rounded bg-gray-300"></div>
      </div>
    </div>
  );
};

export default DisplayArticleSkeletonLoader;
