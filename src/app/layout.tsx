import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';

import { ReactQueryClientProvider } from '@/api/ReactQueryClientProvider';
import BottomBar from '@/components/BottomBar';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'SciCommons',
  description: 'Peer-reviewed scientific articles, preprints, and more.',
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="nightwind-mode"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <BottomBar />
          <Toaster />
          <SonnerToaster richColors />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
