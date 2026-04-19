import 'server-only';

import { createClient } from '@supabase/supabase-js';

/**
 * 서버에서 회원가입 요청만 할 때 쓰는 클라이언트입니다.
 * `@supabase/ssr`의 createServerClient는 항상 PKCE라서, 확인 메일의 `code`가
 * 가입 시 같은 브라우저에만 저장되는 code_verifier와 짝이 맞아야 하고,
 * 메일 앱·다른 기기에서 열면 실패합니다. implicit 가입은 그 제약이 없습니다.
 */
export function createEmailSignUpClient() {
  const store: Record<string, string> = {};
  const storage = {
    getItem: (key: string): string | null =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage,
      },
    },
  );
}
