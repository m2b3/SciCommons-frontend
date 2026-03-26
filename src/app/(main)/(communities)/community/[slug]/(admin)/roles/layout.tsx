import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Community Roles'),
};

export default function CommunityRolesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
