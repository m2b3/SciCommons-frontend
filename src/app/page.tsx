'use client';

import Link from 'next/link';

import cookies from 'js-cookie';

import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

const Home = () => {
  const words = [
    {
      text: 'Welcome',
    },
    {
      text: 'to',
    },
    {
      text: 'SciCommons.',
      className: 'text-green-500 dark:text-green-500',
    },
  ];

  console.log(cookies.get('accessToken'));
  console.log(cookies.get('refreshToken'));

  return (
    <div>
      <NavBar />
      <div className="flex h-screen flex-col items-center justify-center">
        <TypewriterEffectSmooth words={words} />
        <p className="mb-6 max-w-3xl text-center text-xs text-neutral-600 dark:text-neutral-200 sm:text-base">
          Be part of the change. Join our open platform to review, rate, and access research freely.
          Improve research quality and accessibility with community-driven peer review.
        </p>
        <div className="flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <Link href="/articles">
            <button className="h-10 w-40 rounded-xl border border-transparent bg-black text-sm text-white dark:border-white">
              Explore
            </button>
          </Link>
          <Link href="/auth/register">
            <button className="h-10 w-40 rounded-xl border border-black bg-white text-sm  text-black">
              Signup
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
