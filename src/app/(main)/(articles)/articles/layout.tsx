import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Articles'),
};

export default function ArticlesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
