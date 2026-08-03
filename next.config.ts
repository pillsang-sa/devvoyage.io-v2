import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages is static hosting, so everything is prerendered into `out/`.
  output: "export",
  // Emits `out/blog/hello/index.html` instead of `out/blog/hello.html`, which
  // is what GitHub Pages resolves most reliably.
  trailingSlash: true,
  // The Image Optimization API needs a server, which a static export has not.
  images: { unoptimized: true },
};

export default nextConfig;
