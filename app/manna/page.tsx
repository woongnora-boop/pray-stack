import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';

import { listMannaCategories, listMannaEntries } from '@/app/actions/manna';
import { AddCategoryForm } from '@/components/manna/AddCategoryForm';
import { MannaCategoryChips } from '@/components/manna/MannaCategoryChips';
import { MannaList } from '@/components/manna/MannaList';
import { ListPageHero, ListPagePanel, listPrimaryLinkClass } from '@/components/layout/ListPageShell';

interface MannaPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function MannaPage({ searchParams }: MannaPageProps): Promise<ReactElement> {
  const { category: categoryParam } = await searchParams;
  const parsed = z.string().uuid().safeParse(categoryParam);
  const filterCategoryId = parsed.success ? parsed.data : null;

  const [categories, entries] = await Promise.all([
    listMannaCategories(),
    listMannaEntries(filterCategoryId),
  ]);

  return (
    <div className="space-y-8 md:space-y-10">
      <ListPageHero
        tone="sky"
        label="말씀기도"
        title="만나"
        description="다시 보고 싶은 말씀을 카테고리별로 모아 두고, 날짜와 함께 찾아보세요."
        actions={
          <Link href="/manna/new" className={listPrimaryLinkClass()}>
            말씀 추가
          </Link>
        }
      />

      <ListPagePanel>
        <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-5 py-5 md:px-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">카테고리 필터</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">보고 싶은 카테고리만 골라 볼 수 있어요.</p>
          <div className="mt-4">
            <MannaCategoryChips categories={categories} selectedCategoryId={filterCategoryId} />
          </div>
        </div>

        <div className="border-b border-[var(--border)] px-5 py-5 md:px-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">새 카테고리</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">나만의 주제로 말씀을 묶어 보세요.</p>
          <div className="mt-4 max-w-md">
            <AddCategoryForm />
          </div>
        </div>

        <div className="p-5 md:p-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">말씀 목록</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">최근 날짜순으로 표시됩니다.</p>
          <div className="mt-5">
            <MannaList entries={entries} tone="sky" />
          </div>
        </div>
      </ListPagePanel>
    </div>
  );
}
