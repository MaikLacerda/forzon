// Account data never uses the old, unscoped demonstration keys.
let accountId: string | null = null;
export const accountStorage = {
  activate(id: string | null) { accountId = id; },
  get id() { return accountId; },
  prefix(id = accountId) { return `forzon:user:${id}:`; },
  getItem(key: string): string | null {
    return accountId ? localStorage.getItem(this.prefix() + key) : null;
  },
  setItem(key: string, value: string) {
    if (!accountId) throw new Error('Entre na sua conta para salvar.');
    localStorage.setItem(this.prefix() + key, value);
    localStorage.setItem(this.prefix() + '_dirty', 'true');
    window.dispatchEvent(new CustomEvent('forzon_account_write', { detail: { userId: accountId } }));
  },
  removeItem(key: string) {
    if (!accountId) return;
    localStorage.removeItem(this.prefix() + key);
    this.setItem('_changed', new Date().toISOString());
  },
  clear() {
    if (!accountId) return;
    const prefix = this.prefix();
    for (const key of Object.keys(localStorage)) if (key.startsWith(prefix) && key !== prefix + '_revision') localStorage.removeItem(key);
    this.setItem('_changed', new Date().toISOString());
  },
  snapshot(id = accountId): Record<string, string> {
    const prefix = this.prefix(id);
    return Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith(prefix) && !k.slice(prefix.length).startsWith('_')).map(k => [k.slice(prefix.length), localStorage.getItem(k)!]));
  },
  hydrate(id: string, values: Record<string, string>) {
    const prefix = this.prefix(id);
    for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(values)) {
      if (key.startsWith('athlynx_') && typeof value === 'string') localStorage.setItem(prefix + key, value);
    }
  },
};
