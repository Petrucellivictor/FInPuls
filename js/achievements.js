/* =========================================================================
   ACHIEVEMENTS.JS — Conquistas desbloqueadas pelo uso real do app.
   As descrições vivem em data.js (ACHIEVEMENTS); a verificação de cada
   uma é feita aqui, contra o estado atual salvo no localStorage.
   ========================================================================= */

const Achievements = {
  CHECKERS: {
    primeira_meta: () => Goals.getGoals().length > 0,
    meta_concluida: () => Goals.getGoals().some((g) => g.concluido),
    primeiro_investimento: () => Portfolio.getHoldings().length > 0,
    primeira_acao: () => (typeof Stocks !== "undefined" ? Stocks.getTrades().length > 0 : false),
    primeiro_dividendo: () => (typeof Stocks !== "undefined" ? Stocks.getDividends().length > 0 : false),
    streak_7: () => Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias >= 7,
    streak_30: () => Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias >= 30,
    streak_100: () => Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias >= 100,
    reserva_formada: () => (Portfolio.totalsByClass().porClasse["Caixa/Reserva"] || 0) >= 1000,
    nivel1_completo: () => {
      const progress = Learn.getProgress();
      return COURSE[0].licoes.every((l) => !!progress[l.id]);
    },
    trilha_completa: () => {
      const progress = Learn.getProgress();
      return COURSE.every((lvl) => lvl.licoes.every((l) => !!progress[l.id]));
    },
    primeiro_desafio: () => Store.get(STORAGE_KEYS.CHALLENGES_STATE, { totalCompleted: 0 }).totalCompleted > 0,
    leitor: () => Store.get(STORAGE_KEYS.BOOKS_SEEN, []).length > 0,
    primeiro_conto: () => Object.keys(Store.get(STORAGE_KEYS.HISTORY_PROGRESS, {})).length > 0,
    historiador: () => {
      const progress = Store.get(STORAGE_KEYS.HISTORY_PROGRESS, {});
      return HISTORY_COURSE.every((lvl) => lvl.licoes.every((l) => !!progress[l.id]));
    },
    primeira_compra_parcelada: () => (typeof Installments !== "undefined" ? Installments.getAll().length > 0 : false),
  },

  getUnlocked() {
    return Store.get(STORAGE_KEYS.ACHIEVEMENTS_UNLOCKED, []);
  },

  checkAll() {
    const unlocked = this.getUnlocked();
    let changed = false;
    const novas = [];

    ACHIEVEMENTS.forEach((a) => {
      if (unlocked.includes(a.id)) return;
      const check = this.CHECKERS[a.id];
      if (check && check()) {
        unlocked.push(a.id);
        novas.push(a);
        changed = true;
      }
    });

    if (changed) {
      Store.set(STORAGE_KEYS.ACHIEVEMENTS_UNLOCKED, unlocked);
      novas.forEach((a) => this.notify(a));
      this.render();
    }
    return novas;
  },

  notify(achievement) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `<span class="emoji">${achievement.emoji}</span><div><b>Conquista desbloqueada!</b><br/>${achievement.titulo}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  },

  render() {
    const container = document.getElementById("achievementsGrid");
    if (!container) return;
    const unlocked = this.getUnlocked();
    container.innerHTML = ACHIEVEMENTS.map((a) => {
      const done = unlocked.includes(a.id);
      return `
      <div class="achievement-badge ${done ? "unlocked" : "locked"}" title="${a.descricao}">
        <div class="achievement-emoji">${done ? a.emoji : "🔒"}</div>
        <div class="achievement-title">${a.titulo}</div>
      </div>`;
    }).join("");
  },

  init() {
    this.render();
    this.checkAll();
  },
};
