import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@caseai/local-vault', '@caseai/ui', '@caseai/types']
};

export default nextConfig;
