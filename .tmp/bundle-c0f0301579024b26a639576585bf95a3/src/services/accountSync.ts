import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { accountStorage } from './accountStorage';
import { emptyProfile } from './emptyAccount';

// Small transport boundary enables deterministic lifecycle tests without creating real users.
export const accountTransport = {
 async load(id: string) { return supabase!.from('user_app_data').select('data, revision').eq('user_id', id).maybeSingle(); },
 async save(payload: Record<string, string>, revision: number) { return supabase!.rpc('save_user_app_data', {payload, expected_revision: revision}); },
};
export type CloudStatus = 'saved' | 'saving' | 'pending' | 'conflict';
let active: { id: string; revision: number; generation: number } | null = null;
let generation = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let running: Promise<void> | null = null;
function status(value: CloudStatus) {
  window.dispatchEvent(new CustomEvent('forzon_cloud_status', { detail: value }));
}
export function disconnectAccount() {
  generation++;
  active = null;
  clearTimeout(timer);
  accountStorage.activate(null);
}
export async function loadAccount(user: User) {
  const token = ++generation;
  active = null;
  accountStorage.activate(null);
  const prefix = accountStorage.prefix(user.id);
  if (!navigator.onLine && localStorage.getItem(prefix + 'athlynx_profile')) {
    accountStorage.activate(user.id);
    active = { id: user.id, revision: Number(localStorage.getItem(prefix + '_revision') || 0), generation: token };
    status('pending');
    return true;
  }
  const { data, error } = await accountTransport.load(user.id);
  if (token !== generation) return false;
  if (error) throw new Error('Não foi possível carregar seus dados. Verifique a conexão e a configuração do Supabase.');
  const dirty = localStorage.getItem(prefix + '_dirty') === 'true';
  const cachedRevision = Number(localStorage.getItem(prefix + '_revision') || 0);
  if (dirty && data && cachedRevision !== data.revision) {
    // Keep offline edits intact. Never silently replace either version.
    throw new Error('Há alterações neste aparelho e uma versão diferente na nuvem. Exporte o backup local antes de resolver o conflito.');
  }
  if (data && !dirty) accountStorage.hydrate(user.id, data.data);
  localStorage.setItem(prefix + '_revision', String(data?.revision || 0));
  accountStorage.activate(user.id);
  active = { id: user.id, revision: data?.revision || 0, generation: token };
  if (!accountStorage.getItem('athlynx_profile')) {
    accountStorage.setItem('athlynx_profile', JSON.stringify(emptyProfile(user.id, user.user_metadata?.name || 'Atleta')));
  }
  status(localStorage.getItem(prefix + '_dirty') ? 'pending' : 'saved');
  scheduleSync();
  return true;
}
export async function useCloudVersion(userId: string) {
  const { data, error } = await accountTransport.load(userId);
  if (error || !data) throw new Error('Não foi possível carregar a versão da nuvem.');
  // Recovery is reversible: preserve all local edits separately before hydrating.
  const backup = accountStorage.snapshot(userId);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'forzon-backup-antes-de-recarregar.json'; link.click(); URL.revokeObjectURL(url);
  localStorage.setItem(`forzon:backup:${userId}:${Date.now()}`, JSON.stringify(backup));
  accountStorage.hydrate(userId, data.data);
  localStorage.setItem(accountStorage.prefix(userId) + '_revision', String(data.revision));
}
export async function syncAccount(): Promise<void> {
  if (running) { await running; if (active && localStorage.getItem(accountStorage.prefix() + '_dirty') === 'true') return syncAccount(); return; }
  const owner = active;
  if (!owner || !navigator.onLine) { status('pending'); return; }
  const prefix = accountStorage.prefix(owner.id);
  if (localStorage.getItem(prefix + '_dirty') !== 'true') return;
  const snapshot = accountStorage.snapshot(owner.id);
  status('saving');
  running = (async () => {
    const { data, error } = await accountTransport.save(snapshot, owner.revision);
    if (active !== owner) return;
    if (error) { status(error.message.includes('conflict') ? 'conflict' : 'pending'); throw new Error('Seus dados continuam neste aparelho. Não foi possível sincronizar com a nuvem.'); }
    owner.revision = Number(data);
    localStorage.setItem(prefix + '_revision', String(data));
    if (JSON.stringify(accountStorage.snapshot(owner.id)) === JSON.stringify(snapshot)) localStorage.removeItem(prefix + '_dirty');
    status(localStorage.getItem(prefix + '_dirty') ? 'pending' : 'saved');
  })();
  try { await running; } finally { running = null; }
}
function scheduleSync() {
  clearTimeout(timer);
  timer = setTimeout(() => { syncAccount().catch(() => {}); }, 700);
}
if (typeof window !== 'undefined') {
 window.addEventListener('forzon_account_write', scheduleSync);
 window.addEventListener('online', scheduleSync);
}
