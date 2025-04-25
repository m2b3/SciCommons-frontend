'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Menu, MoveLeft } from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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

  return (
    <>
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
                'flex items-center rounded-md px-4 py-2',
                pathname === link.href
                  ? 'bg-common-invert text-text-primary'
                  : 'hover:bg-common-minimal'
              )}
            >
              {React.cloneElement(link.icon, {
                className: pathname === link.href ? 'text-text-primary mr-3' : 'mr-3',
              })}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="fixed left-0 top-14 z-10 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="px-2 py-4">
              <Menu size={24} className="text-text-secondary" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="calc(100vh - 14rem) top-14"
            closeButtonClassName="right-6 top-10"
            isOpen={isOpen}
          >
            <nav className="flex flex-col space-y-2 py-4">
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
                    'flex items-center rounded-md px-4 py-2',
                    pathname === link.href
                      ? 'bg-common-invert text-text-primary'
                      : 'hover:bg-common-minimal'
                  )}
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
    </>
  );
};

export default Sidebar;
