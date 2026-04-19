import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactElement, ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AppHeader } from '@/components/AppHeader';
import { BottomTabBar } from '@/components/app-shell/BottomTabBar';

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
  title: '말씀기도',
  description: '묵상·말씀(만나)·감사를 한곳에 남기는 신앙 기록',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}>
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:pt-6">{children}</main>
        <BottomTabBar />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
