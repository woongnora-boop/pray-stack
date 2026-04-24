'use client';

import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BIBLE_CATALOG, type BibleCatalogEntry } from '@/lib/bible/catalog';
import {
  fetchBibleChapterFromApi,
  filterVersesByInclusiveRange,
  formatChapterVersesPlain,
} from '@/lib/bible/fetch-chapter';
import { parseVerseReferenceLine } from '@/lib/bible/parse-verse-reference';
import { cn } from '@/lib/utils';

type SyncedRange = {
  book: string;
  chapter: number;
  verseFrom?: number;
  verseTo?: number;
};

type ResolvedTarget = {
  bookName: string;
  chapter: number;
};

export type BibleChapterViewerProps = {
  className?: string;
  /**
   * 성경 구절 문자열(`요한복음 3:16`, `3:16-18`, `N장`)과 책·장 동기화.
   * 파싱되면 해당 장 기준으로 절 범위가 있을 때 목록·본문 넣기에 반영.
   */
  syncFromReference?: string;
  /** 불러온 장(또는 구절 범위)을 본문에 넣을 때 */
  onApplyBody?: (plainText: string) => void;
  /** 말씀 본문 / 묵상 내용 등을 한 번에 비울 때 */
  onClearBody?: () => void;
};

export function BibleChapterViewer({
  className,
  syncFromReference,
  onApplyBody,
  onClearBody,
}: BibleChapterViewerProps): ReactElement {
  const [resolved, setResolved] = useState<ResolvedTarget | null>(null);
  const [rangeFromReference, setRangeFromReference] = useState<SyncedRange | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Awaited<ReturnType<typeof fetchBibleChapterFromApi>> | null>(null);

  useEffect(() => {
    if (syncFromReference === undefined) return;
    const p = parseVerseReferenceLine(syncFromReference);
    if (!p) {
      setResolved(null);
      setRangeFromReference(null);
      setLoaded(null);
      setError(null);
      return;
    }
    setResolved({ bookName: p.bookName, chapter: p.chapter });
    setLoaded(null);
    setError(null);
    setRangeFromReference({
      book: p.bookName,
      chapter: p.chapter,
      verseFrom: p.verseFrom,
      verseTo: p.verseTo,
    });
  }, [syncFromReference]);

  const catalogEntry: BibleCatalogEntry | undefined = useMemo(
    () => (resolved ? BIBLE_CATALOG.find((b) => b.bookName === resolved.bookName) : undefined),
    [resolved],
  );

  const activeSlice = useMemo(() => {
    if (!rangeFromReference || !resolved || !catalogEntry) return null;
    if (rangeFromReference.book !== resolved.bookName || rangeFromReference.chapter !== resolved.chapter) {
      return null;
    }
    if (rangeFromReference.verseFrom == null) return null;
    const lo = rangeFromReference.verseFrom;
    const hi = rangeFromReference.verseTo ?? lo;
    return { lo, hi };
  }, [rangeFromReference, resolved, catalogEntry]);

  const load = useCallback(async () => {
    if (!resolved || !catalogEntry) return;
    setLoading(true);
    setError(null);
    setLoaded(null);
    const res = await fetchBibleChapterFromApi({
      book: catalogEntry.bookName,
      chapter: resolved.chapter,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setLoaded(res);
  }, [resolved, catalogEntry]);

  const versesToShow = useMemo(() => {
    if (!loaded?.ok) return [];
    const rows = loaded.data.verses;
    if (!activeSlice) return rows;
    return filterVersesByInclusiveRange(rows, activeSlice.lo, activeSlice.hi);
  }, [loaded, activeSlice]);

  const bodyPlain = versesToShow.length ? formatChapterVersesPlain(versesToShow) : '';

  return (
    <Card className={cn('border-[var(--border)]', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">개역한글 본문</CardTitle>
        <p className="text-sm text-[var(--muted)]">
          위 성경 구절(`책 장:절`)과 동일한 장을 불러옵니다. DB(`/api/bible`)는 개역한글입니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {resolved ? (
          <p className="text-sm font-medium text-[var(--foreground)]">
            연결: {resolved.bookName} {resolved.chapter}장
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            위에서 성경 구절을 `책 장:절` 형식으로 선택하면 이어서 불러올 수 있습니다.
          </p>
        )}

        {activeSlice ? (
          <p className="text-xs text-[var(--muted)]">
            구절 범위 {activeSlice.lo}–{activeSlice.hi}절만 표시·본문에 넣기에 사용합니다.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="default" disabled={loading || !resolved || !catalogEntry} onClick={() => void load()}>
            {loading ? '불러오는 중…' : '절 목록 불러오기'}
          </Button>
          {onApplyBody && loaded?.ok ? (
            <Button type="button" variant="outline" onClick={() => onApplyBody(bodyPlain)} disabled={!bodyPlain}>
              본문에 넣기
            </Button>
          ) : null}
          {onClearBody ? (
            <Button type="button" variant="ghost" className="text-[var(--muted)]" onClick={() => onClearBody()}>
              본문 지우기
            </Button>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loaded?.ok && versesToShow.length > 0 ? (
          <ul className="max-h-60 space-y-2 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm leading-relaxed">
            {versesToShow.map((v) => (
              <li key={v.verse}>
                <span className="mr-2 tabular-nums font-medium text-[var(--muted)]">{v.verse}</span>
                <span className="text-[var(--foreground)]">{v.text}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {loaded?.ok && versesToShow.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">표시할 절이 없습니다. 구절 범위나 DB를 확인해 주세요.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
