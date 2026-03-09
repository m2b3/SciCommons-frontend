import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Community Dashboard'),
};

export default function CommunityDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
