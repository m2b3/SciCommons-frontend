'use client';

import React, { Suspense, lazy, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { BookOpenText, Home, NotebookTabs, Plus, Users } from 'lucide-react';

import useStore from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionUnreadStore } from '@/stores/subscriptionUnreadStore';

// Dynamically import Drawer components
const Drawer = lazy(() => import('../ui/drawer').then((mod) => ({ default: mod.Drawer })));
const DrawerContent = lazy(() =>
  import('../ui/drawer').then((mod) => ({ default: mod.DrawerContent }))
);
const DrawerTrigger = lazy(() =>
  import('../ui/drawer').then((mod) => ({ default: mod.DrawerTrigger }))
);

const BottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);

  // Get count of articles with new realtime events for discussions badge
  const newEventsCount = useSubscriptionUnreadStore((state) => state.getNewEventsCount());

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Hid the bottom-navbar "Articles" destination while preserving it in code.
     Why: Keeping Articles in only one navbar variant creates inconsistent IA across breakpoints.
     How: Commented out the `/articles` nav item and adjusted the mobile grid column count to match. */
  const navLinks = [
    { name: 'Home', route: '/', icon: <Home size={20} /> },
    {
      name: 'Communities',
      route: '/communities',
      altRoute: '/community',
      icon: <Users size={20} />,
    },
    ...(isAuthenticated
      ? [
          {
            name: 'Bookmarks',
            route: '/mycontributions?tab=bookmarks',
            altRoute: '/mycontributions',
            icon: <NotebookTabs size={20} />,
          },
        ]
      : []),
    {
      name: 'Discussions',
      route: '/discussions',
      altRoute: '/discussion',
      icon: <BookOpenText size={20} />,
    },
  ];
  const navLinksAfterCreate = isAuthenticated ? navLinks.slice(2) : navLinks.slice(1);

  const hideBottomBarPaths = ['login', 'register', 'forgotpassword', 'resetpassword'];

  // Helper to check if a nav link is active
  const isLinkActive = (link: (typeof navLinks)[0]) => {
    if (!link.name) return false;
    return link.route === pathname || (link.altRoute && pathname?.startsWith(link.altRoute));
  };

  if (hideBottomBarPaths.some((path) => pathname?.includes(path))) {
    return null;
  }

  return (
    <>
      {/* Fixed by Codex on 2026-05-05
          Who: Codex
          What: Restore auth-aware mobile nav composition while preserving centered create affordance.
          Why: PR #353 exposed Bookmarks to signed-out mobile users and made mobile IA diverge from the desktop navbar.
          How: Gate Bookmarks on auth and switch between 5-column/authenticated and 4-column/guest layouts without leaving empty nav slots. */}
      <main
        className={cn(
          'fixed bottom-0 left-0 z-[1000] grid h-16 w-screen select-none border-t border-common-minimal bg-common-background/70 text-text-secondary backdrop-blur-md md:hidden',
          isAuthenticated ? 'grid-cols-5' : 'grid-cols-4'
        )}
      >
        {/* Home */}
        <button
          type="button"
          aria-current={isLinkActive(navLinks[0]) ? 'page' : undefined}
          className={cn(
            'relative flex flex-col items-center justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60',
            {
              'border-t-2 border-functional-green/70 bg-gradient-to-b from-functional-green/10 to-transparent text-functional-green':
                isLinkActive(navLinks[0]),
              'text-text-tertiary': !isLinkActive(navLinks[0]),
            }
          )}
          onClick={() => router.push(navLinks[0].route)}
        >
          <div className="relative">{navLinks[0].icon}</div>
          <span className="mt-1 select-none text-[10px]">{navLinks[0].name}</span>
        </button>
        {/* Communities */}
        <button
          type="button"
          aria-current={isLinkActive(navLinks[1]) ? 'page' : undefined}
          className={cn(
            'relative flex flex-col items-center justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60',
            {
              'border-t-2 border-functional-green/70 bg-gradient-to-b from-functional-green/10 to-transparent text-functional-green':
                isLinkActive(navLinks[1]),
              'text-text-tertiary': !isLinkActive(navLinks[1]),
            }
          )}
          onClick={() => router.push(navLinks[1].route)}
        >
          <div className="relative">{navLinks[1].icon}</div>
          <span className="mt-1 select-none text-[10px]">{navLinks[1].name}</span>
        </button>
        {/* + (Create) Button in center */}
        <div className="flex flex-col items-center justify-center">
          <CreateDropdown />
        </div>
        {navLinksAfterCreate.map((link) => (
          <button
            key={link.name}
            type="button"
            aria-current={isLinkActive(link) ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60',
              {
                'border-t-2 border-functional-green/70 bg-gradient-to-b from-functional-green/10 to-transparent text-functional-green':
                  isLinkActive(link),
                'text-text-tertiary': !isLinkActive(link),
              }
            )}
            onClick={() => router.push(link.route)}
          >
            <div className="relative">
              {link.icon}
              {link.name === 'Discussions' &&
                newEventsCount > 0 &&
                !pathname?.startsWith('/discussion') && (
                  <span className="absolute -right-3 -top-2 rounded-full border border-functional-red/50 bg-functional-red/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-functional-red">
                    New
                  </span>
                )}
            </div>
            <span className="mt-1 select-none text-[10px]">{link.name}</span>
          </button>
        ))}
      </main>
    </>
  );
};

export default BottomBar;

const CreateDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    // NOTE(Codex for bsureshkrishna, 2026-02-09): Wrap lazy drawer in Suspense to avoid
    // "component suspended while rendering" on first mobile render.
    <Suspense
      fallback={
        <div className="rounded-full border border-common-contrast/60 bg-common-cardBackground p-2 shadow-md">
          <Plus size={24} />
        </div>
      }
    >
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Make the create drawer trigger keyboard accessible.
              Why: A plain div is not focusable or announced to screen readers.
              How: Use a button with an aria-label around the icon. */}
          <button
            type="button"
            aria-label="Create"
            className="rounded-full border border-common-contrast/60 bg-common-cardBackground p-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60"
          >
            <Plus size={24} />
          </button>
        </DrawerTrigger>
        <DrawerContent className="flex flex-col items-center p-0 pt-4" showThumb={true}>
          <div className="flex w-full flex-col px-4 pb-4 text-sm font-semibold text-text-secondary">
            <button
              type="button"
              className="flex select-none items-center gap-2 border-b border-common-minimal p-4 hover:bg-common-minimal/50 hover:text-text-primary"
              onClick={() => {
                setOpen(false);
                router.push('/submitarticle');
              }}
            >
              <BookOpenText size={18} />
              <span>Submit Article</span>
            </button>
            <button
              type="button"
              className="flex select-none items-center gap-2 p-4 hover:bg-common-minimal/50 hover:text-text-primary"
              onClick={() => {
                setOpen(false);
                router.push('/createcommunity');
              }}
            >
              <Users size={18} />
              <span>Create Community</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </Suspense>
  );
};
