import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
    
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    async rewrites() {
      return [
        {
          source: "/api/backend/:path*",
          destination: "http://localhost:168/api/:path*",
        },
      ];
    }

};

export default nextConfig;
