/* =========================================================================
   GOALS.JS — Cofrinhos virtuais (metas de economia)
   Cada cofrinho tem um nome, emoji, valor-meta e valor acumulado. Aportes
   são feitos manualmente pelo usuário. Ao atingir 100%, o cofrinho é
   marcado como concluído e uma conquista pode ser desbloqueada.
   ========================================================================= */

const Goals = {
  init() {
    document.getElementById("goalAddBtn")?.addEventListener("click", () => this.addGoal());
    this.renderAll();
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  getGoals() {
    return Store.get(STORAGE_KEYS.GOALS, []);
  },

  setGoals(goals) {
    Store.set(STORAGE_KEYS.GOALS, goals);
  },

  addGoal() {
    const nome = document.getElementById("goalNomeInput").value.trim();
    const meta = parseFloat(document.getElementById("goalMetaInput").value);
    if (!nome || !meta || meta <= 0) {
      alert("Dê um nome e um valor-meta válido para o cofrinho.");
      return;
    }
    const goals = this.getGoals();
    goals.push({ id: Date.now().toString(), nome, emoji: "🐷", meta, acumulado: 0, concluido: false, criadoEm: new Date().toISOString() });
    this.setGoals(goals);
    document.getElementById("goalNomeInput").value = "";
    document.getElementById("goalMetaInput").value = "";
    this.renderAll();
    document.dispatchEvent(new CustomEvent("goals:updated"));
  },

  /* Criado automaticamente a partir do objetivo escolhido no onboarding.
     Não duplica se o usuário já tiver um cofrinho com a mesma origem. */
  ensureTemplateGoal(objetivoId) {
    const template = GOAL_TEMPLATES[objetivoId];
    if (!template) return;
    const goals = this.getGoals();
    if (goals.some((g) => g.origemObjetivo === objetivoId)) return;
    goals.push({
      id: Date.now().toString(),
      nome: template.nome,
      emoji: template.emoji,
      meta: template.metaSugerida,
      acumulado: 0,
      concluido: false,
      origemObjetivo: objetivoId,
      criadoEm: new Date().toISOString(),
    });
    this.setGoals(goals);
  },

  addContribution(id, valor) {
    const goals = this.getGoals();
    const goal = goals.find((g) => g.id === id);
    if (!goal || !valor || valor <= 0) return;
    goal.acumulado += valor;
    goal.historico = goal.historico || [];
    goal.historico.push({ valor, data: new Date().toISOString() });
    if (goal.acumulado >= goal.meta && !goal.concluido) {
      goal.concluido = true;
      setTimeout(() => alert(`🎉 Parabéns! Você completou o cofrinho "${goal.nome}"!`), 50);
    }
    this.setGoals(goals);
    this.renderAll();
    document.dispatchEvent(new CustomEvent("goals:updated"));
  },

  removeGoal(id) {
    if (!confirm("Remover este cofrinho?")) return;
    this.setGoals(this.getGoals().filter((g) => g.id !== id));
    this.renderAll();
    document.dispatchEvent(new CustomEvent("goals:updated"));
  },

  /* Total aportado em qualquer cofrinho nos últimos `dias` dias (usado nas missões semanais). */
  totalContributedSince(sinceDate) {
    let total = 0;
    this.getGoals().forEach((g) => {
      (g.historico || []).forEach((h) => {
        if (new Date(h.data) >= sinceDate) total += h.valor;
      });
    });
    return total;
  },

  contributedToday() {
    const hoje = new Date().toDateString();
    return this.getGoals().some((g) => (g.historico || []).some((h) => new Date(h.data).toDateString() === hoje));
  },

  renderAll() {
    const container = document.getElementById("goalsList");
    if (!container) return;
    const goals = this.getGoals();
    if (!goals.length) {
      container.innerHTML = `<div class="text-soft text-sm">Nenhum cofrinho criado ainda. Dê um nome e uma meta para começar a guardar dinheiro com propósito.</div>`;
      return;
    }
    container.innerHTML = goals
      .map((g) => {
        const pct = Math.min(100, (g.acumulado / g.meta) * 100);
        return `
        <div class="card goal-card ${g.concluido ? "done" : ""}">
          <div class="flex-between">
            <b>${g.emoji} ${g.nome}</b>
            <button class="del-btn" data-remove="${g.id}" title="Remover">✕</button>
          </div>
          <div class="budget-bar-bg mt-8"><div class="budget-bar-fill ${g.concluido ? "" : ""}" style="width:${pct}%;background:${g.concluido ? "var(--green)" : "var(--primary)"}"></div></div>
          <div class="flex-between text-sm mt-8">
            <span class="text-soft">${this.fmt(g.acumulado)} de ${this.fmt(g.meta)}</span>
            <span class="text-soft">${pct.toFixed(0)}%</span>
          </div>
          ${
            g.concluido
              ? `<div class="alert-box info mt-8">🎉 Meta concluída!</div>`
              : `<div class="flex gap-8 mt-8">
                  <input type="number" class="goal-contrib-input" data-id="${g.id}" placeholder="Valor R$" min="0" step="0.01" style="flex:1" />
                  <button class="btn btn-gold btn-sm" data-contribute="${g.id}">Guardar</button>
                </div>`
          }
        </div>`;
      })
      .join("");

    container.querySelectorAll("[data-remove]").forEach((btn) => btn.addEventListener("click", () => this.removeGoal(btn.dataset.remove)));
    container.querySelectorAll("[data-contribute]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = container.querySelector(`.goal-contrib-input[data-id="${btn.dataset.contribute}"]`);
        const valor = parseFloat(input.value);
        if (!valor || valor <= 0) {
          alert("Informe um valor válido para guardar.");
          return;
        }
        this.addContribution(btn.dataset.contribute, valor);
      });
    });
  },
};
