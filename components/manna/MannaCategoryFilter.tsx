'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { MannaCategoryRow } from '@/app/actions/manna';
import { deleteMannaCategory } from '@/app/actions/manna';
import { getMannaCategoryTokens } from '@/lib/manna-category-styles';
import { cn } from '@/lib/utils';

import { MannaCategoryQuickAdd } from './MannaCategoryQuickAdd';

interface MannaCategoryFilterProps {
  categories: MannaCategoryRow[];
  selectedCategoryId: string | null;
}

const allChipBase =
  'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors';

export function MannaCategoryFilter({ categories, selectedCategoryId }: MannaCategoryFilterProps): ReactElement {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const isAll = selectedCategoryId === null;

  async function handleDelete(c: MannaCategoryRow): Promise<void> {
    if (c.is_default) return;
    if (!window.confirm(`"${c.name}" 카테고리를 삭제할까요?\n말씀이 없을 때만 삭제됩니다.`)) {
      return;
    }
    setBusyId(c.id);
    try {
      const res = await deleteMannaCategory(c.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      if (res.message) {
        toast.success(res.message);
      }
      if (selectedCategoryId === c.id) {
        router.replace('/manna');
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/manna"
        className={cn(
          allChipBase,
          isAll
            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]'
            : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]/40',
        )}
      >
        전체
      </Link>

      {categories.map((c) => {
        const active = selectedCategoryId === c.id;
        const t = getMannaCategoryTokens(c.id, c.name);
        const canDelete = !c.is_default;
        const busy = busyId === c.id;

        return (
          <div
            key={c.id}
            className="inline-flex max-w-full items-stretch overflow-hidden rounded-full border"
            style={{ borderColor: active ? t.solid : t.ring }}
          >
            <Link
              href={`/manna?category=${encodeURIComponent(c.id)}`}
              className="inline-flex min-w-0 max-w-[200px] items-center gap-1.5 px-3 py-1 text-sm font-medium sm:max-w-[240px]"
              style={{
                backgroundColor: active ? t.solid : t.soft,
                color: active ? t.onSolid : t.onSoft,
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: active ? t.onSolid : t.dot }}
                aria-hidden
              />
              <span className="truncate">{c.name}</span>
            </Link>
            {canDelete ? (
              <button
                type="button"
                disabled={busy}
                className="inline-flex shrink-0 items-center justify-center px-1.5 text-sm disabled:opacity-40"
                style={{
                  backgroundColor: active ? t.solid : t.soft,
                  color: active ? t.onSolid : t.onSoft,
                  borderLeft: `1px solid ${active ? 'rgba(255,255,255,0.35)' : t.ring}`,
                }}
                aria-label={`${c.name} 삭제`}
                onClick={(e) => {
                  e.preventDefault();
                  void handleDelete(c);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 opacity-90" aria-hidden />
              </button>
            ) : null}
          </div>
        );
      })}

      <MannaCategoryQuickAdd variant="chip" />
    </div>
  );
}
