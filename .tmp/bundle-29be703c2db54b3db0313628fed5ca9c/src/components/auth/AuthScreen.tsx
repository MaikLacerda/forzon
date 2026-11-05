import React, { useState } from 'react';
import { Dumbbell, ArrowRight, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { accountClient, authError } from '../../services/firebase';

export function AuthScreen({ recovery = false, onRecovered }: { recovery?: boolean; onRecovered?: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function resendVerification() {
    setBusy(true); setError('');
    try { await accountClient!.auth.resendVerification({ email: email.trim(), password }); setMessage('Enviamos outro e-mail de confirmação. Confira sua caixa de entrada e o spam.'); }
    catch (err) { setError(authError(err as Error)); }
    finally { setBusy(false); }
  }
  const changeMode = (next: typeof mode) => { setMode(next); setMessage(''); setError(''); setPassword(''); setConfirmation(''); };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    if (!accountClient) { setError('O cadastro será liberado assim que a conexão de contas estiver configurada.'); return; }
    if ((mode === 'signup' || recovery) && password !== confirmation) { setError('As senhas precisam ser iguais.'); return; }
    setBusy(true);
    try {
      const redirectTo = window.location.origin + '/';
      if (recovery) {
        const { error } = await accountClient.auth.updateUser({ password });
        if (error) throw error;
        setPassword(''); setConfirmation(''); onRecovered?.();
      } else if (mode === 'signup') {
        const { data, error } = await accountClient.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() }, emailRedirectTo: redirectTo } });
        if (error) throw error;
        if (!data.session) setMessage('Confira seu e-mail para confirmar o cadastro. Depois, volte e entre na sua conta.');
        setPassword(''); setConfirmation('');
      } else if (mode === 'forgot') {
        const { error } = await accountClient.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (error) throw error;
        setMessage('Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha.');
      } else {
        const { error } = await accountClient.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) { setError(authError(err as Error)); }
    finally { setBusy(false); }
  }
  const field = 'w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400';
  return <main className="min-h-dvh bg-neutral-950 text-white flex items-center justify-center px-4 py-10">
    <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2 md:items-center">
      <section className="space-y-5">
        <div className="flex items-center gap-3 text-cyan-400 font-black tracking-widest text-xl"><Dumbbell /> FORZON</div>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">Seu treino.<br />Sua evolução.</h1>
        <p className="text-neutral-400 max-w-md">Organize seus treinos e acompanhe cada conquista. Seu histórico começa com você e cresce a cada sessão.</p>
        <p className="flex gap-2 text-sm text-neutral-400"><ShieldCheck className="w-5 h-5 shrink-0 text-cyan-400" /> Uma conta pessoal para guardar seus registros.</p>
      </section>
      <section className="min-w-0 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-bold">{recovery ? 'Criar nova senha' : mode === 'signup' ? 'Crie sua conta' : mode === 'forgot' ? 'Recuperar acesso' : 'Bem-vindo de volta'}</h2>
        <p className="text-sm text-neutral-400 mt-2 mb-6">{mode === 'signup' ? 'Comece com um painel só seu, sem registros de demonstração.' : 'Continue de onde parou.'}</p>
        {!accountClient && <p role="status" className="rounded-xl bg-amber-400/10 text-amber-200 p-3 text-sm mb-4">Estamos preparando o acesso às contas. O cadastro e o login ainda não estão disponíveis.</p>}
        <form onSubmit={submit} className="space-y-4">
          {!recovery && mode === 'signup' && <label className="block space-y-2 text-sm">Nome<input className={field} value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={80} /></label>}
          {!recovery && <label className="block space-y-2 text-sm">E-mail<input className={field} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required maxLength={254} /></label>}
          {(recovery || mode !== 'forgot') && <label className="block space-y-2 text-sm">{recovery ? 'Nova senha' : 'Senha'}<input className={field} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' || recovery ? 'new-password' : 'current-password'} required minLength={mode === 'signup' || recovery ? 8 : 1} maxLength={128} />{(mode === 'signup' || recovery) && <span className="text-xs text-neutral-400">Use pelo menos 8 caracteres.</span>}</label>}
          {(recovery || mode === 'signup') && <label className="block space-y-2 text-sm">Confirmar senha<input className={field} type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={128} /></label>}
          {!recovery && mode === 'signup' && <label className="flex gap-3 text-xs text-neutral-400"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required />Quero criar minha conta e salvar meus registros pessoais de treino.</label>}
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {error.startsWith('Confirme seu e-mail') && <button type="button" disabled={busy} onClick={resendVerification} className="text-cyan-400 text-sm underline">Reenviar confirmação</button>}
          {message && <p role="status" className="text-sm text-cyan-300 flex gap-2"><Mail className="w-5 h-5 shrink-0" />{message}</p>}
          <button disabled={busy || !accountClient} className="w-full min-h-12 rounded-xl bg-cyan-400 text-neutral-950 font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{busy ? <LoaderCircle className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}{recovery ? 'Salvar nova senha' : mode === 'signup' ? 'Criar conta' : mode === 'forgot' ? 'Enviar link' : 'Entrar'}</button>
        </form>
        {!recovery && <div className="flex flex-wrap justify-between gap-3 text-sm mt-5"><button className="text-cyan-400 cursor-pointer" onClick={() => changeMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Já tenho uma conta' : 'Criar uma conta'}</button><button className="text-neutral-400 cursor-pointer" onClick={() => changeMode(mode === 'forgot' ? 'login' : 'forgot')}>{mode === 'forgot' ? 'Voltar para entrar' : 'Esqueci minha senha'}</button></div>}
        {recovery && <button className="text-neutral-400 text-sm mt-5" onClick={async () => { await accountClient?.auth.signOut({ scope: 'local' }); onRecovered?.(); }}>Voltar para entrar</button>}
      </section>
    </div>
  </main>;
}
