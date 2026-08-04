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
};
