import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import type { ReactElement } from 'react';

import type { MannaEntryListItem } from '@/app/actions/manna';
import type { HomeTone } from '@/components/home/homeTones';
import { homeToneStyles } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

import { MannaCard } from './MannaCard';

interface MannaListProps {
  entries: MannaEntryListItem[];
  tone?: HomeTone;
  loggedIn?: boolean;
}

export function MannaList({ entries, tone = 'sky', loggedIn = true }: MannaListProps): ReactElement {
  const t = homeToneStyles[tone];

  if (entries.length === 0) {
    const emptyCtaHref = loggedIn ? '/manna/new' : '/login?next=/manna/new';
    const emptyCtaLabel = loggedIn ? '말씀 추가하기' : '로그인하고 말씀 추가';
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/40 px-6 py-16 text-center dark:bg-[var(--foreground)]/[0.02]">
        <PlusCircle className={cn('h-10 w-10', t.emptyIcon)} aria-hidden />
        <p className="text-lg font-semibold text-[var(--foreground)]">저장된 말씀이 없습니다</p>
        <p className="max-w-md text-sm text-[var(--muted)]">성경 구절과 본문을 남기고, 카테고리로 정리해 보세요.</p>
        <Link
          href={emptyCtaHref}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors',
            t.link,
          )}
        >
          {emptyCtaLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((e) => (
        <MannaCard key={e.id} entry={e} tone={tone} />
      ))}
    </div>
  );
}
