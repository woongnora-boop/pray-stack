import Link from 'next/link';
import type { ReactElement } from 'react';

import { backLinkTouchClassName } from '@/lib/back-link-touch';
import { cn } from '@/lib/utils';

export default function GratitudeNotFound(): ReactElement {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">기록을 찾을 수 없습니다</h1>
      <p className="text-sm text-[var(--muted)]">삭제되었거나 접근 권한이 없을 수 있습니다.</p>
      <Link href="/gratitude" className={cn('text-sm underline', backLinkTouchClassName)}>
        감사노트 목록으로
      </Link>
    </div>
  );
}
