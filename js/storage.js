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
  HISTORY_PROGRESS: "if_history_progress",
  BUSINESS_PROGRESS: "if_business_progress",
  ENERGY: "if_energy",
  COINS: "if_coins",
  LAST_LOGIN_BONUS: "if_last_login_bonus",
  SHOP_OWNED: "if_shop_owned",
  EQUIPPED: "if_equipped",
  LEAGUES: "if_leagues",
  // RFC-037 Fase 1 — marcador de "até onde as celebrações maiores (nível
  // completo / N lições) já avisaram o usuário", nunca progresso em si
  // (isso continua 100% em COURSE_PROGRESS/HISTORY_PROGRESS/
  // BUSINESS_PROGRESS). Mesmo padrão de STORAGE_KEYS.STORIES_SEEN/
  // BOOKS_SEEN/POLVIN_NOTICE_SHOWN — "não repetir aviso já mostrado".
  CELEBRATIONS_SEEN: "if_celebrations_seen",
  SIMULATOR_RUNS: "if_simulator_runs",
  SIMULATOR_LOG: "if_simulator_log",
  POLVIN_QUESTIONS_ASKED: "if_polvin_questions_asked",
  POLVIN_LOG: "if_polvin_log",
  POLVIN_NOTICE_SHOWN: "if_polvin_notice_shown",
  SEASONAL_STATE: "if_seasonal_state",
  CITY_DECORATIONS_OWNED: "if_city_decorations_owned",
  CITY_LIFE: "if_city_life",
  FEATURES_UNLOCKED: "if_features_unlocked",
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

  /* Limpa só o cache local deste navegador (localStorage + estado do
     cofre) — NÃO toca a nuvem. Com a conta obrigatória e o Supabase como
     fonte de verdade (RFC-027), isso é seguro de usar em qualquer fluxo
     "esqueci uma senha local": ao recarregar, o boot re-hidrata os dados a
     partir da nuvem normalmente, já que a sessão de conta continua válida
     — nada de real é perdido, só o cache. */
  clearLocalOnly() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    if (typeof Vault !== "undefined") Vault.reset();
  },

  /* Apaga de verdade os dados desta conta na nuvem (Supabase) — a fonte de
     verdade. Só deve ser chamado por um fluxo que o usuário entende
     explicitamente como "apagar tudo, em todo lugar", nunca como efeito
     colateral de resetar algo puramente local (ex.: senha do cofre). */
  clearCloudData() {
    if (typeof Cloud !== "undefined") return Cloud.deleteAll();
  },

  /* Reset completo (local + nuvem). Mantido para os fluxos que realmente
     pedem "apagar tudo" (ex.: botão de reset do onboarding) — o botão
     "esqueci a senha do cofre" NÃO deve usar isto, ver clearLocalOnly(). */
  clearAll() {
    this.clearLocalOnly();
    this.clearCloudData();
  },

  /* ---------- backup manual (exportar/importar JSON) ---------- */

  exportAll() {
    const dump = { _polvinBackup: true, exportadoEm: new Date().toISOString(), dados: {} };
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
    a.download = `polvin-backup-${dataStr}.json`;
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
