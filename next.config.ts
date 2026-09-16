import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*", "@libsql/client", "libsql"],
};

export default nextConfig;
