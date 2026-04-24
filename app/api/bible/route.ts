import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import type { BibleApiError, BibleChapterResponse } from '@/lib/bible/api-types';
import { resolveBibleBook } from '@/lib/bible/catalog';
import { getSupabaseForBibleRead } from '@/lib/supabase/bible-query-client';
import { DEFAULT_TRANSLATION_QUERY, toDbTranslation } from '@/lib/bible/translation';

export type { BibleChapterResponse, BibleVerseRow } from '@/lib/bible/api-types';

const querySchema = z.object({
  book: z.string().trim().min(1, 'book은 필수입니다.').max(40, 'book은 40자 이하여야 합니다.'),
  chapter: z.coerce
    .number({ invalid_type_error: 'chapter는 숫자여야 합니다.' })
    .int('chapter는 정수여야 합니다.')
    .min(1, 'chapter는 1 이상이어야 합니다.')
    .max(200, 'chapter가 너무 큽니다.'),
  translation: z
    .string()
    .trim()
    .max(64, 'translation은 64자 이하여야 합니다.')
    .optional(),
});

function jsonError(status: number, error: string, message: string): NextResponse<BibleApiError> {
  return NextResponse.json({ error, message }, { status });
}

function zodToMessage(err: z.ZodError): string {
  return err.issues.map((i) => i.message).join(' ');
}

function isTableMissingFromSupabaseMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    msg.includes('bible_verses') &&
    (msg.includes('schema cache') || m.includes('could not find the table') || m.includes('does not exist'))
  );
}

/** URL이 (translation, book, chapter)를 고정하면 본문은 불변 → CDN 장기 캐시. */
const CACHE_HEADER = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800';

export async function GET(request: NextRequest): Promise<NextResponse<BibleChapterResponse | BibleApiError>> {
  const sp = request.nextUrl.searchParams;
  const tr = sp.get('translation');
  const parsed = querySchema.safeParse({
    book: sp.get('book') ?? '',
    chapter: sp.get('chapter') ?? '',
    translation: tr === null || tr.trim() === '' ? undefined : tr,
  });

  if (!parsed.success) {
    return jsonError(400, 'Bad Request', zodToMessage(parsed.error));
  }

  const translationRequested = parsed.data.translation ?? DEFAULT_TRANSLATION_QUERY;
  const translationDb = toDbTranslation(translationRequested);
  const { chapter } = parsed.data;
  const catalog = resolveBibleBook(parsed.data.book);

  if (!catalog) {
    return jsonError(400, 'Bad Request', '지원하지 않는 book입니다. 한글 권명을 정확히 입력해 주세요.');
  }

  if (chapter > catalog.maxChapter) {
    return jsonError(
      400,
      'Bad Request',
      `${catalog.bookName}은(는) ${catalog.maxChapter}장까지 있습니다.`,
    );
  }

  const supabase = await getSupabaseForBibleRead();
  const { data, error } = await supabase
    .from('bible_verses')
    .select('verse, text')
    .eq('translation', translationDb)
    .eq('book_order', catalog.bookOrder)
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  if (error) {
    console.error('[api/bible]', error.message);
    if (isTableMissingFromSupabaseMessage(error.message ?? '')) {
      return jsonError(
        503,
        'Service Unavailable',
        '성경 본문 테이블이 구성되지 않았습니다. 관리자에게 문의해 주세요.',
      );
    }
    return jsonError(500, 'Internal Server Error', '조회 중 오류가 발생했습니다.');
  }

  if (!data?.length) {
    return jsonError(
      404,
      'Not Found',
      '해당 번역·권·장의 본문이 없습니다. 데이터가 적재되었는지 확인해 주세요.',
    );
  }

  const body: BibleChapterResponse = {
    translation: translationDb,
    book: catalog.bookName,
    chapter,
    verses: data.map((row) => ({
      verse: row.verse,
      text: row.text,
    })),
  };

  return NextResponse.json(body, {
    headers: { 'Cache-Control': CACHE_HEADER },
  });
}
