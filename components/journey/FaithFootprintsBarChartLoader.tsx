'use client';

import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';

import type { JourneyDayBucket } from '@/app/actions/journey-stats';

const FaithFootprintsBarChart = dynamic(
  () => import('./FaithFootprintsBarChart').then((m) => m.FaithFootprintsBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--background)]/80 to-[var(--card)] px-2 pb-4 pt-5 md:px-4">
        <div className="h-[200px] w-full animate-pulse rounded-lg bg-[var(--foreground)]/[0.06] md:h-[220px]" />
        <p className="mt-1 px-2 text-center text-[11px] text-[var(--muted)]">
          막대는 묵상·만나·감사가 색으로 구분됩니다. (서울 기준 월~일)
        </p>
      </div>
    ),
  },
);

export function FaithFootprintsBarChartLoader({
  days,
  highlightDayIndex,
}: {
  days: JourneyDayBucket[];
  highlightDayIndex: number | null;
}): ReactElement {
  return <FaithFootprintsBarChart days={days} highlightDayIndex={highlightDayIndex} />;
}
