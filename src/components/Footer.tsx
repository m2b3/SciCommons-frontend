import React from 'react';

import Link from 'next/link';

import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Articles', path: '/articles' },
  { name: 'Communities', path: '/communities' },
  { name: 'Posts', path: '/posts' },
  { name: 'About', path: '/about' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 pb-16 dark:bg-gray-800 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          {/* Social Media Links */}
          <div className="flex justify-center md:order-2">
            <a
              href="#"
              className="mx-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Facebook</span>
              <Facebook className="text-2xl" />
            </a>
            <a
              href="#"
              className="mx-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Youtube</span>
              <Youtube className="text-2xl" />
            </a>
            <a
              href="#"
              className="mx-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="text-2xl" />
            </a>
            <a
              href="#"
              className="mx-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="text-2xl" />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="flex flex-wrap text-center text-base leading-6 text-gray-400 dark:text-gray-500">
              {navLinks.map((link, index) => (
                <React.Fragment key={index}>
                  <Link href={link.path} className="hover:underline">
                    {link.name}
                  </Link>
                  {index !== navLinks.length - 1 && (
                    <span className="mx-4 text-gray-400 dark:text-gray-500">|</span>
                  )}
                </React.Fragment>
              ))}
            </p>
            <p className="mt-2 text-center text-base leading-6 text-gray-400 dark:text-gray-500">
              <span className="inline-block">© 2023 SciCommons. All rights reserved.</span>
              <span className="mx-4 text-gray-400 dark:text-gray-500">|</span>
              <a href="#" className="hover:underline">
                Terms and Conditions
              </a>
              <span className="mx-4 text-gray-400 dark:text-gray-500">|</span>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
