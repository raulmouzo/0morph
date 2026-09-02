import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [20, 75],
  },
}

export default nextConfig
