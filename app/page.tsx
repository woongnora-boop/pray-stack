import type { ReactElement } from 'react';

import { getHomeFeed } from '@/app/actions/home';
import { HomeDashboard, HomeQuickNav } from '@/components/home/HomeDashboard';
import { homeHeroShellClass } from '@/components/home/homeTones';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const feed = user ? await getHomeFeed() : null;

  return (
    <div className="space-y-10 md:space-y-12">
      <header className={homeHeroShellClass}>
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-neutral-200/80 to-transparent blur-3xl dark:from-neutral-600/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-neutral-200/60 to-transparent blur-3xl dark:from-neutral-700/15"
          aria-hidden
        />
        <div className="relative max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Pray Stack</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">홈</h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--muted)] md:text-lg">
            {user
              ? '오늘의 묵상과 말씀, 감사를 한곳에 모아 두세요. 아래에서 가장 최근 기록을 바로 열 수 있습니다.'
              : '로그인하면 묵상·만나·감사 노트를 남기고, 홈에서 최근 기록을 한눈에 볼 수 있습니다.'}
          </p>
        </div>
      </header>

      {user && feed ? <HomeDashboard feed={feed} /> : null}

      <HomeQuickNav showLogin={!user} />
    </div>
  );
}
