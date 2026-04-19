import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

import { getMeditationDay } from '@/app/actions/meditation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteMeditationButton } from '@/components/meditation/DeleteMeditationButton';
import { MEDITATION_CATEGORY_LABELS } from '@/lib/meditation-labels';

interface MeditationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeditationDetailPage({ params }: MeditationDetailPageProps): Promise<ReactElement> {
  const { id } = await params;
  const detail = await getMeditationDay(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">묵상</p>
          <h1 className="text-2xl font-semibold tracking-tight">{detail.meditation_date}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/meditation/${id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--border)]/40"
          >
            수정
          </Link>
          <DeleteMeditationButton dayId={id} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {detail.items.map((item, index) => (
          <Card key={`${item.title}-${index}`}>
            <CardHeader>
              <CardTitle className="text-base">
                묵상 항목 {index + 1} · {MEDITATION_CATEGORY_LABELS[item.category_type]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted)]">성경 구절</p>
                <p>{item.verse_reference}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted)]">제목</p>
                <p className="font-medium">{item.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted)]">내용</p>
                <p className="whitespace-pre-wrap leading-relaxed">{item.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link href="/meditation" className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]">
        ← 목록으로
      </Link>
    </div>
  );
}
