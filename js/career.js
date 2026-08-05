/* =========================================================================
   CAREER.JS — Modo Carreira: trilha personalizada por objetivo de vida.
   Não introduz um objetivo novo — reaproveita o que já foi escolhido no
   diagnóstico inicial (js/onboarding.js: profile.pessoal.objetivo,
   LIFE_GOALS) e o cofrinho que o onboarding já criou para ele
   (GOAL_TEMPLATES/Goals.ensureTemplateGoal). O que este módulo adiciona é
   só uma visão curada: quais lições de COURSE já existentes são mais
   relevantes para aquele objetivo (CAREER_PATHS, em data.js), em que
   ordem, e o quanto já foi concluído.
   ========================================================================= */

const Career = {
  getObjective() {
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    return profile && profile.pessoal ? profile.pessoal.objetivo : null;
  },

  chooseObjective(id) {
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    if (!profile) return;
    profile.pessoal = profile.pessoal || {};
    profile.pessoal.objetivo = id;
    Store.set(STORAGE_KEYS.PROFILE, profile);
    Goals.ensureTemplateGoal(id);
    this.render();
    document.dispatchEvent(new CustomEvent("profile:updated"));
  },

  linkedGoal(objectiveId) {
    return Goals.getGoals().find((g) => g.origemObjetivo === objectiveId) || null;
  },

  renderPicker(container) {
    container.innerHTML = `
      <div class="card mt-16">
        <h3>🎯 Modo Carreira</h3>
        <p class="text-soft text-sm">Escolha um objetivo e a Academia Fin+ destaca as lições mais relevantes para ele, além do cofrinho e da simulação certos para o seu caso.</p>
        <div class="life-goals-grid mt-8" id="careerGoalGrid">
          ${LIFE_GOALS.map((g) => `<button class="life-goal-btn" data-id="${g.id}"><span class="emoji">${g.emoji}</span>${g.label}</button>`).join("")}
        </div>
      </div>
    `;
    container.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => this.chooseObjective(btn.dataset.id));
    });
  },

  render() {
    const container = document.getElementById("homeCareerMode");
    if (!container) return;

    const objectiveId = this.getObjective();
    if (!objectiveId || !CAREER_PATHS[objectiveId]) {
      this.renderPicker(container);
      return;
    }

    const goalInfo = LIFE_GOALS.find((g) => g.id === objectiveId);
    const path = CAREER_PATHS[objectiveId];
    const progress = Learn.getProgress();
    const licoes = path.licoes.map((id) => COURSE.flatMap((lvl) => lvl.licoes).find((l) => l.id === id)).filter(Boolean);
    const doneCount = licoes.filter((l) => !!progress[l.id]).length;
    const pct = Math.round((doneCount / licoes.length) * 100);
    const nextLesson = licoes.find((l) => !progress[l.id]) || null;
    const linkedGoal = this.linkedGoal(objectiveId);

    container.innerHTML = `
      <div class="card mt-16">
        <div class="flex-between">
          <h3>${goalInfo.emoji} Modo Carreira: ${goalInfo.label}</h3>
          <button class="btn btn-outline btn-sm" id="careerChangeBtn">Trocar objetivo</button>
        </div>

        <div class="budget-bar-bg mt-8"><div class="budget-bar-fill" style="width:${pct}%"></div></div>
        <p class="text-soft text-sm mt-8">${doneCount}/${licoes.length} lições recomendadas concluídas.</p>

        <div class="mission-list mt-8">
          ${licoes
            .map((l) => {
              const done = !!progress[l.id];
              return `<div class="mission-row ${done ? "done" : ""}">
                <div class="mission-title">${done ? "✅" : "⬜"} ${l.titulo}</div>
              </div>`;
            })
            .join("")}
        </div>

        ${
          nextLesson
            ? `<button class="btn btn-gold btn-sm btn-block mt-16" id="careerGoToTrailBtn">Continuar a trilha</button>`
            : `<div class="alert-box info mt-16">🎉 Você já concluiu todas as lições recomendadas para este objetivo!</div>`
        }

        <div class="mt-16">
          ${
            linkedGoal
              ? `<p class="text-sm"><b>${linkedGoal.emoji} ${linkedGoal.nome}</b>: ${Goals.fmt(linkedGoal.acumulado)} / ${Goals.fmt(linkedGoal.meta)} guardado.</p>`
              : `<button class="btn btn-outline btn-sm" id="careerCreateGoalBtn">Criar cofrinho sugerido para este objetivo</button>`
          }
        </div>

        <p class="text-soft text-sm mt-8">🧮 ${path.simuladorDica}</p>
      </div>
    `;

    document.getElementById("careerChangeBtn").addEventListener("click", () => this.renderPicker(container));
    document.getElementById("careerGoToTrailBtn")?.addEventListener("click", () => Tabs.go("aprender"));
    document.getElementById("careerCreateGoalBtn")?.addEventListener("click", () => {
      Goals.ensureTemplateGoal(objectiveId);
      this.render();
      document.dispatchEvent(new CustomEvent("goals:updated"));
    });
  },

  init() {
    this.render();
  },
};
