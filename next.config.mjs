/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';
import nextra from 'nextra';

const isDev = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: isDev, // Disable PWA in development for faster builds
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Security headers for production
const securityHeaders = [
  {
    // Prevent XSS attacks
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Prevent clickjacking
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Permissions policy (formerly Feature-Policy)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // Strict Transport Security - enforce HTTPS
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const nextConfig = withPWA({
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Remove X-Powered-By header for security (hides that you're using Next.js)
  poweredByHeader: false,

  // Optimize images
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
      {
        protocol: 'https',
        hostname: 'cdn.scicommons.org',
      },
    ],
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Minimize image size impact on Largest Contentful Paint
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Standalone output for Docker/containerized deployments
  output: 'standalone',

  // Compiler optimizations
  compiler: {
    // Remove console.log in production (keeps console.error and console.warn)
    removeConsole: isDev ? false : { exclude: ['error', 'warn'] },
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'date-fns',
      'lodash',
    ],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Disable source maps in production for security
    if (!isDev && !isServer) {
      config.devtool = false;
    }

    return config;
  },

  // Enable gzip compression (handled by Next.js, but explicit is good)
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Trailing slash configuration (choose one and be consistent)
  trailingSlash: false,

  // Skip type checking during build if you have a separate CI step
  // typescript: {
  //   ignoreBuildErrors: false,
  // },

  // Skip ESLint during build if you have a separate CI step
  // eslint: {
  //   ignoreDuringBuilds: false,
  // },
});

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra(nextConfig);
