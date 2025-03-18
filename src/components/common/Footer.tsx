import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  FacebookIconFilled,
  InstagramIconFilled,
  TwitterIconFilled,
  YoutubeIconFilled,
} from '@/components/ui/Icons/common';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Articles', path: '/articles' },
  { name: 'Communities', path: '/communities' },
  { name: 'Posts', path: '/posts' },
  { name: 'About', path: '/about' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Docs', path: '/docs' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-functional-green/10 dark:bg-functional-green/10 md:pb-0">
      <div className="sm-gap-0 flex w-full flex-col justify-between gap-10 p-16 sm:flex-row md:px-44 md:py-12">
        <div className="flex flex-col items-start gap-12">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={120} height={80} />
          </Link>
          <div className="flex gap-8 md:order-2">
            <a
              href="#"
              className="text-gray-400 opacity-50 transition-opacity duration-300 hover:opacity-100"
            >
              <span className="sr-only">Facebook</span>
              <FacebookIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a
              href="#"
              className="text-gray-400 opacity-70 transition-opacity duration-300 hover:opacity-100"
            >
              <span className="sr-only">Youtube</span>
              <YoutubeIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a
              href="#"
              className="text-gray-400 opacity-70 transition-opacity duration-300 hover:opacity-100"
            >
              <span className="sr-only">Instagram</span>
              <InstagramIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a
              href="#"
              className="text-gray-400 opacity-70 transition-opacity duration-300 hover:opacity-100"
            >
              <span className="sr-only">Twitter</span>
              <TwitterIconFilled fontSize={24} strokeWidth={0} />
            </a>
          </div>
        </div>

        <div className="flex gap-6 text-sm font-medium leading-6 text-green-600 dark:text-green-400 sm:gap-14">
          <div className="flex flex-col gap-2">
            {navLinks.map(
              (link, index) =>
                index <= navLinks.length / 2 && (
                  <React.Fragment key={`${index}-${link.name}`}>
                    <Link href={link.path} className="hover:underline">
                      {link.name}
                    </Link>
                  </React.Fragment>
                )
            )}
          </div>
          <div className="flex flex-col gap-2">
            {navLinks.map(
              (link, index) =>
                index > navLinks.length / 2 && (
                  <React.Fragment key={`${index}-${link.name}`}>
                    <Link href={link.path} className="hover:underline">
                      {link.name}
                    </Link>
                  </React.Fragment>
                )
            )}
          </div>
        </div>
      </div>
      <div className="w-full bg-functional-green p-4 text-center text-sm font-semibold text-white dark:text-black">
        © 2024 SciCommons. All rights reserved.
        <span className="mx-4">|</span>
        <Link href="/terms-and-conditions" className="hover:underline">
          Terms and Conditions
        </Link>
        <span className="mx-4">|</span>
        <Link href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
