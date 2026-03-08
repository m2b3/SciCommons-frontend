import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Create Post'),
};

export default function CreatePostLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
