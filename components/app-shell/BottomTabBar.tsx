'use client';

import { BookMarked, BookOpen, Heart, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: '홈', icon: Home },
  { href: '/meditation', label: '묵상', icon: BookOpen },
  { href: '/manna', label: '만나', icon: BookMarked },
  { href: '/gratitude', label: '감사', icon: Heart },
  { href: '/my', label: '마이', icon: User },
] as const;

function isTabActive(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabBar(): ReactElement | null {
  const pathname = usePathname();
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--card)]/85 pb-[env(safe-area-inset-bottom)]"
      aria-label="하단 메뉴"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0 px-1 pt-1 md:max-w-2xl">
        {tabs.map(({ href, label, icon: Icon }) => {
          const on = isTabActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-t-xl py-2 text-[10px] font-semibold transition-colors',
                on ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]',
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', on && 'stroke-[2.25]')} aria-hidden />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
