import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build in `out/` — drop it on any web host.
  output: "export",
  // /de/ and /en/ become folders with an index.html: served correctly by any host.
  trailingSlash: true,
  devIndicators: false,
  experimental: {
    // One 404 page for the whole site; there is no single root layout to build it from.
    globalNotFound: true,
  },
};

export default nextConfig;
