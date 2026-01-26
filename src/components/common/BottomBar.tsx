'use client';

import React, { lazy, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BookOpenText, Home, Newspaper, Plus, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUnreadNotificationsStore } from '@/stores/unreadNotificationsStore';

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

  // Get total unread count for discussions badge
  const totalUnread = useUnreadNotificationsStore((state) => state.getTotalUnreadCount());

  const navLinks = [
    { name: 'Home', route: '/', icon: <Home size={20} /> },
    { name: 'Articles', route: '/articles', altRoute: '/article', icon: <Newspaper size={20} /> },
    { name: '', route: '', icon: <CreateDropdown /> },
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
    <main className="fixed bottom-0 left-0 z-[1000] grid h-16 w-screen select-none grid-cols-5 border-t border-common-minimal bg-common-background/70 text-text-secondary backdrop-blur-md md:hidden">
      {navLinks.map((link, index) => {
        const isActive = isLinkActive(link);
        const isOnDiscussionsPage = pathname?.startsWith('/discussion');

        return (
          <div
            key={index}
            className={cn('relative flex flex-col items-center justify-center', {
              'border-t-2 border-functional-green/70 bg-gradient-to-b from-functional-green/10 to-transparent text-functional-green':
                isActive,
              'text-gray-500': !isActive,
            })}
            onClick={() => link.name && router.push(link.route)}
          >
            <div className="relative">
              {link.icon}
              {/* Unread badge for Discussions */}
              {link.name === 'Discussions' && totalUnread > 0 && !isOnDiscussionsPage && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-functional-red px-1 text-[8px] font-bold text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <span className="mt-1 select-none text-[10px]">{link.name}</span>
          </div>
        );
      })}
    </main>
  );
};

export default BottomBar;

const CreateDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <div className="rounded-full bg-common-minimal p-2">
          <Plus size={24} />
        </div>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col items-center p-0 pt-4" showThumb={true}>
        <div className="flex w-full flex-col px-4 pb-4 text-sm font-semibold text-text-secondary">
          <Link
            href="/submitarticle"
            className="flex select-none items-center gap-2 border-b border-common-minimal p-4 hover:bg-common-minimal/50 hover:text-text-primary"
            onClick={() => setOpen(false)}
          >
            <BookOpenText size={18} />
            <span>Submit Article</span>
          </Link>
          <Link
            href="/createcommunity"
            className="flex select-none items-center gap-2 p-4 hover:bg-common-minimal/50 hover:text-text-primary"
            onClick={() => setOpen(false)}
          >
            <Users size={18} />
            <span>Create Community</span>
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
