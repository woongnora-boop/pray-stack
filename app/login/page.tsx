import Link from 'next/link';
import type { ReactElement } from 'react';

import { LoginForm } from '@/components/LoginForm';
import { AuthInfoLinks } from '@/components/auth/AuthInfoLinks';
import { safeRelativeNextPath } from '@/lib/site-url';
import { getServerAuth } from '@/lib/supabase/request-session';

interface LoginPageProps {
  searchParams: Promise<{ next?: string; auth_error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<ReactElement> {
  const params = await searchParams;
  const defaultNext = safeRelativeNextPath(params.next);
  const authLinkError = typeof params.auth_error === 'string' ? params.auth_error.replace(/\+/g, ' ') : null;

  const { user } = await getServerAuth();

  if (user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">이미 로그인되어 있습니다.</p>
        <Link href="/" className="text-sm font-medium text-[var(--accent)] underline">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">로그인</h1>
      </div>
      <LoginForm defaultNext={defaultNext} authLinkError={authLinkError} />
      <p className="text-center text-sm text-[var(--muted)]">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-[var(--accent)] underline">
          회원가입
        </Link>
      </p>
      <AuthInfoLinks />
    </div>
  );
}
