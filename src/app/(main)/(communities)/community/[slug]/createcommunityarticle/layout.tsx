import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Create Community Article'),
};

export default function CreateCommunityArticleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
