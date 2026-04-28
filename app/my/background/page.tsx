import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '개발 배경 | Pray Stack',
  description: MY_PAGE_CONTENT.background.description,
};

export default function MyBackgroundPage() {
  redirect('/background');
}
