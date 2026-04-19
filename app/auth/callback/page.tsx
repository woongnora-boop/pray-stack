import { Suspense, type ReactElement } from 'react';

import { AuthCallbackClient } from '@/components/auth/AuthCallbackClient';

export default function AuthCallbackPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <p className="py-8 text-center text-sm text-[var(--muted)]">인증 처리 중…</p>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
