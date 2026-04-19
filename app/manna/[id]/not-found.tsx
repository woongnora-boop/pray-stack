import Link from 'next/link';
import type { ReactElement } from 'react';

export default function MannaNotFound(): ReactElement {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">말씀을 찾을 수 없습니다</h1>
      <p className="text-sm text-[var(--muted)]">삭제되었거나 접근 권한이 없을 수 있습니다.</p>
      <Link href="/manna" className="text-sm underline">
        만나 목록으로
      </Link>
    </div>
  );
}
