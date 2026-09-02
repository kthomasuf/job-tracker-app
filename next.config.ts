import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reads a binary data file relative to its own directory at runtime;
  // bundling it rewrites that path and breaks the read.
  serverExternalPackages: ["all-the-cities"],
};

export default nextConfig;
