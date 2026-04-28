import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { VersionInfoBody } from '@/components/my/VersionInfoBody';

export const metadata: Metadata = {
  title: '버전 정보 | Pray Stack',
  description: '현재 앱 버전과 기본 정보를 안내합니다.',
};

export default function VersionPage(): ReactElement {
  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        홈으로 돌아가기
      </Link>
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">버전 정보</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">현재 앱 버전과 기본 정보를 안내합니다.</p>
      </header>
      <VersionInfoBody />
    </div>
  );
}
