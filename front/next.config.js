/** @type {import('next').NextConfig} */
const nextConfig = {
  // 실험적 기능 활성화 (Next.js 15 기능)
  experimental: {
    // 빌드 최적화
    optimizePackageImports: ['axios'],
  },
  // 이미지 최적화 설정
  images: {
    domains: [],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 정적 파일 서빙 설정
  async rewrites() {
    return [
      // API 라우트 프록시 (백엔드 서버로)
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  // 환경 변수 설정
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
  // TypeScript 설정
  typescript: {
    // 빌드 시 타입 체크
    ignoreBuildErrors: false,
  },
  // ESLint 설정
  eslint: {
    // 빌드 시 린트 체크
    ignoreDuringBuilds: false,
  },
  // webpack 청크 최적화
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
