/** @type {import('next').NextConfig} */
const nextConfig = {
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
