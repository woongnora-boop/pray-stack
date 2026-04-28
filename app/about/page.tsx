import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { MyInfoPage } from '@/components/my/MyInfoPage';
import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '앱 소개 | Pray Stack',
  description: MY_PAGE_CONTENT.about.description,
};

export default function AboutPage(): ReactElement {
  return <MyInfoPage content={MY_PAGE_CONTENT.about} backHref="/" backLabel="홈으로 돌아가기" />;
}
