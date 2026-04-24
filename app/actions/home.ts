'use server';

import type { GratitudeNoteListItem } from '@/app/actions/gratitude';
import type { MeditationDayDetail } from '@/app/actions/meditation';
import { getLatestMannaEntryForHome, type MannaEntryListItem } from '@/app/actions/manna';
import type { MeditationCategoryType } from '@/types/database';
import { getServerAuth } from '@/lib/supabase/request-session';

export interface HomeFeedData {
  meditation: MeditationDayDetail | null;
  manna: MannaEntryListItem | null;
  gratitude: GratitudeNoteListItem | null;
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
        sort_order: number;
      }[]
    | null;
};

function mapLatestMeditationRow(row: LatestMeditationHomeRow | null): MeditationDayDetail | null {
  if (!row?.meditation_items?.length) return null;
  const sorted = [...row.meditation_items].sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: row.id,
    meditation_date: row.meditation_date,
    items: sorted.map((i) => ({
      category_type: i.category_type,
      verse_reference: i.verse_reference,
      title: i.title,
      content: i.content,
    })),
  };
}

export async function getHomeFeed(): Promise<HomeFeedData> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { meditation: null, manna: null, gratitude: null };
  }

  const [medRes, manna, gRes] = await Promise.all([
    supabase
      .from('meditation_days')
      .select(
        `id, meditation_date, meditation_items(category_type, verse_reference, title, content, sort_order)`,
      )
      .eq('user_id', user.id)
      .order('meditation_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getLatestMannaEntryForHome(),
    supabase
      .from('gratitude_notes')
      .select('id, note_date, title, content, created_at')
      .eq('user_id', user.id)
      .order('note_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const meditation = mapLatestMeditationRow(medRes.data as LatestMeditationHomeRow | null);
  const gratitude = (gRes.data as GratitudeNoteListItem | null) ?? null;

  return { meditation, manna, gratitude };
}
