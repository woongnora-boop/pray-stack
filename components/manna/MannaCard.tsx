import Link from 'next/link';
import type { ReactElement } from 'react';

import type { MannaEntryListItem } from '@/app/actions/manna';
import type { HomeTone } from '@/components/home/homeTones';
import { homeToneStyles } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

import { MannaCategoryTag } from './MannaCategoryTag';

function preview(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max)}…`;
}

export function MannaCard({
  entry,
  tone = 'sky',
}: {
  entry: MannaEntryListItem;
  tone?: HomeTone;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <Link
      href={`/manna/${entry.id}`}
      className={cn(
        'group block rounded-xl border border-[var(--border)] bg-[var(--background)]/40 py-4 pl-4 pr-4 transition-all',
        'ring-1 ring-transparent hover:border-[var(--foreground)]/10 hover:bg-[var(--card)] hover:shadow-md hover:ring-[var(--foreground)]/5',
        'dark:bg-[var(--foreground)]/[0.03]',
        t.leftAccent,
      )}
    >
      <p className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
        <span className="font-medium uppercase tracking-wider">{entry.entry_date}</span>
        <MannaCategoryTag categoryId={entry.category_id} name={entry.category_name} size="xs" />
      </p>
      <p className="mt-1.5 line-clamp-2 text-base font-semibold text-[var(--foreground)]">{entry.verse_reference}</p>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{preview(entry.verse_text, 180)}</p>
      {entry.note ? (
        <p className="mt-2 text-xs italic text-[var(--muted)]">메모: {preview(entry.note, 100)}</p>
      ) : null}
    </Link>
  );
}
