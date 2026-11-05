import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import type { UserProfile } from '../../types';
import { accountClient } from '../../services/firebase';
import { syncAccount } from '../../services/accountSync';
export function AuthModal({ isOpen, onClose, profile, onSwitchToNewUser }: { isOpen: boolean; onClose: () => void; profile: UserProfile; onUpdateProfile: (profile: UserProfile) => void; onSwitchToNewUser: () => void }) {
 const [busy, setBusy] = useState(false); const [error, setError] = useState('');
 if (!isOpen) return null;
 async function logout() {
  setBusy(true); setError('');
  try {
   try { await syncAccount(); } catch { /* Offline records remain in this account's cache. */ }
   const {error} = await accountClient!.auth.signOut({scope:'local'}); if(error) throw error;
  } catch { setError('Não foi possível sair. Tente novamente.'); } finally { setBusy(false); }
 }
 return <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-labelledby="account-title" className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 space-y-5"><div className="flex justify-between items-center"><h2 id="account-title" className="text-xl font-bold">Minha conta</h2><button aria-label="Fechar conta" className="p-2" onClick={onClose}><X /></button></div><p className="font-bold">{profile.name}</p><p className="text-neutral-400 text-sm">Seus registros pertencem à sua conta. Alterações offline ficam neste aparelho até a sincronização.</p><button className="text-cyan-400 py-2" onClick={() => {onClose(); onSwitchToNewUser();}}>Editar perfil e objetivos</button>{error && <p role="alert" className="text-red-300">{error}</p>}<button disabled={busy} onClick={logout} className="flex gap-2 items-center border border-neutral-700 rounded-xl px-4 py-3 disabled:opacity-50"><LogOut className="w-4 h-4" />{busy ? 'Saindo…' : 'Sair da conta'}</button></section></div>;
}
