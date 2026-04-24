import type { ReactElement } from 'react';

import type { BibleBooksActivityRow } from '@/app/actions/bible-books-coverage';
import { cn } from '@/lib/utils';

function cellSurface(row: BibleBooksActivityRow): string {
  const { hasMeditation: m, hasManna: n } = row;
  if (m && n) {
    return 'bg-gradient-to-br from-amber-500/75 via-amber-500/35 to-sky-500/75 ring-1 ring-[var(--border)]/60';
  }
  if (m) return 'bg-amber-500/55 ring-1 ring-amber-700/25 dark:bg-amber-400/40';
  if (n) return 'bg-sky-500/55 ring-1 ring-sky-700/25 dark:bg-sky-400/40';
  return 'bg-[var(--border)]/45 dark:bg-[var(--foreground)]/[0.07]';
}

function cellLabel(row: BibleBooksActivityRow): string {
  const bits: string[] = [row.bookName];
  if (row.hasMeditation) bits.push('묵상');
  if (row.hasManna) bits.push('만나');
  if (!row.hasMeditation && !row.hasManna) bits.push('기록 없음');
  return bits.join(' · ');
}

export function BibleBooksHeatmap({ rows }: { rows: BibleBooksActivityRow[] }): ReactElement {
  return (
    <div className="space-y-3">
      <div
        className="grid gap-[3px] rounded-lg border border-[var(--border)] bg-[var(--card)]/40 p-2 sm:p-3"
        style={{ gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' }}
        role="img"
        aria-label="성경 66권별 묵상·만나 기록 분포"
      >
        {rows.map((row) => (
          <div
            key={row.bookOrder}
            title={cellLabel(row)}
            className={cn(
              'aspect-square max-h-8 min-h-[10px] w-full min-w-0 rounded-[3px] transition-opacity hover:opacity-90 sm:max-h-9',
              cellSurface(row),
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-[var(--border)]/60 dark:bg-[var(--foreground)]/15" aria-hidden />
          없음
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-amber-500/55" aria-hidden />
          묵상
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-sky-500/55" aria-hidden />
          만나
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-[2px] bg-gradient-to-br from-amber-500/75 to-sky-500/75"
            aria-hidden
          />
          둘 다
        </span>
        <span className="w-full text-[10px] sm:w-auto">창세기부터 순서대로 11열×6행 (총 66칸)</span>
      </div>
    </div>
  );
}
