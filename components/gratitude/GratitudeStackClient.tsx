'use client';

import { Hash, List } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

function GratitudeSectionNav(): ReactElement | null {
  const pathname = usePathname();
  const show = pathname === '/gratitude' || pathname === '/gratitude/keywords';
  if (!show) {
    return null;
  }

  const onList = pathname === '/gratitude';
  const onKeywords = pathname === '/gratitude/keywords';

  return (
    <nav
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+3.5rem)] left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--card)]/85"
      aria-label="감사 메뉴"
    >
      <div className="mx-auto flex max-w-lg gap-2 px-3 py-2 md:max-w-2xl">
        <Link
          href="/gratitude"
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors',
            onList
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              : 'text-[var(--muted)] [@media(hover:hover)]:hover:bg-[var(--foreground)]/5 [@media(hover:hover)]:hover:text-[var(--foreground)]',
          )}
        >
          <List className="h-4 w-4 shrink-0" aria-hidden />
          노트
        </Link>
        <Link
          href="/gratitude/keywords"
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors',
            onKeywords
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              : 'text-[var(--muted)] [@media(hover:hover)]:hover:bg-[var(--foreground)]/5 [@media(hover:hover)]:hover:text-[var(--foreground)]',
          )}
        >
          <Hash className="h-4 w-4 shrink-0" aria-hidden />
          키워드
        </Link>
      </div>
    </nav>
  );
}

export function GratitudeStackClient({ children }: { children: ReactNode }): ReactElement {
  const pathname = usePathname();
  const padExtra = pathname === '/gratitude' || pathname === '/gratitude/keywords';

  return (
    <div className={cn(padExtra && 'pb-14')}>
      {children}
      <GratitudeSectionNav />
    </div>
  );
}
