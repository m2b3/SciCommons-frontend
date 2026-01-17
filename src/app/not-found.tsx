'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsAnimating(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-common-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-common-background to-green-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900" />

        {/* Animated blobs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-green-400/20 blur-3xl dark:bg-green-600/10" />
        <div
          className="absolute h-60 w-60 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/5"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transition: 'all 0.1s ease-out',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* 404 Number Animation */}
          <div
            className={`transition-all duration-1000 ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
          >
            <h1 className="text-9xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-400">
                404
              </span>
            </h1>
          </div>

          {/* Main heading */}
          <div
            className={`space-y-2 transition-all delay-100 duration-1000 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
              Page Not Found
            </h2>
            <p className="mx-auto max-w-md text-lg text-text-secondary">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. But don&apos;t
              worry, there are plenty of great things to explore!
            </p>
          </div>

          {/* Decorative element */}
          <div
            className={`flex justify-center transition-all delay-200 duration-1000 ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
          >
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-blue-500" />
          </div>

          {/* Action buttons */}
          <div
            className={`flex flex-col gap-4 transition-all delay-300 duration-1000 sm:flex-row sm:justify-center ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <Link href="/">
              <button className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-95 dark:from-blue-500 dark:to-blue-600">
                <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Back to Home
              </button>
            </Link>

            <Link href="/articles">
              <button className="group relative inline-flex items-center gap-2 rounded-lg border-2 border-green-500 px-8 py-3 text-base font-semibold text-green-600 transition-all hover:border-green-600 hover:bg-green-50 hover:text-green-700 active:scale-95 dark:border-green-400 dark:text-green-400 dark:hover:border-green-300 dark:hover:bg-green-950">
                <Search className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                Explore Articles
              </button>
            </Link>
          </div>

          {/* Additional info */}
          <div
            className={`space-y-4 pt-8 transition-all delay-500 duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="text-sm text-text-tertiary">Still need help? Try these options:</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/"
                className="group rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-2 origin-left text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400">
                  <Home className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-text-primary">Home</h3>
                <p className="text-xs text-text-tertiary">Return to homepage</p>
              </Link>

              <Link
                href="/articles"
                className="group rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all hover:border-green-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-2 origin-left text-green-600 transition-transform group-hover:scale-110 dark:text-green-400">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-text-primary">Articles</h3>
                <p className="text-xs text-text-tertiary">Browse our collection</p>
              </Link>

              <button
                onClick={() => router.back()}
                className="group rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all hover:border-purple-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-2 origin-left text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-text-primary">Go Back</h3>
                <p className="text-xs text-text-tertiary">Return to previous page</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
    </div>
  );
}
