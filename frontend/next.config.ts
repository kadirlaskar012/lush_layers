import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
    unoptimized: true, // Guarantees local and LAN images render seamlessly
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "http://127.0.0.1:8000/media/:path*",
      },
      {
        source: "/api/backend/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
