import React from 'react';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';

const Loader = () => {
  return (
    <div className="flex h-[80vh] md:h-[90vh] flex-col items-center justify-center bg-transparent p-6">
      <div className="w-24 md:w-32">
        <InfiniteSpinnerAnimation color="#042f2e" strokeWidth={12} />
      </div>
      {/* Animation is only on this dot */}
      <div className="mt-6 h-2 w-2 animate-bounce rounded-full bg-functional-green" />
      <div className="mt-4 text-center text-sm font-bold text-functional-greenContrast">
        SciCommons is performing some checks, please wait...
      </div>
    </div>
  );
};

export default Loader;
