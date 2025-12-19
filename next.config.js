/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  env: {
    EXPRESS_API_BASE: process.env.EXPRESS_API_BASE || 'http://localhost:4000',
  },
};

module.exports = nextConfig;
