/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators:false,
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["puppeteer"],
  },
}

