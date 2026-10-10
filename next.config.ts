import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [20, 75],
  },
  headers() {
    return [
      {
        // Cross-origin isolation enables SharedArrayBuffer, which the
        // threaded wasm-vips build needs. It is applied site-wide because
        // the browser only reads these headers on a full document load:
        // client-side navigations into /images would otherwise never
        // become isolated.
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ]
  },
}

export default nextConfig
