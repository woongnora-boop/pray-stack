import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import type { ReactElement } from 'react';

import type { HomeTone } from '@/components/home/homeTones';
import { homeToneStyles } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

import { MeditationCard, type MeditationCardProps } from './MeditationCard';

interface MeditationListProps {
  days: MeditationCardProps[];
  tone?: HomeTone;
  /** 비로그인 시 빈 상태 CTA가 로그인으로 이어집니다. */
  loggedIn?: boolean;
}

export function MeditationList({ days, tone = 'amber', loggedIn = true }: MeditationListProps): ReactElement {
  const t = homeToneStyles[tone];

  if (days.length === 0) {
    const emptyCtaHref = loggedIn ? '/meditation/new' : '/login?next=/meditation/new';
    const emptyCtaLabel = loggedIn ? '첫 묵상 작성하기' : '로그인하고 첫 묵상';
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/40 px-6 py-16 text-center dark:bg-[var(--foreground)]/[0.02]">
        <PlusCircle className={cn('h-10 w-10', t.emptyIcon)} aria-hidden />
        <p className="text-lg font-semibold text-[var(--foreground)]">아직 묵상 기록이 없습니다</p>
        <p className="max-w-md text-sm text-[var(--muted)]">
          날짜별로 설교·QT 등 묵상을 남기고, 다시 읽을 수 있어요.
        </p>
        <Link
          href={emptyCtaHref}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors',
            t.link,
          )}
        >
          {emptyCtaLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <MeditationCard key={day.id} {...day} tone={tone} />
      ))}
    </div>
  );
}
