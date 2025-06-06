import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 必要に応じて残す (静的エクスポートの名残)
  },
  /* config options here */
  // Vercelでは通常 basePath と assetPrefix は不要です
  // output: 'export' もVercelの標準デプロイでは不要な場合が多いです
};

export default nextConfig;
