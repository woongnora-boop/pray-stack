import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | Pray Stack',
  description: MY_PAGE_CONTENT.privacy.description,
};

export default function MyPrivacyPage() {
  redirect('/privacy');
}
