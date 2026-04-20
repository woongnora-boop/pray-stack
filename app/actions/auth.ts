'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { AuthActionState } from '@/app/actions/auth-types';
import { persistSessionFromTokens } from '@/app/actions/auth-callback';
import { createEmailSignUpClient } from '@/lib/supabase/email-signup-client';
import { createClient } from '@/lib/supabase/server';
import { pickSiteOriginForAuthEmail, safeRelativeNextPath } from '@/lib/site-url';

export type { AuthActionState } from '@/app/actions/auth-types';

/** 가입·인증 메일 발송이 프로젝트 한도를 넘었을 때 (이메일 주소를 바꿔도 같은 한도 공유) */
const RATE_LIMIT_MESSAGE =
  'Supabase 이메일 발송 한도(429)에 걸렸습니다. 프로젝트 전체 한도라 잠시 후 다시 시도하거나, Dashboard → Authentication → Providers → Email에서 개발 중에만 "Confirm email"을 끄면 인증 메일 발송을 줄일 수 있습니다.';

function isAuthRateLimited(error: { message?: string; status?: number }): boolean {
  const msg = (error.message ?? '').toLowerCase();
  return (
    error.status === 429 ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('email rate limit')
  );
}

function resolveSignInError(error: { message?: string; status?: number; code?: string }): string {
  if (isAuthRateLimited(error)) {
    return RATE_LIMIT_MESSAGE;
  }

  const code = (error.code ?? '').toLowerCase();
  const msg = (error.message ?? '').toLowerCase();

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return '이메일 인증이 아직 완료되지 않았습니다. 메일함의 링크를 누르거나, Supabase Dashboard → Authentication → Providers → Email에서 개발 중에만 "Confirm email"을 끈 뒤 다시 시도해 주세요.';
  }

  if (code === 'user_banned' || msg.includes('banned')) {
    return '이 계정은 사용할 수 없습니다. Supabase 대시보드의 사용자 상태를 확인해 주세요.';
  }

  if (code === 'invalid_credentials' || msg.includes('invalid login')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다. 대소문자·공백을 확인하고, Supabase Authentication → Users에 해당 이메일이 있는지 확인해 주세요.';
  }

  if (error.message) {
    return `로그인할 수 없습니다: ${error.message}`;
  }

  return '이메일 또는 비밀번호가 올바르지 않습니다.';
}

export async function signInWithEmail(
  _prev: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nextAfterLogin = safeRelativeNextPath(String(formData.get('next') ?? ''));

  if (!email || !password) {
    return { success: false, error: '이메일과 비밀번호를 입력해 주세요.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: resolveSignInError(error) };
  }

  revalidatePath('/', 'layout');
  redirect(nextAfterLogin);
}

function isNetworkOrDnsError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const msg = String((err as { message?: string }).message ?? '').toLowerCase();
  const cause = (err as { cause?: { code?: string; message?: string } }).cause;
  const causeMsg = cause ? String(cause.message ?? cause.code ?? '').toLowerCase() : '';
  return (
    msg.includes('fetch failed') ||
    msg.includes('enotfound') ||
    causeMsg.includes('enotfound') ||
    (cause as { code?: string } | undefined)?.code === 'ENOTFOUND'
  );
}

export async function signUp(
  _prev: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { success: false, error: '이메일과 비밀번호를 입력해 주세요.' };
  }

  if (password.length < 6) {
    return { success: false, error: '비밀번호는 6자 이상이어야 합니다.' };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!url || url.includes('your_project') || url.includes('placeholder')) {
    return {
      success: false,
      error:
        'Supabase URL이 설정되지 않았거나 예시 값입니다. web/.env.local의 NEXT_PUBLIC_SUPABASE_URL을 실제 프로젝트 주소로 바꾼 뒤, 터미널에서 npm run dev를 끄고 다시 실행해 주세요.',
    };
  }

  try {
    /** PKCE(server client)가 아닌 implicit 클라이언트 — 확인 메일을 다른 기기에서 열어도 세션을 맺을 수 있습니다. */
    const supabase = createEmailSignUpClient();
    const h = await headers();
    const origin = pickSiteOriginForAuthEmail(h, String(formData.get('site_origin') ?? ''));
    const emailRedirectTo = `${origin}/auth/callback`;
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      if (isAuthRateLimited(error)) {
        return { success: false, error: RATE_LIMIT_MESSAGE };
      }
      const lower = error.message.toLowerCase();
      if (
        lower.includes('already registered') ||
        lower.includes('user already') ||
        lower.includes('email address is already') ||
        error.code === 'user_already_exists'
      ) {
        return { success: false, error: '이미 가입된 이메일입니다.' };
      }
      if (lower.includes('password')) {
        return { success: false, error: '비밀번호가 요구 조건을 만족하지 않습니다.' };
      }
      if (lower.includes('signups not allowed') || lower.includes('signup is disabled')) {
        return { success: false, error: 'Supabase에서 이메일 가입이 비활성화되어 있습니다. 대시보드 Authentication → Providers에서 Email을 켜 주세요.' };
      }
      return {
        success: false,
        error: `가입에 실패했습니다: ${error.message}`,
      };
    }

    const session = signUpData?.session ?? null;
    const confirmedEmail = signUpData?.user?.email ?? email;

    /** Confirm email이 꺼져 있으면 세션이 옵니다. implicit 가입 클라이언트는 쿠키에 붙이지 않으므로 SSR 클라이언트로 옮깁니다. */
    if (session?.access_token && session.refresh_token) {
      const persisted = await persistSessionFromTokens(session.access_token, session.refresh_token);
      if (!persisted.ok) {
        return { success: false, error: persisted.error };
      }
      redirect('/');
    }

    revalidatePath('/', 'layout');

    return {
      success: true,
      pendingVerification: true,
      email: confirmedEmail,
    };
  } catch (err) {
    if (isNetworkOrDnsError(err)) {
      return {
        success: false,
        error:
          'Supabase 서버에 연결할 수 없습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL이 맞는지 확인하고, 저장 후 개발 서버를 완전히 종료했다가 npm run dev로 다시 켜 주세요.',
      };
    }
    throw err;
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
