import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import { Toaster as SonnerToaster } from 'sonner';

import { SessionExpirationDialog } from '@/HOCs/CheckSessionExpiration';
import PathTracker from '@/HOCs/withPathTracker';
import { ReactQueryClientProvider } from '@/api/ReactQueryClientProvider';
import BottomBar from '@/components/common/BottomBar';
import RealtimeStatus from '@/components/common/RealtimeStatus';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
  themeColor: '#00050d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body className={cn(inter.className, 'relative bg-common-background')}>
          <NextTopLoader showSpinner={false} color="#64e466" shadow={false} />
          <SessionExpirationDialog />
          <PathTracker />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider delayDuration={10}>
              <main className="flex-grow">{children}</main>
            </TooltipProvider>
          </ThemeProvider>
          <RealtimeStatus className="fixed left-1/2 top-4 z-[1000] -translate-x-1/2 bg-common-cardBackground md:bottom-4 md:left-auto md:right-2 md:top-auto md:translate-x-0" />
          <BottomBar />
          <SonnerToaster
            richColors
            position="top-center"
            className="top-16"
            closeButton
            duration={3000}
          />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
