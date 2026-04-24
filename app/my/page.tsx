import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Suspense } from 'react';

import { signOut } from '@/app/actions/auth';
import { getJourneyDashboardData, getJourneyMonthCalendarData } from '@/app/actions/journey-stats';
import { FaithFootprintsDashboard } from '@/components/journey/FaithFootprintsDashboard';
import { JourneyDashboardSkeleton } from '@/components/journey/JourneyDashboardSkeleton';
import { JourneyMonthCalendar } from '@/components/journey/JourneyMonthCalendar';
import { appCardClass, appPrimaryButtonClass } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { parseJourneyMonthParam } from '@/lib/journey-month';
import { parseJourneyWeekOffset } from '@/lib/journey-week';
import { getServerAuth } from '@/lib/supabase/request-session';
import { cn } from '@/lib/utils';

interface MyPageProps {
  searchParams: Promise<{ week?: string; month?: string }>;
}

async function MyJourneySection({
  weekOffset,
  year,
  month,
}: {
  weekOffset: number;
  year: number;
  month: number;
}): Promise<ReactNode> {
  const [journey, monthCal] = await Promise.all([
    getJourneyDashboardData(weekOffset),
    getJourneyMonthCalendarData(year, month),
  ]);
  return (
    <>
      {journey ? <FaithFootprintsDashboard data={journey} monthYm={monthCal?.monthYm} /> : null}
      {monthCal ? <JourneyMonthCalendar data={monthCal} weekOffset={weekOffset} /> : null}
    </>
  );
}

export default async function MyPage({ searchParams }: MyPageProps): Promise<ReactElement> {
  const { user } = await getServerAuth();
  const { week: weekParam, month: monthParam } = await searchParams;
  const weekOffset = user ? parseJourneyWeekOffset(weekParam) : 0;
  const { year: calYear, month: calMonth } = user ? parseJourneyMonthParam(monthParam) : { year: 0, month: 0 };

  if (!user) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">마이</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">로그인하면 기록을 안전하게 동기화할 수 있어요.</p>
        </header>
        <div className={appCardClass}>
          <p className="text-sm text-[var(--muted)]">로그인 후 계정 메뉴와 로그아웃을 이용할 수 있습니다.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/login" className={cn(appPrimaryButtonClass, 'sm:w-auto')}>
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)]/40 sm:w-auto"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">마이</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">계정과 활동 요약</p>
      </header>
      <div className={appCardClass}>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">이메일</p>
        <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{user.email ?? '연결된 계정'}</p>
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="outline" className="w-full rounded-2xl sm:w-auto">
            로그아웃
          </Button>
        </form>
      </div>
      <Suspense fallback={<JourneyDashboardSkeleton />}>
        <MyJourneySection weekOffset={weekOffset} year={calYear} month={calMonth} />
      </Suspense>
    </div>
  );
}
