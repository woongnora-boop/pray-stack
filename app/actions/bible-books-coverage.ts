'use server';

import { BIBLE_CATALOG } from '@/lib/bible/catalog';
import { bookOrderFromVerseReference } from '@/lib/bible/parse-verse-reference';
import { getServerAuth } from '@/lib/supabase/request-session';

export type BibleBooksActivityRow = {
  bookOrder: number;
  bookName: string;
  testament: 'OT' | 'NT';
  hasMeditation: boolean;
  hasManna: boolean;
};

/** 묵상·만나에 남긴 성경 구절로 66권 터치 여부 (전체 기간). 비로그인 시 빈 그리드용 66행(전부 미기록). */
export async function getMyBibleBooksActivity(): Promise<BibleBooksActivityRow[]> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return BIBLE_CATALOG.map((b) => ({
      bookOrder: b.bookOrder,
      bookName: b.bookName,
      testament: b.testament,
      hasMeditation: false,
      hasManna: false,
    }));
  }

  const medOrders = new Set<number>();
  const mannaOrders = new Set<number>();

  const [{ data: mannaRows }, { data: medItemRows }] = await Promise.all([
    supabase.from('manna_entries').select('verse_reference').eq('user_id', user.id),
    supabase.from('meditation_items').select('verse_reference').eq('user_id', user.id),
  ]);

  for (const row of mannaRows ?? []) {
    const o = bookOrderFromVerseReference((row as { verse_reference: string }).verse_reference ?? '');
    if (o) mannaOrders.add(o);
  }
  for (const row of medItemRows ?? []) {
    const o = bookOrderFromVerseReference((row as { verse_reference: string }).verse_reference ?? '');
    if (o) medOrders.add(o);
  }

  return BIBLE_CATALOG.map((b) => ({
    bookOrder: b.bookOrder,
    bookName: b.bookName,
    testament: b.testament,
    hasMeditation: medOrders.has(b.bookOrder),
    hasManna: mannaOrders.has(b.bookOrder),
  }));
}
