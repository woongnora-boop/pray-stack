import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 루트 워크스페이스에서 빌드할 때 파일 추적 루트를 저장소 루트로 맞춥니다. */
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default nextConfig;
