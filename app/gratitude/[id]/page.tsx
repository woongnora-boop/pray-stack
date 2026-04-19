import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { getGratitudeNote } from '@/app/actions/gratitude';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteGratitudeButton } from '@/components/gratitude/DeleteGratitudeButton';

interface GratitudeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GratitudeDetailPage({ params }: GratitudeDetailPageProps): Promise<ReactElement> {
  const { id } = await params;
  const note = await getGratitudeNote(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">{note.note_date}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{note.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/gratitude/${id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--border)]/40"
          >
            수정
          </Link>
          <DeleteGratitudeButton noteId={id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">내용</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">{note.content}</p>
        </CardContent>
      </Card>

      <Link href="/gratitude" className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]">
        ← 목록으로
      </Link>
    </div>
  );
}
