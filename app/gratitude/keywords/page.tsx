import Link from 'next/link';
import type { ReactElement } from 'react';

import { getGratitudeKeywordsDashboard } from '@/app/actions/gratitude-keywords';
import { GratitudeKeywordsBoard } from '@/components/gratitude/GratitudeKeywordsBoard';
import { ListPageHero, ListPagePanel, listPrimaryLinkClass } from '@/components/layout/ListPageShell';
import { getServerAuth } from '@/lib/supabase/request-session';

export default async function GratitudeKeywordsPage(): Promise<ReactElement> {
  const { user } = await getServerAuth();
  const data = user ? await getGratitudeKeywordsDashboard() : null;

  return (
    <div className="space-y-8 md:space-y-10">
      <ListPageHero
        tone="rose"
        label="Pray Stack"
        title="감사 키워드"
        description="이번 주·이번 달 감사 노트에서 자주 쓴 말을 모아 두었어요. 서울 달력 기준으로 집계합니다."
        actions={
          user ? (
            <Link href="/gratitude/new" className={listPrimaryLinkClass()}>
              새 기록
            </Link>
          ) : (
            <Link href="/login?next=/gratitude/keywords" className={listPrimaryLinkClass()}>
              로그인하고 보기
            </Link>
          )
        }
      />
      <ListPagePanel className="p-5 md:p-6">
        {!user ? (
          <p className="text-sm text-[var(--muted)]">로그인하면 내 감사 키워드를 볼 수 있어요.</p>
        ) : data ? (
          <GratitudeKeywordsBoard week={data.week} month={data.month} />
        ) : (
          <p className="text-sm text-[var(--muted)]">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        )}
      </ListPagePanel>
    </div>
  );
}
