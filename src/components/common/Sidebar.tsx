'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MoveLeft, MoveRight } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SCREEN_WIDTH_MD } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactElement;
}

interface SidebarProps {
  baseHref: string;
  links: SidebarLink[];
}

const Sidebar: React.FC<SidebarProps> = ({ baseHref, links }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_MD}px)`);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSheetClose = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 500);
    return () => clearTimeout(timeout);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return isDesktop ? (
    <div className="fixed left-0 top-14 hidden h-screen overflow-y-auto border-r border-common-contrast bg-common-cardBackground p-4 text-text-primary md:block md:w-64">
      <div className="flex flex-col space-y-2 py-4">
        <Link
          href={baseHref}
          className="mb-8 flex items-center text-sm text-text-secondary hover:underline"
        >
          <MoveLeft size={14} className="mr-3" />
          {baseHref.includes('article') ? 'Back to Article' : 'Back to Community'}
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center rounded-md px-4 py-2 text-sm',
              pathname === link.href
                ? 'bg-common-invert text-text-primary'
                : 'hover:bg-common-minimal'
            )}
          >
            {React.cloneElement(link.icon, {
              className: pathname === link.href ? 'text-text-primary mr-3 size-4' : 'mr-3 size-4',
            })}
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <div className="fixed left-0 top-14 z-10 md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm bg-common-background/80 px-4 py-1">
            <span className="text-xs text-text-secondary underline">Menu</span>
            <MoveRight size={14} className="text-text-secondary" />
          </div>
        </SheetTrigger>
        <SheetContent
          side="left"
          className=""
          closeButtonClassName="right-6 top-10"
          isOpen={isOpen}
        >
          <SheetTitle className="hidden">Menu</SheetTitle>
          <nav className="flex flex-col space-y-2 py-4">
            <Link
              href={baseHref}
              className="mb-8 flex w-fit items-center text-sm text-text-secondary hover:underline"
            >
              <MoveLeft size={14} className="mr-3" />
              {baseHref.includes('article') ? 'Back to Article' : 'Back to Community'}
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center rounded-md px-4 py-2',
                  pathname === link.href
                    ? 'bg-common-invert text-text-primary'
                    : 'hover:bg-common-minimal'
                )}
                onClick={handleSheetClose}
              >
                {React.cloneElement(link.icon, {
                  className: pathname === link.href ? 'text-text-primary mr-3' : 'mr-3',
                })}
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sidebar;
