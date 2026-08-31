
'use client';

import { ReactNode, useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Compass, Home, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

const IconRail = () => {
  const pathname = usePathname();
  // Use resolvedTheme so the toggle flips the *visible* theme in one click even when the
  // stored preference is 'system' (raw `theme` would be 'system', not 'light'/'dark').
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === 'dark';

  const isFeed = pathname === '/feed' || !!pathname?.startsWith('/feed/');
  const railBtn = (active: boolean) =>
    cn(
      'grid size-10 place-items-center rounded-xl transition-colors',
      active
        ? 'bg-functional-green/10 text-functional-green'
        : 'text-text-tertiary hover:bg-common-minimal hover:text-text-secondary'
    );

  return (
    <aside className="flex w-14 flex-none flex-col items-center gap-2 border-r border-common-contrast/40 bg-common-cardBackground py-3">
      <Link href="/feed" aria-label="SciCommons feed" className="mb-2">
        <span className="grid size-9 place-items-center rounded-xl bg-functional-green text-sm font-bold text-white">
          Sc
        </span>
      </Link>
      <Link href="/feed" aria-label="Explore" className={railBtn(isFeed)}>
        <Compass className="size-5" />
      </Link>
      <Link href="/articles" aria-label="Classic SciCommons app" className={railBtn(false)}>
        <Home className="size-5" />
      </Link>
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(railBtn(false), 'mt-auto')}
      >
        {mounted && isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
    </aside>
  );
};

const TopBar = () => (
  <header className="flex h-14 flex-none items-center gap-4 border-b border-common-contrast/40 bg-common-background px-4">
    <Link href="/feed" className="text-sm font-semibold text-text-primary">
      Sci<span className="text-functional-green">Commons</span>
    </Link>
    <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-common-contrast/50 bg-common-cardBackground px-4 py-1.5 text-sm text-text-tertiary">
      <Search className="size-4" />
      {/* Placeholder search — search/LLM features are out of scope for this demo. */}
      <input
        disabled
        placeholder="Ask or search anything…"
        className="w-full cursor-not-allowed bg-transparent outline-none placeholder:text-text-tertiary"
      />
    </div>
  </header>
);

export default function FeedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-common-background text-text-primary">
      <IconRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
