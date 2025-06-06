import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/shadowing-card' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/shadowing-card' : '',
  images: {
    unoptimized: true, // Add this line for static export
  },
  /* config options here */
};

export default nextConfig;
