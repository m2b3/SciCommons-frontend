/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';
import nextra from 'nextra';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = withPWA({
  images: {
    // Keep Next.js image optimization enabled; `unoptimized: true` caused images not to render in this app.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gsoc2024.s3.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'gsoc2024.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'cdn.scicommons.org',
      },
      {
        protocol: 'http',
        hostname: 'cdn.scicommons.org',
      },
      // Do not allow loopback hosts here; Next image optimizer would create an SSRF path.
    ],
  },
  output: 'standalone'
});

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

export default withNextra(nextConfig);
