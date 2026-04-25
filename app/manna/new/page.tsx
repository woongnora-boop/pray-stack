import Link from 'next/link';
import type { ReactElement } from 'react';

import { listMannaCategories } from '@/app/actions/manna';
import { MannaCategoryQuickAdd } from '@/components/manna/MannaCategoryQuickAdd';
import { MannaForm } from '@/components/manna/MannaForm';
import { seoulYmdNow } from '@/lib/date';
import { backLinkTouchClassName } from '@/lib/back-link-touch';
import { cn } from '@/lib/utils';

export default async function NewMannaPage(): Promise<ReactElement> {
  const categories = await listMannaCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">말씀 추가</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">성경 구절, 본문, 카테고리를 입력합니다.</p>
      </div>
      {categories.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">먼저 카테고리를 만든 뒤 말씀을 추가할 수 있습니다.</p>
          <MannaCategoryQuickAdd variant="inline" />
          <Link href="/manna" className={cn('text-sm underline', backLinkTouchClassName)}>
            ← 만나 목록으로
          </Link>
        </div>
      ) : (
        <MannaForm mode="create" categories={categories} defaultEntryDateYmd={seoulYmdNow()} />
      )}
      <Link
        href="/manna"
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
