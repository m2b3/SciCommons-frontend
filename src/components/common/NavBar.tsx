'use client';

import React, { useEffect, useState } from 'react';

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
  Settings,
  SunMediumIcon,
  User,
  Users,
} from 'lucide-react';

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
import { useTabTitleNotification } from '@/hooks/useTabTitleNotification';
import { useUserSettings } from '@/hooks/useUserSettings';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionUnreadStore } from '@/stores/subscriptionUnreadStore';

import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const NavBar: React.FC = () => {
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);
  const user = useStore(useAuthStore, (state) => state.user);
  const pathname = usePathname();

  // Get count of articles with new realtime events for discussions badge
  const newEventsCount = useSubscriptionUnreadStore((state) => state.getNewEventsCount());

  // Update tab title with unread count
  useTabTitleNotification();

  const isAshokaUser = user?.email?.endsWith('ashoka.edu.in') ?? false;
  const router = useRouter();
  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Hid the top-navbar "Articles" link while preserving it in code.
     Why: The IA currently emphasizes communities and discussion flows, and a top-level Articles link
     reads as a parallel content silo that confuses navigation hierarchy.
     How: Commented out the `/articles` entry in the primary navLinks array. */
  /* Fixed by Codex on 2026-02-09
     What: Add a Bookmarks nav link for authenticated users
     Why: Bookmarks were buried under Contributions and took too many clicks
     How: Link to the contributions page with the bookmarks tab preselected */
  const navLinks = [
    { href: '/', label: 'Home' },
    // { href: '/articles', label: 'Articles', altHref: '/article' },
    { href: '/communities', label: 'Communities', altHref: '/community' },
    { href: '/discussions', label: 'Discussions', altHref: '/discussion' },
    ...(isAuthenticated
      ? [
          {
            href: '/mycontributions?tab=bookmarks',
            label: 'Bookmarks',
            altHref: '/mycontributions',
          },
        ]
      : []),
    { href: '/help', label: 'Help', bold: true },
    // { href: '/posts', label: 'Posts' },
    // { href: '/about', label: 'About' },
  ];

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Modernize the navbar treatment with a lighter glass finish.
     Why: The heavier green emphasis pulled focus away from content.
     How: Shifted to cooler neutrals, softer borders, and subtle hover fills. */
  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-common-contrast/40 bg-common-background/70 text-text-primary backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Convert the back icon into a real button.
              Why: Icon-only divs are not keyboard accessible or announced by screen readers.
              How: Wrap the icon in a button with an aria-label and click handler. */}
          <button
            type="button"
            aria-label="Go back"
            className="mr-4 flex size-8 items-center justify-center rounded-full text-primary hover:bg-common-minimal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60"
            onClick={() => {
              router.back();
            }}
          >
            <MoveLeft className="size-5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SciCommons logo"
                width={isAshokaUser ? 45 : 60}
                height={isAshokaUser ? 33 : 40}
              />
            </Link>
            {isAshokaUser && (
              <>
                <span className="text-lg font-light text-text-tertiary">×</span>
                <Image width={90} height={32} src={'/images/KCDHA-Black.png'} alt="KCDHA" />
              </>
            )}
          </div>
        </div>
        <ul className="mx-auto hidden items-center space-x-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {navLinks?.map((link) => {
            // Check if current path matches this nav link
            const isActive =
              link.href === pathname || (link.altHref && pathname?.startsWith(link.altHref));

            return (
              <li
                key={link.href}
                className={cn(
                  /* Fixed by Codex on 2026-02-15
                     Who: Codex
                     What: Add non-color active cues in the navbar.
                     Why: Color-only highlighting is weak for common color-blind users.
                     How: Added a contrast border and underline indicator for active states. */
                  'relative rounded-full border border-transparent px-3 py-1 text-sm text-text-primary transition hover:bg-functional-green/10',
                  {
                    'border-common-contrast/60 bg-functional-green/10 font-semibold text-functional-green shadow-sm after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-current':
                      isActive,
                    'font-bold': link.bold && !isActive,
                  }
                )}
              >
                <Link href={link.href} aria-current={isActive ? 'page' : undefined}>
                  {link.label}
                </Link>
                {/* Unread indicator badge for Discussions */}
                {link.href === '/discussions' &&
                  newEventsCount > 0 &&
                  !pathname?.startsWith('/discussion') && (
                    <span className="absolute -right-3 -top-2 rounded-full border border-functional-red/50 bg-functional-red/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-functional-red">
                      New
                    </span>
                  )}
              </li>
            );
          })}
        </ul>
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <CreateDropdown />
            </div>
            <Link href="/notifications" aria-label="Notifications">
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
  const router = useRouter();

  return (
    <DropdownMenu onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        {/* Fixed by Codex on 2026-02-15
            Who: Codex
            What: Let the Create button size to its content instead of forcing a square.
            Why: Firefox rendered the square as a circle and clipped the "Create" label.
            How: Removed the aspect-square constraint so padding can expand with text. */}
        <Button
          // variant={'default'}
          size="sm"
          className="rounded-full"
        >
          <Plus size={16} />
          <span className="hidden lg:block">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={12}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/submitarticle');
              }}
              className="flex items-center gap-2"
            >
              <BookOpenText size={16} />
              <span>Submit Article</span>
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Write and submit an article
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/createcommunity');
              }}
              className="flex items-center gap-2"
            >
              <Users size={16} />
              <span>Create Community</span>
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
  const { handleAppInstall, isInstallAvailable, handleOpenAppHelp } = usePWAInstallPrompt();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const { data } = useCurrentUser();
  // Fetch user settings on app load (similar to useCurrentUser)
  useUserSettings();

  const profileImage = data?.data?.profile_pic_url || `data:image/png;base64,${imageData}`;

  const handleLogout = () => {
    logout();
    /* Fixed by Codex on 2026-02-09
       What: Redirect to home after logout
       Why: Avoid leaving users on a stale authenticated page
       How: Navigate with next/navigation router after logout */
    router.push('/');
  };

  return (
    <DropdownMenu onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)} open={isDropdownOpen}>
      <DropdownMenuTrigger asChild>
        {/* Fixed by Codex on 2026-02-15
            Who: Codex
            What: Make the profile menu trigger keyboard accessible.
            Why: An image alone is not focusable for keyboard users.
            How: Wrap the avatar in a button with an aria-label. */}
        <button
          type="button"
          aria-label="Open profile menu"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60"
        >
          <Image
            src={profileImage}
            alt="Profile"
            width={32}
            height={32}
            className="aspect-square cursor-pointer rounded-full object-cover"
            quality={80}
            sizes="32px"
            priority
          />
        </button>
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
          <Link href="/settings" className="flex items-center">
            <Settings size={16} className="mr-2" /> Settings
          </Link>
        </DropdownMenuItem>
        {/* Fixed by Codex on 2026-02-16
            Who: Codex
            What: Made PWA menu state explicit with either Install or Open app help.
            Why: Hiding install entirely after first install can confuse users who do not realize the app is already available.
            How: Show Install only when deferred prompt exists; otherwise show a help action with launch guidance. */}
        {isInstallAvailable && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsDropdownOpen(false);
              void handleAppInstall();
            }}
            className="text-functional-green"
          >
            <DownloadIcon size={16} className="mr-2" />
            Install
          </DropdownMenuItem>
        )}
        {!isInstallAvailable && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsDropdownOpen(false);
              handleOpenAppHelp();
            }}
            className="text-text-secondary"
          >
            <DownloadIcon size={16} className="mr-2" />
            Open app help
          </DropdownMenuItem>
        )}
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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Deferred theme-toggle rendering until client mount.
     Why: Theme value can differ between server render and client hydration when resolvedTheme is computed.
     How: Gate render on mounted state and read from resolvedTheme fallback to theme. */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const currentTheme = resolvedTheme || theme;

  return (
    /* Fixed by Codex on 2026-02-15
       Who: Codex
       What: Make the theme toggle keyboard and screen-reader accessible.
       Why: A clickable div is not focusable and lacks a programmatic label.
       How: Swap to a button with aria-label and aria-pressed state. */
    <button
      type="button"
      className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60"
      aria-label="Toggle color theme"
      aria-pressed={currentTheme === 'dark'}
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
    >
      {currentTheme === 'light' ? (
        <MoonIcon size={iconSize} className="mr-2" />
      ) : (
        <SunMediumIcon size={iconSize} className="mr-2" />
      )}
      {showTitle && <>{currentTheme === 'light' ? 'Dark' : 'Light'} Mode</>}
    </button>
  );
};
