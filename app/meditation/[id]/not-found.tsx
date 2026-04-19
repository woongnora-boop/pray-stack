import Link from 'next/link';
import type { ReactElement } from 'react';

export default function MeditationNotFound(): ReactElement {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">묵상을 찾을 수 없습니다</h1>
      <p className="text-sm text-[var(--muted)]">삭제되었거나 접근 권한이 없을 수 있습니다.</p>
      <Link href="/meditation" className="text-sm underline">
        묵상 목록으로
      </Link>
    </div>
  );
}
