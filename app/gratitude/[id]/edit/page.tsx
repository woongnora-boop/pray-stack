import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { getGratitudeNote } from '@/app/actions/gratitude';
import { GratitudeForm } from '@/components/gratitude/GratitudeForm';
import { backLinkTouchClassName } from '@/lib/back-link-touch';
import { cn } from '@/lib/utils';

interface GratitudeEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function GratitudeEditPage({ params }: GratitudeEditPageProps): Promise<ReactElement> {
  const { id } = await params;
  const note = await getGratitudeNote(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">감사 기록 수정</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{note.note_date}</p>
      </div>
      <GratitudeForm
        key={id}
        mode="edit"
        noteId={id}
        initialValues={{
          note_date: note.note_date,
          title: note.title,
          content: note.content,
        }}
      />
      <Link
        href={`/gratitude/${id}`}
        className={cn(
          'text-sm text-[var(--muted)] underline [@media(hover:hover)]:hover:text-[var(--foreground)] active:text-[var(--foreground)]',
          backLinkTouchClassName,
        )}
      >
        ← 상세로
      </Link>
    </div>
  );
}
