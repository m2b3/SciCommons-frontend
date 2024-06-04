import React from 'react';

const DisplayCommunitySkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow-md">
      <div className="relative h-56 w-full bg-gray-300"></div>
      <div className="relative p-4">
        <div className="absolute left-4 top-0 -translate-y-1/2 transform">
          <div className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-300 shadow-md"></div>
        </div>
        <div className="mt-12">
          <div className="h-6 w-2/3 rounded bg-gray-300"></div>
          <div className="mt-2 h-4 w-full rounded bg-gray-300"></div>
          <div className="mt-1 h-4 w-5/6 rounded bg-gray-300"></div>
        </div>
        <div className="absolute right-4 top-4">
          <div className="flex items-center space-x-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700">
            <div className="h-5 w-5 rounded-full bg-gray-300"></div>
            <span className="h-5 w-20 rounded bg-gray-300"></span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-gray-200 px-4 py-2">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-full bg-gray-300"></div>
            <span className="h-4 w-16 rounded bg-gray-300"></span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-full bg-gray-300"></div>
            <span className="h-4 w-24 rounded bg-gray-300"></span>
          </div>
        </div>
        <div className="h-10 w-28 rounded-md bg-gray-300"></div>
      </div>
    </div>
  );
};

export default DisplayCommunitySkeletonLoader;
