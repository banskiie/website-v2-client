/** @type {import('next').NextConfig} */

const nextConfig = {
<<<<<<< HEAD
  allowedDevOrigins: [
    "192.168.6.56",
    "192.168.6.64",
    "192.168.1.34",
    "192.168.6.67",
    ,
    "192.168.1.95",
  ],
=======
  allowedDevOrigins: ["192.168.6.56", "192.168.6.64", "192.168.1.5"],
>>>>>>> faab6b1b4d96802b951ca12706659cf80e8c1d34
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.basketball-reference.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    // Disable type checking during build
    ignoreBuildErrors: true,
  },
<<<<<<< HEAD
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable Turbopack for build
  experimental: {
    turbo: undefined,
  },
=======
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // // Disable Turbopack for build
  // experimental: {
  //   turbo: undefined,
  // },

>>>>>>> faab6b1b4d96802b951ca12706659cf80e8c1d34
}

export default nextConfig
