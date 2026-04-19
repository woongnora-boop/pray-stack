'use client';

import type { ReactElement } from 'react';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import type { MannaActionState } from '@/app/actions/manna';
import { createMannaCategory } from '@/app/actions/manna';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddCategoryForm(): ReactElement {
  const [state, formAction, pending] = useActionState(createMannaCategory, null as MannaActionState | null);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.success && state.message) {
      toast.success(state.message);
    }
    if (!state.success) {
      toast.error(state.error);
    }
  }, [state]);

  const nameErr = state?.success === false ? state.fieldErrors?.name?.[0] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="category_name">새 카테고리</Label>
        <Input id="category_name" name="name" placeholder="예: 평안" disabled={pending} aria-invalid={Boolean(nameErr)} />
        {nameErr ? <p className="text-sm text-red-600">{nameErr}</p> : null}
      </div>
      <Button type="submit" variant="outline" disabled={pending} className="shrink-0">
        {pending ? '추가 중…' : '추가'}
      </Button>
    </form>
  );
}
