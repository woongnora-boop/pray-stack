import type { ReactElement } from 'react';

import { getMannaCategoryTokens } from '@/lib/manna-category-styles';
import { cn } from '@/lib/utils';

export function MannaCategoryTag({
  categoryId,
  name,
  size = 'sm',
}: {
  categoryId: string;
  name: string;
  size?: 'xs' | 'sm' | 'md';
}): ReactElement {
  const t = getMannaCategoryTokens(categoryId, name);
  const sizeCls =
    size === 'xs'
      ? 'gap-0.5 px-1.5 py-0 text-[10px]'
      : size === 'md'
        ? 'gap-1.5 px-2.5 py-1 text-xs'
        : 'gap-1 px-2 py-0.5 text-[11px]';
  const dotCls = size === 'xs' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5';

  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center rounded-full border font-medium leading-none',
        sizeCls,
      )}
      style={{
        backgroundColor: t.soft,
        borderColor: t.ring,
        color: t.onSoft,
      }}
    >
      <span className={cn('shrink-0 rounded-full', dotCls)} style={{ backgroundColor: t.dot }} aria-hidden />
      <span className="min-w-0 truncate">{name}</span>
    </span>
  );
}
