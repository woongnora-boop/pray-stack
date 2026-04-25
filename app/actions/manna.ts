'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { displayYmdFromDb, seoulYmdFromIso, seoulYmdNow, toDateInputValue } from '@/lib/date';
import { mergePayloadDateFromFormData } from '@/lib/form-merge-payload';
import { getServerAuth, getServerSupabase } from '@/lib/supabase/request-session';
import {
  mannaCategoryNameSchema,
  mannaEntryFormSchema,
  type MannaEntryFormValues,
} from '@/lib/validations/manna';

export type MannaActionState =
  | { success: true; message?: string; newCategoryId?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export interface MannaCategoryRow {
  id: string;
  name: string;
  is_default: boolean;
  sort_order: number;
}

export interface MannaEntryListItem {
  id: string;
  verse_reference: string;
  verse_text: string;
  note: string | null;
  category_id: string;
  category_name: string;
  entry_date: string;
  created_at: string;
}

export type MannaEntryDetail = MannaEntryFormValues & {
  id: string;
  created_at: string;
  updated_at: string;
  category_name: string;
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

/** Supabase에 `entry_date` 컬럼이 아직 없을 때 나는 오류 (목록이 비어 보이는 원인) */
function isMissingEntryDateColumnError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  if (msg.includes('entry_date') && (msg.includes('does not exist') || msg.includes('could not find'))) {
    return true;
  }
  if (msg.includes('entry_date') && msg.includes('schema cache')) return true;
  if (error.code === '42703') return true;
  return false;
}

/**
 * 표시·폼용 말씀 일자(`entry_date`). DB에만 있고 `created_at`(입력 시각)과는 별개입니다.
 * 예전에 `entry_date`가 비어 있던 행만, 서울 달력 기준으로 `created_at`에서 추정합니다.
 */
function entryDateFromRow(row: { entry_date?: string | null; created_at: string }): string {
  const fromCol = row.entry_date?.trim();
  if (fromCol) {
    const ymd = displayYmdFromDb(fromCol);
    if (ymd) return ymd;
  }
  return seoulYmdFromIso(row.created_at) || row.created_at.slice(0, 10);
}

/** 신규 작성: 비어 있거나 파싱 실패 시 서울 당일. */
function resolveMannaEntryDateYmdForCreate(entryDateFromForm: string): string {
  return displayYmdFromDb(entryDateFromForm) || toDateInputValue(entryDateFromForm) || seoulYmdNow();
}

type MannaListRow = {
  id: string;
  verse_reference: string;
  verse_text: string;
  note: string | null;
  category_id: string;
  created_at: string;
  entry_date?: string;
};

type MannaDetailRow = {
  id: string;
  verse_reference: string;
  verse_text: string;
  note: string | null;
  category_id: string;
  entry_date?: string;
  created_at: string;
  updated_at: string;
};

async function assertCategoryOwnedByUser(userId: string, categoryId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('manna_categories')
    .select('id')
    .eq('id', categoryId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}

function categoryNameFromJoin(row: { manna_categories?: { name: string } | { name: string }[] | null }): string {
  const c = row.manna_categories;
  if (!c) return '';
  return (Array.isArray(c) ? c[0]?.name : c.name) ?? '';
}

export async function listMannaCategories(): Promise<MannaCategoryRow[]> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('manna_categories')
    .select('id, name, is_default, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as MannaCategoryRow[];
}

export async function listMannaEntries(filterCategoryId: string | null): Promise<MannaEntryListItem[]> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return [];
  }

  const mapJoinedRows = (
    rows: (MannaListRow & { manna_categories?: { name: string } | { name: string }[] | null })[],
  ): MannaEntryListItem[] =>
    rows.map((r) => ({
      id: r.id,
      verse_reference: r.verse_reference,
      verse_text: r.verse_text,
      note: r.note,
      category_id: r.category_id,
      created_at: r.created_at,
      entry_date: entryDateFromRow(r),
      category_name: categoryNameFromJoin(r),
    }));

  let query = supabase
    .from('manna_entries')
    .select('id, verse_reference, verse_text, note, category_id, entry_date, created_at, manna_categories(name)')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (filterCategoryId) {
    query = query.eq('category_id', filterCategoryId);
  }

  const { data: rows, error } = await query;

  if (!error && rows) {
    return mapJoinedRows(rows as (MannaListRow & { manna_categories?: { name: string } | { name: string }[] | null })[]);
  }

  if (error && !isMissingEntryDateColumnError(error)) {
    return [];
  }

  let q2 = supabase
    .from('manna_entries')
    .select('id, verse_reference, verse_text, note, category_id, created_at, manna_categories(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filterCategoryId) {
    q2 = q2.eq('category_id', filterCategoryId);
  }

  const { data: rows2, error: err2 } = await q2;

  if (err2 || !rows2) {
    return [];
  }

  return mapJoinedRows(rows2 as (MannaListRow & { manna_categories?: { name: string } | { name: string }[] | null })[]);
}

