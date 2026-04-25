/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.kick.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "stake.com" },
    ],
  },
  allowedDevOrigins: [
    'don-kasjo-lime.vercel.app',
  ],
}

export default nextConfig