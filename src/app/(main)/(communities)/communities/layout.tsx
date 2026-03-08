import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Communities'),
};

export default function CommunitiesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
