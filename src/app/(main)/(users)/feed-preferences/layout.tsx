import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Feed Preferences'),
};

export default function FeedPreferencesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
