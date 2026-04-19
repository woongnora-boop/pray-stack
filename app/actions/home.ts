'use server';

import type { GratitudeNoteListItem } from '@/app/actions/gratitude';
import { getMeditationDay, type MeditationDayDetail } from '@/app/actions/meditation';
import { getLatestMannaEntryForHome, type MannaEntryListItem } from '@/app/actions/manna';
import { createClient } from '@/lib/supabase/server';

export interface HomeFeedData {
  meditation: MeditationDayDetail | null;
  manna: MannaEntryListItem | null;
  gratitude: GratitudeNoteListItem | null;
}

export async function getHomeFeed(): Promise<HomeFeedData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { meditation: null, manna: null, gratitude: null };
  }

  const { data: latestMed } = await supabase
    .from('meditation_days')
    .select('id')
    .eq('user_id', user.id)
    .order('meditation_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  let meditation: MeditationDayDetail | null = null;
  if (latestMed?.id) {
    meditation = await getMeditationDay(latestMed.id);
  }

  const manna = await getLatestMannaEntryForHome();

  const { data: gRow } = await supabase
    .from('gratitude_notes')
    .select('id, note_date, title, content, created_at')
    .eq('user_id', user.id)
    .order('note_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const gratitude = (gRow as GratitudeNoteListItem | null) ?? null;

  return { meditation, manna, gratitude };
}
