import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firebaseDatabase } from './firebase';
import { accountStorage } from './accountStorage';

// Multiple documents keep growing histories below Firestore's per-document limit.
export const CHUNK_CHARACTERS = 60000;
export const MAX_CHUNKS = 20;
export function encodeSnapshot(payload: Record<string, string>): string[] {
  const json = JSON.stringify(payload);
  const chunks: string[] = [];
  for (let offset = 0; offset < json.length;) {
    let end = Math.min(json.length, offset + CHUNK_CHARACTERS);
    const last = json.charCodeAt(end - 1);
    if (end < json.length && last >= 0xd800 && last <= 0xdbff) end--;
    chunks.push(json.slice(offset, end));
    offset = end;
  }
  if (chunks.length > MAX_CHUNKS) throw new Error('O histórico excedeu o tamanho de sincronização. Exporte seus dados; os registros continuam neste aparelho.');
  return chunks;
}
export function decodeSnapshot(parts: string[]): Record<string, string> {
  const data = JSON.parse(parts.join(''));
  if (!data || Array.isArray(data) || typeof data !== 'object' || Object.values(data).some(v => typeof v !== 'string')) throw new Error('Dados de conta inválidos.');
  return data;
}
export const firestoreAccountTransport = {
  async load(id: string) {
    if (!firebaseDatabase || firebaseAuth?.currentUser?.uid !== id) throw new Error('Entre na sua conta para carregar os registros.');
    const database = firebaseDatabase;
    const data = await runTransaction(database, async transaction => {
      const metadata = await transaction.get(doc(database, 'accounts', id));
      if (!metadata.exists()) return null;
      const { revision, chunkCount } = metadata.data();
      if (!Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > MAX_CHUNKS) throw new Error('Formato de conta inválido.');
      const chunks = await Promise.all(Array.from({ length: chunkCount }, (_, i) => transaction.get(doc(database, 'accounts', id, 'chunks', String(i)))));
      if (chunks.some(chunk => !chunk.exists() || chunk.data()?.revision !== revision)) throw new Error('Histórico incompleto na nuvem.');
      return { revision, data: decodeSnapshot(chunks.map(chunk => chunk.data()!.text)) };
    });
    return { data, error: null };
  },
  async save(payload: Record<string, string>, expectedRevision: number) {
    try {
      const owner = firebaseAuth?.currentUser?.uid;
      if (!owner || !firebaseDatabase || accountStorage.id !== owner) throw new Error('Entre na sua conta para sincronizar.');
      const database = firebaseDatabase;
      const chunks = encodeSnapshot(payload);
      const revision = await runTransaction(database, async transaction => {
        const ref = doc(database, 'accounts', owner);
        const previous = await transaction.get(ref);
        const previousRevision = previous.exists() ? previous.data().revision : 0;
        if (previousRevision !== expectedRevision) throw new Error('revision conflict');
        const next = previousRevision + 1;
        chunks.forEach((text, i) => transaction.set(doc(database, 'accounts', owner, 'chunks', String(i)), { text, revision: next }));
        for (let i = chunks.length; i < (previous.data()?.chunkCount || 0); i++) transaction.delete(doc(database, 'accounts', owner, 'chunks', String(i)));
        transaction.set(ref, { revision: next, chunkCount: chunks.length, updatedAt: serverTimestamp() });
        return next;
      });
      return { data: revision, error: null };
    } catch (error) { return { data: null, error: { message: error instanceof Error ? error.message : 'Falha na sincronização.' } }; }
  },
};
