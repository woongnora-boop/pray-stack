import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '이용약관 | Pray Stack',
  description: MY_PAGE_CONTENT.terms.description,
};

export default function MyTermsPage() {
  redirect('/terms');
}
