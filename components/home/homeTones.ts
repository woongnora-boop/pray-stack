import { cn } from '@/lib/utils';

/** 홈·목록 페이지에서 묵상/만나/감사 구역 색 구분 */
export type HomeTone = 'amber' | 'sky' | 'rose';

export const homeToneStyles: Record<
  HomeTone,
  {
    bar: string;
    iconWrap: string;
    /** 링크·쉐브론 강조색 */
    icon: string;
    link: string;
    leftAccent: string;
    emptyIcon: string;
  }
> = {
  amber: {
    bar: 'from-amber-400 via-orange-400 to-amber-500',
    iconWrap: 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    link: 'text-amber-700 hover:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-400/10',
    leftAccent: 'border-l-[3px] border-amber-500',
    emptyIcon: 'text-amber-500/40',
  },
  sky: {
    bar: 'from-sky-400 via-blue-400 to-sky-500',
    iconWrap: 'bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
    icon: 'text-sky-600 dark:text-sky-400',
    link: 'text-sky-700 hover:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-400/10',
    leftAccent: 'border-l-[3px] border-sky-500',
    emptyIcon: 'text-sky-500/40',
  },
  rose: {
    bar: 'from-rose-400 via-pink-400 to-rose-500',
    iconWrap: 'bg-rose-500/10 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
    icon: 'text-rose-600 dark:text-rose-400',
    link: 'text-rose-700 hover:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-400/10',
    leftAccent: 'border-l-[3px] border-rose-500',
    emptyIcon: 'text-rose-500/40',
  },
};

export const homeShellCardClass = cn(
  'overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]',
  'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]',
  'dark:shadow-[0_1px_3px_rgba(0,0,0,0.35),0_8px_32px_rgba(0,0,0,0.25)]',
);

export const homeHeroShellClass = cn(
  'relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-8 shadow-sm md:px-8 md:py-10',
);
