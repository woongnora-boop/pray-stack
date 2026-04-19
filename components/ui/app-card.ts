import { cn } from '@/lib/utils';

/** 카드·패널 공통: 토스형 미니앱 — 얇은 테두리, 약한 그림자 */
export const appCardClass = cn(
  'rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm',
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
);

export const appPrimaryButtonClass = cn(
  'inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition-opacity',
  'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:opacity-95',
);

export const appChipClass = cn(
  'inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]',
);
