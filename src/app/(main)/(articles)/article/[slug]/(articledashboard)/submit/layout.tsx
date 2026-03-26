import type { Metadata } from 'next';

import { buildSciCommonsTitle } from '@/lib/pageTitle';

export const metadata: Metadata = {
  title: buildSciCommonsTitle('Submit Article'),
};

export default function SubmitArticleDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
