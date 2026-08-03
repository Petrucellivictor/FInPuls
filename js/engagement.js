/* =========================================================================
   ENGAGEMENT.JS — Desafios diários, missão da semana e evento aleatório
   do dia. Tudo determinístico por data (não muda a cada refresh) e
   persistido em localStorage, renderizado no dashboard (Início).
   ========================================================================= */

const Engagement = {
  init() {
    this.renderHome();
  },

  todayStr() {
    return new Date().toDateString();
  },

  weekKey() {
    return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  },

  getState() {
    return Store.get(STORAGE_KEYS.CHALLENGES_STATE, {
      date: null,
      dailyIds: [],
      dailyCompletedManual: [],
      xpAwardedToday: [],
      weekKey: null,
      weeklyId: null,
      weeklyAwarded: false,
      eventDate: null,
      eventId: null,
      eventAnswerIdx: null,
      totalCompleted: 0,
    });
  },

  setState(state) {
    Store.set(STORAGE_KEYS.CHALLENGES_STATE, state);
  },

  /* Garante que o pacote de hoje/semana está gerado, sem repetir a cada render. */
  ensureFreshState() {
    const state = this.getState();
    const today = this.todayStr();
    const wk = this.weekKey();

    if (state.date !== today) {
      const dayIndex = new Date().getDate() + new Date().getMonth() * 31;
      const pool = DAILY_CHALLENGES;
      const ids = [];
      for (let i = 0; i < 3 && i < pool.length; i++) {
        const idx = (dayIndex + i * 3) % pool.length;
        if (!ids.includes(pool[idx].id)) ids.push(pool[idx].id);
      }
      state.date = today;
      state.dailyIds = ids;
      state.dailyCompletedManual = [];
      state.xpAwardedToday = [];
      state.eventDate = today;
      state.eventId = RANDOM_EVENTS[dayIndex % RANDOM_EVENTS.length].id;
      state.eventAnswerIdx = null;
    }

    if (state.weekKey !== wk) {
      state.weekKey = wk;
      state.weeklyId = WEEKLY_MISSIONS[wk % WEEKLY_MISSIONS.length].id;
      state.weeklyAwarded = false;
    }

    this.setState(state);
    return state;
  },

  startOfWeekDate() {
    return new Date(this.weekKey() * 7 * 24 * 60 * 60 * 1000);
  },

  isDailyChallengeAutoDone(challenge) {
    const today = this.todayStr();
    switch (challenge.id) {
      case "log_expense":
        return Wallet.getTransactions().some((t) => new Date(t.data).toDateString() === today);
      case "complete_lesson":
        return Store.get(STORAGE_KEYS.LESSON_LOG, []).some((l) => new Date(l.data).toDateString() === today);
      case "save_goal":
        return Goals.contributedToday();
      default:
        return false;
    }
  },

  isDailyChallengeDone(state, challenge) {
    if (challenge.tipo === "auto") return this.isDailyChallengeAutoDone(challenge);
    return state.dailyCompletedManual.includes(challenge.id);
  },

  weeklyProgress(mission) {
    const since = this.startOfWeekDate();
    switch (mission.id) {
      case "week_lessons_3":
        return Store.get(STORAGE_KEYS.LESSON_LOG, []).filter((l) => new Date(l.data) >= since).length;
      case "week_save_100":
        return Goals.totalContributedSince(since);
      case "week_log_5tx":
        return Wallet.getTransactions().filter((t) => new Date(t.data) >= since).length;
      default:
        return 0;
    }
  },

  markDailyManual(id) {
    const state = this.ensureFreshState();
    if (!state.dailyCompletedManual.includes(id)) {
      state.dailyCompletedManual.push(id);
      this.setState(state);
    }
    this.checkAwards();
    this.renderHome();
  },

  answerEvent(optIdx) {
    const state = this.ensureFreshState();
    if (state.eventAnswerIdx !== null) return;
    const event = RANDOM_EVENTS.find((e) => e.id === state.eventId);
    const opt = event.opcoes[optIdx];
    state.eventAnswerIdx = optIdx;
    this.setState(state);
    if (opt.xp) Learn.addXp(opt.xp);
    this.renderHome();
  },

  /* Concede XP uma única vez por desafio/missão concluído, e mantém o contador
     total (usado pela conquista "primeiro desafio concluído"). */
  checkAwards() {
    const state = this.ensureFreshState();
    let changed = false;

    state.dailyIds.forEach((id) => {
      const challenge = DAILY_CHALLENGES.find((c) => c.id === id);
      if (!challenge) return;
      const done = this.isDailyChallengeDone(state, challenge);
      if (done && !state.xpAwardedToday.includes(id)) {
        Learn.addXp(challenge.xp);
        state.xpAwardedToday.push(id);
        state.totalCompleted++;
        changed = true;
      }
    });

    const mission = WEEKLY_MISSIONS.find((m) => m.id === state.weeklyId);
    if (mission && !state.weeklyAwarded) {
      const progress = this.weeklyProgress(mission);
      if (progress >= mission.meta) {
        Learn.addXp(mission.xp);
        state.weeklyAwarded = true;
        state.totalCompleted++;
        changed = true;
      }
    }

    if (changed) this.setState(state);
    if (typeof Achievements !== "undefined") Achievements.checkAll();
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  renderHome() {
    const dailyEl = document.getElementById("homeDailyChallenges");
    const weeklyEl = document.getElementById("homeWeeklyMission");
    const eventEl = document.getElementById("homeRandomEvent");
    if (!dailyEl || !weeklyEl || !eventEl) return;

    const state = this.ensureFreshState();
    this.checkAwards();

    dailyEl.innerHTML = state.dailyIds
      .map((id) => {
        const c = DAILY_CHALLENGES.find((ch) => ch.id === id);
        if (!c) return "";
        const done = this.isDailyChallengeDone(state, c);
        return `
        <div class="mission-row ${done ? "done" : ""}">
          <div>
            <div class="mission-title">${done ? "✅" : "⬜"} ${c.titulo}</div>
            <div class="text-soft text-sm">${c.descricao}</div>
          </div>
          <div class="flex gap-8" style="flex-shrink:0">
            <span class="mission-xp">+${c.xp} XP</span>
            ${c.tipo === "manual" && !done ? `<button class="btn btn-outline btn-sm" data-mark="${c.id}">Marcar</button>` : ""}
          </div>
        </div>`;
      })
      .join("");

    dailyEl.querySelectorAll("[data-mark]").forEach((btn) => {
      btn.addEventListener("click", () => this.markDailyManual(btn.dataset.mark));
    });

    const mission = WEEKLY_MISSIONS.find((m) => m.id === state.weeklyId);
    if (mission) {
      const progress = this.weeklyProgress(mission);
      const isCount = mission.id !== "week_save_100";
      const pct = Math.min(100, (progress / mission.meta) * 100);
      weeklyEl.innerHTML = `
        <div class="mission-title">${state.weeklyAwarded ? "✅" : "🗺️"} ${mission.titulo}</div>
        <div class="text-soft text-sm">${mission.descricao}</div>
        <div class="budget-bar-bg mt-8"><div class="budget-bar-fill" style="width:${pct}%;background:${state.weeklyAwarded ? "var(--green)" : "var(--primary)"}"></div></div>
        <div class="flex-between text-sm mt-8">
          <span class="text-soft">${isCount ? `${Math.min(progress, mission.meta)} / ${mission.meta}` : `${this.fmt(progress)} / ${this.fmt(mission.meta)}`}</span>
          <span class="mission-xp">+${mission.xp} XP</span>
        </div>
      `;
    }

    const event = RANDOM_EVENTS.find((e) => e.id === state.eventId);
    if (event) {
      if (state.eventAnswerIdx !== null) {
        const opt = event.opcoes[state.eventAnswerIdx];
        eventEl.innerHTML = `
          <div class="text-sm"><b>${event.titulo}</b></div>
          <div class="quiz-feedback mt-8">${opt.ideal ? "✅" : "💭"} ${opt.feedback} ${opt.xp ? `<b>(+${opt.xp} XP)</b>` : ""}</div>
          <p class="text-soft text-sm mt-8">Volte amanhã para um novo evento.</p>
        `;
      } else {
        eventEl.innerHTML = `
          <div class="text-sm"><b>${event.titulo}</b></div>
          <p class="text-soft text-sm">${event.situacao}</p>
          <div class="flex" style="flex-direction:column;gap:8px">
            ${event.opcoes.map((o, i) => `<button class="quiz-option" data-opt="${i}">${o.texto}</button>`).join("")}
          </div>
        `;
        eventEl.querySelectorAll("[data-opt]").forEach((btn) => {
          btn.addEventListener("click", () => this.answerEvent(Number(btn.dataset.opt)));
        });
      }
    }
  },
};
