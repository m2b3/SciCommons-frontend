import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Posts'),
};

export default function PostsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
