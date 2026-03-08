import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Community Settings'),
};

export default function CommunitySettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
