'use client';

import type { ReactElement } from 'react';
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { MeditationActionState } from '@/app/actions/meditation';
import { submitMeditationForm } from '@/app/actions/meditation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { displayYmdFromDb, getTodayLocalDateString, seoulYmdNow, toDateInputValue } from '@/lib/date';
import type { MeditationFormValues } from '@/lib/validations/meditation';

import { MeditationItemBlock, type MeditationItemBlockValue } from './MeditationItemBlock';

const emptyItem = (): MeditationItemBlockValue => ({
  category_type: 'sermon',
  verse_reference: '',
  title: '',
  content: '',
  paragraph_highlights: {},
});

interface MeditationFormProps {
  mode: 'create' | 'edit';
  dayId?: string;
  initialValues?: MeditationFormValues;
}

export function MeditationForm({ mode, dayId, initialValues }: MeditationFormProps): ReactElement {
  const router = useRouter();
  const initialItems = useMemo(() => {
    if (initialValues?.items?.length) {
      return initialValues.items.map((i) => ({
        ...i,
        paragraph_highlights: i.paragraph_highlights ?? {},
      }));
    }
    return [emptyItem()];
  }, [initialValues]);

  const [meditationDate, setMeditationDate] = useState(() => {
    const ymd = toDateInputValue(initialValues?.meditation_date);
    if (ymd) return ymd;
    return mode === 'create' ? seoulYmdNow() || getTodayLocalDateString() : '';
  });
  const [items, setItems] = useState<MeditationItemBlockValue[]>(initialItems);

  const payloadString = useMemo(
    () =>
      JSON.stringify({
        meditation_date: toDateInputValue(meditationDate) || meditationDate,
        items,
      } satisfies MeditationFormValues),
    [meditationDate, items],
  );

  const meditationDateRef = useRef(meditationDate);
  meditationDateRef.current = meditationDate;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const boundSubmit = useCallback(async (prev: MeditationActionState | null, formData: FormData) => {
    const fromRef = toDateInputValue(meditationDateRef.current);
    const rawForm =
      typeof formData.get('meditation_date') === 'string'
        ? toDateInputValue(String(formData.get('meditation_date')).trim())
        : '';
    const medYmd = displayYmdFromDb(fromRef || rawForm) || fromRef || rawForm;

    const payloadObj = {
      meditation_date: medYmd,
      items: itemsRef.current.map((i) => ({ ...i })),
    };

    const fd = new FormData();
    fd.set('_mode', String(formData.get('_mode') ?? ''));
    const did = formData.get('_dayId');
    if (did != null) fd.set('_dayId', String(did));
    if (medYmd) {
      fd.set('meditation_date', medYmd);
    }
    fd.set('_payload', JSON.stringify(payloadObj));
    return submitMeditationForm(prev, fd);
  }, []);

  const [state, formAction, pending] = useActionState(boundSubmit, null as MeditationActionState | null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.success) {
      if (state.message) {
        toast.success(state.message);
      }
      if (mode === 'edit' && dayId) {
        router.refresh();
        router.push(`/meditation/${dayId}`);
      }
      return;
    }
    toast.error(state.error);
  }, [state, mode, router, dayId]);

  const meditationDateError = state?.success === false ? state.fieldErrors?.meditation_date?.[0] : undefined;

  return (
    <form className="mx-auto flex max-w-2xl flex-col gap-6" action={formAction}>
      <input type="hidden" name="_mode" value={mode} />
      {mode === 'edit' && dayId ? <input type="hidden" name="_dayId" value={dayId} /> : null}
      <input type="hidden" name="_payload" value={payloadString} />

      <div className="space-y-2">
        <Label htmlFor="meditation_date">날짜</Label>
        <Input
          id="meditation_date"
          name="meditation_date"
          type="date"
          value={meditationDate}
          onChange={(e) => setMeditationDate(e.target.value)}
          required
          aria-invalid={Boolean(meditationDateError)}
        />
        {meditationDateError ? <p className="text-sm text-red-600">{meditationDateError}</p> : null}
        {state?.success === false && state.fieldErrors?.items?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.items[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <MeditationItemBlock
            key={index}
            index={index}
            value={item}
            onChange={(next) => {
              setItems((prev) => prev.map((p, i) => (i === index ? next : p)));
            }}
            canRemove={items.length > 1}
            onRemove={() => {
              setItems((prev) => prev.filter((_, i) => i !== index));
            }}
            fieldErrors={state?.success === false ? state.fieldErrors : undefined}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={items.length >= 5 || pending}
          onClick={() => {
            setItems((prev) => [...prev, emptyItem()]);
          }}
        >
          + 묵상 항목 추가
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
