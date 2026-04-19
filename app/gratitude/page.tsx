import Link from 'next/link';
import type { ReactElement } from 'react';

import { listGratitudeNotes } from '@/app/actions/gratitude';
import { GratitudeList } from '@/components/gratitude/GratitudeList';
import { ListPageHero, ListPagePanel, listPrimaryLinkClass } from '@/components/layout/ListPageShell';
import { createClient } from '@/lib/supabase/server';

export default async function GratitudeListPage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const notes = await listGratitudeNotes();

  return (
    <div className="space-y-8 md:space-y-10">
      <ListPageHero
        tone="rose"
        label="말씀기도"
        title="감사노트"
        description="하루를 돌아보며 감사와 은혜를 날짜와 함께 남겨 보세요."
        actions={
          user ? (
            <Link href="/gratitude/new" className={listPrimaryLinkClass()}>
              새 기록
            </Link>
          ) : (
            <Link href="/login?next=/gratitude/new" className={listPrimaryLinkClass()}>
              로그인하고 새 기록
            </Link>
          )
        }
      />
      <ListPagePanel className="p-5 md:p-6">
        <GratitudeList notes={notes} tone="rose" loggedIn={Boolean(user)} />
      </ListPagePanel>
    </div>
  );
}
