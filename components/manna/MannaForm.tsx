'use client';

import type { ReactElement } from 'react';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { MannaActionState, MannaCategoryRow } from '@/app/actions/manna';
import { submitMannaEntryForm } from '@/app/actions/manna';
import { BibleVersePickerKRV } from '@/components/bible/bible-verse-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTodayLocalDateString } from '@/lib/date';
import { cn } from '@/lib/utils';

interface MannaFormProps {
  mode: 'create' | 'edit';
  entryId?: string;
  categories: MannaCategoryRow[];
  initialValues?: {
    entry_date: string;
    verse_reference: string;
    verse_text: string;
    category_id: string;
    note?: string | null;
  };
}

export function MannaForm({ mode, entryId, categories, initialValues }: MannaFormProps): ReactElement {
  const router = useRouter();
  const [entryDate, setEntryDate] = useState(initialValues?.entry_date ?? getTodayLocalDateString());
  const [verseReference, setVerseReference] = useState(initialValues?.verse_reference ?? '');
  const [verseText, setVerseText] = useState(initialValues?.verse_text ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? categories[0]?.id ?? '');
  const [note, setNote] = useState(initialValues?.note ?? '');

  const payloadString = useMemo(
    () =>
      JSON.stringify({
        entry_date: entryDate,
        verse_reference: verseReference,
        verse_text: verseText,
        category_id: categoryId,
        note,
      }),
    [entryDate, verseReference, verseText, categoryId, note],
  );

  const [state, formAction, pending] = useActionState(submitMannaEntryForm, null as MannaActionState | null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.success && state.message) {
      toast.success(state.message);
      if (mode === 'edit') {
        router.refresh();
      }
    }
    if (!state.success) {
      toast.error(state.error);
    }
  }, [state, mode, router]);

  const entryDateErr = state?.success === false ? state.fieldErrors?.entry_date?.[0] : undefined;
  const verseRefErr = state?.success === false ? state.fieldErrors?.verse_reference?.[0] : undefined;
  const verseTextErr = state?.success === false ? state.fieldErrors?.verse_text?.[0] : undefined;
  const categoryErr = state?.success === false ? state.fieldErrors?.category_id?.[0] : undefined;
  const noteErr = state?.success === false ? state.fieldErrors?.note?.[0] : undefined;

  return (
    <form className="mx-auto flex max-w-2xl flex-col gap-6" action={formAction}>
      <input type="hidden" name="_mode" value={mode} />
      {mode === 'edit' && entryId ? <input type="hidden" name="_entryId" value={entryId} /> : null}
      <input type="hidden" name="_payload" value={payloadString} />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{mode === 'create' ? '말씀 추가' : '말씀 수정'}</h2>
        <p className="text-sm text-[var(--muted)]">
          개역개정 성경 구절을 선택하거나 직접 입력하고, 본문과 카테고리를 입력합니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manna_entry_date">날짜</Label>
        <Input
          id="manna_entry_date"
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          required
          aria-invalid={Boolean(entryDateErr)}
        />
        {entryDateErr ? <p className="text-sm text-red-600">{entryDateErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>성경 구절</Label>
        <BibleVersePickerKRV value={verseReference} onChange={setVerseReference} />
        {verseRefErr ? <p className="text-sm text-red-600">{verseRefErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="verse_text">말씀 본문</Label>
        <Textarea
          id="verse_text"
          value={verseText}
          onChange={(e) => setVerseText(e.target.value)}
          className="min-h-[120px] resize-y"
          aria-invalid={Boolean(verseTextErr)}
        />
        {verseTextErr ? <p className="text-sm text-red-600">{verseTextErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">카테고리</Label>
        <select
          id="category_id"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={cn(
            'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm',
            categoryErr && 'border-red-500',
          )}
          aria-invalid={Boolean(categoryErr)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {categoryErr ? <p className="text-sm text-red-600">{categoryErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">메모 (선택)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[80px] resize-y"
          aria-invalid={Boolean(noteErr)}
        />
        {noteErr ? <p className="text-sm text-red-600">{noteErr}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
