import Link from 'next/link';
import type { ReactElement } from 'react';

import type { MannaCategoryRow } from '@/app/actions/manna';
import { cn } from '@/lib/utils';

interface MannaCategoryChipsProps {
  categories: MannaCategoryRow[];
  selectedCategoryId: string | null;
}

const chipBase =
  'inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors';

export function MannaCategoryChips({ categories, selectedCategoryId }: MannaCategoryChipsProps): ReactElement {
  const isAll = selectedCategoryId === null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/manna"
        className={cn(
          chipBase,
          isAll
            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]'
            : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]/40',
        )}
      >
        전체
      </Link>
      {categories.map((c) => {
        const active = selectedCategoryId === c.id;
        return (
          <Link
            key={c.id}
            href={`/manna?category=${encodeURIComponent(c.id)}`}
            className={cn(
              chipBase,
              active
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]/40',
            )}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
