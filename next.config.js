/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // MATIKAN TYPE CHECK
  },
  eslint: {
    ignoreDuringBuilds: true, // MATIKAN ESLINT
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
