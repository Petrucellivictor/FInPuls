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
    trilha_unificada_completa: () => {
      const courseProgress = Learn.getProgress();
      const historyProgress = Store.get(STORAGE_KEYS.HISTORY_PROGRESS, {});
      const courseDone = COURSE.every((lvl) => lvl.licoes.every((l) => !!courseProgress[l.id]));
      const historyDone = HISTORY_COURSE.every((lvl) => lvl.licoes.every((l) => !!historyProgress[l.id]));
      return courseDone && historyDone;
    },
    primeiro_passo_empreendedor: () => Object.keys(Store.get(STORAGE_KEYS.BUSINESS_PROGRESS, {})).length > 0,
    mestre_empreendedor: () => {
      const progress = Store.get(STORAGE_KEYS.BUSINESS_PROGRESS, {});
      return BUSINESS_COURSE.every((lvl) => lvl.licoes.every((l) => !!progress[l.id]));
    },
    renda_fixa_completa: () => {
      const progress = Learn.getProgress();
      const nivel2 = COURSE.find((lvl) => lvl.id === "nivel2");
      return !!nivel2 && nivel2.licoes.every((l) => !!progress[l.id]);
    },
    renda_variavel_completa: () => {
      const progress = Learn.getProgress();
      const nivel3 = COURSE.find((lvl) => lvl.id === "nivel3");
      return !!nivel3 && nivel3.licoes.every((l) => !!progress[l.id]);
    },
    primeira_licao: () => Store.get(STORAGE_KEYS.LESSON_LOG, []).length > 0,
    simulador_50x: () => Store.get(STORAGE_KEYS.SIMULATOR_RUNS, 0) >= 50,
    leu_10_livros: () => Object.keys(Store.get(STORAGE_KEYS.BOOKS_COMPLETED, {})).length >= 10,
    amigo_polvin: () => Store.get(STORAGE_KEYS.POLVIN_QUESTIONS_ASKED, 0) >= 10,
    primeiro_certificado: () => Object.keys(Store.get(STORAGE_KEYS.BOOKS_COMPLETED, {})).length > 0,
    vida_na_cidade_iniciada: () => Store.get(STORAGE_KEYS.CITY_LIFE, { semana: 0 }).semana >= 1,
    vida_na_cidade_1_ano: () => Store.get(STORAGE_KEYS.CITY_LIFE, { semana: 0 }).semana >= 12,
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
      if (typeof City !== "undefined") City.render();
    }
    return novas;
  },

  notify(achievement) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
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
