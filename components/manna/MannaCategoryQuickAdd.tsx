'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { MannaActionState } from '@/app/actions/manna';
import { createMannaCategory } from '@/app/actions/manna';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MannaCategoryQuickAddProps {
  onSuccess?: (newCategoryId: string) => void;
  /** chip: 필터 줄 + 버튼 / inline: 폼 옆 설명형 */
  variant?: 'chip' | 'inline';
  className?: string;
}

export function MannaCategoryQuickAdd({
  onSuccess,
  variant = 'chip',
  className,
}: MannaCategoryQuickAddProps): ReactElement {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const lastStateKey = useRef('');
  const [state, formAction, pending] = useActionState(createMannaCategory, null as MannaActionState | null);

  useEffect(() => {
    if (!state) return;
    const key = JSON.stringify(state);
    if (lastStateKey.current === key) return;
    lastStateKey.current = key;

    if (state.success) {
      const id = state.newCategoryId;
      if (state.message) {
        toast.success(state.message);
      }
      if (id) {
        onSuccess?.(id);
      }
      setName('');
      setOpen(false);
      router.refresh();
      return;
    }
    toast.error(state.error);
  }, [state, onSuccess, router]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = panelRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const chipBase =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm transition-colors';
  const chipIdle = 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]/40';

  const submitAdd = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    const fd = new FormData();
    fd.set('name', trimmed);
    startTransition(() => {
      formAction(fd);
    });
  }, [name, pending, formAction]);

  return (
    <div ref={panelRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        className={cn(
          variant === 'chip' ? cn(chipBase, chipIdle, open && 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30') : undefined,
          variant === 'inline' &&
            'inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--foreground)]/25 hover:text-[var(--foreground)]',
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Plus className={cn(variant === 'chip' ? 'h-4 w-4' : 'h-4 w-4')} aria-hidden />
        {variant === 'inline' ? <span>새 카테고리</span> : null}
      </button>

      {open ? (
        <div
          className={cn(
            'absolute z-20 mt-1 min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-md',
            variant === 'chip' ? 'left-0 top-full' : 'left-0 top-full sm:left-auto sm:right-0',
          )}
          role="dialog"
          aria-label="새 카테고리 추가"
        >
          <div className="flex flex-col gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitAdd();
                }
              }}
              placeholder="예: 평안"
              disabled={pending}
              autoFocus
              maxLength={40}
              aria-label="카테고리 이름"
            />
            <Button
              type="button"
              className="h-9 px-3 py-1.5 text-xs"
              disabled={pending || !name.trim()}
              onClick={submitAdd}
            >
              {pending ? '추가 중…' : '추가'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
