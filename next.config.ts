import type { NextConfig } from "next";

// Trigger Vercel redeployment for env vars

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
