import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getServerSupabase } from '@/lib/supabase/request-session';

function createStatelessClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * 성경 본문 조회용.
 * 1) `SUPABASE_SERVICE_ROLE_KEY` — 배포에서 가장 안정적(import·운영 조회 동일).
 * 2) 없으면 `NEXT_PUBLIC_SUPABASE_ANON_KEY`만으로 상태 없는 클라이언트(공개 SELECT 정책 필요).
 *    Route Handler에서 쿠키 세션 클라이언트에만 의존하면 배포 환경에서 실패하는 경우가 있어 2순위로 둠.
 * 3) 그마저 없으면 `getServerSupabase()`(세션·RLS).
 */
export async function getSupabaseForBibleRead(): Promise<SupabaseClient> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

  if (url && serviceKey) {
    return createStatelessClient(url, serviceKey);
  }

  if (url && anonKey) {
    return createStatelessClient(url, anonKey);
  }

  return await getServerSupabase();
}
