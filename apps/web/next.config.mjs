/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` }];
    }
    return [];
  }
};
export default nextConfig;
