'use client';

import { useActionState, type ReactElement } from 'react';

import type { AuthActionState } from '@/app/actions/auth-types';
import { signInWithEmail } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  /** 로그인 후 이동할 상대 경로 (예: `/meditation/new`) */
  defaultNext?: string;
  /** 인증 링크 오류 등 외부에서 전달되는 메시지 */
  authLinkError?: string | null;
}

export function LoginForm({ defaultNext = '/', authLinkError }: LoginFormProps): ReactElement {
  const [state, formAction, pending] = useActionState(signInWithEmail, null as AuthActionState | null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={defaultNext} />
      {authLinkError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {authLinkError}
        </p>
      ) : null}
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
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  );
}
