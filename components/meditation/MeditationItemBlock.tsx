'use client';

import type { ReactElement } from 'react';

import type { MeditationCategoryType } from '@/types/database';

import { BibleChapterViewer } from '@/components/bible/BibleChapterViewer';
import { BibleVersePickerKRV } from '@/components/bible/bible-verse-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { MeditationHighlightId } from '@/lib/meditation-highlight-styles';
import { MEDITATION_CATEGORY_LABELS } from '@/lib/meditation-labels';
import { sanitizeParagraphHighlights, splitMeditationParagraphs } from '@/lib/meditation-paragraph-highlights';
import { cn } from '@/lib/utils';

import { MeditationParagraphHighlighter } from './MeditationParagraphHighlighter';

export interface MeditationItemBlockValue {
  category_type: MeditationCategoryType;
  verse_reference: string;
  title: string;
  content: string;
  paragraph_highlights: Record<string, MeditationHighlightId>;
}

interface MeditationItemBlockProps {
  index: number;
  value: MeditationItemBlockValue;
  onChange: (next: MeditationItemBlockValue) => void;
  canRemove: boolean;
  onRemove: () => void;
  fieldErrors?: Record<string, string[] | undefined>;
}

function itemFieldError(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  index: number,
  field: string,
): string | undefined {
  const key = `items.${index}.${field}`;
  return fieldErrors?.[key]?.[0];
}

export function MeditationItemBlock({
  index,
  value,
  onChange,
  canRemove,
  onRemove,
  fieldErrors,
}: MeditationItemBlockProps): ReactElement {
  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--foreground)]">묵상 항목 {index + 1}</p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:underline"
          >
            항목 삭제
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`block-${index}-category`}>분류</Label>
        <select
          id={`block-${index}-category`}
          value={value.category_type}
          onChange={(e) => {
            onChange({ ...value, category_type: e.target.value as MeditationCategoryType });
          }}
          className={cn(
            'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm',
            itemFieldError(fieldErrors, index, 'category_type') && 'border-red-500',
          )}
        >
          {(Object.keys(MEDITATION_CATEGORY_LABELS) as MeditationCategoryType[]).map((key) => (
            <option key={key} value={key}>
              {MEDITATION_CATEGORY_LABELS[key]}
            </option>
          ))}
        </select>
        {itemFieldError(fieldErrors, index, 'category_type') ? (
          <p className="text-sm text-red-600">{itemFieldError(fieldErrors, index, 'category_type')}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>성경 구절</Label>
        <BibleVersePickerKRV
          value={value.verse_reference}
          onChange={(next) => onChange({ ...value, verse_reference: next })}
        />
        {itemFieldError(fieldErrors, index, 'verse_reference') ? (
          <p className="text-sm text-red-600">{itemFieldError(fieldErrors, index, 'verse_reference')}</p>
        ) : null}
      </div>

      <BibleChapterViewer
        syncFromReference={value.verse_reference}
        onApplyBody={(plain) => {
          const nextContent = value.content.trim() ? `${value.content.trim()}\n\n${plain}` : plain;
          const n = splitMeditationParagraphs(nextContent).length;
          onChange({
            ...value,
            content: nextContent,
            paragraph_highlights: sanitizeParagraphHighlights(value.paragraph_highlights, n),
          });
        }}
        onClearBody={() => onChange({ ...value, content: '', paragraph_highlights: {} })}
      />

      <div className="space-y-2">
        <Label htmlFor={`block-${index}-title`}>묵상 제목</Label>
        <Input
          id={`block-${index}-title`}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          aria-invalid={Boolean(itemFieldError(fieldErrors, index, 'title'))}
        />
        {itemFieldError(fieldErrors, index, 'title') ? (
          <p className="text-sm text-red-600">{itemFieldError(fieldErrors, index, 'title')}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`block-${index}-content`}>묵상 내용</Label>
        <Textarea
          id={`block-${index}-content`}
          value={value.content}
          onChange={(e) => {
            const content = e.target.value;
            const n = splitMeditationParagraphs(content).length;
            onChange({
              ...value,
              content,
              paragraph_highlights: sanitizeParagraphHighlights(value.paragraph_highlights, n),
            });
          }}
          className="min-h-[120px] resize-y"
          aria-invalid={Boolean(itemFieldError(fieldErrors, index, 'content'))}
        />
        <p className="text-[11px] text-[var(--muted)]">
          형광은 <strong className="font-medium text-[var(--foreground)]">빈 줄(줄바꿈 두 번)</strong>으로 나뉜 문단마다 적용됩니다.
        </p>
        {itemFieldError(fieldErrors, index, 'content') ? (
          <p className="text-sm text-red-600">{itemFieldError(fieldErrors, index, 'content')}</p>
        ) : null}
        <MeditationParagraphHighlighter
          content={value.content}
          highlights={value.paragraph_highlights}
          onHighlightsChange={(next) => onChange({ ...value, paragraph_highlights: next })}
        />
      </div>
    </div>
  );
}
