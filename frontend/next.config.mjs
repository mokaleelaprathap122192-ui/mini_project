/** @type {import('next').NextConfig} */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': require.resolve('three'),
    };
    return config;
  }
};

export default nextConfig;
