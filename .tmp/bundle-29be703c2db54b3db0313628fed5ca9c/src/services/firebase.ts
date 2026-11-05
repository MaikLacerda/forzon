import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import webConfig from '../data/firebaseWebConfig.json';

const env = (import.meta as ImportMeta & { env: Record<string, string> }).env || {};
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || webConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || webConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || webConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || webConfig.appId,
};
const configured = Object.values(config).every(Boolean);
// Tests import pure storage helpers in Node without starting a remote auth session.
const app = configured && typeof document !== 'undefined' ? (getApps()[0] || initializeApp(config)) : null;
export const firebaseAuth = app ? getAuth(app) : null;
export const firebaseDatabase = app ? getFirestore(app) : null;
if (firebaseAuth) firebaseAuth.languageCode = "pt-BR";
export interface AccountUser { id: string; user_metadata?: { name?: string } }
const actionSettings = () => ({ url: window.location.origin + '/', handleCodeInApp: false });

export const accountClient = firebaseAuth ? {
  auth: {
    onAuthStateChange(callback: (event: string, session: { user: AccountUser } | null) => void) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
        callback(user?.emailVerified ? 'SIGNED_IN' : 'SIGNED_OUT', user?.emailVerified ? { user: { id: user.uid, user_metadata: { name: user.displayName || undefined } } } : null);
      });
      return { data: { subscription: { unsubscribe } } };
    },
    async signUp({ email, password, options }: { email: string; password: string; options: { data: { name: string }; emailRedirectTo?: string } }) {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      try {
        await updateProfile(result.user, { displayName: options.data.name });
        await sendEmailVerification(result.user, actionSettings());
      } finally { await signOut(firebaseAuth); }
      return { data: { session: null }, error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      if (!result.user.emailVerified) {
        await signOut(firebaseAuth);
        throw Object.assign(new Error('Confirme seu e-mail antes de entrar.'), { code: 'auth/email-not-verified' });
      }
      return { error: null };
    },
    async resendVerification({ email, password }: { email: string; password: string }) {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      try { if (!result.user.emailVerified) await sendEmailVerification(result.user, actionSettings()); }
      finally { await signOut(firebaseAuth); }
    },
    async resetPasswordForEmail(email: string, _options?: { redirectTo: string }) {
      await sendPasswordResetEmail(firebaseAuth, email, actionSettings());
      return { error: null };
    },
    async updateUser({ password }: { password: string }) {
      const code = new URLSearchParams(window.location.search).get('oobCode');
      if (!code) throw Object.assign(new Error('Link inválido.'), { code: 'auth/invalid-action-code' });
      await confirmPasswordReset(firebaseAuth, code, password);
      window.history.replaceState({}, '', window.location.pathname);
      return { error: null };
    },
    async signOut(_options?: { scope: string }) { await signOut(firebaseAuth); return { error: null }; },
  },
} : null;

export function authError(error: { message?: string; code?: string }): string {
  switch (error.code) {
    case 'auth/invalid-credential': case 'auth/user-not-found': case 'auth/wrong-password': return 'E-mail ou senha incorretos.';
    case 'auth/email-not-verified': return 'Confirme seu e-mail antes de entrar. Confira também a pasta de spam.';
    case 'auth/email-already-in-use': return 'Este e-mail já tem uma conta. Entre ou recupere sua senha.';
    case 'auth/too-many-requests': return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed': return 'Não foi possível conectar. Verifique sua internet.';
    case 'auth/weak-password': case 'auth/password-does-not-meet-requirements': return 'Use uma senha com pelo menos 8 caracteres e confira os requisitos do cadastro.';
    case 'auth/invalid-email': return 'Confira o endereço de e-mail.';
    case 'auth/expired-action-code': case 'auth/invalid-action-code': return 'Este link expirou ou já foi utilizado. Solicite outro link de recuperação.';
    case 'auth/operation-not-allowed': return 'O acesso por e-mail ainda não foi habilitado. Entre em contato com o suporte.';
    case 'auth/unauthorized-continue-uri': return 'O endereço do aplicativo ainda precisa ser autorizado para o envio de e-mails.';
    default: return 'Não foi possível concluir. Confira os dados e tente novamente.';
  }
}
