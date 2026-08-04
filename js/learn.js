/* =========================================================================
   LEARN.JS — Utilitários de gamificação (XP, streak, nível de jogador)
   A renderização da trilha (financeira + história intercaladas) e o fluxo
   de quiz vivem em js/trail.js. Este módulo guarda só o "estado do
   jogador", usado em vários pontos do app (header, home, conquistas).
   ========================================================================= */

const Learn = {
  getProgress() {
    return Store.get(STORAGE_KEYS.COURSE_PROGRESS, {}); // { lessonId: true }
  },

  getXp() {
    return Store.get(STORAGE_KEYS.XP, 0);
  },

  addXp(amount) {
    const oldLevel = this.playerLevel();
    const xp = this.getXp() + amount;
    Store.set(STORAGE_KEYS.XP, xp);
    this.bumpStreak();
    document.dispatchEvent(new CustomEvent("xp:updated"));
    const newLevel = this.playerLevel();
    if (newLevel > oldLevel && typeof Fx !== "undefined") {
      const tierOld = playerLevelTitle(oldLevel);
      const tierNew = playerLevelTitle(newLevel);
      if (tierNew.titulo !== tierOld.titulo) Fx.levelUpToast(tierNew);
    }
    return xp;
  },

  bumpStreak() {
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0, ultimoDia: null });
    const hoje = new Date().toDateString();
    if (streak.ultimoDia === hoje) return; // já contou hoje
    const ontem = new Date(Date.now() - 86400000).toDateString();
    streak.dias = streak.ultimoDia === ontem ? streak.dias + 1 : 1;
    streak.ultimoDia = hoje;
    Store.set(STORAGE_KEYS.STREAK, streak);
  },

  playerLevel() {
    const xp = this.getXp();
    // cada 100xp = 1 nível de jogador
    return Math.floor(xp / 100) + 1;
  },

  /* ---------- Moedas (moeda de troca da Loja, separada do XP) ---------- */

  getCoins() {
    return Store.get(STORAGE_KEYS.COINS, 0);
  },

  addCoins(amount) {
    const coins = this.getCoins() + amount;
    Store.set(STORAGE_KEYS.COINS, coins);
    document.dispatchEvent(new CustomEvent("coins:updated"));
    return coins;
  },

  spendCoins(amount) {
    const coins = this.getCoins();
    if (coins < amount) return false;
    Store.set(STORAGE_KEYS.COINS, coins - amount);
    document.dispatchEvent(new CustomEvent("coins:updated"));
    return true;
  },

  /* Pontuação total: combina XP, moedas, conquistas e streak num único
     número usado para o ranking e as medalhas por faixa. */
  totalScore() {
    const xp = this.getXp();
    const coins = this.getCoins();
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias;
    const achievements = Store.get(STORAGE_KEYS.ACHIEVEMENTS_UNLOCKED, []).length;
    return xp + coins * 2 + achievements * 20 + streak * 5;
  },
};
