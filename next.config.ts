import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mastra and its storage drivers ship native/Node-only code; keep them out
  // of the server bundle and let Node resolve them at runtime.
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
