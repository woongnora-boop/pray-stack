import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/** 목록·상세는 비회원도 볼 수 있고, 새 글·수정만 로그인을 요구합니다. */
function pathnameRequiresLogin(pathname: string): boolean {
  if (pathname === '/meditation/new') return true;
  if (/^\/meditation\/[^/]+\/edit$/.test(pathname)) return true;
  if (pathname === '/manna/new') return true;
  if (/^\/manna\/[^/]+\/edit$/.test(pathname)) return true;
  if (pathname === '/gratitude/new') return true;
  if (/^\/gratitude\/[^/]+\/edit$/.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathnameRequiresLogin(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * Supabase SSR은 세션 갱신을 위해 넓은 matcher가 일반적입니다.
 * 정적 자산만 제외하고, `pathnameRequiresLogin`으로 실제 리다이렉트는 새 글·수정 경로에만 적용합니다.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
