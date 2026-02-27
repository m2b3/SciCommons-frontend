'use client';

import React from 'react';

const HelpPage = () => {
  return (
    <div className="relative min-h-[calc(100vh-200px)] bg-common-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold text-text-primary">Help & Support</h1>

        <div className="mx-auto max-w-6xl">
          <div className="mb-32">
            <p className="w-full pb-8 text-center text-sm font-bold text-text-secondary md:text-base">
              Featured Video
            </p>
            <div className="flex w-full flex-col items-center justify-center">
              <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border-2 border-functional-greenContrast/20">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/6U-XS_kjvmc"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
