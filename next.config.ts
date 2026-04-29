/** @type {import('next').NextConfig} */

const nextConfig = {
  allowedDevOrigins: ["192.168.6.56", "192.168.6.64", "192.168.1.4",'192.168.1.237'],
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
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // // Disable Turbopack for build
  // experimental: {
  //   turbo: undefined,
  // },

}

export default nextConfig
