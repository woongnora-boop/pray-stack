import Link from 'next/link';
import type { ReactElement } from 'react';

export function AuthInfoLinks(): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-xs text-[var(--muted)]">
      <Link href="/about" className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]">
        앱 소개
      </Link>
      <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]">
        개인정보 처리방침
      </Link>
      <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]">
        이용약관
      </Link>
    </div>
  );
}
