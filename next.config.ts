import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Prevent Turbopack from bundling these CJS-only libraries.
  // They must be required natively by Node.js in server routes.
  // This fixes ENOENT (pdf-parse debug mode) and worker .mjs errors.
  serverExternalPackages: ["pdf-parse", "pdf2json", "pdfjs-dist"],
};

export default nextConfig;
