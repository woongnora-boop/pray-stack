import type { ReactElement } from 'react';

import { MEDITATION_HIGHLIGHT_STYLES } from '@/lib/meditation-highlight-styles';
import { normalizeHighlightsFromDb, splitMeditationParagraphs } from '@/lib/meditation-paragraph-highlights';
import { cn } from '@/lib/utils';

export function MeditationHighlightedBody({
  content,
  highlights,
  compact = false,
  maxParagraphs,
}: {
  content: string;
  highlights: unknown;
  compact?: boolean;
  /** compact일 때 보여 줄 문단 수(기본 4). 상세는 전체. */
  maxParagraphs?: number;
}): ReactElement {
  const hl = normalizeHighlightsFromDb(highlights);
  let paragraphs = splitMeditationParagraphs(content);
  if (compact) {
    const cap = maxParagraphs != null && maxParagraphs > 0 ? maxParagraphs : 4;
    paragraphs = paragraphs.slice(0, cap);
  }

  const gap = compact ? 'space-y-1' : 'space-y-2';
  const wrapMax = compact ? 'max-h-28 overflow-y-auto pr-0.5' : '';

  return (
    <div className={cn(gap, wrapMax)}>
      {paragraphs.map((text, i) => {
        const hid = hl[String(i)];
        const style = hid ? MEDITATION_HIGHLIGHT_STYLES[hid] : null;
        return (
          <p
            key={i}
            className={cn(
              'whitespace-pre-wrap rounded-md border leading-relaxed text-[var(--foreground)]',
              compact
                ? 'px-2 py-1 text-[11px] leading-snug line-clamp-2'
                : 'px-3 py-2 text-sm',
              !style && 'border-[var(--border)] bg-[var(--background)]/30',
            )}
            style={
              style
                ? {
                    backgroundColor: style.bg,
                    borderColor: style.border,
                  }
                : undefined
            }
          >
            {text.length ? text : '\u00a0'}
          </p>
        );
      })}
    </div>
  );
}
