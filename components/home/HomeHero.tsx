import type { ReactElement } from 'react';

import { appCardClass } from '@/components/ui/app-card';

interface HomeHeroProps {
  loggedIn: boolean;
}

export function HomeHero({ loggedIn }: HomeHeroProps): ReactElement {
  return (
    <header className={appCardClass}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">말씀기도</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">홈</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] md:text-base">
        {loggedIn
          ? '오늘도 말씀과 기도를 이어가 보세요. 아래에서 바로 기록하고, 최근 글을 열 수 있어요.'
          : '묵상·말씀(만나)·감사를 한곳에 남기는 신앙 기록입니다. 로그인하면 홈에서 최근 기록을 볼 수 있어요.'}
      </p>
    </header>
  );
}
