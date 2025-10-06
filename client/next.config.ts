/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["i.pravatar.cc", "images.ctfassets.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "undsgn.com",
      },
    ],
  },
};

module.exports = nextConfig;
