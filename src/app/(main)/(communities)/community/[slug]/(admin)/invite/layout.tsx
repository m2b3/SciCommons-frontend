import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Community Invite'),
};

export default function CommunityInviteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
