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
  STOCK_TRADES: "if_stock_trades",
  STOCK_DIVIDENDS: "if_stock_dividends",
  STOCK_PRICES: "if_stock_prices",
  LESSON_LOG: "if_lesson_log",
  INSTALLMENTS: "if_installments",
  ACCOUNT: "if_account",
  HISTORY_PROGRESS: "if_history_progress",
  BUSINESS_PROGRESS: "if_business_progress",
  COINS: "if_coins",
  LAST_LOGIN_BONUS: "if_last_login_bonus",
  SHOP_OWNED: "if_shop_owned",
  EQUIPPED: "if_equipped",
  LEAGUES: "if_leagues",
};

const Store = {
  get(key, fallback) {
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
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("Erro ao salvar storage:", key, e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },

  /* ---------- backup manual (exportar/importar JSON) ---------- */

  exportAll() {
    const dump = { _finplusBackup: true, exportadoEm: new Date().toISOString(), dados: {} };
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) dump.dados[name] = JSON.parse(raw);
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
        localStorage.setItem(key, JSON.stringify(dados[name]));
      }
    });
  },
};
