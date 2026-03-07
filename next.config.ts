import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDirectoryPath = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: currentDirectoryPath
  }
};

export default nextConfig;
