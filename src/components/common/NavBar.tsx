'use client';

import React, { useState } from 'react';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Bell,
  BookOpenText,
  DownloadIcon,
  LogOut,
  MoonIcon,
  MoveLeft,
  NotebookTabs,
  Plus,
  SunMediumIcon,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useIdenticon from '@/hooks/useIdenticons';
import usePWAInstallPrompt from '@/hooks/usePWAInstallPrompt';
import useStore from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const NavBar: React.FC = () => {
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/communities', label: 'Communities' },
    { href: '/discussions', label: 'Discussions' },
    // { href: '/posts', label: 'Posts' },
    // { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-common-minimal bg-common-background/50 text-text-primary backdrop-blur-md sm:px-2 lg:px-9">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2">
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
        <ul className="mx-auto hidden items-center space-x-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {navLinks?.map((link) => (
            <li
              key={link.href}
              className={cn(
                'rounded-full px-3 py-1 text-sm text-text-primary hover:bg-functional-green/10',
                {
                  'bg-functional-green/10 font-bold text-functional-green': link.href === pathname,
                }
              )}
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
              <Bell className="hover:animate-wiggle h-9 w-9 cursor-pointer rounded-full p-2 text-text-secondary hover:text-functional-yellow" />
            </Link>
            <ThemeSwitch iconSize={20} />
            <ProfileDropdown />
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant={'transparent'} className="px-1">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant={'default'} className="rounded-full">
                Register
              </Button>
            </Link>
            <ThemeSwitch iconSize={20} />
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavBar;

const CreateDropdown: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'default'}
          className="aspect-square rounded-full p-2 lg:aspect-auto lg:px-3"
        >
          <Plus size={16} />
          <span className="hidden lg:block">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={12}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
              <Link href="/submitarticle" className="flex items-center gap-2">
                <BookOpenText size={16} />
                <span>Submit Article</span>
              </Link>
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Write and submit an article
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
              <Link href="/createcommunity" className="flex items-center gap-2">
                <Users size={16} />
                <span>Create Community</span>
              </Link>
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Start a new community journal
          </TooltipContent>
        </Tooltip>

        {/* <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
                <Link href="/posts/createpost">Create Post</Link>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              Share your thoughts with a post
            </TooltipContent>
          </Tooltip> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProfileDropdown: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const imageData = useIdenticon(40);
  const { handleAppInstall } = usePWAInstallPrompt('install');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data } = useCurrentUser();

  const profileImage = data?.data?.profile_pic_url || `data:image/png;base64,${imageData}`;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <DropdownMenu onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Image
          src={profileImage}
          alt="Profile"
          width={32}
          height={32}
          className="aspect-square cursor-pointer rounded-full object-cover"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={12}>
        <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
          <Link href="/myprofile" className="flex items-center">
            <User size={16} className="mr-2" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
          <Link href="/mycontributions" className="flex items-center">
            <NotebookTabs size={16} className="mr-2" /> Contributions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
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
        <DropdownMenuItem onClick={() => setIsDropdownOpen(false)}>
          <button onClick={handleLogout} className="flex items-center text-functional-red">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ThemeSwitch = ({
  showTitle = false,
  iconSize = 16,
}: {
  showTitle?: boolean;
  iconSize?: number;
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex cursor-pointer items-center space-x-2"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? (
        <MoonIcon size={iconSize} className="mr-2" />
      ) : (
        <SunMediumIcon size={iconSize} className="mr-2" />
      )}
      {showTitle && <>{theme === 'light' ? 'Dark' : 'Light'} Mode</>}
    </div>
  );
};