/** 홈 피드용: `entry_date` 컬럼 유무와 관계없이 최신 1건 (카테고리명은 조인으로 한 번에 조회) */
export async function getLatestMannaEntryForHome(): Promise<MannaEntryListItem | null> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return null;
  }

  const q1 = await supabase
    .from('manna_entries')
    .select('id, verse_reference, verse_text, note, category_id, created_at, entry_date, manna_categories(name)')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!q1.error && q1.data) {
    const r = q1.data as MannaListRow & { manna_categories?: { name: string } | { name: string }[] | null };
    return {
      id: r.id,
      verse_reference: r.verse_reference,
      verse_text: r.verse_text,
      note: r.note,
      category_id: r.category_id,
      created_at: r.created_at,
      entry_date: entryDateFromRow(r),
      category_name: categoryNameFromJoin(r),
    };
  }

  if (q1.error && !isMissingEntryDateColumnError(q1.error)) {
    return null;
  }

  const q2 = await supabase
    .from('manna_entries')
    .select('id, verse_reference, verse_text, note, category_id, created_at, manna_categories(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (q2.error || !q2.data) {
    return null;
  }

  const r = q2.data as MannaListRow & { manna_categories?: { name: string } | { name: string }[] | null };
  return {
    id: r.id,
    verse_reference: r.verse_reference,
    verse_text: r.verse_text,
    note: r.note,
    category_id: r.category_id,
    created_at: r.created_at,
    entry_date: entryDateFromRow(r),
    category_name: categoryNameFromJoin(r),
  };
}

export async function getMannaEntry(entryId: string): Promise<MannaEntryDetail | null> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return null;
  }

  let row: (MannaDetailRow & { manna_categories?: { name: string } | { name: string }[] | null }) | null = null;

  const primary = await supabase
    .from('manna_entries')
    .select(
      'id, verse_reference, verse_text, note, category_id, entry_date, created_at, updated_at, manna_categories(name)',
    )
    .eq('id', entryId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!primary.error && primary.data) {
    row = primary.data as MannaDetailRow & { manna_categories?: { name: string } | { name: string }[] | null };
  } else if (primary.error && isMissingEntryDateColumnError(primary.error)) {
    const fb = await supabase
      .from('manna_entries')
      .select(
        'id, verse_reference, verse_text, note, category_id, created_at, updated_at, manna_categories(name)',
      )
      .eq('id', entryId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!fb.error && fb.data) {
      row = fb.data as MannaDetailRow & { manna_categories?: { name: string } | { name: string }[] | null };
    }
  }

  if (!row) {
    return null;
  }

  const typed = row;
  const categoryName = categoryNameFromJoin(typed);

  return {
    id: typed.id,
    verse_reference: typed.verse_reference,
    verse_text: typed.verse_text,
    note: typed.note ?? undefined,
    category_id: typed.category_id,
    entry_date: entryDateFromRow(typed),
    created_at: typed.created_at,
    updated_at: typed.updated_at,
    category_name: categoryName,
  };
}

export async function createMannaEntry(
  _prev: MannaActionState | null,
  input: unknown,
): Promise<MannaActionState> {
  const parsed = mannaEntryFormSchema.safeParse(input);
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

  const ok = await assertCategoryOwnedByUser(user.id, parsed.data.category_id);
  if (!ok) {
    return { success: false, error: '선택한 카테고리를 사용할 수 없습니다.' };
  }

  const insertBase = {
    user_id: user.id,
    category_id: parsed.data.category_id,
    verse_reference: parsed.data.verse_reference,
    verse_text: parsed.data.verse_text,
    note: parsed.data.note ?? null,
  };

  const entryYmd = resolveMannaEntryDateYmdForCreate(parsed.data.entry_date);

  let { data: inserted, error } = await supabase
    .from('manna_entries')
    .insert({
      ...insertBase,
      entry_date: entryYmd,
    })
    .select('id')
    .single();

  if (error && isMissingEntryDateColumnError(error)) {
    const retry = await supabase.from('manna_entries').insert(insertBase).select('id').single();
    inserted = retry.data;
    error = retry.error;
  }

  if (error || !inserted) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/manna');
  revalidatePath('/');
  redirect(`/manna/${(inserted as { id: string }).id}`);
}

