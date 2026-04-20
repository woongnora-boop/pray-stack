import Link from 'next/link';
import type { ReactElement } from 'react';

import { signOut } from '@/app/actions/auth';
import { getJourneyDashboardData } from '@/app/actions/journey-stats';
import { parseJourneyWeekOffset } from '@/lib/journey-week';
import { FaithFootprintsDashboard } from '@/components/journey/FaithFootprintsDashboard';
import { appCardClass, appPrimaryButtonClass } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

interface MyPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function MyPage({ searchParams }: MyPageProps): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { week: weekParam } = await searchParams;
  const weekOffset = user ? parseJourneyWeekOffset(weekParam) : 0;

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

  const journey = await getJourneyDashboardData(weekOffset);

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
      {journey ? <FaithFootprintsDashboard data={journey} /> : null}
    </div>
  );
}
