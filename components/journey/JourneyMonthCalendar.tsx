import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement } from 'react';

import type { JourneyMonthCalendarData } from '@/app/actions/journey-stats';
import { homeShellCardClass } from '@/components/home/homeTones';
import { journeyMyQueryString } from '@/lib/journey-month';
import { cn } from '@/lib/utils';

const WEEK_HEADERS = ['월', '화', '수', '목', '금', '토', '일'] as const;

const navPillClass =
  'inline-flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 disabled:pointer-events-none disabled:opacity-35';

function myCalendarHref(weekOffset: number, monthYm: string): string {
  return `/my?${journeyMyQueryString(weekOffset, monthYm)}`;
}

export function JourneyMonthCalendar({
  data,
  weekOffset,
}: {
  data: JourneyMonthCalendarData;
  weekOffset: number;
}): ReactElement {
  return (
    <section className={homeShellCardClass}>
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/20">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">월별 기록</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-[var(--foreground)] md:text-xl">{data.monthLabelKo}</h2>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                날짜별 묵상·만나·감사 기록 수를 달력으로 볼 수 있어요. (서울 기준, 월요일 시작)
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-right shadow-sm sm:min-w-[9.5rem]">
            <p className="text-[11px] font-medium text-[var(--muted)]">이달 총 기록</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-[var(--foreground)] md:text-3xl">
              {data.monthTotal}
              <span className="ml-1 text-sm font-semibold text-[var(--muted)]">건</span>
            </p>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-xs text-[var(--muted)] sm:justify-start"
          aria-label="이달 유형별 기록 수"
        >
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" aria-hidden />
            묵상 <strong className="text-[var(--foreground)]">{data.monthByType.meditation}</strong>건
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span className="h-2 w-2 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" aria-hidden />
            만나 <strong className="text-[var(--foreground)]">{data.monthByType.manna}</strong>건
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600 dark:bg-rose-400" aria-hidden />
            감사 <strong className="text-[var(--foreground)]">{data.monthByType.gratitude}</strong>건
          </span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 sm:justify-end">
          {data.canPrevMonth ? (
            <Link href={myCalendarHref(weekOffset, data.prevYm)} className={navPillClass} scroll={false}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
              <span className="sr-only">이전 달</span>
            </Link>
          ) : (
            <span className={cn(navPillClass, 'cursor-not-allowed opacity-35')} aria-disabled>
              <ChevronLeft className="h-5 w-5" aria-hidden />
              <span className="sr-only">이전 달</span>
            </span>
          )}
          <span className="min-w-[6rem] text-center text-xs font-medium text-[var(--muted)]">{data.monthYm}</span>
          {data.canNextMonth ? (
            <Link href={myCalendarHref(weekOffset, data.nextYm)} className={navPillClass} scroll={false}>
              <ChevronRight className="h-5 w-5" aria-hidden />
              <span className="sr-only">다음 달</span>
            </Link>
          ) : (
            <span className={cn(navPillClass, 'cursor-not-allowed opacity-35')} aria-disabled>
              <ChevronRight className="h-5 w-5" aria-hidden />
              <span className="sr-only">다음 달</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-3 py-5 md:px-5 md:py-6">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] md:gap-1.5 md:text-[11px]">
          {WEEK_HEADERS.map((h) => (
            <div key={h} className="py-1">
              {h}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 md:gap-1.5">
          {data.cells.map((cell) => {
            const isToday = cell.ymd === data.todaySeoulYmd;
            const hasAny = cell.count > 0;
            return (
              <div
                key={cell.ymd}
                className={cn(
                  'flex min-h-[3.25rem] flex-col rounded-lg border px-1 py-1.5 md:min-h-[4rem] md:px-1.5 md:py-2',
                  cell.inMonth
                    ? 'border-[var(--border)] bg-[var(--background)]/50 dark:bg-[var(--foreground)]/[0.03]'
                    : 'border-transparent bg-transparent text-[var(--muted)] opacity-50',
                  isToday && 'ring-2 ring-[var(--primary)]/55 ring-offset-1 ring-offset-[var(--card)]',
                )}
              >
                <span
                  className={cn(
                    'text-center text-xs font-semibold tabular-nums md:text-sm',
                    cell.inMonth ? 'text-[var(--foreground)]' : 'text-[var(--muted)]',
                  )}
                >
                  {cell.dayNumber}
                </span>
                <div className="mt-auto flex min-h-[14px] items-end justify-center gap-0.5 pb-0.5">
                  {hasAny ? (
                    <>
                      {cell.meditationCount > 0 ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400"
                          title={`묵상 ${cell.meditationCount}`}
                          aria-label={`묵상 ${cell.meditationCount}건`}
                        />
                      ) : null}
                      {cell.mannaCount > 0 ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400"
                          title={`만나 ${cell.mannaCount}`}
                          aria-label={`만나 ${cell.mannaCount}건`}
                        />
                      ) : null}
                      {cell.gratitudeCount > 0 ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600 dark:bg-rose-400"
                          title={`감사 ${cell.gratitudeCount}`}
                          aria-label={`감사 ${cell.gratitudeCount}건`}
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
          점 색: 묵상(주황) · 만나(하늘) · 감사(로즈). 같은 날 여러 유형이 있으면 점이 여러 개 보여요.
        </p>
      </div>
    </section>
  );
}
