import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { MyInfoPage } from '@/components/my/MyInfoPage';
import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | Pray Stack',
  description: MY_PAGE_CONTENT.privacy.description,
};

export default function PrivacyPage(): ReactElement {
  return <MyInfoPage content={MY_PAGE_CONTENT.privacy} backHref="/" backLabel="홈으로 돌아가기" />;
}
