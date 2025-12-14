import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  FacebookIconFilled,
  InstagramIconFilled,
  TwitterIconFilled,
  YoutubeIconFilled,
} from '@/components/ui/Icons/common';
import useStore from '@/hooks/useStore';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Articles', path: '/articles' },
  { name: 'Communities', path: '/communities' },
  { name: 'About', path: '/about' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Docs', path: '/docs' },
];

const Footer: React.FC = () => {
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);

  // Filter navLinks to remove Login/Register if authenticated
  const filteredNavLinks = isAuthenticated
    ? navLinks.filter((link) => link.name !== 'Login' && link.name !== 'Register')
    : navLinks;

  // Split links for two columns as before
  const mid = Math.ceil(filteredNavLinks.length / 2);
  const firstColLinks = filteredNavLinks.slice(0, mid);
  const secondColLinks = filteredNavLinks.slice(mid);

  return (
    <footer className="rounded-t-3xl bg-functional-green/10 pb-16 dark:bg-functional-green/10 md:pb-0">
      <div className="sm-gap-0 flex w-full flex-col justify-between gap-10 p-8 pt-12 sm:flex-row sm:p-16 md:px-44 md:py-12">
        <div className="flex flex-col items-start gap-12">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={120} height={80} />
          </Link>
          <div className="flex gap-8 md:order-2">
            <a href="#" className="text-functional-green">
              <span className="sr-only">Facebook</span>
              <FacebookIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a href="#" className="text-functional-green">
              <span className="sr-only">Youtube</span>
              <YoutubeIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a href="#" className="text-functional-green">
              <span className="sr-only">Instagram</span>
              <InstagramIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a href="#" className="text-functional-green">
              <span className="sr-only">Twitter</span>
              <TwitterIconFilled fontSize={24} strokeWidth={0} />
            </a>
          </div>
        </div>

        <div className="flex gap-6 text-xs font-semibold leading-6 text-functional-green sm:gap-14">
          <div className="flex flex-col gap-2">
            {firstColLinks.map((link) => (
              <Link key={link.name} href={link.path} className="hover:underline">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {secondColLinks.map((link) => (
              <Link key={link.name} href={link.path} className="hover:underline">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center bg-functional-green p-4 text-xs font-semibold text-white dark:text-black sm:justify-center">
        <span className="mr-2 sm:mr-4">© 2024 SciCommons. All rights reserved.</span>
        <span className="mr-2 sm:mr-4">
          <span className="mr-2 sm:mr-4">|</span>
          <Link href="/terms-and-conditions" className="hover:underline">
            Terms and Conditions
          </Link>
        </span>
        <span className="mr-2 sm:mr-4">
          <span className="mr-2 sm:mr-4">|</span>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
