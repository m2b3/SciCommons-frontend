'use client';

import React, { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Cookies from 'js-cookie';
import { Bell, LogOut, NotebookTabs, User } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import useStore from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const NavBar: React.FC = () => {
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState('');
  const pathname = usePathname();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/communities', label: 'Communities' },
    { href: '/posts', label: 'Posts' },
  ];

  // Todo: Refactor this and Activate tabs when the required page is matched.
  useEffect(() => {
    switch (true) {
      case pathname.includes('articles') || pathname.includes('article'):
        setActiveTab('Articles');
        break;
      case pathname.includes('posts') || pathname.includes('post'):
        setActiveTab('Posts');
        break;
      case pathname.includes('communities') || pathname.includes('community'):
        setActiveTab('Communities');
        break;
      default:
        setActiveTab('Home');
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-100/20 backdrop-blur-[20px] sm:px-9">
      <nav className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Image src="https://picsum.photos/200/200" alt="Logo" width={40} height={40} />
        </div>
        <ul className="mx-auto flex space-x-4">
          {navLinks.map((link) => (
            <li
              key={link.href}
              className={cn('rounded-full px-2 py-1 text-sm hover:bg-functional-green/10', {
                'bg-functional-green/10 font-bold text-functional-green': link.label === activeTab,
              })}
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <CreateDropdown />
            <Link href="/notifications">
              <Bell className="h-8 w-8 cursor-pointer rounded-full p-1 text-gray-800 hover:bg-gray-200 hover:text-gray-600" />
            </Link>
            <ProfileDropdown />
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-gray-800 hover:text-gray-600">
              <button>Login</button>
            </Link>
            <Link href="/auth/register" className="text-gray-800 hover:text-gray-600">
              <button className="rounded-full bg-green-500 px-4 py-2 text-white">Register</button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavBar;

const CreateDropdown: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border-2 border-green-500 px-4 py-2 text-green-500 transition-colors duration-300 hover:bg-green-500 hover:text-white">
          + Create
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href="/submitarticle">Submit Article</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/createcommunity">Create Community</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/posts/createpost">Create Post</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProfileDropdown: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    const access = Cookies.get('accessToken');
    const refresh = Cookies.get('refreshToken');
    console.log(access, refresh);
    toast.success('Logged out successfully');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={`https:picsum.photos/200/200?random=${Math.random()}`}
          alt="Profile"
          width={40}
          height={40}
          className="cursor-pointer rounded-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href="/myprofile" className="flex items-center ">
            <User size={16} className="mr-2" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/mycontributions" className="flex items-center ">
            <NotebookTabs size={16} className="mr-2" /> Contributions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center space-x-2">
            Dark Mode{' '}
            <Switch
              className="ml-2"
              checked={theme === 'dark'}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button onClick={handleLogout} className="flex items-center text-functional-red">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
