'use client';

import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { JourneyDayBucket } from '@/app/actions/journey-stats';

/** 묵상 / 만나 / 감사 — 홈 톤(amber·sky·rose)과 맞춘 막대 색 */
const BAR = {
  meditation: '#d97706',
  manna: '#0284c7',
  gratitude: '#e11d48',
} as const;

const BAR_HIGHLIGHT = {
  meditation: '#f59e0b',
  manna: '#0ea5e9',
  gratitude: '#f43f5e',
} as const;

type ChartRow = JourneyDayBucket & { name: string };

function toChartRows(days: JourneyDayBucket[]): ChartRow[] {
  return days.map((d) => ({ ...d, name: d.label }));
}

function JourneyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: ChartRow }[];
}): ReactElement | null {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const { meditationCount, mannaCount, gratitudeCount } = row;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">
        {row.label}요일 · {row.ymd}
      </p>
      <p className="mt-1.5 space-y-0.5 text-[var(--muted)]">
        <span className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: BAR.meditation }} aria-hidden />
            묵상
          </span>
          <span className="tabular-nums font-medium text-[var(--foreground)]">{meditationCount}건</span>
        </span>
        <span className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: BAR.manna }} aria-hidden />
            만나
          </span>
          <span className="tabular-nums font-medium text-[var(--foreground)]">{mannaCount}건</span>
        </span>
        <span className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: BAR.gratitude }} aria-hidden />
            감사
          </span>
          <span className="tabular-nums font-medium text-[var(--foreground)]">{gratitudeCount}건</span>
        </span>
      </p>
      <p className="mt-2 border-t border-[var(--border)] pt-2 font-medium text-[var(--foreground)]">합계 {row.count}건</p>
    </div>
  );
}

export function FaithFootprintsBarChart({
  days,
  highlightDayIndex,
}: {
  days: JourneyDayBucket[];
  highlightDayIndex: number | null;
}): ReactElement {
  const chartData = toChartRows(days);
  const maxBar = Math.max(1, ...days.map((d) => d.meditationCount + d.mannaCount + d.gratitudeCount));
  const hi = (idx: number) => highlightDayIndex !== null && idx === highlightDayIndex;

  return (
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
            <Bar dataKey="meditationCount" stackId="week" maxBarSize={44} radius={[0, 0, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`m-${entry.ymd}`}
                  fill={entry.meditationCount === 0 ? 'transparent' : hi(index) ? BAR_HIGHLIGHT.meditation : BAR.meditation}
                />
              ))}
            </Bar>
            <Bar dataKey="mannaCount" stackId="week" maxBarSize={44} radius={[0, 0, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`a-${entry.ymd}`}
                  fill={entry.mannaCount === 0 ? 'transparent' : hi(index) ? BAR_HIGHLIGHT.manna : BAR.manna}
                />
              ))}
            </Bar>
            <Bar dataKey="gratitudeCount" stackId="week" maxBarSize={44} radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`g-${entry.ymd}`}
                  fill={entry.gratitudeCount === 0 ? 'transparent' : hi(index) ? BAR_HIGHLIGHT.gratitude : BAR.gratitude}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 px-2 text-center text-[11px] text-[var(--muted)]">
        막대는 묵상(주황)·만나(하늘)·감사(로즈) 순으로 쌓여 있어요. 각 유형은 해당 날짜에 1건씩 집계됩니다. (서울 기준 월~일)
      </p>
    </div>
  );
}
