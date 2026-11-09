import type { NextConfig } from "next";
const config: NextConfig = { experimental: { agentUpgrade: "security", cssChunking: 'graph' }, images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480], qualities: [60, 75, 90, 95], remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/s/files/**' }] }, poweredByHeader: false, reactStrictMode: true, devIndicators: false };
export default config;
