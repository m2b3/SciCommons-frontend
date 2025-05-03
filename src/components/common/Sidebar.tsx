'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Menu, MoveLeft } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="fixed left-0 top-10 hidden h-screen overflow-y-auto border-r border-gray-200 bg-white-secondary p-4 text-gray-900 md:block md:w-64 md:bg-white-primary">
        <div className="flex flex-col space-y-2 py-4">
          <Link
            href={baseHref}
            className="mb-8 flex items-center text-sm text-gray-500 hover:text-green-500 hover:underline"
          >
            <MoveLeft size={14} className="mr-3" />
            {baseHref.includes('article') ? 'Back to Article' : 'Back to Community'}
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-md px-4 py-2 ${
                pathname === link.href ? 'bg-black text-white' : 'hover:bg-gray-200'
              }`}
            >
              {React.cloneElement(link.icon, {
                className: pathname === link.href ? 'text-white mr-3' : 'mr-3',
              })}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="fixed left-0 top-10 z-10 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="px-2 py-8">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-2 py-4">
              <Link
                href={baseHref}
                className="mb-8 flex items-center text-sm text-gray-500 hover:text-green-500 hover:underline"
              >
                <MoveLeft size={14} className="mr-3" />
                {baseHref.includes('article') ? 'Back to Article' : 'Back to Community'}
              </Link>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-md px-4 py-2 ${
                    pathname === link.href ? 'bg-black text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  {React.cloneElement(link.icon, {
                    className: pathname === link.href ? 'text-white mr-3' : 'mr-3',
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
