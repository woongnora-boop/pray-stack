import type { ReactElement } from 'react';

import { homeShellCardClass } from '@/components/home/homeTones';

/** 주간 대시보드 + 월 달력 로딩 스켈레톤 */
export function JourneyDashboardSkeleton(): ReactElement {
  return (
    <div className="space-y-6" aria-hidden>
      <section className={homeShellCardClass}>
        <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-[var(--primary)]/15" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-2.5 w-24 animate-pulse rounded bg-[var(--foreground)]/10" />
                  <div className="h-5 w-40 animate-pulse rounded-md bg-[var(--foreground)]/12" />
                  <div className="h-3 max-w-md animate-pulse rounded-md bg-[var(--foreground)]/8" />
                  <div className="h-3 max-w-sm animate-pulse rounded-md bg-[var(--foreground)]/8" />
                </div>
              </div>
              <div className="h-[5.25rem] shrink-0 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 sm:w-36" />
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="mx-auto h-4 w-40 animate-pulse rounded-md bg-[var(--foreground)]/10 sm:mx-0" />
              <div className="flex justify-center gap-2 sm:justify-end">
                <div className="h-10 w-11 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
                <div className="h-10 w-16 animate-pulse rounded-md bg-[var(--foreground)]/8" />
                <div className="h-10 w-11 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 border-t border-[var(--border)]/60 pt-3 sm:justify-start">
              <div className="h-3.5 w-20 animate-pulse rounded-md bg-[var(--foreground)]/10" />
              <div className="h-3.5 w-20 animate-pulse rounded-md bg-[var(--foreground)]/10" />
              <div className="h-3.5 w-20 animate-pulse rounded-md bg-[var(--foreground)]/10" />
            </div>
          </div>
        </div>
        <div className="space-y-8 px-4 py-6 md:px-6 md:py-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-[var(--primary)]/30" />
              <div className="h-3.5 w-32 animate-pulse rounded-md bg-[var(--foreground)]/10" />
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--background)]/80 to-[var(--card)] px-2 pb-4 pt-5 md:px-4">
              <div className="h-[200px] w-full animate-pulse rounded-lg bg-[var(--foreground)]/[0.06] md:h-[220px]" />
              <div className="mx-auto mt-3 h-2.5 w-3/4 max-w-md animate-pulse rounded bg-[var(--foreground)]/8" />
            </div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-[var(--primary)]/30" />
              <div className="h-3.5 w-40 animate-pulse rounded-md bg-[var(--foreground)]/10" />
            </div>
            <div className="mb-2 h-3 w-full max-w-md animate-pulse rounded bg-[var(--foreground)]/8" />
            <div
              className="grid gap-[3px] rounded-lg border border-[var(--border)] bg-[var(--card)]/40 p-2"
              style={{ gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' }}
            >
              {Array.from({ length: 66 }).map((_, i) => (
                <div key={i} className="aspect-square max-h-8 animate-pulse rounded-[3px] bg-[var(--foreground)]/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={homeShellCardClass}>
        <div className="border-b border-[var(--border)] px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-3">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-[var(--primary)]/15" />
              <div className="space-y-2">
                <div className="h-2.5 w-20 animate-pulse rounded bg-[var(--foreground)]/10" />
                <div className="h-5 w-36 animate-pulse rounded-md bg-[var(--foreground)]/12" />
              </div>
            </div>
            <div className="h-16 w-28 animate-pulse rounded-2xl bg-[var(--foreground)]/8" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <div className="h-10 w-11 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
            <div className="h-10 w-11 animate-pulse rounded-xl bg-[var(--foreground)]/10" />
          </div>
        </div>
        <div className="px-3 py-4 md:px-5">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 animate-pulse rounded bg-[var(--foreground)]/8" />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="aspect-square max-h-14 animate-pulse rounded-lg bg-[var(--foreground)]/[0.06]" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
