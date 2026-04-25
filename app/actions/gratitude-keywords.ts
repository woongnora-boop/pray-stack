'use server';

import {
  displayYmdFromDb,
  formatSeoulMonthHeading,
  formatSeoulWeekRangeLabel,
  seoulEndOfMonth,
  seoulEndOfWeekSunday,
  seoulStartOfMonth,
  seoulStartOfWeekMonday,
  seoulYmdNow,
  toDateInputValue,
} from '@/lib/date';
import { rankKeywordsFromNotesAsync, type GratitudeKeywordRank } from '@/lib/gratitude-keywords';
import { getServerAuth } from '@/lib/supabase/request-session';

export type { GratitudeKeywordRank };

export interface GratitudeKeywordPeriod {
  label: string;
  start: string;
  end: string;
  keywords: GratitudeKeywordRank[];
}

async function listNotesInRange(
  startYmd: string,
  endYmd: string,
): Promise<{ title: string; content: string; note_date: string }[]> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('gratitude_notes')
    .select('title, content, note_date')
    .eq('user_id', user.id)
    .gte('note_date', startYmd)
    .lte('note_date', endYmd)
    .order('note_date', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as { title: string; content: string; note_date: string }[]).map((row) => ({
    title: row.title,
    content: row.content,
    note_date: displayYmdFromDb(row.note_date) || toDateInputValue(row.note_date) || String(row.note_date).slice(0, 10),
  }));
}

/** 홈 대시보드용: 이번 주(월–일, 서울) 감사 키워드 상위. */
export async function getGratitudeKeywordsForHomePreview(): Promise<GratitudeKeywordRank[]> {
  const today = seoulYmdNow();
  const start = seoulStartOfWeekMonday(today);
  const end = seoulEndOfWeekSunday(today);
  const notes = await listNotesInRange(start, end);
  return rankKeywordsFromNotesAsync(notes, 8);
}

/** 감사 키워드 화면: 이번 주·이번 달 요약. */
export async function getGratitudeKeywordsDashboard(): Promise<{
  week: GratitudeKeywordPeriod;
  month: GratitudeKeywordPeriod;
} | null> {
  const { user } = await getServerAuth();
  if (!user) {
    return null;
  }

  const today = seoulYmdNow();
  const wStart = seoulStartOfWeekMonday(today);
  const wEnd = seoulEndOfWeekSunday(today);
  const mStart = seoulStartOfMonth(today);
  const mEnd = seoulEndOfMonth(today);

  const [weekNotes, monthNotes] = await Promise.all([
    listNotesInRange(wStart, wEnd),
    listNotesInRange(mStart, mEnd),
  ]);

  const [weekKeywords, monthKeywords] = await Promise.all([
    rankKeywordsFromNotesAsync(weekNotes, 40),
    rankKeywordsFromNotesAsync(monthNotes, 60),
  ]);

  return {
    week: {
      label: formatSeoulWeekRangeLabel(wStart, wEnd),
      start: wStart,
      end: wEnd,
      keywords: weekKeywords,
    },
    month: {
      label: formatSeoulMonthHeading(today),
      start: mStart,
      end: mEnd,
      keywords: monthKeywords,
    },
  };
}
