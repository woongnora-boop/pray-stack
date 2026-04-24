'use client';

import { useCallback, useState, type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BibleChapterResponse } from '@/lib/bible/api-types';
import { cn } from '@/lib/utils';

const PRESET_BOOKS = ['창세기', '요한복음'] as const;
type PresetBook = (typeof PRESET_BOOKS)[number];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isBibleChapterResponse(v: unknown): v is BibleChapterResponse {
  if (!isRecord(v)) return false;
  if (
    typeof v.translation !== 'string' ||
    typeof v.book !== 'string' ||
    typeof v.chapter !== 'number' ||
    !Array.isArray(v.verses)
  ) {
    return false;
  }
  for (const item of v.verses) {
    if (!isRecord(item)) return false;
    if (typeof item.verse !== 'number' || typeof item.text !== 'string') return false;
  }
  return true;
}

const selectClassName = cn(
  'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
);

export default function BibleTestPage(): ReactElement {
  const [preset, setPreset] = useState<PresetBook | 'custom'>('창세기');
  const [customBook, setCustomBook] = useState('');
  const [chapterInput, setChapterInput] = useState('1');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BibleChapterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const resolvedBook = preset === 'custom' ? customBook.trim() : preset;

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    setHasFetched(true);

    const chapter = Number.parseInt(chapterInput.trim(), 10);
    if (!resolvedBook) {
      setError('책 이름을 입력하거나 선택해 주세요.');
      return;
    }
    if (!Number.isFinite(chapter) || chapter < 1) {
      setError('장 번호는 1 이상의 숫자여야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({ book: resolvedBook, chapter: String(chapter) });
      const res = await fetch(`/api/bible?${qs.toString()}`);
      const json: unknown = await res.json();

      if (!res.ok) {
        setError(`${res.status} — ${JSON.stringify(json)}`);
        return;
      }
      if (!isBibleChapterResponse(json)) {
        setError('응답 형식이 예상과 다릅니다.');
        return;
      }
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`요청 실패: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [chapterInput, resolvedBook]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">성경 DB 연결 테스트</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">`/api/bible` GET — Supabase 연결 확인용</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>조회</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bible-book-preset">책</Label>
            <select
              id="bible-book-preset"
              className={selectClassName}
              value={preset}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'custom') setPreset('custom');
                else setPreset(v as PresetBook);
              }}
            >
              {PRESET_BOOKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="custom">직접 입력…</option>
            </select>
            {preset === 'custom' ? (
              <Input
                id="bible-book-custom"
                placeholder="예: 출애굽기"
                value={customBook}
                onChange={(e) => setCustomBook(e.target.value)}
                autoComplete="off"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bible-chapter">장</Label>
            <Input
              id="bible-chapter"
              type="number"
              inputMode="numeric"
              min={1}
              value={chapterInput}
              onChange={(e) => setChapterInput(e.target.value)}
            />
          </div>

          <Button type="button" className="w-full sm:w-auto" disabled={loading} onClick={() => void load()}>
            {loading ? '불러오는 중…' : '불러오기'}
          </Button>
        </CardContent>
      </Card>

      {!hasFetched && !loading ? (
        <Card className="border-dashed border-[var(--border)] bg-transparent">
          <CardContent className="p-4 text-center text-sm text-[var(--muted)]">
            불러오기를 누르면 결과가 여기에 표시됩니다.
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-[var(--muted)]">조회 중…</CardContent>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">오류</p>
            <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-[var(--foreground)]">{error}</pre>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && data && data.verses.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-[var(--muted)]">
            {data.book} {data.chapter}장 — 절 목록이 비어 있습니다.
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && data && data.verses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data.book} {data.chapter}장
              <span className="ml-2 text-sm font-normal text-[var(--muted)]">({data.translation})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--muted)]">총 {data.verses.length}절</p>
            <ul className="space-y-3 border-t border-[var(--border)] pt-3">
              {data.verses.map((v) => (
                <li key={v.verse} className="text-sm leading-relaxed text-[var(--foreground)]">
                  <span className="mr-2 font-medium text-[var(--muted)]">{v.verse}</span>
                  {v.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
