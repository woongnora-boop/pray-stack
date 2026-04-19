import { headers } from 'next/headers';

/** 로그인 후 이동 등에서 외부로 나가지 않도록 검증한 상대 경로만 허용합니다. */
export function safeRelativeNextPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/';
  const t = raw.trim();
  if (!t.startsWith('/') || t.startsWith('//') || t.includes('\0')) return '/';
  return t;
}

/**
 * 인증 메일 `emailRedirectTo` 등에 쓰는 공개 origin.
 * - 배포 시 `NEXT_PUBLIC_SITE_URL`을 `https://실제도메인`으로 두면 확인 메일에 올바른 주소가 들어갑니다.
 * - 미설정 시 현재 요청의 Host/Forwarded 헤더(Vercel 등) 또는 로컬 기본값을 사용합니다.
 */
export async function getSiteOrigin(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;

  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').trim();
  if (host) {
    const forwardedProto = h.get('x-forwarded-proto');
    const proto =
      forwardedProto === 'http' || forwardedProto === 'https'
        ? forwardedProto
        : process.env.VERCEL
          ? 'https'
          : 'http';
    return `${proto}://${host}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, '');
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return 'http://localhost:3000';
}
