'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactElement } from 'react';

import {
  exchangePkceCode,
  persistSessionFromTokens,
  verifyEmailWithTokenHash,
} from '@/app/actions/auth-callback';

function parseHashParams(hash: string): Record<string, string> {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const out: Record<string, string> = {};
  for (const part of raw.split('&')) {
    const [k, ...rest] = part.split('=');
    if (!k) continue;
    out[decodeURIComponent(k)] = decodeURIComponent(rest.join('=').replace(/\+/g, ' '));
  }
  return out;
}

export function AuthCallbackClient(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('인증 처리 중…');
  const handled = useRef(false);

  const qp = searchParams.toString();

  useEffect(() => {
    if (handled.current) return;
    let cancel = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    async function run(): Promise<void> {
      const oauthError = searchParams.get('error');
      const oauthDesc = searchParams.get('error_description');
      if (oauthError) {
        handled.current = true;
        router.replace(`/login?auth_error=${encodeURIComponent(oauthDesc ?? oauthError)}`);
        return;
      }

      const tokenHash = searchParams.get('token_hash');
      const otpType = searchParams.get('type');
      if (tokenHash && otpType) {
        const r = await verifyEmailWithTokenHash(tokenHash, otpType);
        if (cancel) return;
        handled.current = true;
        if (!r.ok) {
          router.replace(`/login?auth_error=${encodeURIComponent(r.error)}`);
          return;
        }
        router.replace('/');
        router.refresh();
        return;
      }

      const code = searchParams.get('code');
      if (code) {
        const r = await exchangePkceCode(code);
        if (cancel) return;
        handled.current = true;
        if (!r.ok) {
          const hint =
            r.error.includes('code verifier') || r.error.includes('PKCE')
              ? `${r.error} (가입을 시작한 브라우저가 아니면 나올 수 있습니다. 새로 회원가입해 메일을 다시 받아 주세요.)`
              : r.error;
          router.replace(`/login?auth_error=${encodeURIComponent(hint)}`);
          return;
        }
        router.replace('/');
        router.refresh();
        return;
      }

      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (hash && hash.includes('access_token')) {
        const params = parseHashParams(hash);
        const access = params.access_token;
        const refresh = params.refresh_token;
        if (access && refresh) {
          const persist = await persistSessionFromTokens(access, refresh);
          if (cancel) return;
          handled.current = true;
          if (!persist.ok) {
            router.replace(`/login?auth_error=${encodeURIComponent(persist.error)}`);
            return;
          }
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          router.replace('/');
          router.refresh();
          return;
        }
      }

      if (typeof window !== 'undefined' && window.location.hash) {
        const parsedImplicit = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              flowType: 'implicit',
              detectSessionInUrl: true,
              persistSession: false,
              autoRefreshToken: false,
            },
          },
        );
        const {
          data: { session },
          error,
        } = await parsedImplicit.auth.getSession();
        if (cancel) return;
        if (session) {
          handled.current = true;
          const persist = await persistSessionFromTokens(session.access_token, session.refresh_token);
          if (!persist.ok) {
            router.replace(`/login?auth_error=${encodeURIComponent(persist.error)}`);
            return;
          }
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          router.replace('/');
          router.refresh();
          return;
        }
        if (error) {
          handled.current = true;
          router.replace(`/login?auth_error=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      if (cancel) return;
      handled.current = true;
      setMessage('유효한 인증 정보가 없습니다. 잠시 후 로그인 화면으로 이동합니다.');
      redirectTimer = setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }

    void run();

    return () => {
      cancel = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router, searchParams, qp]);

  return (
    <div className="mx-auto max-w-sm space-y-2 px-2 py-8 text-center text-sm text-[var(--muted)]">
      <p>{message}</p>
    </div>
  );
}
