'use client';

import type { ReactElement } from 'react';
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { GratitudeActionState } from '@/app/actions/gratitude';
import { submitGratitudeNoteForm } from '@/app/actions/gratitude';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { displayYmdFromDb, getTodayLocalDateString, seoulYmdNow, toDateInputValue } from '@/lib/date';
import type { GratitudeNoteFormValues } from '@/lib/validations/gratitude';

interface GratitudeFormProps {
  mode: 'create' | 'edit';
  noteId?: string;
  initialValues?: GratitudeNoteFormValues;
}

export function GratitudeForm({ mode, noteId, initialValues }: GratitudeFormProps): ReactElement {
  const router = useRouter();
  const [noteDate, setNoteDate] = useState(() => {
    const ymd = toDateInputValue(initialValues?.note_date);
    if (ymd) return ymd;
    return mode === 'create' ? seoulYmdNow() || getTodayLocalDateString() : '';
  });
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');

  const payloadString = useMemo(
    () =>
      JSON.stringify({
        note_date: toDateInputValue(noteDate) || noteDate,
        title,
        content,
      } satisfies GratitudeNoteFormValues),
    [noteDate, title, content],
  );

  const noteDateRef = useRef(noteDate);
  noteDateRef.current = noteDate;
  const titleRef = useRef(title);
  titleRef.current = title;
  const contentRef = useRef(content);
  contentRef.current = content;

  const boundSubmit = useCallback(async (prev: GratitudeActionState | null, formData: FormData) => {
    const fromRef = toDateInputValue(noteDateRef.current);
    const rawForm =
      typeof formData.get('note_date') === 'string' ? toDateInputValue(String(formData.get('note_date')).trim()) : '';
    const noteYmd = displayYmdFromDb(fromRef || rawForm) || fromRef || rawForm;

    const payloadObj = {
      note_date: noteYmd,
      title: titleRef.current,
      content: contentRef.current,
    };

    const fd = new FormData();
    fd.set('_mode', String(formData.get('_mode') ?? ''));
    const nid = formData.get('_noteId');
    if (nid != null) fd.set('_noteId', String(nid));
    if (noteYmd) {
      fd.set('note_date', noteYmd);
    }
    fd.set('_payload', JSON.stringify(payloadObj));
    return submitGratitudeNoteForm(prev, fd);
  }, []);

  const [state, formAction, pending] = useActionState(boundSubmit, null as GratitudeActionState | null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.success) {
      if (state.message) {
        toast.success(state.message);
      }
      if (mode === 'edit' && noteId) {
        router.refresh();
        router.push(`/gratitude/${noteId}`);
      }
      return;
    }
    toast.error(state.error);
  }, [state, mode, router, noteId]);

  const dateErr = state?.success === false ? state.fieldErrors?.note_date?.[0] : undefined;
  const titleErr = state?.success === false ? state.fieldErrors?.title?.[0] : undefined;
  const contentErr = state?.success === false ? state.fieldErrors?.content?.[0] : undefined;

  return (
    <form className="mx-auto flex max-w-2xl flex-col gap-6" action={formAction}>
      <input type="hidden" name="_mode" value={mode} />
      {mode === 'edit' && noteId ? <input type="hidden" name="_noteId" value={noteId} /> : null}
      <input type="hidden" name="_payload" value={payloadString} />

      <div className="space-y-2">
        <Label htmlFor="note_date">날짜</Label>
        <Input
          id="note_date"
          name="note_date"
          type="date"
          value={noteDate}
          onChange={(e) => setNoteDate(e.target.value)}
          required
          aria-invalid={Boolean(dateErr)}
        />
        {dateErr ? <p className="text-sm text-red-600">{dateErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={Boolean(titleErr)} />
        {titleErr ? <p className="text-sm text-red-600">{titleErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          aria-invalid={Boolean(contentErr)}
        />
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          무엇을 써야 할지 모르겠다면 →
          <br />
          오늘 감사했던 일, 오늘 나에게 잘해준 사람, 오늘 기억하고 싶은 은혜를 떠올려 보세요.
        </p>
        {contentErr ? <p className="text-sm text-red-600">{contentErr}</p> : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? '저장 중…' : '저장'}
      </Button>
    </form>
  );
}
