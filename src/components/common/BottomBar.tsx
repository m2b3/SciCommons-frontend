'use client';

import React, { Suspense, lazy, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { BookOpenText, Home, Plus, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
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

  // Get count of articles with new realtime events for discussions badge
  const newEventsCount = useSubscriptionUnreadStore((state) => state.getNewEventsCount());

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Hid the bottom-navbar "Articles" destination while preserving it in code.
     Why: Keeping Articles in only one navbar variant creates inconsistent IA across breakpoints.
     How: Commented out the `/articles` nav item and adjusted the mobile grid column count to match. */
  const navLinks = [
    { name: 'Home', route: '/', icon: <Home size={20} /> },
    // { name: 'Articles', route: '/articles', altRoute: '/article', icon: <Newspaper size={20} /> },
    {
      name: 'Communities',
      route: '/communities',
      altRoute: '/community',
      icon: <Users size={20} />,
    },
    {
      name: 'Discussions',
      route: '/discussions',
      altRoute: '/discussion',
      icon: <BookOpenText size={20} />,
    },
    // { name: 'Contributions', route: '/mycontributions', icon: <NotebookTabs size={20} /> },
    // { name: 'Posts', route: '/posts', altRoute: '/post', icon: <NotebookPen size={18} /> },
  ];
  const navSlotClassByName: Record<string, string> = {
    Home: 'col-start-1',
    Communities: 'col-start-3',
    Discussions: 'col-start-4',
  };

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
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Tokenize bottom bar inactive icon text color.
          Why: Keep inactive states aligned with skin text scales.
          How: Replace gray utilities with text-tertiary token. */}
      {/* Fixed by Codex on 2026-02-16
          Who: Codex
          What: Repositioned the mobile create (+) action to true screen center.
          Why: A four-column grid places the create button in a column, not at the viewport midpoint.
          How: Keep nav links in assigned grid slots and render create as an absolute centered overlay. */}
      <main className="fixed bottom-0 left-0 z-[1000] grid h-16 w-screen select-none grid-cols-4 border-t border-common-minimal bg-common-background/70 text-text-secondary backdrop-blur-md md:hidden">
        {navLinks.map((link, index) => {
          const isActive = isLinkActive(link);
          const isOnDiscussionsPage = pathname?.startsWith('/discussion');

          return (
            /* Fixed by Codex on 2026-02-15
             Who: Codex
             What: Promote bottom nav items to real buttons with aria state.
             Why: Clickable divs are not keyboard focusable or announced to assistive tech.
             How: Render buttons with aria-current and move routing into onClick. */
            <button
              key={index}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative col-span-1 flex flex-col items-center justify-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60',
                navSlotClassByName[link.name],
                {
                  'border-t-2 border-functional-green/70 bg-gradient-to-b from-functional-green/10 to-transparent text-functional-green':
                    isActive,
                  'text-text-tertiary': !isActive,
                }
              )}
              onClick={() => router.push(link.route)}
            >
              <div className="relative">
                {link.icon}
                {/* Fixed by Codex on 2026-02-15
                 Who: Codex
                 What: Replace the discussions unread dot with a labeled badge.
                 Why: Add a non-color cue for unread activity.
                 How: Use a compact "New" pill instead of a color-only dot. */}
                {link.name === 'Discussions' && newEventsCount > 0 && !isOnDiscussionsPage && (
                  <span className="absolute -right-3 -top-2 rounded-full border border-functional-red/50 bg-functional-red/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-functional-red">
                    New
                  </span>
                )}
              </div>
              <span className="mt-1 select-none text-[10px]">{link.name}</span>
            </button>
          );
        })}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
          <div className="pointer-events-auto">
            <CreateDropdown />
          </div>
        </div>
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
