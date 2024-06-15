import React from 'react';
import { Bars } from 'react-loader-spinner';

const Loader = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center bg-white justify-center px-4">
      <Bars
        height="80"
        width="80"
        color="#22c55e"
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
};

export default Loader;
