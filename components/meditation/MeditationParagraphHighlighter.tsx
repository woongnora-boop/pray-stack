'use client';

import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import {
  MEDITATION_HIGHLIGHT_IDS,
  MEDITATION_HIGHLIGHT_LABELS,
  MEDITATION_HIGHLIGHT_STYLES,
  type MeditationHighlightId,
} from '@/lib/meditation-highlight-styles';
import { sanitizeParagraphHighlights, splitMeditationParagraphs } from '@/lib/meditation-paragraph-highlights';
import { cn } from '@/lib/utils';

export function MeditationParagraphHighlighter({
  content,
  highlights,
  onHighlightsChange,
}: {
  content: string;
  highlights: Record<string, MeditationHighlightId>;
  onHighlightsChange: (next: Record<string, MeditationHighlightId>) => void;
}): ReactElement {
  const [pen, setPen] = useState<MeditationHighlightId | 'erase'>('amber');
  const paragraphs = useMemo(() => splitMeditationParagraphs(content), [content]);
  const n = paragraphs.length;

  function applyParagraph(index: number): void {
    const key = String(index);
    const next: Record<string, MeditationHighlightId> = { ...highlights };
    if (pen === 'erase') {
      delete next[key];
    } else if (next[key] === pen) {
      delete next[key];
    } else {
      next[key] = pen;
    }
    onHighlightsChange(sanitizeParagraphHighlights(next, n));
  }

  return (
    <div className="space-y-3 rounded-md border border-dashed border-[var(--border)] bg-[var(--card)]/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[var(--muted)]">형광펜</span>
        <div className="flex flex-wrap gap-1.5">
          {MEDITATION_HIGHLIGHT_IDS.map((id) => {
            const s = MEDITATION_HIGHLIGHT_STYLES[id];
            const active = pen === id;
            return (
              <button
                key={id}
                type="button"
                title={MEDITATION_HIGHLIGHT_LABELS[id]}
                onClick={() => setPen(id)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-transform',
                  active ? 'scale-110 ring-2 ring-[var(--foreground)]/25 ring-offset-1 ring-offset-[var(--card)]' : 'opacity-90 hover:opacity-100',
                )}
                style={{ backgroundColor: s.dot, borderColor: active ? s.border : 'transparent' }}
                aria-label={`${MEDITATION_HIGHLIGHT_LABELS[id]} 선택`}
                aria-pressed={active}
              />
            );
          })}
          <button
            type="button"
            onClick={() => setPen('erase')}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              pen === 'erase'
                ? 'border-[var(--foreground)]/30 bg-[var(--foreground)]/10 text-[var(--foreground)]'
                : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--border)]/40',
            )}
            aria-pressed={pen === 'erase'}
          >
            해제
          </button>
        </div>
      </div>
      <p className="text-[11px] leading-snug text-[var(--muted)]">
        색을 고른 뒤 아래 문단을 누르면 칠해집니다. 같은 색·같은 문단을 다시 누르면 지워지고, 「해제」는 클릭 한 번에 색을 뺍니다.
      </p>
      <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {paragraphs.map((text, i) => {
          const hid = highlights[String(i)];
          const style = hid ? MEDITATION_HIGHLIGHT_STYLES[hid] : null;
          const preview = text.replace(/\s+/g, ' ').trim().slice(0, 120) || '(빈 문단)';
          return (
            <button
              key={i}
              type="button"
              onClick={() => applyParagraph(i)}
              className={cn(
                'w-full rounded-md border px-2.5 py-2 text-left text-xs leading-snug transition-colors',
                !style && 'border-[var(--border)] bg-[var(--background)]/50 hover:bg-[var(--border)]/30',
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
              <span className="font-mono text-[10px] text-[var(--muted)]">§{i + 1}</span>{' '}
              <span className="text-[var(--foreground)]">
                {preview}
                {text.length > 120 ? '…' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
