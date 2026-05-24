import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@lordicon/react",
      "framer-motion",
      "gsap",
      "lottie-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/150/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/legal/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/legal/terms-of-service",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/company/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/products/web-unblocker",
        destination: "/products/web-scraping",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
