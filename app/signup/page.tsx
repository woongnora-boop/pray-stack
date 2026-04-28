import Link from 'next/link';
import type { ReactElement } from 'react';

import { AuthInfoLinks } from '@/components/auth/AuthInfoLinks';
import { SignupForm } from '@/components/SignupForm';
import { getServerAuth } from '@/lib/supabase/request-session';

export default async function SignupPage(): Promise<ReactElement> {
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
        <h1 className="text-xl font-semibold">회원가입</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">이메일과 비밀번호로 새 계정을 만듭니다.</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-[var(--muted)]">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-[var(--accent)] underline">
          로그인
        </Link>
      </p>
      <AuthInfoLinks />
    </div>
  );
}
