/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // static page: `npm run build` writes plain HTML/JS/CSS to ./out
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
