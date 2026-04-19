import type { ReactElement } from 'react';

import { getHomeFeed } from '@/app/actions/home';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { HomeGuestRecentHint } from '@/components/home/HomeGuestRecentHint';
import { HomeHero } from '@/components/home/HomeHero';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const feed = user ? await getHomeFeed() : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <HomeHero loggedIn={!!user} />
      {user && feed ? <HomeDashboard feed={feed} compact /> : <HomeGuestRecentHint />}
    </div>
  );
}
