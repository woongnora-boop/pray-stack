import { Activity, ChevronLeft, ChevronRight, LayoutGrid, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement } from 'react';

import type { BibleBooksActivityRow } from '@/app/actions/bible-books-coverage';
import type { JourneyDashboardData } from '@/app/actions/journey-stats';
import { BibleBooksHeatmap } from '@/components/journey/BibleBooksHeatmap';
import { FaithFootprintsBarChartLoader } from '@/components/journey/FaithFootprintsBarChartLoader';
import { homeShellCardClass } from '@/components/home/homeTones';
import { journeyMyQueryString, seoulYmToday } from '@/lib/journey-month';
import { JOURNEY_MIN_WEEK_OFFSET } from '@/lib/journey-week';
import { cn } from '@/lib/utils';

function weekNavHref(nextOffset: number, monthYm: string): string {
  return `/my?${journeyMyQueryString(nextOffset, monthYm)}`;
}

const navPillClass =
  'inline-flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 disabled:pointer-events-none disabled:opacity-35';

export function FaithFootprintsDashboard({
  data,
  monthYm,
  bibleBooksActivity,
}: {
  data: JourneyDashboardData;
  /** 월 달력과 동일한 `YYYY-MM`을 유지해 주간 이전/다음 이동 시 달력 월이 바뀌지 않게 함 */
  monthYm?: string;
  bibleBooksActivity: BibleBooksActivityRow[];
}): ReactElement {
  const { weekOffset, highlightDayIndex } = data;
  const ym = monthYm ?? seoulYmToday();
  const canPrev = weekOffset > JOURNEY_MIN_WEEK_OFFSET;
  const canNext = weekOffset < 0;

  return (
    <section className={homeShellCardClass}>
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/20">
                <TrendingUp className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">신앙의 발자취</p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[var(--foreground)] md:text-xl">활동 요약</h2>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                  선택한 주의 묵상·만나·감사를 모았어요. 아래 격자는 전체 기간 동안 성경 구절로 남긴 권별 기록이에요.
                </p>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-right shadow-sm sm:min-w-[9.5rem]">
              <p className="text-[11px] font-medium text-[var(--muted)]">주간 총 기록</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-[var(--foreground)] md:text-3xl">
                {data.weekTotal}
                <span className="ml-1 text-sm font-semibold text-[var(--muted)]">건</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm font-semibold text-[var(--foreground)] sm:text-left">{data.weekRangeLabel}</p>
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              {canPrev ? (
                <Link href={weekNavHref(weekOffset - 1, ym)} className={navPillClass} scroll={false}>
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                  <span className="sr-only">이전 주</span>
                </Link>
              ) : (
                <span className={cn(navPillClass, 'cursor-not-allowed opacity-35')} aria-disabled>
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                  <span className="sr-only">이전 주</span>
                </span>
              )}
              <span className="min-w-[4.5rem] text-center text-xs text-[var(--muted)]">
                {weekOffset === 0 ? '이번 주' : weekOffset < 0 ? `${Math.abs(weekOffset)}주 전` : ''}
              </span>
              {canNext ? (
                <Link href={weekNavHref(weekOffset + 1, ym)} className={navPillClass} scroll={false}>
                  <ChevronRight className="h-5 w-5" aria-hidden />
                  <span className="sr-only">다음 주</span>
                </Link>
              ) : (
                <span className={cn(navPillClass, 'cursor-not-allowed opacity-35')} aria-disabled>
                  <ChevronRight className="h-5 w-5" aria-hidden />
                  <span className="sr-only">다음 주</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-4 py-6 md:px-6 md:py-8">
        <div
          className="-mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-b border-[var(--border)]/80 pb-5 text-xs text-[var(--muted)] sm:justify-start"
          aria-label="이번 주 유형별 기록 수"
        >
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" aria-hidden />
            묵상 <strong className="text-[var(--foreground)]">{data.weekByType.meditation}</strong>건
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span className="h-2 w-2 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" aria-hidden />
            만나 <strong className="text-[var(--foreground)]">{data.weekByType.manna}</strong>건
          </span>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600 dark:bg-rose-400" aria-hidden />
            감사 <strong className="text-[var(--foreground)]">{data.weekByType.gratitude}</strong>건
          </span>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">요일별 기록 수</h3>
          </div>
          <FaithFootprintsBarChartLoader days={data.days} highlightDayIndex={highlightDayIndex} />
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">성경 66권 기록 맵</h3>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-[var(--muted)]">
            묵상·만나에 저장한 성경 구절(`책 장:절`)에서 권을 인식합니다. 마우스를 올리면 권 이름을 볼 수 있어요.
          </p>
          <BibleBooksHeatmap rows={bibleBooksActivity} />
        </div>
      </div>
    </section>
  );
}
