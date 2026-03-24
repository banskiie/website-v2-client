/** @type {import('next').NextConfig} */

// const nextConfig = {
//   images: {
//     domains: ['res.cloudinary.com'],

//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "drive.google.com",
//       },
//       {
//         protocol: "https",
//         hostname: "img.youtube.com",
//       },
//       {
//         protocol: "https",
//         hostname: "www.basketball-reference.com",
//       },
//       {
//         protocol: "https",
//         hostname: "lh3.googleusercontent.com",
//       }
//     ],
//   },
// }

// export default nextConfig

const nextConfig = {
  allowedDevOrigins: ["192.168.6.64"],
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
      }
    ],
  },
  typescript: {
    // Disable type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable Turbopack for build
  experimental: {
    turbo: undefined,
  },

}

export default nextConfig