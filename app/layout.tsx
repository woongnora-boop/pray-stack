import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactElement, ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AppHeader } from '@/components/AppHeader';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pray Stack',
  description: '묵상 · 만나 · 감사노트',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}>
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
