import Link from 'next/link';
import type { ReactElement } from 'react';

import type { GratitudeNoteListItem } from '@/app/actions/gratitude';
import type { HomeTone } from '@/components/home/homeTones';
import { homeToneStyles } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

function preview(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max)}…`;
}

export function GratitudeCard({
  note,
  tone = 'rose',
}: {
  note: GratitudeNoteListItem;
  tone?: HomeTone;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <Link
      href={`/gratitude/${note.id}`}
      className={cn(
        'group block rounded-xl border border-[var(--border)] bg-[var(--background)]/40 py-4 pl-4 pr-4 transition-all',
        'ring-1 ring-transparent hover:border-[var(--foreground)]/10 hover:bg-[var(--card)] hover:shadow-md hover:ring-[var(--foreground)]/5',
        'dark:bg-[var(--foreground)]/[0.03]',
        t.leftAccent,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">{note.note_date}</p>
      <p className="mt-1.5 line-clamp-2 text-base font-semibold text-[var(--foreground)]">{note.title}</p>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{preview(note.content, 160)}</p>
    </Link>
  );
}
