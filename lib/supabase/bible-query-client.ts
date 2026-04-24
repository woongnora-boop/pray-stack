import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getServerSupabase } from '@/lib/supabase/request-session';

/**
 * 성경 본문 조회용. 서버에 `SUPABASE_SERVICE_ROLE_KEY`가 있으면 RLS와 무관하게 읽기 가능.
 * 없으면 세션 기반 anon 클라이언트(테이블에 anon SELECT 정책 필요).
 */
export async function getSupabaseForBibleRead(): Promise<SupabaseClient> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (url && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return await getServerSupabase();
}
