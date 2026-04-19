import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import type { ReactElement } from 'react';

import type { GratitudeNoteListItem } from '@/app/actions/gratitude';
import type { HomeTone } from '@/components/home/homeTones';
import { homeToneStyles } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

import { GratitudeCard } from './GratitudeCard';

interface GratitudeListProps {
  notes: GratitudeNoteListItem[];
  tone?: HomeTone;
}

export function GratitudeList({ notes, tone = 'rose' }: GratitudeListProps): ReactElement {
  const t = homeToneStyles[tone];

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/40 px-6 py-16 text-center dark:bg-[var(--foreground)]/[0.02]">
        <PlusCircle className={cn('h-10 w-10', t.emptyIcon)} aria-hidden />
        <p className="text-lg font-semibold text-[var(--foreground)]">감사 기록이 없습니다</p>
        <p className="max-w-md text-sm text-[var(--muted)]">하루를 돌아보며 감사와 은혜를 자유롭게 남겨 보세요.</p>
        <Link
          href="/gratitude/new"
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors',
            t.link,
          )}
        >
          첫 기록 작성하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((n) => (
        <GratitudeCard key={n.id} note={n} tone={tone} />
      ))}
    </div>
  );
}
