import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import useStore from '@/hooks/useStore';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { name: 'Home', path: '/' },
  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Hid the footer Articles entry without deleting route support.
     Why: Prevent casual user entry into /articles while keeping the framework for later re-enable.
     How: Commented out the Articles nav item in footer links. */
  // { name: 'Articles', path: '/articles' },
  { name: 'Communities', path: '/communities' },
  { name: 'About', path: '/about' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Docs', path: '/docs' },
];

const Footer: React.FC = () => {
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);
  const isAshokaUser = useStore(useAuthStore, (state) =>
    state.user?.email?.endsWith('ashoka.edu.in')
  );
  const currentYear = new Date().getFullYear();

  // Filter navLinks to remove Login/Register if authenticated
  const filteredNavLinks = isAuthenticated
    ? navLinks.filter((link) => link.name !== 'Login' && link.name !== 'Register')
    : navLinks;

  // Split links for two columns as before
  const mid = Math.ceil(filteredNavLinks.length / 2);
  const firstColLinks = filteredNavLinks.slice(0, mid);
  const secondColLinks = filteredNavLinks.slice(mid);

  return (
    <footer className="rounded-t-3xl border-t border-common-contrast/40 bg-common-background pb-16 md:pb-0">
      {/* Fixed by Codex on 2026-02-15
         Who: Codex
         What: Rebalanced the footer colors to match the cooler, modern palette.
         Why: The solid green footer block felt heavy against the new lighter hero.
         How: Swapped to neutral backgrounds with accent gradients for the legal strip. */}
      {/* Fixed by Codex on 2026-02-16
         Who: Codex
         What: Aligned footer logo and nav blocks across both mobile and desktop layouts.
         Why: The navigation block looked visually offset from the SC logo, especially in stacked mobile view.
         How: Center-align stacked mobile sections, restore left alignment from `sm` onward, and keep a small desktop optical offset. */}
      <div className="sm-gap-0 flex w-full flex-col items-center justify-between gap-10 p-8 pt-12 sm:flex-row sm:items-center sm:p-16 md:px-44 md:py-12">
        <div className="flex flex-col items-center gap-12 sm:items-start">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SciCommons logo"
                width={isAshokaUser ? 90 : 120}
                height={isAshokaUser ? 66 : 80}
              />
            </Link>
            {isAshokaUser && (
              <>
                <span className="text-2xl font-light text-text-tertiary">×</span>
                <Image width={140} height={50} src={'/images/KCDHA-Black.png'} alt="KCDHA" />
              </>
            )}
          </div>
          {/* Commented out social media icons - dead links */}
          {/* <div className="flex gap-8 md:order-2">
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
          </div> */}
        </div>

        <div className="flex justify-center gap-6 text-xs font-semibold leading-6 text-text-secondary sm:justify-start sm:gap-14 sm:pt-1">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            {firstColLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="hover:text-functional-green hover:underline"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-start">
            {secondColLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="hover:text-functional-green hover:underline"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Tokenize footer legal strip text color.
          Why: Keep gradient text contrast aligned with skin palettes.
          How: Replace white/black utilities with primary-foreground. */}
      <div className="flex w-full flex-wrap items-center bg-gradient-to-r from-functional-green to-functional-blue p-4 text-xs font-semibold text-primary-foreground sm:justify-center">
        <span className="mr-2 sm:mr-4">© 2024–{currentYear} SciCommons</span>
        {/* Commented out dead links */}
        {/* <span className="mr-2 sm:mr-4">
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
        </span> */}
      </div>
    </footer>
  );
};

export default Footer;
