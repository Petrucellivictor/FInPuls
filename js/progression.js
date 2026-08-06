/* =========================================================================
   PROGRESSION.JS — Desbloqueio progressivo de ferramentas por nível
   (RFC-012). Mesmo padrão de js/achievements.js (CHECKERS + checkAll +
   notify), aplicado a abas inteiras em vez de emblemas: `profile.nivel`
   (diagnóstico inicial) finalmente tem um efeito real, junto com o
   progresso real na trilha. Os módulos "gated" (js/stocks.js,
   js/advanced.js) não sabem que estão sendo gated — o bloqueio vive
   inteiramente aqui, via classes CSS na aba/painel.
   ========================================================================= */

const Progression = {
  CHECKERS: {
    acoesfiis: () => {
      const profile = Store.get(STORAGE_KEYS.PROFILE, null);
      if (profile && profile.nivel === "avancado") return true;
      const progress = Learn.getProgress();
      const nivel3 = COURSE.find((lvl) => lvl.id === "nivel3");
      return !!nivel3 && nivel3.licoes.every((l) => !!progress[l.id]);
    },
    avancado: () => {
      const profile = Store.get(STORAGE_KEYS.PROFILE, null);
      if (profile && (profile.nivel === "avancado" || profile.nivel === "intermediario")) return true;
      const progress = Learn.getProgress();
      return COURSE[0].licoes.every((l) => !!progress[l.id]);
    },
  },

  getUnlocked() {
    return Store.get(STORAGE_KEYS.FEATURES_UNLOCKED, []);
  },

  isUnlocked(id) {
    return this.getUnlocked().includes(id);
  },

  checkAll() {
    const unlocked = this.getUnlocked();
    let changed = false;
    const novas = [];

    FEATURE_GATES.forEach((gate) => {
      if (unlocked.includes(gate.id)) return;
      const check = this.CHECKERS[gate.id];
      if (check && check()) {
        unlocked.push(gate.id);
        novas.push(gate);
        changed = true;
      }
    });

    if (changed) {
      Store.set(STORAGE_KEYS.FEATURES_UNLOCKED, unlocked);
      novas.forEach((gate) => this.notify(gate));
      this.renderTabs();
    }
    return novas;
  },

  notify(gate) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast level-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `<span class="emoji">${gate.emoji}</span><div><b>Nova ferramenta desbloqueada!</b><br/>${gate.mensagemDesbloqueio}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 5500);
  },

  lockedPanelHtml(gate) {
    return `
      <div class="card gate-lock-card" style="text-align:center">
        <div style="font-size:48px">🔒</div>
        <h2>${gate.nome} ainda bloqueado</h2>
        <p class="text-soft">Esta ferramenta libera quando você: <b>${gate.requisito}</b>.</p>
        <p class="text-soft text-sm">Continue evoluindo na Academia PolvIn — você será avisado na hora que desbloquear.</p>
      </div>`;
  },

  /* Aplica/remove o estado bloqueado no botão da aba e no painel — a aba
     NUNCA desaparece do menu, só fica marcada e mostra uma prévia em vez
     do conteúdo real (mesmo espírito do "???" da Cidade Financeira). */
  renderTabs() {
    FEATURE_GATES.forEach((gate) => {
      const unlocked = this.isUnlocked(gate.id);

      const btn = document.querySelector(`.tab-btn[data-tab="${gate.tab}"]`);
      if (btn) btn.classList.toggle("tab-locked", !unlocked);

      const panel = document.getElementById(`tab-${gate.tab}`);
      if (panel) panel.classList.toggle("gate-locked", !unlocked);

      const overlay = document.getElementById(`gateLock-${gate.tab}`);
      if (overlay) overlay.innerHTML = unlocked ? "" : this.lockedPanelHtml(gate);
    });
  },

  init() {
    this.checkAll();
    this.renderTabs();
  },
};
