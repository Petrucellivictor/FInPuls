/* =========================================================================
   ENERGY.JS — Sistema de energia (estilo Duolingo), limitando quantas
   lições podem ser INICIADAS por dia. Renova para o máximo a cada novo
   dia (mesma lógica de data usada no streak, em js/learn.js). Acertar
   ENERGY_COMBO perguntas seguidas dentro de uma lição devolve +1 energia
   na hora, mesmo sem esperar o dia seguinte.
   ========================================================================= */

const ENERGY_MAX = 5;
const ENERGY_COMBO = 3;

const Energy = {
  init() {
    this.ensureFresh();
    this.render();
  },

  /* Reseta para o máximo se o último reset não foi hoje — mesmo padrão de
     comparação de `toDateString()` usado em Learn.bumpStreak(). */
  ensureFresh() {
    const e = Store.get(STORAGE_KEYS.ENERGY, { atual: ENERGY_MAX, ultimoReset: null });
    const hoje = new Date().toDateString();
    let dirty = false;
    if (e.ultimoReset !== hoje) {
      e.atual = ENERGY_MAX;
      e.ultimoReset = hoje;
      dirty = true;
    }
    if (typeof e.atual !== "number" || !Number.isFinite(e.atual)) {
      e.atual = ENERGY_MAX;
      dirty = true;
    } else if (e.atual < 0 || e.atual > ENERGY_MAX) {
      e.atual = Math.min(ENERGY_MAX, Math.max(0, e.atual));
      dirty = true;
    }
    if (dirty) Store.set(STORAGE_KEYS.ENERGY, e);
    return e;
  },

  get() {
    return this.ensureFresh().atual;
  },

  has() {
    return this.get() > 0;
  },

  spend() {
    const e = this.ensureFresh();
    if (e.atual <= 0) return false;
    e.atual -= 1;
    Store.set(STORAGE_KEYS.ENERGY, e);
    this.render();
    return true;
  },

  bonus(amount) {
    const e = this.ensureFresh();
    const antes = e.atual;
    e.atual = Math.min(ENERGY_MAX, e.atual + amount);
    Store.set(STORAGE_KEYS.ENERGY, e);
    this.render();
    return e.atual - antes;
  },

  /* Chamado a cada resposta de uma pergunta de lição (trail.js e
     business.js), com a contagem atual de acertos consecutivos NA lição
     em andamento. A cada múltiplo de ENERGY_COMBO acertado em sequência,
     devolve 1 energia (até o máximo). */
  registerAnswer(correct, streak) {
    if (!correct || streak <= 0 || streak % ENERGY_COMBO !== 0) return;
    const ganho = this.bonus(1);
    if (ganho > 0 && typeof Fx !== "undefined") Fx.energyToast(ganho, ENERGY_COMBO);
  },

  render() {
    const el = document.getElementById("headerEnergy");
    if (el) el.textContent = `${this.get()}/${ENERGY_MAX}`;
  },

  /* Chamado no início de toda lição (Trail.startLesson / Business.startLesson).
     Consome 1 energia e retorna true se havia saldo; caso contrário, mostra
     o aviso de energia esgotada e retorna false — quem chamou deve abortar
     o início da lição. */
  tryStart() {
    if (this.spend()) return true;
    this.showOutOfEnergyModal();
    return false;
  },

  showOutOfEnergyModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box" style="text-align:center">
        <button class="modal-close">✕</button>
        <div style="font-size:48px">⚡</div>
        <h2>Sem energia por hoje</h2>
        <p class="text-soft">Você já usou suas ${ENERGY_MAX} energias iniciando lições hoje. Elas renovam à meia-noite — ou acerte ${ENERGY_COMBO} perguntas seguidas dentro de uma lição para ganhar +1 energia na hora.</p>
        <button class="btn btn-primary btn-block mt-16" id="energyModalCloseBtn">Entendi</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.querySelector("#energyModalCloseBtn").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
  },
};
