import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { getMannaEntry } from '@/app/actions/manna';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteMannaButton } from '@/components/manna/DeleteMannaButton';
import { MannaCategoryTag } from '@/components/manna/MannaCategoryTag';
import { backLinkTouchClassName } from '@/lib/back-link-touch';
import { cn } from '@/lib/utils';

interface MannaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MannaDetailPage({ params }: MannaDetailPageProps): Promise<ReactElement> {
  const { id } = await params;
  const entry = await getMannaEntry(id);

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <span>{entry.entry_date}</span>
            <MannaCategoryTag categoryId={entry.category_id} name={entry.category_name} size="sm" />
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{entry.verse_reference}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/manna/${id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--border)]/40"
          >
            수정
          </Link>
          <DeleteMannaButton entryId={id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">말씀 본문</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">{entry.verse_text}</p>
        </CardContent>
      </Card>

      {entry.note ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">메모</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.note}</p>
          </CardContent>
        </Card>
      ) : null}

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
