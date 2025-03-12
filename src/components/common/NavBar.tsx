'use client';

import React from 'react';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Bell, DownloadIcon, LogOut, MoveLeft, NotebookTabs, Plus, User } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import useIdenticon from '@/hooks/useIdenticons';
import usePWAInstallPrompt from '@/hooks/usePWAInstallPrompt';
import useStore from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const NavBar: React.FC = () => {
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/communities', label: 'Communities' },
    { href: '/posts', label: 'Posts' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-slate-100/20 text-gray-900 backdrop-blur-[50px] dark:bg-slate-300/10 sm:px-9">
      <nav className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <MoveLeft
            className="mr-4 size-5 cursor-pointer text-primary"
            strokeWidth={1.5}
            onClick={() => {
              router.back();
            }}
          />
          <Link href="/" className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={60} height={40} />
          </Link>
        </div>
        <ul className="mx-auto hidden space-x-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {navLinks?.map((link) => (
            <li
              key={link.href}
              className={cn('rounded-full px-3 py-1 text-sm hover:bg-functional-green/10', {
                'bg-functional-green/10 font-bold text-green-400': link.href === pathname,
              })}
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <CreateDropdown />
            </div>
            <Link href="/notifications">
              <Bell className="h-9 w-9 cursor-pointer rounded-full p-2 text-gray-800 hover:bg-gray-200 hover:text-gray-600" />
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
        <button className="flex items-center gap-1 rounded-full border-2 border-green-500 px-4 py-2 text-green-500 transition-colors duration-300 hover:bg-green-500 hover:text-white">
          <Plus size={18} />
          Create
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
  const imageData = useIdenticon(40);
  const { handleAppInstall } = usePWAInstallPrompt('install');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={`data:image/png;base64,${imageData}`}
          alt="Profile"
          width={40}
          height={40}
          className="cursor-pointer rounded-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href="/myprofile" className="flex items-center">
            <User size={16} className="mr-2" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/mycontributions" className="flex items-center">
            <NotebookTabs size={16} className="mr-2" /> Contributions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            <Switch
              className="ml-2"
              checked={theme === 'dark'}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button
            onClick={handleAppInstall}
            id="install"
            hidden
            className="flex items-center text-functional-green"
          >
            <DownloadIcon size={16} className="mr-2" />
            Install
          </button>
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
