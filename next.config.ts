import type { NextConfig } from "next";

const projectRoot = import.meta.dirname;

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
