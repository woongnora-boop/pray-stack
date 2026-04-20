'use client';

import { Activity, ChevronLeft, ChevronRight, Tags, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { FaithWordItem, JourneyDashboardData, JourneyDayBucket } from '@/app/actions/journey-stats';
import { homeShellCardClass } from '@/components/home/homeTones';
import { JOURNEY_MIN_WEEK_OFFSET } from '@/lib/journey-week';
import { cn } from '@/lib/utils';

type ChartRow = JourneyDayBucket & { name: string };

function toChartRows(days: JourneyDayBucket[]): ChartRow[] {
  return days.map((d) => ({ ...d, name: d.label }));
}

function JourneyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
}): ReactElement | null {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">
        {row.label}요일 · {row.ymd}
      </p>
      <p className="mt-0.5 text-[var(--muted)]">기록 {row.count}건</p>
    </div>
  );
}

function FaithWordCloud({ words }: { words: FaithWordItem[] }): ReactElement {
  if (words.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/40 px-4 py-10 text-center text-sm text-[var(--muted)] dark:bg-[var(--foreground)]/[0.02]">
        이 주에는 추출할 만한 단어가 거의 없어요. 묵상·만나·감사에 문장을 남겨 보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap content-center justify-center gap-x-2 gap-y-3 px-1 py-2 md:gap-x-3 md:gap-y-4">
      {words.map((w) => {
        const size =
          w.weight >= 0.85 ? 'text-base md:text-lg' : w.weight >= 0.55 ? 'text-sm md:text-base' : 'text-xs md:text-sm';
        const pad = w.weight >= 0.85 ? 'px-3.5 py-1.5' : w.weight >= 0.55 ? 'px-3 py-1' : 'px-2.5 py-0.5';
        const opacity = 0.45 + w.weight * 0.5;
        return (
          <span
            key={w.text}
            title={`${w.count}회`}
            className={cn(
              'inline-flex max-w-full items-center rounded-full border border-[var(--border)] font-medium tracking-tight text-[var(--foreground)] transition-transform hover:scale-[1.02]',
              size,
              pad,
            )}
            style={{
              opacity,
              background: `color-mix(in srgb, var(--primary) ${Math.round(8 + w.weight * 18)}%, var(--card))`,
              borderColor: `color-mix(in srgb, var(--primary) ${Math.round(15 + w.weight * 35)}%, var(--border))`,
            }}
          >
            <span className="truncate">{w.text}</span>
          </span>
        );
      })}
    </div>
  );
}

function weekNavHref(nextOffset: number): string {
  if (nextOffset === 0) return '/my';
  return `/my?week=${nextOffset}`;
}

const navPillClass =
  'inline-flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 disabled:pointer-events-none disabled:opacity-35';

export function FaithFootprintsDashboard({ data }: { data: JourneyDashboardData }): ReactElement {
  const chartData = toChartRows(data.days);
  const maxBar = Math.max(1, ...data.days.map((d) => d.count));
  const { weekOffset, highlightDayIndex } = data;
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
                  선택한 주의 묵상·만나·감사를 모았어요. 자주 쓴 단어로 그때의 기도를 떠올려 보세요.
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
                <Link href={weekNavHref(weekOffset - 1)} className={navPillClass} scroll={false}>
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
                <Link href={weekNavHref(weekOffset + 1)} className={navPillClass} scroll={false}>
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
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">요일별 기록 수</h3>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--background)]/80 to-[var(--card)] px-2 pb-4 pt-5 md:px-4">
            <div className="h-[200px] w-full md:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="var(--border)" opacity={0.85} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 500 }}
                    dy={6}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={32}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    domain={[0, maxBar]}
                  />
                  <Tooltip content={<JourneyTooltip />} cursor={{ fill: 'var(--foreground)', opacity: 0.04 }} />
                  <Bar dataKey="count" radius={[10, 10, 4, 4]} maxBarSize={44}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.ymd}
                        fill={
                          entry.count === 0
                            ? 'color-mix(in srgb, var(--muted) 35%, transparent)'
                            : highlightDayIndex !== null && index === highlightDayIndex
                              ? 'var(--primary)'
                              : 'color-mix(in srgb, var(--primary) 82%, var(--foreground) 18%)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 px-2 text-center text-[11px] text-[var(--muted)]">
              묵상 일지·만나·감사 노트가 있는 날을 각각 1건으로 세었어요. (서울 기준 월~일)
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <Tags className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">이 주의 믿음의 단어</h3>
          </div>
          <FaithWordCloud words={data.faithWords} />
        </div>
      </div>
    </section>
  );
}
