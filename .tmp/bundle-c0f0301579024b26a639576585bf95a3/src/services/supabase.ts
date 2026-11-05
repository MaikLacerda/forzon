import { createClient } from '@supabase/supabase-js';

const env = (import.meta as ImportMeta & { env: Record<string, string> }).env || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) }) },
}) : null;

export function authError(error: { message?: string; code?: string }): string {
  if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos.';
  if (error.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (error.code === 'user_already_exists') return 'Este e-mail já tem uma conta. Entre ou recupere sua senha.';
  if (error.message?.includes('fetch')) return 'Não foi possível conectar. Verifique sua internet.';
  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}
