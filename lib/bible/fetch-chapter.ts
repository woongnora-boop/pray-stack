import type { BibleApiError, BibleChapterResponse } from '@/lib/bible/api-types';

export type FetchBibleChapterResult =
  | { ok: true; data: BibleChapterResponse }
  | { ok: false; status: number; message: string };

export async function fetchBibleChapterFromApi(params: {
  book: string;
  chapter: number;
  translation?: string;
}): Promise<FetchBibleChapterResult> {
  const qs = new URLSearchParams({
    book: params.book.trim(),
    chapter: String(params.chapter),
  });
  if (params.translation?.trim()) {
    qs.set('translation', params.translation.trim());
  }

  const res = await fetch(`/api/bible?${qs.toString()}`);
  const json: unknown = await res.json();

  if (!res.ok) {
    const err = json as Partial<BibleApiError>;
    const message = typeof err.message === 'string' ? err.message : `요청 실패 (${res.status})`;
    return { ok: false, status: res.status, message };
  }

  if (!isBibleChapterResponse(json)) {
    return { ok: false, status: 500, message: '응답 형식이 올바르지 않습니다.' };
  }

  return { ok: true, data: json };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isBibleChapterResponse(v: unknown): v is BibleChapterResponse {
  if (!isRecord(v)) return false;
  if (typeof v.translation !== 'string' || typeof v.book !== 'string' || typeof v.chapter !== 'number') {
    return false;
  }
  if (!Array.isArray(v.verses)) return false;
  for (const row of v.verses) {
    if (!isRecord(row)) return false;
    if (typeof row.verse !== 'number' || typeof row.text !== 'string') return false;
  }
  return true;
}

export function formatChapterVersesPlain(verses: BibleChapterResponse['verses']): string {
  return verses.map((v) => `${v.verse}. ${v.text}`).join('\n');
}

export function filterVersesByInclusiveRange(
  verses: BibleChapterResponse['verses'],
  verseFrom: number,
  verseTo: number,
): BibleChapterResponse['verses'] {
  return verses.filter((v) => v.verse >= verseFrom && v.verse <= verseTo);
}

export function formatChapterReferenceLabel(book: string, chapter: number): string {
  return `${book} ${chapter}장`;
}
