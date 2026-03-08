import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('My Profile'),
};

export default function MyProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
