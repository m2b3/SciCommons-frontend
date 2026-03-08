import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';

import { Toaster as SonnerToaster } from 'sonner';

import { SessionExpirationDialog } from '@/HOCs/CheckSessionExpiration';
import PathTracker from '@/HOCs/withPathTracker';
import { ReactQueryClientProvider } from '@/api/ReactQueryClientProvider';
import BottomBar from '@/components/common/BottomBar';
import { GlobalErrorHandler } from '@/components/common/GlobalErrorHandler';
import RealtimeBootstrap from '@/components/common/RealtimeBootstrap';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

import './globals.css';

/* Fixed by Codex GPT-5 on 2026-02-18
   Who: Codex GPT-5
   What: Removed `next/font/google` from the root layout.
   Why: Docker and CI builds can run in networks where fonts.googleapis.com is blocked.
   How: Keep Tailwind font variables and resolve them via local fallback stacks in globals.css. */

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Add a UI skin hook on the root HTML element.
   Why: Enable separable look-and-feel swaps without touching component markup.
   How: Read NEXT_PUBLIC_UI_SKIN at build/runtime and attach it as a data attribute. */
const uiSkin = process.env.NEXT_PUBLIC_UI_SKIN ?? 'default';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.scicommons.org'),
  title: 'SciCommons',
  description: 'Peer-reviewed scientific articles, preprints, and more.',
  openGraph: {
    title: 'SciCommons',
    description: 'Peer-reviewed scientific articles, preprints, and more.',
    url: 'https://www.scicommons.org',
    siteName: 'SciCommons',
    images: [
      {
        url: '/og.png',
        width: 256,
        height: 256,
        alt: 'SciCommons',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Added root hydration-warning suppression on the html element.
       Why: Theme and root-level attributes can differ during SSR/CSR handoff, creating expected warnings.
       How: Keep existing skin attribute and add suppressHydrationWarning at the root tag. */
    <html lang="en" data-skin={uiSkin} suppressHydrationWarning>
      <body className="relative bg-common-background font-sans">
        <ReactQueryClientProvider>
          <GlobalErrorHandler />
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Align the route transition loader color with the new accent palette.
              Why: The old neon green clashed with the cooler modern palette.
              How: Updated NextTopLoader to use the teal accent token. */}
          <NextTopLoader showSpinner={false} color="#14b8a6" shadow={false} />
          <SessionExpirationDialog />
          <PathTracker />
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Mount realtime logic without rendering the HUD.
              Why: Realtime hook was only mounted by RealtimeStatus; removing it disabled unread dots.
              How: Add a bootstrapper component that calls useRealtime and returns null. */}
          <RealtimeBootstrap />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider delayDuration={10}>
              <main className="flex-grow">{children}</main>
            </TooltipProvider>
          </ThemeProvider>
          {/* Fixed by Codex on 2026-02-10
              Problem: The realtime status badge showed "Disabled" and distracted users.
              Solution: Removed the RealtimeStatus HUD from the global layout render.
              Result: The indicator no longer appears while realtime continues in the background. */}
          <BottomBar />
          <SonnerToaster
            position="top-center"
            className="top-16"
            closeButton
            duration={3000}
            toastOptions={{
              classNames: {
                toast: 'sc-toast',
                title: 'sc-toast-title',
                description: 'sc-toast-description',
                actionButton: 'sc-toast-action',
                cancelButton: 'sc-toast-cancel',
                closeButton: 'sc-toast-close',
                success: 'sc-toast-success',
                error: 'sc-toast-error',
                info: 'sc-toast-info',
                warning: 'sc-toast-warning',
                loading: 'sc-toast-loading',
              },
            }}
          />
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
