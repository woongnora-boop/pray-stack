'use client';

import { useActionState, type ReactElement } from 'react';

import { signUp, type AuthActionState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignupForm(): ReactElement {
  const [state, formAction, pending] = useActionState(signUp, null as AuthActionState | null);

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
