'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MoveLeft } from 'lucide-react';

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

  return (
    <div className="flex h-screen w-64 justify-center border-r bg-white p-4">
      <nav className="flex flex-col space-y-2 py-4">
        {/* Back To Community */}
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
      </nav>
    </div>
  );
};

export default Sidebar;
