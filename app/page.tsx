import type { ReactElement } from 'react';
import { Suspense } from 'react';

import { getHomeFeed } from '@/app/actions/home';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { HomeFeedSkeleton } from '@/components/home/HomeFeedSkeleton';
import { HomeGuestRecentHint } from '@/components/home/HomeGuestRecentHint';
import { HomeHero } from '@/components/home/HomeHero';
import { getServerAuth } from '@/lib/supabase/request-session';

async function HomeAuthenticatedFeed(): Promise<ReactElement> {
  const feed = await getHomeFeed();
  return <HomeDashboard feed={feed} compact />;
}

export default async function HomePage(): Promise<ReactElement> {
  const { user } = await getServerAuth();

  return (
    <div className="space-y-6 md:space-y-8">
      <HomeHero loggedIn={!!user} />
      {user ? (
        <Suspense fallback={<HomeFeedSkeleton />}>
          <HomeAuthenticatedFeed />
        </Suspense>
      ) : (
        <HomeGuestRecentHint />
      )}
    </div>
  );
}
