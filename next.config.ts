import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://9r3kr9wg-5000.inc1.devtunnels.ms/:path*",
      },
    ];
  },
};

export default nextConfig;
