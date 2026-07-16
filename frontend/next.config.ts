import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = (process.env.BACKEND_API_URL || "http://backend:8000").replace(/\/$/, "")
    return [{
      source: "/api/v1/:path*",
      destination: `${backendUrl}/api/v1/:path*`,
    }]
  },
};

export default nextConfig;
