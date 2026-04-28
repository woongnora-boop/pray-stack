import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '버전 정보 | Pray Stack',
  description: '현재 앱 버전과 기본 정보를 안내합니다.',
};

export default function MyVersionPage() {
  redirect('/version');
}
