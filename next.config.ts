import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** 사전 파일을 Node에서 직접 읽도록 번들에서 제외 */
  serverExternalPackages: ['kuromoji-ko'],
};

export default nextConfig;
