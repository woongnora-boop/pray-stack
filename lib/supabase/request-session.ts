import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

/**
 * 단일 서버 요청(한 번의 RSC 렌더) 안에서 Supabase 클라이언트를 한 번만 만들도록 캐시합니다.
 * 레이아웃·페이지·여러 서버 액션이 각각 createClient()를 호출해도 동일 인스턴스를 재사용합니다.
 */
export const getServerSupabase = cache(createClient);

/**
 * 같은 요청에서 `auth.getUser()`를 한 번만 호출합니다.
 * AppHeader와 페이지·액션이 중복으로 세션을 읽는 비용을 줄입니다.
 */
export const getServerAuth = cache(async () => {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});
