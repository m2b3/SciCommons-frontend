import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Post'),
};

export default function PostDetailsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
