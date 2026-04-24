import type { ReactElement } from 'react';

import { homeShellCardClass } from '@/components/home/homeTones';

/** 홈 `HomeDashboard` compact 그리드와 비슷한 형태의 로딩 스켈레톤 */
export function HomeFeedSkeleton(): ReactElement {
  return (
    <div className={homeShellCardClass} aria-hidden>
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4 py-3 md:px-5 md:py-3.5">
        <div className="flex items-start gap-2.5">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-28 animate-pulse rounded-md bg-[var(--foreground)]/10" />
            <div className="h-3 max-w-md animate-pulse rounded-md bg-[var(--foreground)]/8" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3 md:gap-3 md:p-4">
        {['amber', 'sky', 'rose'].map((k) => (
          <div
            key={k}
            className="flex min-h-[140px] flex-col rounded-xl border border-[var(--border)] bg-[var(--background)]/35 p-3 dark:bg-[var(--foreground)]/[0.03]"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[var(--foreground)]/10" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 w-16 animate-pulse rounded-md bg-[var(--foreground)]/10" />
                <div className="h-2.5 w-24 animate-pulse rounded-md bg-[var(--foreground)]/8" />
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 rounded-lg border border-[var(--border)]/80 bg-[var(--card)]/40 p-2.5">
              <div className="h-2 w-20 animate-pulse rounded bg-[var(--foreground)]/8" />
              <div className="h-3 w-full animate-pulse rounded-md bg-[var(--foreground)]/10" />
              <div className="h-3 w-full max-w-[85%] animate-pulse rounded-md bg-[var(--foreground)]/8" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-[var(--foreground)]/8" />
            </div>
            <div className="mt-2 flex gap-1">
              <div className="h-6 w-14 animate-pulse rounded-full bg-[var(--foreground)]/8" />
              <div className="h-6 w-12 animate-pulse rounded-full bg-[var(--foreground)]/8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
