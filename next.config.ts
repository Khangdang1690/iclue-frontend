import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Temporarily disable to fix SSE connection issues
};

export default nextConfig;
