import Link from 'next/link';
import type { ReactElement } from 'react';

import { GratitudeForm } from '@/components/gratitude/GratitudeForm';
import { backLinkTouchClassName } from '@/lib/back-link-touch';
import { cn } from '@/lib/utils';

export default function NewGratitudePage(): ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">감사 기록 작성</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">날짜, 제목, 내용을 입력합니다.</p>
      </div>
      <GratitudeForm mode="create" />
      <Link
        href="/gratitude"
        className={cn(
          'text-sm text-[var(--muted)] underline [@media(hover:hover)]:hover:text-[var(--foreground)] active:text-[var(--foreground)]',
          backLinkTouchClassName,
        )}
      >
        ← 목록으로
      </Link>
    </div>
  );
}
