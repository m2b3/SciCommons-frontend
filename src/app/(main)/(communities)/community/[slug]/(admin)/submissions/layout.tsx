import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Community Submissions'),
};

export default function CommunitySubmissionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
