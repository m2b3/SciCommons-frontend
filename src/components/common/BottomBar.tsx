'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Home, Newspaper, NotebookPen, Plus, Users } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const BottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');

  const navLinks = [
    { name: 'Home', route: '/', icon: <Home size={18} /> },
    { name: 'Communities', route: '/communities', icon: <Users size={18} /> },
    { name: '', route: '', icon: <CreateDropdown /> },
    { name: 'Articles', route: '/articles', icon: <Newspaper size={18} /> },
    { name: 'Posts', route: '/posts', icon: <NotebookPen size={18} /> },
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
          <p className="mt-1 text-xs">{link.name}</p>
        </div>
      ))}
    </main>
  );
};

export default BottomBar;

const CreateDropdown: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <DropdownMenu onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full bg-common-minimal p-2">
          <Plus size={24} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href="/submitarticle">Submit Article</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/createcommunity" className="text-gray-500">
            Create Community
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/posts/createpost" className="text-gray-500">
            Create Post
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
