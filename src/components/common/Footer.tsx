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
            <a href="#" className="text-gray-400">
              <span className="sr-only">Facebook</span>
              <FacebookIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a href="#" className="text-gray-400">
              <span className="sr-only">Youtube</span>
              <YoutubeIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a href="#" className="text-gray-400">
              <span className="sr-only">Instagram</span>
              <InstagramIconFilled fontSize={24} strokeWidth={0} />
            </a>
            <a href="#" className="text-gray-400">
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

      {/* <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2">
            <a href="#" className="mx-3 text-text-primary">
              <span className="sr-only">Facebook</span>
              <Facebook className="text-2xl" fill="white" strokeWidth={0} />
            </a>
            <a href="#" className="mx-3 text-text-primary">
              <span className="sr-only">Youtube</span>
              <Youtube className="text-2xl" strokeWidth={2} />
            </a>
            <a href="#" className="mx-3 text-text-primary">
              <span className="sr-only">Instagram</span>
              <Instagram className="text-2xl" strokeWidth={2} />
            </a>
            <a href="#" className="mx-3 text-text-primary">
              <span className="sr-only">Twitter</span>
              <Twitter className="text-2xl" fill="white" strokeWidth={0} />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="flex flex-wrap text-center text-base leading-6 text-gray-400">
              {navLinks.map((link, index) => (
                <React.Fragment key={index}>
                  <Link href={link.path} className="hover:underline">
                    {link.name}
                  </Link>
                  {index !== navLinks.length - 1 && <span className="mx-4 text-gray-400">|</span>}
                </React.Fragment>
              ))}
            </p>
            <p className="mt-2 text-center text-base leading-6 text-gray-400">
              <span className="inline-block">© 2023 SciCommons. All rights reserved.</span>
              <span className="mx-4 text-gray-400">|</span>
              <Link href="/terms-and-conditions" className="hover:underline">
                Terms and Conditions
              </Link>
              <span className="mx-4 text-gray-400">|</span>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;
