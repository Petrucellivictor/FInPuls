/* =========================================================================
   VAULT.JS — Cofre local de criptografia (opcional) para dados sensíveis.

   O QUE ISSO PROTEGE: com o cofre ativado, os dados sensíveis (perfil,
   conta, transações, orçamentos, patrimônio, investimentos, ligas) ficam
   cifrados em repouso no localStorage com AES-GCM 256 bits, com a chave
   derivada (PBKDF2, 150.000 iterações) de uma senha local que NUNCA é
   salva em nenhum lugar. Isso significa que quem copiar os arquivos de
   localStorage do seu navegador (ex.: um backup de disco, um malware que
   só lê arquivos) vê apenas texto cifrado, não os valores reais.

   O QUE ISSO **NÃO** PROTEGE: enquanto o cofre está desbloqueado (durante
   o uso normal do app), os dados descriptografados vivem na memória da
   página. Se alguém encontrar uma vulnerabilidade de execução de código
   na própria página (XSS) enquanto ela está desbloqueada, esse ataque
   pode ler os dados como qualquer outro código do site — nenhuma
   criptografia no navegador, de nenhum app, protege contra isso, porque
   o próprio app precisa conseguir ler os dados para funcionar. Ferramentas
   como gerenciadores de senha têm exatamente essa mesma limitação.

   SEM RECUPERAÇÃO: não existe servidor guardando uma cópia da sua senha
   nem dos seus dados. Se você esquecer a senha do cofre, os dados
   cifrados NÃO podem ser recuperados por ninguém — nem por nós. Exportar
   um backup (⬇️ Exportar no cabeçalho) antes de ativar o cofre é a única
   rede de segurança real.
   ========================================================================= */

const Vault = {
  SENSITIVE_KEYS: [
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.ACCOUNT,
    STORAGE_KEYS.TRANSACTIONS,
    STORAGE_KEYS.BUDGETS,
    STORAGE_KEYS.WISHLIST,
    STORAGE_KEYS.HOLDINGS,
    STORAGE_KEYS.GOALS,
    STORAGE_KEYS.STOCK_TRADES,
    STORAGE_KEYS.STOCK_DIVIDENDS,
    STORAGE_KEYS.INSTALLMENTS,
    STORAGE_KEYS.LEAGUES,
  ],

  cache: {},
  _key: null,
  _persistTimer: null,

  isAvailable() {
    return typeof window !== "undefined" && !!window.crypto && !!window.crypto.subtle;
  },

  isEnabled() {
    return !!Store.get(STORAGE_KEYS.VAULT_ENABLED, false);
  },

  isUnlocked() {
    return !!this._key;
  },

  /* ---------- utilitários de codificação ---------- */

  bytesToB64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  },

  b64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  },

  /* ---------- primitivas de criptografia (Web Crypto API nativa) ---------- */

  async deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  async encryptRaw(text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this._key, enc.encode(text));
    return this.bytesToB64(iv) + "." + this.bytesToB64(new Uint8Array(cipher));
  },

  async decryptRaw(payload) {
    const [ivB64, dataB64] = payload.split(".");
    const iv = this.b64ToBytes(ivB64);
    const data = this.b64ToBytes(dataB64);
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this._key, data);
    return new TextDecoder().decode(dec);
  },

  /* ---------- ciclo de vida do cofre ---------- */

  /* Ativa o cofre por vez primeira: migra os dados sensíveis já salvos em
     texto puro para dentro do blob cifrado, e remove as cópias em texto. */
  async setup(passphrase) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    this._key = await this.deriveKey(passphrase, salt);
    Store.set(STORAGE_KEYS.VAULT_SALT, this.bytesToB64(salt));

    this.cache = {};
    this.SENSITIVE_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          this.cache[key] = JSON.parse(raw);
        } catch (e) {
          console.warn("Vault: entrada ignorada ao migrar (JSON inválido):", key);
        }
      }
    });

    const canary = await this.encryptRaw("fin-plus-vault-ok");
    Store.set(STORAGE_KEYS.VAULT_CANARY, canary);
    await this.persist();

    this.SENSITIVE_KEYS.forEach((key) => localStorage.removeItem(key));
    Store.set(STORAGE_KEYS.VAULT_ENABLED, true);
  },

  /* Tenta desbloquear com a senha informada. Retorna true/false — nunca
     lança erro para quem chama, para simplificar o tratamento na tela. */
  async unlock(passphrase) {
    if (!this.isEnabled()) return true;
    const saltB64 = Store.get(STORAGE_KEYS.VAULT_SALT, null);
    if (!saltB64) return false;

    const previousKey = this._key;
    try {
      this._key = await this.deriveKey(passphrase, this.b64ToBytes(saltB64));
      const canary = Store.get(STORAGE_KEYS.VAULT_CANARY, "");
      const decoded = await this.decryptRaw(canary);
      if (decoded !== "fin-plus-vault-ok") throw new Error("senha incorreta");

      const blob = Store.get(STORAGE_KEYS.VAULT_BLOB, null);
      this.cache = blob ? JSON.parse(await this.decryptRaw(blob)) : {};
      return true;
    } catch (e) {
      this._key = previousKey;
      return false;
    }
  },

  lock() {
    this._key = null;
    this.cache = {};
  },

  reset() {
    this._key = null;
    this.cache = {};
  },

  schedulePersist() {
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => this.persist(), 400);
  },

  async persist() {
    if (!this.isUnlocked()) return;
    const payload = await this.encryptRaw(JSON.stringify(this.cache));
    Store.set(STORAGE_KEYS.VAULT_BLOB, payload);
  },

  async changePassphrase(oldPassphrase, newPassphrase) {
    const ok = await this.unlock(oldPassphrase);
    if (!ok) return false;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    this._key = await this.deriveKey(newPassphrase, salt);
    Store.set(STORAGE_KEYS.VAULT_SALT, this.bytesToB64(salt));
    const canary = await this.encryptRaw("fin-plus-vault-ok");
    Store.set(STORAGE_KEYS.VAULT_CANARY, canary);
    await this.persist();
    return true;
  },

  /* Desativa o cofre e devolve os dados para texto puro no localStorage.
     Só deve ser chamado depois de o usuário confirmar que entende que os
     dados deixam de ficar cifrados em repouso. */
  disable() {
    Object.entries(this.cache).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    Store.remove(STORAGE_KEYS.VAULT_ENABLED);
    Store.remove(STORAGE_KEYS.VAULT_SALT);
    Store.remove(STORAGE_KEYS.VAULT_CANARY);
    Store.remove(STORAGE_KEYS.VAULT_BLOB);
    this._key = null;
    this.cache = {};
  },
};
