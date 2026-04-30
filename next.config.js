/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.IS_CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig