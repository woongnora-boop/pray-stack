import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '앱 소개 | Pray Stack',
  description: MY_PAGE_CONTENT.about.description,
};

export default function MyAboutPage() {
  redirect('/about');
}
