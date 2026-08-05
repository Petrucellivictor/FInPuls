/* =========================================================================
   ENGAGEMENT.JS — Desafios diários, missão da semana e evento aleatório
   do dia. Tudo determinístico por data (não muda a cada refresh) e
   persistido em localStorage, renderizado no dashboard (Início).
   ========================================================================= */

const Engagement = {
  init() {
    this.checkDailyLoginBonus();
    this.checkPolvinNotice();
    this.renderHome();
  },

  /* Aviso leve do POLVIn — sem push notification (exigiria backend, fora do
     escopo atual, ver ROADMAP.md Etapa 0): só um toast mostrado no máximo
     1x por dia, ao abrir o app, com o aviso mais relevante no momento.
     Prioridade: sentiu sua falta (2+ dias sem atividade) > streak em risco
     (nada feito hoje, mas tem streak ativo) > perto de subir de nível. */
  checkPolvinNotice() {
    if (typeof Fx === "undefined" || !Fx.polvinNoticeToast) return;
    const today = this.todayStr();
    if (Store.get(STORAGE_KEYS.POLVIN_NOTICE_SHOWN, null) === today) return;

    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0, ultimoDia: null });
    const daysSince = streak.ultimoDia ? Math.round((new Date(today) - new Date(streak.ultimoDia)) / 86400000) : null;

    let message = null;
    if (streak.dias > 0 && daysSince >= 2) {
      message = "🐙 Seu dinheiro sentiu sua falta! Bora continuar de onde parou?";
    } else if (streak.dias > 0 && daysSince >= 1) {
      message = "🐙 Sua sequência está em risco hoje! Complete algo na Academia Fin+ para não perder o streak.";
    } else {
      const faltam = 100 - (Learn.getXp() % 100);
      if (faltam <= 20) message = `🐙 Faltam só ${faltam} XP para você subir de nível!`;
    }

    if (message) {
      Fx.polvinNoticeToast(message);
      Store.set(STORAGE_KEYS.POLVIN_NOTICE_SHOWN, today);
    }
  },

  todayStr() {
    return new Date().toDateString();
  },

  /* Bônus por abrir o app hoje (independente de completar qualquer lição) —
     como os "foguinhos" do Duolingo, mas com moedas escalando pela ofensiva. */
  checkDailyLoginBonus() {
    const today = this.todayStr();
    const last = Store.get(STORAGE_KEYS.LAST_LOGIN_BONUS, null);
    if (last === today) return;
    Store.set(STORAGE_KEYS.LAST_LOGIN_BONUS, today);

    const jaTinhaPerfil = !!Store.get(STORAGE_KEYS.PROFILE, null);
    Learn.addXp(5);
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias;
    const coinBonus = streak >= 30 ? 30 : streak >= 14 ? 20 : streak >= 7 ? 15 : streak >= 3 ? 10 : 5;
    Learn.addCoins(coinBonus);

    if (jaTinhaPerfil && typeof Fx !== "undefined") {
      Fx.dailyBonusToast(streak, coinBonus);
    }
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

  /* Embaralhamento determinístico (mesmo "seed" = mesmo resultado o dia
     inteiro, mas sem o padrão fixo de deslocamento — "amanhã muda tudo",
     não só desliza 1 posição). LCG simples, suficiente para variar a
     seleção diária sem precisar de nada além de Math. */
  seededShuffle(array, seed) {
    const arr = array.slice();
    let s = seed % 233280 || 1;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /* Garante que o pacote de hoje/semana está gerado, sem repetir a cada render. */
  ensureFreshState() {
    const state = this.getState();
    const today = this.todayStr();
    const wk = this.weekKey();

    if (state.date !== today) {
      const dayIndex = new Date().getDate() + new Date().getMonth() * 31 + new Date().getFullYear() * 372;
      const embaralhado = this.seededShuffle(DAILY_CHALLENGES, dayIndex);
      const ids = embaralhado.slice(0, 3).map((c) => c.id);
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
      case "run_simulation":
        return Store.get(STORAGE_KEYS.SIMULATOR_LOG, []).some((l) => new Date(l.data).toDateString() === today);
      case "ask_polvin":
        return Store.get(STORAGE_KEYS.POLVIN_LOG, []).some((l) => new Date(l.data).toDateString() === today);
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
    if (opt.xp) {
      Learn.addXp(opt.xp);
      Learn.addCoins(3);
    }
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
        Learn.addCoins(2);
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
        Learn.addCoins(10);
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
