'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BibleBook } from '@/lib/bible-meta';
import { BIBLE_BOOKS } from '@/lib/bible-meta';
import { cn } from '@/lib/utils';

/** 개역개정 66권: 구약 1–39권, 신약 40–66권 */
const OT_LAST_ID = 39;

interface BibleVersePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

const selectClass = cn(
  'flex h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

type Testament = 'ot' | 'nt';

function booksForTestament(t: Testament): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => (t === 'ot' ? b.id <= OT_LAST_ID : b.id > OT_LAST_ID));
}

export function BibleVersePickerKRV({ value = '', onChange }: BibleVersePickerProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [testament, setTestament] = useState<Testament>('ot');
  const [bookId, setBookId] = useState<string>('');
  const [chapter, setChapter] = useState<string>('');
  const [startVerse, setStartVerse] = useState<string>('');
  const [endVerse, setEndVerse] = useState<string>('');
  const [manualMode, setManualMode] = useState(false);

  const bookList = useMemo(() => booksForTestament(testament), [testament]);

  const selectedBook: BibleBook | undefined = BIBLE_BOOKS.find((b) => b.id.toString() === bookId);
  const maxChapters = selectedBook?.chapters.length || 0;
  const maxVerses = selectedBook && chapter ? selectedBook.chapters[parseInt(chapter, 10) - 1] : 0;

  const clearBookSelection = () => {
    setBookId('');
    setChapter('');
    setStartVerse('');
    setEndVerse('');
  };

  const switchTestament = (next: Testament) => {
    setTestament(next);
    if (!bookId) return;
    const id = parseInt(bookId, 10);
    const isOt = id <= OT_LAST_ID;
    if (next === 'ot' && !isOt) clearBookSelection();
    if (next === 'nt' && isOt) clearBookSelection();
  };

  useEffect(() => {
    if (manualMode) return;
    if (!selectedBook || !chapter || !startVerse) return;

    let refStr = `${selectedBook.name} ${chapter}:${startVerse}`;
    if (endVerse && endVerse !== startVerse) {
      refStr += `-${endVerse}`;
    }
    if (refStr === value) return;

    onChangeRef.current?.(refStr);
  }, [bookId, chapter, startVerse, endVerse, manualMode, selectedBook, value]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-medium text-muted-foreground">개역개정</span>

        <div
          className="flex rounded-md border border-[var(--border)] p-0.5"
          role="tablist"
          aria-label="성경 구분"
        >
          <button
            type="button"
            role="tab"
            aria-selected={testament === 'ot'}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              testament === 'ot'
                ? 'bg-[var(--accent)] text-[var(--background)]'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => switchTestament('ot')}
          >
            구약
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={testament === 'nt'}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              testament === 'nt'
                ? 'bg-[var(--accent)] text-[var(--background)]'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => switchTestament('nt')}
          >
            신약
          </button>
        </div>

        <select
          className={cn(selectClass, 'min-w-[128px] max-w-[160px]')}
          value={bookId}
          onChange={(e) => {
            setBookId(e.target.value);
            setChapter('');
            setStartVerse('');
            setEndVerse('');
            setManualMode(false);
          }}
        >
          <option value="">책 선택</option>
          {bookList.map((book) => (
            <option key={book.id} value={book.id.toString()}>
              {book.name}
            </option>
          ))}
        </select>

        <select
          className={cn(selectClass, 'w-[90px]')}
          disabled={!bookId}
          value={chapter}
          onChange={(e) => {
            setChapter(e.target.value);
            setStartVerse('');
            setEndVerse('');
            setManualMode(false);
          }}
        >
          <option value="">장</option>
          {Array.from({ length: maxChapters }).map((_, i) => (
            <option key={i + 1} value={(i + 1).toString()}>
              {i + 1}장
            </option>
          ))}
        </select>

        <select
          className={cn(selectClass, 'w-[90px]')}
          disabled={!chapter}
          value={startVerse}
          onChange={(e) => {
            const v = e.target.value;
            setStartVerse(v);
            setEndVerse(v);
            setManualMode(false);
          }}
        >
          <option value="">시작 절</option>
          {Array.from({ length: maxVerses }).map((_, i) => (
            <option key={i + 1} value={(i + 1).toString()}>
              {i + 1}절
            </option>
          ))}
        </select>

        <span className="text-muted-foreground">~</span>

        <select
          className={cn(selectClass, 'w-[90px]')}
          disabled={!startVerse}
          value={endVerse}
          onChange={(e) => {
            setEndVerse(e.target.value);
            setManualMode(false);
          }}
        >
          <option value="">끝 절</option>
          {Array.from({ length: maxVerses })
            .map((_, i) => i + 1)
            .filter((v) => v >= parseInt(startVerse || '1', 10))
            .map((v) => (
              <option key={v} value={v.toString()}>
                {v}절
              </option>
            ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label>성경 구절 (자동완성 및 수정 가능)</Label>
        <Input
          placeholder="예: 요한복음 3:16-18"
          value={value}
          onChange={(e) => {
            setManualMode(true);
            onChangeRef.current?.(e.target.value);
          }}
        />
        <p className="text-xs text-muted-foreground">
          선택기를 사용하면 자동으로 채워집니다. 필요한 경우 직접 수정하세요.
        </p>
      </div>
    </div>
  );
}
