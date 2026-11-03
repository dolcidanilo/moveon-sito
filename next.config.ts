import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Le animazioni si avviano una sola volta: in sviluppo la doppia esecuzione di React le duplicherebbe.
  reactStrictMode: false,
};

export default nextConfig;