export async function updateMannaEntry(
  entryId: string,
  _prev: MannaActionState | null,
  input: unknown,
): Promise<MannaActionState> {
  const parsed = mannaEntryFormSchema.safeParse(input);
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
    .from('manna_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { success: false, error: '말씀을 찾을 수 없습니다.' };
  }

  const ok = await assertCategoryOwnedByUser(user.id, parsed.data.category_id);
  if (!ok) {
    return { success: false, error: '선택한 카테고리를 사용할 수 없습니다.' };
  }

  const updateBase = {
    category_id: parsed.data.category_id,
    verse_reference: parsed.data.verse_reference,
    verse_text: parsed.data.verse_text,
    note: parsed.data.note ?? null,
  };

  const entryYmd =
    displayYmdFromDb(parsed.data.entry_date) || toDateInputValue(parsed.data.entry_date);
  if (!entryYmd) {
    return {
      success: false,
      error: '날짜를 확인해 주세요.',
      fieldErrors: { entry_date: ['날짜를 선택해 주세요.'] },
    };
  }

  const { error } = await supabase
    .from('manna_entries')
    .update({
      ...updateBase,
      entry_date: entryYmd,
    })
    .eq('id', entryId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/manna');
  revalidatePath('/');
  revalidatePath(`/manna/${entryId}`);
  revalidatePath(`/manna/${entryId}/edit`);
  return { success: true, message: '저장되었습니다.' };
}

export async function deleteMannaEntry(entryId: string): Promise<MannaActionState> {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const { error } = await supabase.from('manna_entries').delete().eq('id', entryId).eq('user_id', user.id);

  if (error) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/manna');
  revalidatePath('/');
  return { success: true };
}

export async function submitMannaEntryForm(
  prev: MannaActionState | null,
  formData: FormData,
): Promise<MannaActionState> {
  const mode = String(formData.get('_mode') ?? 'create');
  const entryId = String(formData.get('_entryId') ?? '');
  const raw = String(formData.get('_payload') ?? '{}');
  const merged = mergePayloadDateFromFormData(formData, raw, 'entry_date');
  if (!merged.ok) {
    return { success: false, error: '요청 형식이 올바르지 않습니다.' };
  }
  const parsedJson = merged.payload;

  if (mode === 'edit') {
    if (!entryId) {
      return { success: false, error: '수정할 기록을 찾을 수 없습니다.' };
    }
    return updateMannaEntry(entryId, prev, parsedJson);
  }

  return createMannaEntry(prev, parsedJson);
}

export async function createMannaCategory(
  _prev: MannaActionState | null,
  formData: FormData,
): Promise<MannaActionState> {
  const parsed = mannaCategoryNameSchema.safeParse({
    name: String(formData.get('name') ?? ''),
  });
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

  const { data: maxRow } = await supabase
    .from('manna_categories')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = ((maxRow as { sort_order: number } | null)?.sort_order ?? 0) + 1;

  const { data: inserted, error } = await supabase
    .from('manna_categories')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      is_default: false,
      sort_order: nextOrder,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '이미 같은 이름의 카테고리가 있습니다.' };
    }
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/manna');
  revalidatePath('/manna/new');
  revalidatePath('/');
  return {
    success: true,
    message: '카테고리가 추가되었습니다.',
    newCategoryId: (inserted as { id: string } | null)?.id,
  };
}

export async function deleteMannaCategory(categoryId: string): Promise<MannaActionState> {
  if (!categoryId) {
    return { success: false, error: '삭제할 카테고리가 없습니다.' };
  }

  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const { data: row, error: fetchErr } = await supabase
    .from('manna_categories')
    .select('id, is_default')
    .eq('id', categoryId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr || !row) {
    return { success: false, error: '카테고리를 찾을 수 없습니다.' };
  }

  if (row.is_default) {
    return { success: false, error: '기본 카테고리는 삭제할 수 없습니다.' };
  }

  const { count, error: countErr } = await supabase
    .from('manna_entries')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('user_id', user.id);

  if (countErr) {
    return { success: false, error: mapDbError(countErr) };
  }
  if (count != null && count > 0) {
    return { success: false, error: '이 주제에 저장된 말씀이 있어 삭제할 수 없습니다.' };
  }

  const { error } = await supabase.from('manna_categories').delete().eq('id', categoryId).eq('user_id', user.id);

  if (error) {
    return { success: false, error: mapDbError(error) };
  }

  revalidatePath('/manna');
  revalidatePath('/manna/new');
  revalidatePath('/');
  return { success: true, message: '카테고리를 삭제했습니다.' };
}
