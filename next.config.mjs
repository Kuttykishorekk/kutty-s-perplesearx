/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'standalone' for Docker, but Vercel doesn't need it
  // Vercel will auto-detect and optimize
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
  serverExternalPackages: ['pdf-parse'],
  // Vercel optimizations
  experimental: {
    // Optimize for serverless
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
