'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
// import { IconArticle, IconHomeFilled, IconNotebook, IconUsersGroup } from '@tabler/icons-react';
import { Home, Newspaper, NotebookPen, Plus, Users } from 'lucide-react';

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

  return (
    <main className="fixed bottom-0 left-0 grid h-16 w-screen select-none grid-cols-5 border-t border-common-minimal bg-gray-50 dark:bg-gray-900 md:hidden">
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full bg-gray-300 p-2 dark:bg-gray-800">
          <Plus size={24} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mb-6 w-48 rounded-common-lg border border-gray-300 bg-gray-100 py-2 dark:border-gray-700 dark:bg-gray-950">
        <DropdownMenuItem className="py-2 hover:bg-gray-900">
          <Link href="/submitarticle">
            <span className="p-4 text-sm text-gray-500">Submit Article</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 hover:bg-gray-900">
          <Link href="/createcommunity" className="text-gray-500">
            <span className="p-4 text-sm text-gray-500">Create Community</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 hover:bg-gray-900">
          <Link href="/posts/createpost" className="text-gray-500">
            <span className="p-4 text-sm text-gray-500">Create Post</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
