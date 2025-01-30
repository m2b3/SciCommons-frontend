import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import { Toaster as SonnerToaster } from 'sonner';

import { SessionExpirationDialog } from '@/HOCs/CheckSessionExpiration';
import PathTracker from '@/HOCs/withPathTracker';
import { ReactQueryClientProvider } from '@/api/ReactQueryClientProvider';
import BottomBar from '@/components/common/BottomBar';

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
        <body className={inter.className}>
          <NextTopLoader showSpinner={false} color="#64e466" shadow={false} />
          <SessionExpirationDialog />
          <PathTracker />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="nightwind-mode"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex-grow">{children}</main>
          </ThemeProvider>
          <BottomBar />
          <SonnerToaster richColors position="top-center" />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
