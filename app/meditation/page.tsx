import Link from 'next/link';
import type { ReactElement } from 'react';

import { listMeditationDays } from '@/app/actions/meditation';
import { ListPageHero, ListPagePanel, listPrimaryLinkClass } from '@/components/layout/ListPageShell';
import { MeditationList } from '@/components/meditation/MeditationList';

export default async function MeditationListPage(): Promise<ReactElement> {
  const days = await listMeditationDays();

  return (
    <div className="space-y-8 md:space-y-10">
      <ListPageHero
        tone="amber"
        label="말씀기도"
        title="묵상"
        description="날짜별로 설교·QT 등 묵상을 남기고, 다시 읽을 수 있습니다."
        actions={
          <Link href="/meditation/new" className={listPrimaryLinkClass()}>
            새 묵상
          </Link>
        }
      />
      <ListPagePanel className="p-5 md:p-6">
        <MeditationList days={days} tone="amber" />
      </ListPagePanel>
    </div>
  );
}
