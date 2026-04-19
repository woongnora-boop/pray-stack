import { BookMarked, BookOpen, Heart } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

import { type HomeTone, homeHeroShellClass, homeShellCardClass, homeToneStyles } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

const toneIcon: Record<HomeTone, ReactNode> = {
  amber: <BookOpen className="h-6 w-6" aria-hidden />,
  sky: <BookMarked className="h-6 w-6" aria-hidden />,
  rose: <Heart className="h-6 w-6" aria-hidden />,
};

export function ListPageHero({
  tone,
  label,
  title,
  description,
  actions,
}: {
  tone: HomeTone;
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <header className={homeHeroShellClass}>
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-neutral-200/80 to-transparent blur-3xl dark:from-neutral-600/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-neutral-200/60 to-transparent blur-3xl dark:from-neutral-700/15"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-[var(--border)]',
              t.iconWrap,
            )}
          >
            {toneIcon[tone]}
          </div>
          <div className="min-w-0 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
            <div className={cn('mt-2 h-0.5 w-14 rounded-full bg-gradient-to-r md:w-20', t.bar)} />
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">{title}</h1>
            <p className="mt-2 text-base leading-relaxed text-[var(--muted)] md:text-lg">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1">{actions}</div> : null}
      </div>
    </header>
  );
}

export function ListPagePanel({ children, className }: { children: ReactNode; className?: string }): ReactElement {
  return <div className={cn(homeShellCardClass, className)}>{children}</div>;
}

export function listPrimaryLinkClass(_tone: HomeTone): string {
  return cn(
    'inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors',
    'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90',
    'shadow-sm',
  );
}

