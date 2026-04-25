'use client';

import type { GratitudeKeywordPeriod } from '@/app/actions/gratitude-keywords';
import { cn } from '@/lib/utils';
import { useState, type ReactElement } from 'react';

export function GratitudeKeywordsBoard({
  week,
  month,
}: {
  week: GratitudeKeywordPeriod;
  month: GratitudeKeywordPeriod;
}): ReactElement {
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const active = tab === 'week' ? week : month;

  return (
    <div className="flex min-h-[min(52vh,420px)] flex-col gap-5">
      <div className="min-h-0 flex-1">
        <p className="text-xs font-medium text-[var(--muted)]">{active.label}</p>
        {active.keywords.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            이 기간에 남긴 감사 노트가 없거나, 키워드를 뽑을 만큼의 글이 아직 없어요. 노트에 마음을 조금 더 적어 보시면 여기에 모여요.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {active.keywords.map((k) => (
              <li
                key={`${tab}-${k.term}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-950 dark:text-rose-100"
              >
                <span>{k.term}</span>
                <span className="tabular-nums text-xs font-semibold text-rose-700/80 dark:text-rose-200/80">{k.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="mt-auto flex rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-1 dark:bg-[var(--foreground)]/[0.03]"
        role="tablist"
        aria-label="집계 단위"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'week'}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
            tab === 'week'
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]'
              : 'text-[var(--muted)] [@media(hover:hover)]:hover:text-[var(--foreground)]',
          )}
          onClick={() => setTab('week')}
        >
          주간
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'month'}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
            tab === 'month'
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]'
              : 'text-[var(--muted)] [@media(hover:hover)]:hover:text-[var(--foreground)]',
          )}
          onClick={() => setTab('month')}
        >
          월간
        </button>
      </div>
    </div>
  );
}
