'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { displayYmdFromDb, toDateInputValue } from '@/lib/date';
import { mergePayloadDateFromFormData } from '@/lib/form-merge-payload';
import { getServerAuth } from '@/lib/supabase/request-session';
import { meditationFormSchema, type MeditationFormValues } from '@/lib/validations/meditation';
import type { MeditationCategoryType } from '@/types/database';

export type MeditationActionState =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export interface MeditationDayDetail {
  id: string;
  meditation_date: string;
  items: MeditationFormValues['items'];
}

function mapDbError(dbError?: { message?: string } | null): string {
  const base = '저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  if (process.env.NODE_ENV === 'development' && dbError?.message) {
    return `${base} [개발] ${dbError.message}`;
  }
  return base;
}

function zodFieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return error.flatten().fieldErrors;
}

export interface MeditationDayListItem {
  id: string;
  meditation_date: string;
  item_count: number;
  /** 첫 묵상 항목 제목 (목록 미리보기) */
  preview_title: string | null;
  /** 첫 항목 성경 구절 */
  preview_verse: string | null;
  /** 첫 항목 내용 일부 */
  preview_excerpt: string | null;
}

function excerptMeditationContent(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max)}…`;
}

type NestedMeditationDayRow = {
  id: string;
  meditation_date: string;
  meditation_items: {
    verse_reference: string;
    title: string;
    content: string;
    sort_order: number;
  }[];
};

export async function listMeditationDays(): Promise<MeditationDayListItem[]> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return [];
  }

  const { data: rows, error } = await supabase
    .from('meditation_days')
    .select('id, meditation_date, meditation_items(verse_reference, title, content, sort_order)')
    .eq('user_id', user.id)
    .order('meditation_date', { ascending: false, nullsFirst: false });

  if (error || !rows) {
    return [];
  }

  return (rows as NestedMeditationDayRow[]).map((d) => {
    const items = [...(d.meditation_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const first = items[0];
    const ymd = displayYmdFromDb(d.meditation_date) || d.meditation_date;
    return {
      id: d.id,
      meditation_date: ymd,
      item_count: items.length,
      preview_title: first?.title ?? null,
      preview_verse: first?.verse_reference ?? null,
      preview_excerpt: first?.content ? excerptMeditationContent(first.content, 140) : null,
    };
  });
}

export async function getMeditationDay(dayId: string): Promise<MeditationDayDetail | null> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return null;
  }

  const { data: dayRow, error: dayError } = await supabase
    .from('meditation_days')
    .select('id, meditation_date, user_id')
    .eq('id', dayId)
    .maybeSingle();

  const day = dayRow as { id: string; meditation_date: string; user_id: string } | null;

  if (dayError || !day || day.user_id !== user.id) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from('meditation_items')
    .select('category_type, verse_reference, title, content, sort_order')
    .eq('day_id', dayId)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (itemsError || !items?.length) {
    return null;
  }

  const itemRows = items as {
    category_type: MeditationCategoryType;
    verse_reference: string;
    title: string;
    content: string;
  }[];

  const parsedItems = itemRows.map((i) => ({
    category_type: i.category_type,
    verse_reference: i.verse_reference,
    title: i.title,
    content: i.content,
  }));

  const ymd = displayYmdFromDb(day.meditation_date) || day.meditation_date;
  return {
    id: day.id,
    meditation_date: ymd,
    items: parsedItems,
  };
}

export async function createMeditation(
  _prev: MeditationActionState | null,
  input: unknown,
): Promise<MeditationActionState> {
  const parsed = meditationFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: '입력값을 확인해 주세요.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const { meditation_date, items } = parsed.data;

  const { data: existing } = await supabase
    .from('meditation_days')
    .select('id')
    .eq('user_id', user.id)
    .eq('meditation_date', meditation_date)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: '이미 해당 날짜에 묵상이 있습니다. 날짜를 바꾸거나 기존 기록을 수정해 주세요.',
    };
  }

  const { data: insertedDay, error: dayError } = await supabase
    .from('meditation_days')
    .insert({ user_id: user.id, meditation_date })
    .select('id')
    .single();

  if (dayError || !insertedDay) {
    return { success: false, error: mapDbError(dayError) };
  }

  const rows = items.map((item, index) => ({
    day_id: insertedDay.id,
    user_id: user.id,
    category_type: item.category_type,
    verse_reference: item.verse_reference,
    title: item.title,
    content: item.content,
    sort_order: index + 1,
  }));

  const { error: itemsError } = await supabase.from('meditation_items').insert(rows);

  if (itemsError) {
    await supabase.from('meditation_days').delete().eq('id', insertedDay.id);
    return { success: false, error: mapDbError(itemsError) };
  }

  revalidatePath('/meditation');
  revalidatePath('/');
  redirect(`/meditation/${insertedDay.id}`);
}

export async function updateMeditation(
  dayId: string,
  _prev: MeditationActionState | null,
  input: unknown,
): Promise<MeditationActionState> {
  const parsed = meditationFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: '입력값을 확인해 주세요.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const { items } = parsed.data;
  const meditation_date =
    displayYmdFromDb(parsed.data.meditation_date) || toDateInputValue(parsed.data.meditation_date);
  if (!meditation_date) {
    return {
      success: false,
      error: '날짜를 확인해 주세요.',
      fieldErrors: { meditation_date: ['날짜를 선택해 주세요.'] },
    };
  }

  const { data: day, error: dayFetchError } = await supabase
    .from('meditation_days')
    .select('id, user_id')
    .eq('id', dayId)
    .maybeSingle();

  if (dayFetchError || !day || day.user_id !== user.id) {
    return { success: false, error: '묵상을 찾을 수 없습니다.' };
  }

  const { data: conflict } = await supabase
    .from('meditation_days')
    .select('id')
    .eq('user_id', user.id)
    .eq('meditation_date', meditation_date)
    .neq('id', dayId)
    .maybeSingle();

  if (conflict) {
    return { success: false, error: '다른 기록이 이미 같은 날짜를 사용 중입니다.' };
  }

  const { error: updateDayError } = await supabase
    .from('meditation_days')
    .update({ meditation_date })
    .eq('id', dayId)
    .eq('user_id', user.id);

  if (updateDayError) {
    return { success: false, error: mapDbError(updateDayError) };
  }

  const { error: deleteError } = await supabase
    .from('meditation_items')
    .delete()
    .eq('day_id', dayId)
    .eq('user_id', user.id);

  if (deleteError) {
    return { success: false, error: mapDbError(deleteError) };
  }

  const rows = items.map((item, index) => ({
    day_id: dayId,
    user_id: user.id,
    category_type: item.category_type,
    verse_reference: item.verse_reference,
    title: item.title,
    content: item.content,
    sort_order: index + 1,
  }));

  const { error: insertError } = await supabase.from('meditation_items').insert(rows);

  if (insertError) {
    return { success: false, error: mapDbError(insertError) };
  }

  revalidatePath('/meditation');
  revalidatePath('/');
  revalidatePath(`/meditation/${dayId}`);
  revalidatePath(`/meditation/${dayId}/edit`);
  return { success: true, message: '저장되었습니다.' };
}

export async function submitMeditationForm(
  prev: MeditationActionState | null,
  formData: FormData,
): Promise<MeditationActionState> {
  const mode = String(formData.get('_mode') ?? 'create');
  const dayId = String(formData.get('_dayId') ?? '');
  const raw = String(formData.get('_payload') ?? '{}');
  const merged = mergePayloadDateFromFormData(formData, raw, 'meditation_date');
  if (!merged.ok) {
    return { success: false, error: '요청 형식이 올바르지 않습니다.' };
  }
  const parsedJson = merged.payload;

  if (mode === 'edit') {
    if (!dayId) {
      return { success: false, error: '수정할 기록을 찾을 수 없습니다.' };
    }
    return updateMeditation(dayId, prev, parsedJson);
  }

  return createMeditation(prev, parsedJson);
}

export async function deleteMeditation(dayId: string): Promise<MeditationActionState> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const { error } = await supabase.from('meditation_days').delete().eq('id', dayId).eq('user_id', user.id);

  if (error) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/meditation');
  revalidatePath('/');
  return { success: true };
}
