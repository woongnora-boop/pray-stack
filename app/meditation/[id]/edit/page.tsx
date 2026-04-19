import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { getMeditationDay } from '@/app/actions/meditation';
import { MeditationForm } from '@/components/meditation/MeditationForm';

interface MeditationEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeditationEditPage({ params }: MeditationEditPageProps): Promise<ReactElement> {
  const { id } = await params;
  const detail = await getMeditationDay(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">묵상 수정</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{detail.meditation_date}</p>
      </div>
      <MeditationForm
        mode="edit"
        dayId={id}
        initialValues={{ meditation_date: detail.meditation_date, items: detail.items }}
      />
      <Link href={`/meditation/${id}`} className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]">
        ← 상세로
      </Link>
    </div>
  );
}
