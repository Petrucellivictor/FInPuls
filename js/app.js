/* =========================================================================
   APP.JS — Inicialização e orquestração geral do Fin+
   ========================================================================= */

const App = {
  init() {
    Tabs.init();
    Auth.init();
    Onboarding.init();
    InvestmentsUI.init();
    Simulator.init();
    Wallet.init();
    Installments.init();
    Goals.init();
    Portfolio.init();
    Stocks.init();
    Learn.init();
    History.init();
    Engagement.init();
    Achievements.init();
    Market.init();
    News.init();
    Advanced.init();
    Books.init();

    this.renderHeaderStats();
    this.renderHome();
    this.bindGlobalEvents();
    this.bindBackupButtons();
  },

  bindGlobalEvents() {
    document.addEventListener("profile:updated", () => {
      this.renderHeaderStats();
      this.renderHome();
    });
    document.addEventListener("xp:updated", () => this.renderHeaderStats());
    document.addEventListener("wallet:updated", () => {
      this.renderHome();
      Achievements.checkAll();
    });
    document.addEventListener("course:updated", () => {
      this.renderHome();
      Achievements.checkAll();
    });
    document.addEventListener("goals:updated", () => {
      this.renderHome();
      Achievements.checkAll();
    });
    document.addEventListener("lesson:passed", () => Achievements.checkAll());
    document.addEventListener("tab:changed", (e) => {
      if (e.detail.tabId === "home") this.renderHome();
    });
  },

  bindBackupButtons() {
    document.getElementById("exportBtn")?.addEventListener("click", () => Store.exportAll());

    const fileInput = document.getElementById("importFileInput");
    document.getElementById("importBtn")?.addEventListener("click", () => fileInput.click());
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Store.importAll(reader.result);
          alert("Backup importado com sucesso! A página será recarregada.");
          location.reload();
        } catch (e) {
          alert(e.message || "Não foi possível importar este arquivo.");
        }
      };
      reader.readAsText(file);
      fileInput.value = "";
    });
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  renderHeaderStats() {
    const xp = Learn.getXp();
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0 });
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);

    document.getElementById("headerXp").textContent = `${xp} XP`;
    document.getElementById("headerStreak").textContent = `${streak.dias} dia${streak.dias === 1 ? "" : "s"}`;

    const nivelLabels = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };
    document.getElementById("headerLevel").textContent = profile ? nivelLabels[profile.nivel] : "Sem perfil";
  },

  renderHome() {
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    const nivelLabels = { iniciante: "Iniciante 🌱", intermediario: "Intermediário 📈", avancado: "Avançado 🚀" };

    // Saudação e perfil
    if (profile) {
      document.getElementById("homeGreeting").textContent = `Bem-vindo(a) de volta!`;
      document.getElementById("profileSummaryText").innerHTML = `Seu perfil atual: <b>${nivelLabels[profile.nivel]}</b>. Continue evoluindo na trilha de aprendizado para destravar novos conteúdos.`;
    }

    // Anel de nível (baseado no XP) + título nomeado + evolução do POLVIn
    const xp = Learn.getXp();
    const playerLevel = Learn.playerLevel();
    const pctToNextLevel = xp % 100;
    document.getElementById("homeLevelRing").style.setProperty("--pct", pctToNextLevel);
    document.getElementById("homeLevelNum").textContent = playerLevel;

    const tier = playerLevelTitle(playerLevel);
    document.getElementById("homeLevelTitle").textContent = `${tier.emoji} ${tier.titulo}`;
    const accessoryEl = document.getElementById("polvinAccessory");
    if (accessoryEl) accessoryEl.textContent = tier.min > 1 ? tier.emoji : "";

    // KPIs financeiros do mês
    const totals = Wallet.totals();
    document.getElementById("kpiSaldo").textContent = this.fmt(totals.saldo);
    document.getElementById("kpiEntradas").textContent = this.fmt(totals.entradas);
    document.getElementById("kpiSaidas").textContent = this.fmt(totals.saidas);
    document.getElementById("kpiImpulso").textContent = this.fmt(totals.impulso);

    // Dica do dia (determinística por dia, para não mudar a cada refresh)
    const dayIndex = new Date().getDate() % SPENDING_TIPS.length;
    const tip = SPENDING_TIPS[dayIndex];
    document.getElementById("tipOfDayText").innerHTML = `<b>${tip.titulo}:</b> ${tip.texto}`;

    // Snippet da trilha de aprendizado
    Learn.renderHomeSnippet();

    // Missões diárias/semanais e evento do dia
    Engagement.renderHome();
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
