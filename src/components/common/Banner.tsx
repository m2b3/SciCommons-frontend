import React from 'react';

const Banner = () => {
  return (
    <div className="flex w-full flex-row items-center justify-center bg-functional-yellow/15 p-4 text-center text-yellow-700 dark:text-yellow-500">
      <div className="flex flex-row items-center space-x-4">
        <p className="text-xs md:text-sm">
          This website is purely for testing at the moment. Stay tuned for an alpha-release in December 2024. Thank you.
        </p>
      </div>
    </div>
  );
};

export default Banner;
