/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora qualquer erro de ESLint durante o build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
