import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { MyInfoPage } from '@/components/my/MyInfoPage';
import { MY_CONTACT_EMAIL, MY_CONTACT_MAILTO, MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '문의하기 | Pray Stack',
  description: MY_PAGE_CONTENT.contact.description,
};

export default function ContactPage(): ReactElement {
  return (
    <MyInfoPage
      content={MY_PAGE_CONTENT.contact}
      backHref="/"
      backLabel="홈으로 돌아가기"
      extra={
        <div className="space-y-2 text-sm">
          <p className="text-[var(--muted)]">이메일</p>
          <a href={MY_CONTACT_MAILTO} className="font-medium text-[var(--foreground)] underline underline-offset-2">
            {MY_CONTACT_EMAIL}
          </a>
          <p className="pt-1 text-xs text-[var(--muted)]">답변은 순차적으로 드립니다.</p>
        </div>
      }
    />
  );
}
