/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "undsgn.com",
      },
    ],
  },
};

module.exports = nextConfig;
