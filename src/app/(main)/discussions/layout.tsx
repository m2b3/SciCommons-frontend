import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Discussions'),
};

export default function DiscussionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
