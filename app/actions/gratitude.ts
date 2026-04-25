'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { displayYmdFromDb, toDateInputValue } from '@/lib/date';
import { mergePayloadDateFromFormData } from '@/lib/form-merge-payload';
import { getServerAuth } from '@/lib/supabase/request-session';
import { gratitudeNoteFormSchema, type GratitudeNoteFormValues } from '@/lib/validations/gratitude';

export type GratitudeActionState =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export interface GratitudeNoteListItem {
  id: string;
  note_date: string;
  title: string;
  content: string;
  created_at: string;
}

export type GratitudeNoteDetail = GratitudeNoteFormValues & {
  id: string;
  created_at: string;
  updated_at: string;
};

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

export async function listGratitudeNotes(): Promise<GratitudeNoteListItem[]> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('gratitude_notes')
    .select('id, note_date, title, content, created_at')
    .eq('user_id', user.id)
    .order('note_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as GratitudeNoteListItem[]).map((row) => ({
    ...row,
    note_date: displayYmdFromDb(row.note_date) || row.note_date,
  }));
}

export async function getGratitudeNote(noteId: string): Promise<GratitudeNoteDetail | null> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return null;
  }

  const { data: row, error } = await supabase
    .from('gratitude_notes')
    .select('id, note_date, title, content, created_at, updated_at')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const typed = row as GratitudeNoteDetail;
  return {
    ...typed,
    note_date: displayYmdFromDb(typed.note_date) || typed.note_date,
  };
}

export async function createGratitudeNote(
  _prev: GratitudeActionState | null,
  input: unknown,
): Promise<GratitudeActionState> {
  const parsed = gratitudeNoteFormSchema.safeParse(input);
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

  const { data: inserted, error } = await supabase
    .from('gratitude_notes')
    .insert({
      user_id: user.id,
      note_date: parsed.data.note_date,
      title: parsed.data.title,
      content: parsed.data.content,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/gratitude');
  revalidatePath('/');
  redirect(`/gratitude/${(inserted as { id: string }).id}`);
}

export async function updateGratitudeNote(
  noteId: string,
  _prev: GratitudeActionState | null,
  input: unknown,
): Promise<GratitudeActionState> {
  const parsed = gratitudeNoteFormSchema.safeParse(input);
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

  const { data: existing, error: fetchError } = await supabase
    .from('gratitude_notes')
    .select('id')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: '기록을 찾을 수 없습니다.' };
  }

  const note_date =
    displayYmdFromDb(parsed.data.note_date) || toDateInputValue(parsed.data.note_date);
  if (!note_date) {
    return {
      success: false,
      error: '날짜를 확인해 주세요.',
      fieldErrors: { note_date: ['날짜를 선택해 주세요.'] },
    };
  }

  const { error } = await supabase
    .from('gratitude_notes')
    .update({
      note_date,
      title: parsed.data.title,
      content: parsed.data.content,
    })
    .eq('id', noteId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/gratitude');
  revalidatePath('/');
  revalidatePath(`/gratitude/${noteId}`);
  revalidatePath(`/gratitude/${noteId}/edit`);
  return { success: true, message: '저장되었습니다.' };
}

export async function deleteGratitudeNote(noteId: string): Promise<GratitudeActionState> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const { error } = await supabase.from('gratitude_notes').delete().eq('id', noteId).eq('user_id', user.id);

  if (error) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/gratitude');
  revalidatePath('/');
  return { success: true };
}

export async function submitGratitudeNoteForm(
  prev: GratitudeActionState | null,
  formData: FormData,
): Promise<GratitudeActionState> {
  const mode = String(formData.get('_mode') ?? 'create');
  const noteId = String(formData.get('_noteId') ?? '');
  const raw = String(formData.get('_payload') ?? '{}');
  const merged = mergePayloadDateFromFormData(formData, raw, 'note_date');
  if (!merged.ok) {
    return { success: false, error: '요청 형식이 올바르지 않습니다.' };
  }
  const parsedJson = merged.payload;

  if (mode === 'edit') {
    if (!noteId) {
      return { success: false, error: '수정할 기록을 찾을 수 없습니다.' };
    }
    return updateGratitudeNote(noteId, prev, parsedJson);
  }

  return createGratitudeNote(prev, parsedJson);
}
