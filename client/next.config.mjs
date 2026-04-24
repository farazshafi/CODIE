/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['192.168.1.2'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "undsgn.com" },
    ],
  },
  async rewrites() {
    const backend = process.env.API_BASE_URL;
    if (!backend) return [];
    
    return [
      {
        source: "/api/:path*",
        destination: `${backend.replace(/\/$/, "")}/:path*`,
      },
      {
        source: "/graphql",
        destination: `${backend.replace(/\/api\/?$/, "").replace(/\/$/, "")}/graphql`,
      },
    ];
  },

};

export default nextConfig;


