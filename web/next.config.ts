import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'generative-placeholders.glitch.me',
      },
    ],
  },
};

export default nextConfig;
