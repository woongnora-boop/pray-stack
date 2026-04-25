'use client';

import type { ReactElement } from 'react';
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { MannaActionState, MannaCategoryRow } from '@/app/actions/manna';
import { submitMannaEntryForm } from '@/app/actions/manna';
import { BibleChapterViewer } from '@/components/bible/BibleChapterViewer';
import { BibleVersePickerKRV } from '@/components/bible/bible-verse-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { displayYmdFromDb, getTodayLocalDateString, seoulYmdNow, toDateInputValue } from '@/lib/date';
import { getMannaCategoryTokens } from '@/lib/manna-category-styles';
import { cn } from '@/lib/utils';

import { MannaCategoryQuickAdd } from './MannaCategoryQuickAdd';

interface MannaFormProps {
  mode: 'create' | 'edit';
  entryId?: string;
  /** 신규 작성: 말씀 일자 기본값(페이지 렌더 시각의 서울 당일). 입력 시각(`created_at`)과 별개 필드. */
  defaultEntryDateYmd?: string;
  categories: MannaCategoryRow[];
  initialValues?: {
    entry_date: string;
    verse_reference: string;
    verse_text: string;
    category_id: string;
    note?: string | null;
  };
}

export function MannaForm({ mode, entryId, defaultEntryDateYmd, categories, initialValues }: MannaFormProps): ReactElement {
  const router = useRouter();
  const [entryDate, setEntryDate] = useState(() => {
    const ymd = toDateInputValue(initialValues?.entry_date);
    if (ymd) return ymd;
    if (mode === 'create') {
      const serverDefault = toDateInputValue(defaultEntryDateYmd);
      if (serverDefault) return serverDefault;
      return seoulYmdNow() || getTodayLocalDateString();
    }
    return '';
  });
  const [verseReference, setVerseReference] = useState(initialValues?.verse_reference ?? '');
  const [verseText, setVerseText] = useState(initialValues?.verse_text ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? categories[0]?.id ?? '');
  const [note, setNote] = useState(initialValues?.note ?? '');

  const payloadString = useMemo(
    () =>
      JSON.stringify({
        entry_date: toDateInputValue(entryDate) || entryDate,
        verse_reference: verseReference,
        verse_text: verseText,
        category_id: categoryId,
        note,
      }),
    [entryDate, verseReference, verseText, categoryId, note],
  );

  const verseRefRef = useRef(verseReference);
  verseRefRef.current = verseReference;
  const verseTextRef = useRef(verseText);
  verseTextRef.current = verseText;
  const categoryIdRef = useRef(categoryId);
  categoryIdRef.current = categoryId;
  const noteRef = useRef(note);
  noteRef.current = note;

  const entryDateRef = useRef(entryDate);
  entryDateRef.current = entryDate;

  const boundSubmit = useCallback(async (prev: MannaActionState | null, formData: FormData) => {
    const fromRef = toDateInputValue(entryDateRef.current);
    const rawForm =
      typeof formData.get('entry_date') === 'string' ? toDateInputValue(String(formData.get('entry_date')).trim()) : '';
    const entryYmd =
      displayYmdFromDb(fromRef || rawForm) || fromRef || rawForm || toDateInputValue(entryDateRef.current);

    const payloadObj = {
      entry_date: entryYmd || '',
      verse_reference: verseRefRef.current,
      verse_text: verseTextRef.current,
      category_id: categoryIdRef.current,
      note: noteRef.current ?? '',
    };

    const fd = new FormData();
    fd.set('_mode', String(formData.get('_mode') ?? ''));
    const eid = formData.get('_entryId');
    if (eid != null) fd.set('_entryId', String(eid));
    if (entryYmd) {
      fd.set('entry_date', entryYmd);
    }
    fd.set('_payload', JSON.stringify(payloadObj));
    return submitMannaEntryForm(prev, fd);
  }, []);

  const [state, formAction, pending] = useActionState(boundSubmit, null as MannaActionState | null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.success) {
      if (state.message) {
        toast.success(state.message);
      }
      if (mode === 'edit' && entryId) {
        router.refresh();
        router.push(`/manna/${entryId}`);
      }
      return;
    }
    toast.error(state.error);
  }, [state, mode, router, entryId]);

  const entryDateErr = state?.success === false ? state.fieldErrors?.entry_date?.[0] : undefined;
  const verseRefErr = state?.success === false ? state.fieldErrors?.verse_reference?.[0] : undefined;
  const verseTextErr = state?.success === false ? state.fieldErrors?.verse_text?.[0] : undefined;
  const categoryErr = state?.success === false ? state.fieldErrors?.category_id?.[0] : undefined;
  const noteErr = state?.success === false ? state.fieldErrors?.note?.[0] : undefined;

  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);
  const categoryAccent = selectedCategory
    ? getMannaCategoryTokens(selectedCategory.id, selectedCategory.name).solid
    : undefined;

  return (
    <form className="mx-auto flex max-w-2xl flex-col gap-6" action={formAction}>
      <input type="hidden" name="_mode" value={mode} />
      {mode === 'edit' && entryId ? <input type="hidden" name="_entryId" value={entryId} /> : null}
      <input type="hidden" name="_payload" value={payloadString} />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{mode === 'create' ? '말씀 추가' : '말씀 수정'}</h2>
        <p className="text-sm text-[var(--muted)]">
          구절 참조는 개역개정 기준 선택기(`책 장:절`)로 고르거나 직접 수정할 수 있습니다. 아래 개역한글 뷰어는 그 문자열과 책·장을 맞추고, 범위가 있으면 해당 절만 본문에 넣을 수 있습니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manna_entry_date">날짜</Label>
        <Input
          id="manna_entry_date"
          name="entry_date"
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

      <BibleChapterViewer
        syncFromReference={verseReference}
        onApplyBody={(plain) => {
          setVerseText((prev) => {
            const p = prev.trim();
            return p ? `${p}\n\n${plain}` : plain;
          });
        }}
        onClearBody={() => setVerseText('')}
      />

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
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Label htmlFor="category_id">카테고리</Label>
          <MannaCategoryQuickAdd
            variant="inline"
            onSuccess={(id) => {
              if (id) setCategoryId(id);
              router.refresh();
            }}
          />
        </div>
        <div
          className={cn(
            'overflow-hidden rounded-md border bg-[var(--card)]',
            categoryErr ? 'border-red-500' : 'border-[var(--border)]',
          )}
          style={categoryAccent && !categoryErr ? { borderLeftWidth: 4, borderLeftColor: categoryAccent } : undefined}
        >
          <select
            id="category_id"
            name="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-10 w-full border-0 bg-transparent px-3 text-sm text-[var(--foreground)] outline-none ring-0 focus:ring-0"
            aria-invalid={Boolean(categoryErr)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
