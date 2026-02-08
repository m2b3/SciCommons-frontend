'use client';

import React, { lazy, useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BookOpenText, Home, Newspaper, Plus, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState('');

  const navLinks = [
    { name: 'Home', route: '/', icon: <Home size={20} /> },
    { name: 'Articles', route: '/articles', icon: <Newspaper size={20} /> },
    { name: '', route: '', icon: <CreateDropdown /> },
    { name: 'Communities', route: '/communities', icon: <Users size={20} /> },
    { name: 'Discussions', route: '/discussions', icon: <BookOpenText size={20} /> },
    // { name: 'Contributions', route: '/mycontributions', icon: <NotebookTabs size={20} /> },
    // { name: 'Posts', route: '/posts', icon: <NotebookPen size={18} /> },
  ];

  const hideBottomBarPaths = ['login', 'register', 'forgotpassword', 'resetpassword'];

  useEffect(() => {
    switch (true) {
      case pathname?.includes('articles') || pathname?.includes('article'):
        setActiveTab('Articles');
        break;
      case pathname?.includes('posts') || pathname?.includes('post'):
        setActiveTab('Posts');
        break;
      case pathname?.includes('communities') || pathname?.includes('community'):
        setActiveTab('Communities');
        break;
      case pathname?.includes('discussions') || pathname?.includes('discussion'):
        setActiveTab('Discussions');
        break;
      case pathname?.includes('mycontributions') || pathname?.includes('mycontribution'):
        setActiveTab('Contributions');
        break;
      default:
        setActiveTab('Home');
    }
  }, [pathname]);

  if (hideBottomBarPaths.some((path) => pathname?.includes(path))) {
    return null;
  }

  return (
    <main className="fixed bottom-0 left-0 z-[1000] grid h-16 w-screen select-none grid-cols-5 border-t border-common-minimal bg-common-background/70 text-text-secondary backdrop-blur-md md:hidden">
      {navLinks.map((link, index) => (
        <div
          key={index}
          className={cn('flex flex-col items-center justify-center', {
            'border-t-2 border-functional-green/70 bg-gradient-to-b from-functional-green/10 to-transparent text-functional-green':
              link.name === activeTab,
            'text-gray-500': link.name !== activeTab,
          })}
          // onClick={() => router.push(`/${link.name.toLowerCase()}`)}
          onClick={() => link.name && router.push(link.route)}
        >
          {link.icon}
          <span className="mt-1 select-none text-[10px]">{link.name}</span>
        </div>
      ))}
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
