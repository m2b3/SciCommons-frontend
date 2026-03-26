import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Create Community'),
};

export default function CreateCommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
