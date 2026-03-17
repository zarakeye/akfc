import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: ["rehype-slug"],
  },
})

const nextConfig: NextConfig = {
  transpilePackages: ["@akfc/backend", "@akfc/contracts"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
}

export default withMDX(nextConfig)