import Link from 'next/link';
import type { ReactElement } from 'react';

import { LoginForm } from '@/components/LoginForm';
import { createClient } from '@/lib/supabase/server';

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextRaw = (await searchParams).next ?? '/meditation';
  const nextPath = nextRaw.startsWith('/') ? nextRaw : '/meditation';

  if (user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">이미 로그인되어 있습니다.</p>
        <Link href={nextPath} className="text-sm font-medium text-[var(--accent)] underline">
          계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">로그인</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Supabase에 등록된 이메일로 로그인합니다.</p>
      </div>
      <LoginForm nextPath={nextPath} />
      <p className="text-center text-sm text-[var(--muted)]">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-[var(--accent)] underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
