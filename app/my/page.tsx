import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { Suspense } from 'react';

import { signOut } from '@/app/actions/auth';
import { getMyBibleBooksActivity } from '@/app/actions/bible-books-coverage';
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

export const metadata: Metadata = {
  title: '마이 | Pray Stack',
  description: '계정, 활동 요약, 앱 정보와 정책 안내를 확인할 수 있습니다.',
};

function MyMenuGroup({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string; description: string }[];
}): ReactElement {
  return (
    <section className={appCardClass}>
      <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      <ul className="mt-3 divide-y divide-[var(--border)]">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 py-3 transition-colors hover:text-[var(--foreground)] active:text-[var(--foreground)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
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
  const [journey, monthCal, bibleBooks] = await Promise.all([
    getJourneyDashboardData(weekOffset),
    getJourneyMonthCalendarData(year, month),
    getMyBibleBooksActivity(),
  ]);
  return (
    <>
      {journey ? (
        <FaithFootprintsDashboard data={journey} monthYm={monthCal?.monthYm} bibleBooksActivity={bibleBooks} />
      ) : null}
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
        <MyMenuGroup
          title="앱 정보"
          items={[
            { href: '/about', label: '앱 소개', description: 'pray-stack이 어떤 앱인지 소개합니다.' },
            { href: '/background', label: '개발 배경', description: 'pray-stack을 왜 만들게 되었는지 전합니다.' },
            { href: '/version', label: '버전 정보', description: '현재 앱 버전과 기본 정보를 안내합니다.' },
          ]}
        />
        <MyMenuGroup
          title="정책 및 안내"
          items={[
            { href: '/privacy', label: '개인정보 처리방침', description: '사용자 정보가 어떻게 다뤄지는지 안내합니다.' },
            { href: '/terms', label: '이용약관', description: '서비스 이용에 필요한 기본 사항을 안내합니다.' },
            { href: '/contact', label: '문의하기', description: '제안이나 불편사항을 전달할 수 있습니다.' },
          ]}
        />
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
      <MyMenuGroup
        title="앱 정보"
        items={[
          { href: '/about', label: '앱 소개', description: 'pray-stack이 어떤 앱인지 소개합니다.' },
          { href: '/background', label: '개발 배경', description: 'pray-stack을 왜 만들게 되었는지 전합니다.' },
          { href: '/version', label: '버전 정보', description: '현재 앱 버전과 기본 정보를 안내합니다.' },
        ]}
      />
      <MyMenuGroup
        title="정책 및 안내"
        items={[
          { href: '/privacy', label: '개인정보 처리방침', description: '사용자 정보가 어떻게 다뤄지는지 안내합니다.' },
          { href: '/terms', label: '이용약관', description: '서비스 이용에 필요한 기본 사항을 안내합니다.' },
          { href: '/contact', label: '문의하기', description: '제안이나 불편사항을 전달할 수 있습니다.' },
        ]}
      />
      <Suspense fallback={<JourneyDashboardSkeleton />}>
        <MyJourneySection weekOffset={weekOffset} year={calYear} month={calMonth} />
      </Suspense>
    </div>
  );
}
