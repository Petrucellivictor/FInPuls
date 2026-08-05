/* =========================================================================
   EVENTS.JS — Eventos temporários (janelas fixas no calendário, recorrentes
   todo ano): missões especiais, XP em dobro nas lições da trilha, e uma
   moldura exclusiva na Loja enquanto o evento estiver ativo.
   Dados em SEASONAL_EVENTS (data.js). Sem ranking sincronizado entre
   usuários (exigiria backend, ver ROADMAP.md Etapa 0) — quem quiser
   comparar XP ganho durante o evento com amigos já pode usar as Ligas
   locais/manuais da aba Desafios.
   ========================================================================= */

const Events = {
  todayMMDD() {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  /* Nenhum intervalo em SEASONAL_EVENTS cruza a virada do ano (31/12 → 01/01),
     então comparar strings "MM-DD" com zero-padding basta — não precisa
     tratar wraparound. */
  getActiveEvent() {
    const today = this.todayMMDD();
    return SEASONAL_EVENTS.find((e) => today >= e.inicio && today <= e.fim) || null;
  },

  xpMultiplier() {
    const event = this.getActiveEvent();
    return event ? event.xpMultiplicador : 1;
  },

  applyMultiplier(baseXp) {
    return Math.round(baseXp * this.xpMultiplier());
  },

  /* Início da ocorrência ATUAL do evento (este ano), usado para verificar
     as missões especiais só contra atividade feita durante a janela aberta. */
  occurrenceStart(event) {
    const [mm, dd] = event.inicio.split("-").map(Number);
    return new Date(new Date().getFullYear(), mm - 1, dd);
  },

  getState() {
    return Store.get(STORAGE_KEYS.SEASONAL_STATE, { occurrenceKey: null, missionsAwarded: [] });
  },

  setState(state) {
    Store.set(STORAGE_KEYS.SEASONAL_STATE, state);
  },

  /* Cada evento recorre todo ano — a "occurrenceKey" muda a cada ano novo,
     zerando as missões premiadas sem precisar de nenhuma lógica de expiração. */
  ensureFreshState(event) {
    const state = this.getState();
    const key = `${event.id}-${new Date().getFullYear()}`;
    if (state.occurrenceKey !== key) {
      state.occurrenceKey = key;
      state.missionsAwarded = [];
      this.setState(state);
    }
    return state;
  },

  isSpecialMissionDone(mission, sinceDate) {
    switch (mission.tipo) {
      case "licao":
        return Store.get(STORAGE_KEYS.LESSON_LOG, []).some((l) => new Date(l.data) >= sinceDate);
      case "licao_nivel3": {
        const nivel3 = COURSE.find((lvl) => lvl.id === "nivel3");
        const ids = nivel3 ? nivel3.licoes.map((l) => l.id) : [];
        return Store.get(STORAGE_KEYS.LESSON_LOG, []).some((l) => ids.includes(l.lessonId) && new Date(l.data) >= sinceDate);
      }
      case "simulacao":
        return Store.get(STORAGE_KEYS.SIMULATOR_LOG, []).some((l) => new Date(l.data) >= sinceDate);
      case "polvin":
        return Store.get(STORAGE_KEYS.POLVIN_LOG, []).some((l) => new Date(l.data) >= sinceDate);
      case "transacao":
        return (typeof Wallet !== "undefined" ? Wallet.getTransactions() : []).some((t) => new Date(t.data) >= sinceDate);
      case "meta":
        return (typeof Goals !== "undefined" ? Goals.totalContributedSince(sinceDate) : 0) > 0;
      case "livro":
        return Object.values(Store.get(STORAGE_KEYS.BOOKS_COMPLETED, {})).some((b) => new Date(b.data) >= sinceDate);
      default:
        return false;
    }
  },

  checkAwards(event) {
    const state = this.ensureFreshState(event);
    const since = this.occurrenceStart(event);
    let changed = false;

    event.missoesEspeciais.forEach((m) => {
      if (state.missionsAwarded.includes(m.id)) return;
      if (this.isSpecialMissionDone(m, since)) {
        Learn.addXp(m.xp);
        Learn.addCoins(5);
        state.missionsAwarded.push(m.id);
        changed = true;
      }
    });

    if (changed) {
      this.setState(state);
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    }
  },

  render() {
    const container = document.getElementById("homeSeasonalEvent");
    if (!container) return;

    const event = this.getActiveEvent();
    if (!event) {
      container.innerHTML = "";
      return;
    }

    this.checkAwards(event);
    const state = this.getState();

    container.innerHTML = `
      <div class="card mt-16 seasonal-event-card">
        <div class="flex-between">
          <h3>${event.emoji} ${event.nome}</h3>
          <span class="mission-xp">🔥 XP em dobro nas lições</span>
        </div>
        <p class="text-soft text-sm">${event.descricao}</p>
        ${event.missoesEspeciais
          .map((m) => {
            const done = state.missionsAwarded.includes(m.id);
            return `
            <div class="mission-row ${done ? "done" : ""}">
              <div>
                <div class="mission-title">${done ? "✅" : "⬜"} ${m.titulo}</div>
                <div class="text-soft text-sm">${m.descricao}</div>
              </div>
              <span class="mission-xp">+${m.xp} XP</span>
            </div>`;
          })
          .join("")}
        <p class="text-soft text-sm mt-8">🎁 Moldura exclusiva liberada na Loja (aba Perfil) enquanto o evento estiver ativo.</p>
      </div>
    `;
  },

  init() {
    this.render();
  },
};
