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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_BASE_URL || "http://localhost:5000/api"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
