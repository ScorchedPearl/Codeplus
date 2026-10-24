import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Event posters are uploaded through server actions
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
