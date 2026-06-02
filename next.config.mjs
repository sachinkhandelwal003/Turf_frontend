/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.rkinteriorstudio.in',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      }
    ],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
    scrollRestoration: true,
  },
};

export default nextConfig;
