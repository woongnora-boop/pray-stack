'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

const EMAIL_OTP_TYPES = new Set(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

export async function verifyEmailWithTokenHash(
  tokenHash: string,
  type: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!EMAIL_OTP_TYPES.has(type)) {
    return { ok: false, error: '잘못된 인증 유형입니다.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function exchangePkceCode(code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function persistSessionFromTokens(
  accessToken: string,
  refreshToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
