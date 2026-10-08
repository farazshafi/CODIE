/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ['192.168.1.2', '192.168.1.12', 'localhost', '127.0.0.1', '0.0.0.0'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "undsgn.com" },
    ],
  },
  async rewrites() {
    const backendApi = process.env.API_BASE_URL || "http://app:5000/api";
    const targetApiUrl = backendApi.endsWith("/api") ? backendApi : `${backendApi.replace(/\/$/, "")}/api`;

    const socketBackend = process.env.SOCKET_BACKEND_URL || targetApiUrl.replace(/\/api\/?$/, "") || "http://app:5000";
    const targetSocketUrl = socketBackend.replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${targetApiUrl}/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${targetSocketUrl}/socket.io/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${targetSocketUrl}/socket.io/:path*`,
      },
    ];
  },

};

export default nextConfig;


