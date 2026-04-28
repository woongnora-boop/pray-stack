import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { MyInfoPage } from '@/components/my/MyInfoPage';
import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '개발 배경 | Pray Stack',
  description: MY_PAGE_CONTENT.background.description,
};

export default function BackgroundPage(): ReactElement {
  return <MyInfoPage content={MY_PAGE_CONTENT.background} backHref="/" backLabel="홈으로 돌아가기" />;
}
