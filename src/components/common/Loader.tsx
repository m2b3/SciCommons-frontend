import React from 'react';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';

const Loader = () => {
  return (
    <div className="md::h-[90vh] flex h-[80vh] flex-col items-center justify-center bg-transparent p-6">
      {/* {loaders[type]} */}
      <div className="w-24 md:w-32">
        <InfiniteSpinnerAnimation color="#16A34A" strokeWidth={12} />
      </div>
      <div className={`mt-4 animate-pulse text-center text-sm font-normal text-functional-green`}>
        SciCommons is performing some checks, please wait...
      </div>
    </div>
  );
};

export default Loader;
