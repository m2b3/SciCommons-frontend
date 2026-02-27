'use client';

import React from 'react';

import Link from 'next/link';

import GifReloader from '@/components/common/GifReloader';

const SignUpSuccess = () => {
  /* Fixed by Codex on 2026-02-15
     Problem: JSX fragment had an extra closing div, breaking compilation.
     Solution: Remove the stray closing tag to restore valid JSX nesting.
     Result: Sign-up success screen renders without TypeScript errors. */
  return (
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Replace success-state hard-coded grays with theme tokens.
          Why: Keep the confirmation screen aligned with UI skins.
          How: Swap gray/white utilities for semantic token classes. */}
      <div className="flex h-screen flex-col items-center justify-center bg-common-background">
        <div className="w-full max-w-md rounded-md bg-common-cardBackground p-6 shadow-common">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center">
              <GifReloader gifUrl="/signupsuccess.gif" interval={100000} />
            </div>
            <h1 className="mt-4 font-bold text-text-primary res-text-xl"> Sign Up Successful</h1>
            <p className="mt-2 text-text-tertiary">
              {' '}
              We have sent you an email. Please verify your email address to activate your account.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="mt-4 flex items-center justify-center text-functional-green hover:text-functional-greenContrast"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Sign in
          </Link>
        </div>
      </div>
    </>
  );
};

export default SignUpSuccess;
