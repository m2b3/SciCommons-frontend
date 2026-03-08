import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Community Requests'),
};

export default function CommunityRequestsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
