import type { Metadata } from 'next';

import { buildSciCommonsTitle, humanizeSlug } from '@/lib/pageTitle';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const fallbackCommunityName = humanizeSlug(params.slug);

  return {
    title: buildSciCommonsTitle(fallbackCommunityName, {
      fallbackSegment: 'Community',
      truncate: true,
    }),
  };
}

export default function CommunityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
