/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Jika ingin akses API tanpa /api, tapi kita sudah punya /api
    ];
  },
};

module.exports = nextConfig;
