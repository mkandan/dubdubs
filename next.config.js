/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out/chrome',
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
