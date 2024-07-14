'use client';

import React from 'react';

import Link from 'next/link';

import GifReloader from '@/components/GifReloader';

const SignUpSuccess = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md p-6 md:bg-white md:shadow-md md:dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <GifReloader gifUrl="/signupsuccess.gif" interval={100000} />
          </div>
          <h1 className="mt-4 font-bold res-text-xl dark:text-white"> Sign Up Successful</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {' '}
            We have sent you an email. Please verify your email address to activate your account.
          </p>
        </div>
        <a target="_blank" href="https://gmail.com/" rel="noopener noreferrer">
          <button
            type="submit"
            className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-brand px-4 py-2 font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
            //   onClick={() => window.open('https://mail.google.com')}
          >
            Open Gmail
          </button>
        </a>
        <Link
          href="/auth/login"
          className="mt-4 flex items-center justify-center text-brand hover:text-brand-dark dark:text-brand-dark dark:hover:text-brand"
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
  );
};

export default SignUpSuccess;
