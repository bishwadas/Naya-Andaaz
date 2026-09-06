/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  serverExternalPackages: ['drizzle-orm', 'pg'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'nayaandaaz.com',
          },
        ],
        destination: 'https://www.nayaandaaz.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
