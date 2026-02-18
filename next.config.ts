import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sql.js uses node modules (fs, path) that don't exist in the browser.
  // Turbopack handles this automatically, so we just need an empty config
  // to acknowledge we're using Turbopack.
  turbopack: {},
};

export default nextConfig;
