import { headers } from 'next/headers';

/** 로그인 후 이동 등에서 외부로 나가지 않도록 검증한 상대 경로만 허용합니다. */
export function safeRelativeNextPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/';
  const t = raw.trim();
  if (!t.startsWith('/') || t.startsWith('//') || t.includes('\0')) return '/';
  return t;
}

type HeaderGet = { get(name: string): string | null };

function trimTrailingSlash(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function protocolFromForwardedHeaders(h: HeaderGet): 'http' | 'https' {
  const forwardedProto = h.get('x-forwarded-proto');
  if (forwardedProto === 'http' || forwardedProto === 'https') {
    return forwardedProto;
  }
  if (process.env.VERCEL) {
    return 'https';
  }
  return 'http';
}

function originFromRequestHeaders(h: HeaderGet): string | null {
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').trim();
  if (host) {
    const proto = protocolFromForwardedHeaders(h);
    return `${proto}://${host}`;
  }

  const origin = h.get('origin')?.trim();
  if (!origin) return null;
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function originFromVercelSystemEnv(): string | null {
  const raw = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, '');
  if (raw) {
    return `https://${raw}`;
  }

  if (process.env.VERCEL_ENV === 'production') {
    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/^https?:\/\//, '');
    if (production) {
      return `https://${production}`;
    }
  }

  return null;
}

function isLocalhostStyleOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
  } catch {
    return false;
  }
}

/** 가입 폼의 `site_origin`이 실제 브라우저 출처와, 프록시가 넘긴 Host 계열 정보와 맞는지 봅니다. */
function clientOriginMatchesRequest(headerStore: HeaderGet, clientOrigin: string): boolean {
  const headerOrigin = headerStore.get('origin')?.trim() ?? '';
  if (!headerOrigin || headerOrigin !== clientOrigin) return false;
  try {
    const u = new URL(clientOrigin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
  } catch {
    return false;
  }

  const fromHeaders = originFromRequestHeaders(headerStore);
  if (!fromHeaders) return false;
  try {
    return new URL(fromHeaders).hostname === new URL(clientOrigin).hostname;
  } catch {
    return false;
  }
}

export type ResolveSiteOriginOptions = {
  /**
   * `NEXT_PUBLIC_SITE_URL`이 localhost인데 실제 접속은 배포 도메인인 경우(잘못된 빌드/환경 변수),
   * 요청 헤더 기준 origin을 우선합니다.
   */
  preferRequestOverLocalhostExplicit?: boolean;
};

/**
 * 공개 사이트 origin (인증 메일 `emailRedirectTo`, 절대 URL 조합 등).
 *
 * 우선순위:
 * 1. `NEXT_PUBLIC_SITE_URL` — Vercel·로컬에서 환경별로 명시하는 것이 가장 안전합니다.
 * 2. 현재 요청 헤더 (`x-forwarded-host` / `host`, 없으면 `origin`) — 미설정 시 실제 접속 도메인을 반영합니다.
 * 3. Vercel 런타임 변수 (`VERCEL_URL`, 프로덕션의 `VERCEL_PROJECT_PRODUCTION_URL`).
 * 4. 로컬 개발 기본값 `http://localhost:3000` (Vercel이 아닐 때만).
 */
export function getResolvedSiteOrigin(
  headerStore?: HeaderGet,
  options?: ResolveSiteOriginOptions,
): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const explicitNorm = explicit ? trimTrailingSlash(explicit) : '';

  const fromHeaders = headerStore ? originFromRequestHeaders(headerStore) : null;

  if (
    options?.preferRequestOverLocalhostExplicit &&
    explicitNorm &&
    isLocalhostStyleOrigin(explicitNorm) &&
    fromHeaders &&
    !isLocalhostStyleOrigin(fromHeaders)
  ) {
    return fromHeaders;
  }

  if (explicitNorm) {
    return explicitNorm;
  }

  if (fromHeaders) {
    return fromHeaders;
  }

  const fromVercel = originFromVercelSystemEnv();
  if (fromVercel) {
    return fromVercel;
  }

  if (!process.env.VERCEL) {
    return 'http://localhost:3000';
  }

  return 'http://localhost:3000';
}

/**
 * 인증 메일 `emailRedirectTo`용. 브라우저가 보낸 `site_origin`이 `Origin` 헤더·Host 계열과 일치할 때만 사용해
 * PC `localhost`로 가입한 뒤 휴대폰에서 메일을 열 때 나는 localhost 고정 문제를 줄입니다(같은 Wi‑Fi의 LAN IP·배포 URL 등).
 */
export function pickSiteOriginForAuthEmail(
  headerStore: HeaderGet,
  formSiteOrigin: string | null | undefined,
): string {
  const raw = typeof formSiteOrigin === 'string' ? formSiteOrigin.trim() : '';
  if (raw && clientOriginMatchesRequest(headerStore, raw)) {
    return trimTrailingSlash(raw);
  }
  return getResolvedSiteOrigin(headerStore, { preferRequestOverLocalhostExplicit: true });
}

/**
 * 서버 컴포넌트·Server Action 등에서 `headers()`와 함께 사용합니다.
 */
export async function getSiteOrigin(): Promise<string> {
  const h = await headers();
  return getResolvedSiteOrigin(h, { preferRequestOverLocalhostExplicit: true });
}

/**
 * 클라이언트 컴포넌트에서 환경 변수가 없을 때 현재 탭의 origin을 사용합니다.
 * (SSR 첫 페인트 시에는 `NEXT_PUBLIC_SITE_URL`만 쓰입니다.)
 */
export function getBrowserSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return trimTrailingSlash(explicit);
  }
  return '';
}
