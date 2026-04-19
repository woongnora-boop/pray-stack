import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { getMannaEntry, listMannaCategories } from '@/app/actions/manna';
import { MannaForm } from '@/components/manna/MannaForm';

interface MannaEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function MannaEditPage({ params }: MannaEditPageProps): Promise<ReactElement> {
  const { id } = await params;
  const [entry, categories] = await Promise.all([getMannaEntry(id), listMannaCategories()]);

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">말씀 수정</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{entry.verse_reference}</p>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">카테고리가 없습니다. 목록에서 카테고리를 추가해 주세요.</p>
      ) : (
        <MannaForm
          mode="edit"
          entryId={id}
          categories={categories}
          initialValues={{
            entry_date: entry.entry_date,
            verse_reference: entry.verse_reference,
            verse_text: entry.verse_text,
            category_id: entry.category_id,
            note: entry.note,
          }}
        />
      )}
      <Link href={`/manna/${id}`} className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]">
        ← 상세로
      </Link>
    </div>
  );
}
