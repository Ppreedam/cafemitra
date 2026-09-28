import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app's own folder is the project root. Without it, a stray
  // package-lock.json higher up makes Turbopack treat the whole repo (server,
  // client, print agent...) as the workspace, causing manifest errors on dev.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
