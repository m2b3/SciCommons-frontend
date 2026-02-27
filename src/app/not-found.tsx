'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Home } from 'lucide-react';

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
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Replace 404 page hard-coded color utilities with semantic tokens.
          Why: Ensure skins can restyle the not-found experience consistently.
          How: Swap blue/green/purple classes for functional token gradients and surfaces. */}
      <div className="relative min-h-screen w-full overflow-hidden bg-common-background">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-functional-blue/10 via-common-background to-functional-green/10 dark:from-common-background dark:via-common-cardBackground dark:to-common-background" />

          {/* Animated blobs */}
          <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-functional-blue/20 blur-3xl dark:bg-functional-blue/10" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-functional-green/20 blur-3xl dark:bg-functional-green/10" />
          <div
            className="absolute h-60 w-60 rounded-full bg-functional-yellow/10 blur-3xl dark:bg-functional-yellow/5"
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
                <span className="bg-gradient-to-r from-functional-blue to-functional-green bg-clip-text text-transparent dark:from-functional-blueLight dark:to-functional-greenLight">
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
                The page you&apos;re looking for doesn&apos;t exist or has been moved. But
                don&apos;t worry, there are plenty of great things to explore!
              </p>
            </div>

            {/* Decorative element */}
            <div
              className={`flex justify-center transition-all delay-200 duration-1000 ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            >
              <div className="h-1 w-24 rounded-full bg-gradient-to-r from-functional-blue via-functional-green to-functional-blue" />
            </div>

            {/* Action buttons */}
            <div
              className={`flex flex-col gap-4 transition-all delay-300 duration-1000 sm:flex-row sm:justify-center ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
              {/* Fixed by Codex on 2026-02-15
                Who: Codex
                What: Remove nested interactive controls in 404 CTAs.
                Why: Link-wrapped buttons are invalid and flagged by accessibility checkers.
                How: Style the Link directly and keep the same visual treatment. */}
              <Link
                href="/"
                className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-functional-blue to-functional-blueContrast px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:from-functional-blueContrast hover:to-functional-blue hover:shadow-xl active:scale-95"
              >
                <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Back to Home
              </Link>
              {/* Fixed by Codex on 2026-02-16
                  Who: Codex
                  What: Hid the 404 "Explore Articles" CTA.
                  Why: Prevent accidental re-entry to /articles from fallback navigation.
                  How: Commented out the /articles action while retaining it for later restore. */}
              {/*
              <Link
                href="/articles"
                className="group relative inline-flex items-center gap-2 rounded-lg border-2 border-functional-green px-8 py-3 text-base font-semibold text-functional-green transition-all hover:border-functional-greenContrast hover:bg-functional-green/10 hover:text-functional-greenContrast active:scale-95"
              >
                <Search className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                Explore Articles
              </Link>
              */}
            </div>

            {/* Additional info */}
            <div
              className={`space-y-4 pt-8 transition-all delay-500 duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
            >
              <p className="text-sm text-text-tertiary">Still need help? Try these options:</p>
              {/* Fixed by Codex on 2026-02-22
                  Who: Codex
                  What: Recentered the fallback quick-link cards on the 404 page.
                  Why: The Articles card is intentionally hidden, so a 3-column grid left Home/Go Back visually off-center.
                  How: Constrained the grid width and switched to a centered 2-column layout on small+ screens. */}
              <div className="mx-auto grid w-full max-w-xl gap-3 sm:grid-cols-2">
                <Link
                  href="/"
                  className="group rounded-lg border border-common-contrast bg-common-cardBackground p-4 text-left transition-all hover:border-functional-blue/40 hover:shadow-md"
                >
                  <div className="mb-2 origin-left text-functional-blue transition-transform group-hover:scale-110">
                    <Home className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Home</h3>
                  <p className="text-xs text-text-tertiary">Return to homepage</p>
                </Link>
                {/* Fixed by Codex on 2026-02-16
                    Who: Codex
                    What: Hid the Articles quick-link card on 404.
                    Why: Keep fallback navigation aligned with temporary /articles de-emphasis.
                    How: Commented out the /articles card block for easy re-enable later. */}
                {/*
                <Link
                  href="/articles"
                  className="group rounded-lg border border-common-contrast bg-common-cardBackground p-4 text-left transition-all hover:border-functional-green/40 hover:shadow-md"
                >
                  <div className="mb-2 origin-left text-functional-green transition-transform group-hover:scale-110">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Articles</h3>
                  <p className="text-xs text-text-tertiary">Browse our collection</p>
                </Link>
                */}

                <button
                  onClick={() => router.back()}
                  className="group rounded-lg border border-common-contrast bg-common-cardBackground p-4 text-left transition-all hover:border-functional-yellow/40 hover:shadow-md"
                >
                  <div className="mb-2 origin-left text-functional-yellow transition-transform group-hover:scale-110">
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
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-functional-blue to-transparent opacity-20" />
      </div>
    </>
  );
}
