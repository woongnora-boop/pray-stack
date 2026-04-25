import Link from 'next/link';
import type { ReactElement } from 'react';

import type { MeditationDayListItem } from '@/app/actions/meditation';
import type { HomeTone } from '@/components/home/homeTones';
import { homeToneStyles } from '@/components/home/homeTones';
import { hasAnyParagraphHighlight } from '@/lib/meditation-paragraph-highlights';
import { cn } from '@/lib/utils';

import { MeditationHighlightedBody } from './MeditationHighlightedBody';

export type MeditationCardProps = MeditationDayListItem & {
  tone?: HomeTone;
};

export function MeditationCard({
  id,
  meditation_date,
  item_count,
  preview_title,
  preview_verse,
  preview_excerpt,
  preview_content = '',
  preview_paragraph_highlights = {},
  tone = 'amber',
}: MeditationCardProps): ReactElement {
  const t = homeToneStyles[tone];
  const headline = preview_title?.trim() || '묵상 기록';
  const showHl = hasAnyParagraphHighlight(preview_paragraph_highlights) && preview_content.trim().length > 0;

  return (
    <Link
      href={`/meditation/${id}`}
      className={cn(
        'group block rounded-xl border border-[var(--border)] bg-[var(--background)]/40 py-4 pl-4 pr-4 transition-all',
        'ring-1 ring-transparent hover:border-[var(--foreground)]/10 hover:bg-[var(--card)] hover:shadow-md hover:ring-[var(--foreground)]/5',
        'dark:bg-[var(--foreground)]/[0.03]',
        t.leftAccent,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">{meditation_date}</p>
      <p className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug text-[var(--foreground)]">{headline}</p>
      {preview_verse ? (
        <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">{preview_verse}</p>
      ) : null}
      {showHl ? (
        <div className="mt-2">
          <MeditationHighlightedBody
            content={preview_content}
            highlights={preview_paragraph_highlights}
            compact
            maxParagraphs={5}
          />
        </div>
      ) : preview_excerpt ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{preview_excerpt}</p>
      ) : null}
      <p className="mt-3 text-xs text-[var(--muted)]">
        묵상 항목 <span className="font-semibold text-[var(--foreground)]">{item_count}</span>개
      </p>
    </Link>
  );
}
