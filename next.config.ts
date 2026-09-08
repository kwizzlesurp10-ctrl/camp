import type { NextConfig } from "next";

const projectRoot = import.meta.dirname;

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
