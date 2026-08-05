/* =========================================================================
   STORAGE.JS — Camada de persistência (localStorage)
   Centraliza leitura/escrita para que, no futuro, seja fácil trocar por
   um backend real sem alterar o restante da aplicação.
   ========================================================================= */

const STORAGE_KEYS = {
  PROFILE: "if_profile",
  TRANSACTIONS: "if_transactions",
  BUDGETS: "if_budgets",
  WISHLIST: "if_wishlist",
  COURSE_PROGRESS: "if_course_progress",
  XP: "if_xp",
  STREAK: "if_streak",
  HOLDINGS: "if_holdings",
  GOALS: "if_goals",
  CHALLENGES_STATE: "if_challenges_state",
  ACHIEVEMENTS_UNLOCKED: "if_achievements_unlocked",
  BOOKS_SEEN: "if_books_seen",
  BOOKS_COMPLETED: "if_books_completed",
  STORIES_SEEN: "if_stories_seen",
  STOCK_TRADES: "if_stock_trades",
  STOCK_DIVIDENDS: "if_stock_dividends",
  STOCK_PRICES: "if_stock_prices",
  LESSON_LOG: "if_lesson_log",
  INSTALLMENTS: "if_installments",
  ACCOUNT: "if_account",
  HISTORY_PROGRESS: "if_history_progress",
  BUSINESS_PROGRESS: "if_business_progress",
  ENERGY: "if_energy",
  COINS: "if_coins",
  LAST_LOGIN_BONUS: "if_last_login_bonus",
  SHOP_OWNED: "if_shop_owned",
  EQUIPPED: "if_equipped",
  LEAGUES: "if_leagues",
  SIMULATOR_RUNS: "if_simulator_runs",
  SIMULATOR_LOG: "if_simulator_log",
  POLVIN_QUESTIONS_ASKED: "if_polvin_questions_asked",
  POLVIN_LOG: "if_polvin_log",
  POLVIN_NOTICE_SHOWN: "if_polvin_notice_shown",
  VAULT_ENABLED: "if_vault_enabled",
  VAULT_SALT: "if_vault_salt",
  VAULT_CANARY: "if_vault_canary",
  VAULT_BLOB: "if_vault_blob",
};

const Store = {
  /* Chaves sensíveis, quando o cofre (js/vault.js) está ativo, não vivem
     em texto puro no localStorage — ficam só no cache em memória do
     Vault, sincronizado com um único blob cifrado. Isso é transparente
     para todo o resto do app: quem chama Store.get/set não precisa saber
     se o cofre está ativo ou não. */
  isVaultManaged(key) {
    // Checa SENSITIVE_KEYS antes de Vault.isEnabled(): isEnabled() chama
    // Store.get(VAULT_ENABLED, ...), e VAULT_ENABLED nunca está em
    // SENSITIVE_KEYS — invertendo a ordem do && isso causaria recursão
    // infinita (get -> isVaultManaged -> isEnabled -> get -> ...).
    return typeof Vault !== "undefined" && Vault.SENSITIVE_KEYS.includes(key) && Vault.isEnabled();
  },

  get(key, fallback) {
    if (this.isVaultManaged(key)) {
      if (!Vault.isUnlocked()) return fallback;
      return key in Vault.cache ? Vault.cache[key] : fallback;
    }
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Erro ao ler storage:", key, e);
      return fallback;
    }
  },

  set(key, value) {
    if (this.isVaultManaged(key)) {
      if (!Vault.isUnlocked()) return false;
      Vault.cache[key] = value;
      Vault.schedulePersist();
      return true;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (typeof Cloud !== "undefined") Cloud.schedulePush(key, value);
      return true;
    } catch (e) {
      console.warn("Erro ao salvar storage:", key, e);
      return false;
    }
  },

  remove(key) {
    if (this.isVaultManaged(key)) {
      delete Vault.cache[key];
      Vault.schedulePersist();
      return;
    }
    localStorage.removeItem(key);
    if (typeof Cloud !== "undefined") Cloud.removeKey(key);
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    if (typeof Vault !== "undefined") Vault.reset();
    if (typeof Cloud !== "undefined") Cloud.deleteAll();
  },

  /* ---------- backup manual (exportar/importar JSON) ---------- */

  exportAll() {
    const dump = { _finplusBackup: true, exportadoEm: new Date().toISOString(), dados: {} };
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (key.indexOf("if_vault_") === 0) return; // metadados do cofre não entram no backup
      const value = this.get(key, undefined);
      if (value !== undefined) dump.dados[name] = value;
    });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dataStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `finplus-backup-${dataStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  importAll(jsonText) {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      throw new Error("Arquivo inválido: não é um JSON legível.");
    }
    const dados = parsed && parsed.dados ? parsed.dados : parsed;
    if (!dados || typeof dados !== "object") {
      throw new Error("Arquivo inválido: estrutura de dados não reconhecida.");
    }
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (dados[name] !== undefined) {
        this.set(key, dados[name]);
      }
    });
  },
};
