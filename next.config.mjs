/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Uncomment below for GitHub Pages deployment
  output: 'export',
  basePath: '/Demo',
}

export default nextConfig
