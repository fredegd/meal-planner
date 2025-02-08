import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.lecker.de",
      },
      {
        protocol: "https",
        hostname: "image.brigitte.de",
      },
      {
        protocol: "https",
        hostname: "image.essen-und-trinken.de",
      },
      {
        protocol: "https",
        hostname: "images.eatsmarter.de",
      },
      {
        protocol: "https",
        hostname: "www.daskochrezept.de",
      },
      {
        protocol: "https",
        hostname: "www.mrsflury.com",
      },
      {
        protocol: "https",
        hostname: "kleingenuss.de",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "elavegan.com",
      },
    ],
  },
};

export default nextConfig;
