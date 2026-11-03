import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import { disconnectAccount, loadAccount, syncAccount, useCloudVersion, type CloudStatus } from '../../services/accountSync';
import { accountStorage } from '../../services/accountStorage';
import { AuthScreen } from './AuthScreen';

export function AccountGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(window.location.hash.includes('type=recovery'));
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [cloud, setCloud] = useState<CloudStatus>('saved');
  useEffect(() => {
    if (!supabase) return;
    let current: string | null = null;
    let alive = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      const next = session?.user;
      if (next?.id && current === next.id) return;
      current = next?.id || null;
      disconnectAccount(); setReady(false); setError(''); setUser(next || null);
      if (!next) { setReady(true); return; }
      // Supabase auth callbacks must return before making further SDK requests.
      setTimeout(() => {
        if (!alive || current !== next.id) return;
        loadAccount(next).then(loaded => { if (alive && loaded && current === next.id) setReady(true); }).catch(() => {
          if (alive && current === next.id) setError('Não foi possível abrir seus dados. Confira a conexão. Se há alterações offline em conflito, baixe o backup antes de recarregar.');
        });
      }, 0);
    });
    return () => { alive = false; data.subscription.unsubscribe(); disconnectAccount(); };
  }, [retry]);
  useEffect(() => {
    const listener = (event: Event) => setCloud((event as CustomEvent<CloudStatus>).detail);
    window.addEventListener('forzon_cloud_status', listener);
    return () => window.removeEventListener('forzon_cloud_status', listener);
  }, []);
  const reloadCloud = async () => {
    if (!user) return;
    try { await useCloudVersion(user.id); setRetry(v => v + 1); } catch { setError('Não foi possível recarregar. Verifique sua conexão.'); }
  };
  const backup = () => {
    const blob = new Blob([JSON.stringify(accountStorage.snapshot(user?.id), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'forzon-backup-local.json'; a.click(); URL.revokeObjectURL(url);
  };
  if (recovery && supabase) return <AuthScreen recovery onRecovered={() => setRecovery(false)} />;
  if (!supabase || (ready && !user)) return <AuthScreen />;
  if (!ready) return <main className="min-h-dvh bg-neutral-950 text-white flex items-center justify-center p-6"><div className="max-w-md space-y-4" role="status"><h1 className="font-bold text-xl">{error ? 'Seus registros estão preservados' : 'Abrindo sua conta…'}</h1><p>{error || 'Carregando seus dados pessoais.'}</p>{error && <div className="flex flex-wrap gap-4"><button onClick={() => setRetry(v => v + 1)}>Tentar novamente</button><button onClick={backup}>Baixar backup local</button><button onClick={reloadCloud}>Preservar cópia local e carregar nuvem</button><button onClick={() => supabase!.auth.signOut({ scope: 'local' })}>Sair</button></div>}</div></main>;
  return <React.Fragment key={user!.id}>
    {cloud !== 'saved' && <div role="status" className="bg-neutral-900 text-amber-200 px-4 py-2 text-sm flex flex-wrap gap-3">{cloud === 'saving' ? 'Salvando seus registros…' : cloud === 'conflict' ? 'Há uma versão mais recente na nuvem. Seus registros locais foram preservados.' : 'Alterações salvas neste aparelho. Sincronização pendente.'}{cloud !== 'saving' && <><button className="underline" onClick={() => syncAccount().catch(() => {})}>Tentar sincronizar</button><button className="underline" onClick={backup}>Baixar backup</button>{cloud === "conflict" && <button className="underline" onClick={reloadCloud}>Preservar cópia local e carregar nuvem</button>}</>}</div>}
    {children}
  </React.Fragment>;
}
