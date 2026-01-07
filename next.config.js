/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  env: {
    EXPRESS_API_BASE: process.env.EXPRESS_API_BASE || 'http://localhost:4000',
  },
  async headers() {
    // In development, allow connections to localhost for API calls
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const localhostSources = isDevelopment ? 'http://localhost:3000 http://localhost:4000 http://localhost:5000 http://localhost:5001' : '';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://www.gstatic.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: http:",
              `connect-src 'self' ${localhostSources} https://api.themoviedb.org https://image.tmdb.org https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com`.trim(),
              "frame-src 'self' https://*.firebaseapp.com",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
