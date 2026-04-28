import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { MY_PAGE_CONTENT } from '@/lib/my-pages-content';

export const metadata: Metadata = {
  title: '문의하기 | Pray Stack',
  description: MY_PAGE_CONTENT.contact.description,
};

export default function MyContactPage() {
  redirect('/contact');
}
