import React from "react";
import "./HeroBanner.css";

const HeroBanner = () => {
  return (
    <>
      <div className="w-full">
        {/* <img src={process.env.PUBLIC_URL + "./header.png"} className="mx-auto screener" alt="logo" /> */}
        <section className="mt-24 mx-auto max-w-screen-xl pb-12 px-4 items-center lg:flex md:px-8">
          <div className="space-y-4 flex-1 sm:text-center lg:text-left">
            <h1 className="text-white font-bold text-4xl xl:text-5xl">
              <span className="text-green-500"> Open peer Review</span>
            </h1>
            <p className="text-gray-500 max-w-xl leading-relaxed sm:mx-auto lg:ml-0">
              SciCommons aims to eliminate the barriers to open peer review by
              providing a free, open-source platform for researchers to publish
              their work and receive feedback from the community.
            </p>
            <div className="pt-10 items-center justify-center space-y-3 sm:space-x-6 sm:space-y-0 sm:flex lg:justify-start">
              <a
                href="/"
                className="px-7 py-3 w-full bg-white text-gray-800 text-center rounded-md shadow-md block sm:w-auto"
              >
                Get started
              </a>
              <a
                href="/"
                className="px-7 py-3 w-full bg-green-500 text-gray-200 text-center rounded-md block sm:w-auto"
              >
                Try it out
              </a>
            </div>
          </div>
          <div className="flex-1 text-center mt-7 lg:mt-0 lg:ml-3">
            <video className="w-full border-2 border-white" autoPlay loop muted playsInline>
              <source 
                  src={process.env.PUBLIC_URL + "./logoafter.mp4"}
                  type="video/mp4"
              />
            </video>
          </div>
        </section>
      </div>
      <div className="bg-white">
        <section className="text-green-500 body-font">
          <div className="px-5 py-24 mx-auto">
            <div className="flex flex-wrap -m-4 text-center">
              <div className="p-4 sm:w-1/4 w-1/2">
                <h2 className="title-font font-medium sm:text-4xl text-3xl text-green-500">
                  2.7K
                </h2>
                <p className="leading-relaxed">Users</p>
              </div>
              <div className="p-4 sm:w-1/4 w-1/2">
                <h2 className="title-font font-medium sm:text-4xl text-3xl text-green-500">
                  1.8K
                </h2>
                <p className="leading-relaxed">Subscribes</p>
              </div>
              <div className="p-4 sm:w-1/4 w-1/2">
                <h2 className="title-font font-medium sm:text-4xl text-3xl text-green-500">
                  35
                </h2>
                <p className="leading-relaxed">Downloads</p>
              </div>
              <div className="p-4 sm:w-1/4 w-1/2">
                <h2 className="title-font font-medium sm:text-4xl text-3xl text-green-500">
                  4
                </h2>
                <p className="leading-relaxed">Products</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HeroBanner;
