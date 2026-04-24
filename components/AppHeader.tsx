import Link from 'next/link';
import type { ReactElement } from 'react';

import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { getServerAuth } from '@/lib/supabase/request-session';

export async function AppHeader(): Promise<ReactElement> {
  const { user } = await getServerAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--card)]/75">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3 md:max-w-2xl">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-80">
          Pray Stack
        </Link>
        <nav className="hidden flex-wrap items-center gap-2 text-sm md:flex" aria-label="상단 메뉴">
          <Link className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-[var(--border)]/40 hover:text-[var(--foreground)]" href="/meditation">
            묵상
          </Link>
          <Link className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-[var(--border)]/40 hover:text-[var(--foreground)]" href="/manna">
            만나
          </Link>
          <Link className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-[var(--border)]/40 hover:text-[var(--foreground)]" href="/gratitude">
            감사노트
          </Link>
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" className="h-8 px-2 text-sm">
                로그아웃
              </Button>
            </form>
          ) : (
            <Link
              className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-[var(--border)]/40 hover:text-[var(--foreground)]"
              href="/login"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
