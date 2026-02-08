import React from 'react';

const Banner = () => {
  return (
    <div className="flex w-full flex-row items-center justify-center rounded-t-3xl bg-functional-yellow/15 p-4 pb-16 text-center text-yellow-700 dark:text-yellow-500">
      <div className="flex flex-col items-start space-y-2">
        <ul className="list-disc space-y-1 pl-5 text-xs md:text-sm">
          <li>
            We are getting closer to release. Set up a community and use it for discussions like
            Neurostars or Discourse.
          </li>
          <li>Set up a journal club for your group: it works !</li>
        </ul>
      </div>
    </div>
  );
};

export default Banner;
