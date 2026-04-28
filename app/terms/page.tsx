import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { MyInfoPage } from '@/components/my/MyInfoPage';
import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '이용약관 | Pray Stack',
  description: MY_PAGE_CONTENT.terms.description,
};

export default function TermsPage(): ReactElement {
  return <MyInfoPage content={MY_PAGE_CONTENT.terms} backHref="/" backLabel="홈으로 돌아가기" />;
}
