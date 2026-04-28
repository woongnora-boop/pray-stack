import Link from 'next/link';
import type { ReactElement } from 'react';

import { appCardClass } from '@/components/ui/app-card';
import {
  getMyAppVersion,
  MY_APP_NAME,
  MY_CONTACT_EMAIL,
  MY_CONTACT_MAILTO,
  MY_RECENT_UPDATE,
  MY_RECENT_UPDATE_REASON,
} from '@/lib/my-pages-content';

function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-4 py-3">
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export function VersionInfoBody(): ReactElement {
  return (
    <section className={appCardClass}>
      <div className="space-y-3">
        <Row label="앱 이름" value={MY_APP_NAME} />
        <Row label="현재 버전" value={getMyAppVersion()} />
        <Row label="최근 업데이트" value={MY_RECENT_UPDATE} />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-4 py-3">
          <p className="text-xs font-medium text-[var(--muted)]">문의 이메일</p>
          <Link href={MY_CONTACT_MAILTO} className="mt-1 inline-flex text-sm font-medium text-[var(--foreground)] underline">
            {MY_CONTACT_EMAIL}
          </Link>
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">※ {MY_RECENT_UPDATE_REASON}</p>
    </section>
  );
}
