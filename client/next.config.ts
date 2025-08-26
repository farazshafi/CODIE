/** @type {import('next').NextConfig} */
const nextConfig = {

  reactStrictMode: false,
  images: {
    domains: ["i.pravatar.cc"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "undsgn.com",
      },
    ],
  },
};

module.exports = nextConfig;
