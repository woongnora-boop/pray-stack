'use server';

import type { GratitudeNoteListItem } from '@/app/actions/gratitude';
import { getGratitudeKeywordsForHomePreview } from '@/app/actions/gratitude-keywords';
import type { GratitudeKeywordRank } from '@/lib/gratitude-keywords';
import type { MeditationDayDetail } from '@/app/actions/meditation';
import { getLatestMannaEntryForHome, type MannaEntryListItem } from '@/app/actions/manna';
import { displayYmdFromDb } from '@/lib/date';
import { isMissingParagraphHighlightsColumnError } from '@/lib/meditation-highlights-db';
import { normalizeHighlightsFromDb } from '@/lib/meditation-paragraph-highlights';
import { getServerAuth } from '@/lib/supabase/request-session';
import type { MeditationCategoryType } from '@/types/database';

export interface HomeFeedData {
  meditation: MeditationDayDetail | null;
  manna: MannaEntryListItem | null;
  gratitude: GratitudeNoteListItem | null;
  /** 서울 기준 이번 주 감사 노트 키워드 (홈 미리보기) */
  gratitudeWeekKeywords: GratitudeKeywordRank[];
}

type LatestMeditationHomeRow = {
  id: string;
  meditation_date: string;
  meditation_items:
    | {
        category_type: MeditationCategoryType;
        verse_reference: string;
        title: string;
        content: string;
        paragraph_highlights?: unknown;
        sort_order: number;
      }[]
    | null;
};

function mapLatestMeditationRow(row: LatestMeditationHomeRow | null): MeditationDayDetail | null {
  if (!row?.meditation_items?.length) return null;
  const sorted = [...row.meditation_items].sort((a, b) => a.sort_order - b.sort_order);
  const ymd = displayYmdFromDb(row.meditation_date);
  return {
    id: row.id,
    meditation_date: ymd || row.meditation_date,
    items: sorted.map((i) => ({
      category_type: i.category_type,
      verse_reference: i.verse_reference,
      title: i.title,
      content: i.content,
      paragraph_highlights:
        i.paragraph_highlights !== undefined && i.paragraph_highlights !== null
          ? normalizeHighlightsFromDb(i.paragraph_highlights)
          : {},
    })),
  };
}

export async function getHomeFeed(): Promise<HomeFeedData> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { meditation: null, manna: null, gratitude: null, gratitudeWeekKeywords: [] };
  }

  const selectMeditationWithHl = `id, meditation_date, meditation_items(category_type, verse_reference, title, content, paragraph_highlights, sort_order)`;
  const selectMeditationNoHl = `id, meditation_date, meditation_items(category_type, verse_reference, title, content, sort_order)`;

  let medRes = await supabase
    .from('meditation_days')
    .select(selectMeditationWithHl)
    .eq('user_id', user.id)
    .order('meditation_date', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (medRes.error && isMissingParagraphHighlightsColumnError(medRes.error)) {
    medRes = await supabase
      .from('meditation_days')
      .select(selectMeditationNoHl)
      .eq('user_id', user.id)
      .order('meditation_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
  }

  const [manna, gRes, gratitudeWeekKeywords] = await Promise.all([
    getLatestMannaEntryForHome(),
    supabase
      .from('gratitude_notes')
      .select('id, note_date, title, content, created_at')
      .eq('user_id', user.id)
      .order('note_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getGratitudeKeywordsForHomePreview(),
  ]);

  const meditation = mapLatestMeditationRow(medRes.data as LatestMeditationHomeRow | null);
  const gRaw = gRes.data as GratitudeNoteListItem | null;
  const gratitude = gRaw
    ? {
        ...gRaw,
        note_date: displayYmdFromDb(gRaw.note_date) || gRaw.note_date,
      }
    : null;

  const mannaNorm =
    manna != null
      ? { ...manna, entry_date: displayYmdFromDb(manna.entry_date) || manna.entry_date }
      : null;

  return { meditation, manna: mannaNorm, gratitude, gratitudeWeekKeywords };
}
