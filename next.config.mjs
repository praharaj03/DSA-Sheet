/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { agentUpgrade: "security" },
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
