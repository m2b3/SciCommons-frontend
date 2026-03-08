import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Edit Article'),
};

export default function EditArticleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
