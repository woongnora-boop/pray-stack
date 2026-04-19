'use client';

import Link from 'next/link';
import { useActionState, type ReactElement } from 'react';

import type { AuthActionState } from '@/app/actions/auth-types';
import { signUp } from '@/app/actions/auth';
import { appCardClass, appPrimaryButtonClass } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function EmailVerificationStep({ email }: { email: string }): ReactElement {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-verify-title"
    >
      <div className={cn(appCardClass, 'relative w-full max-w-md shadow-lg')}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">다음 단계</p>
        <h2 id="signup-verify-title" className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          메일함을 확인해 주세요
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          <span className="break-all font-medium text-[var(--foreground)]">{email}</span> 주소로 인증 메일을 보냈습니다.
          메일의 링크를 눌러 인증을 마친 다음, 아래에서 로그인해 주세요.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          도착까지 시간이 걸릴 수 있고, 스팸·프로모션함에 들어갈 수도 있어요.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)]/40 sm:order-1"
          >
            홈으로
          </Link>
          <Link href="/login" className={cn(appPrimaryButtonClass, 'text-center sm:order-2 sm:w-auto sm:min-w-[9rem]')}>
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SignupForm(): ReactElement {
  const [state, formAction, pending] = useActionState(signUp, null as AuthActionState | null);

  if (state?.success && state.pendingVerification) {
    return <EmailVerificationStep email={state.email} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.success === false ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} />
        <p className="text-xs text-[var(--muted)]">6자 이상 입력해 주세요.</p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '가입 중…' : '회원가입'}
      </Button>
    </form>
  );
}
