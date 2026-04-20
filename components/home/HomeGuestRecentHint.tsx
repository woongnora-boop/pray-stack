import Link from 'next/link';
import type { ReactElement } from 'react';

import { appCardClass, appPrimaryButtonClass } from '@/components/ui/app-card';
import { cn } from '@/lib/utils';

export function HomeGuestRecentHint(): ReactElement {
  return (
    <section className="space-y-2" aria-labelledby="home-recent-guest">
      <h2 id="home-recent-guest" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        최근 기록
      </h2>
      <div className={appCardClass}>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          로그인하면 홈에서 가장 최근 묵상·만나·감사 노트를 한눈에 볼 수 있어요.
        </p>
        <Link href="/login" className={cn(appPrimaryButtonClass, 'mt-4 max-w-xs')}>
          로그인하고 이어가기
        </Link>
      </div>
    </section>
  );
}
