import type { NextConfig } from "next";
const config: NextConfig = { experimental: { agentUpgrade: "security" }, images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480], qualities: [75, 90, 95] }, poweredByHeader: false, reactStrictMode: true, devIndicators: false };
export default config;
