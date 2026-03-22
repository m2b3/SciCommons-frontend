'use client';

import { useParams } from 'next/navigation';

import Sidebar from '@/components/common/Sidebar';

export default function ArticleAuthorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  return (
    <div className="relative flex">
      {/* Fixed by Codex on 2026-02-09
          Problem: Sidebar "Edit" link was redundant now that settings opens directly in edit mode.
          Solution: Remove the Edit item while keeping the sidebar for Back to Article navigation.
          Result: Cleaner sidebar with no duplicate edit entry. */}
      <Sidebar baseHref={`/article/${params?.slug}`} links={[]} />
      <main className="mt-6 flex-1 p-4 md:ml-64 md:mt-0 md:pl-4">{children}</main>
    </div>
  );
}
