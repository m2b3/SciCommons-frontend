/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';
import nextra from 'nextra';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = withPWA({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gsoc2024.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  output: 'standalone'
});

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

export default withNextra(nextConfig);
