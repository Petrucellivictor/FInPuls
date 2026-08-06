/* =========================================================================
   APP.JS — Inicialização e orquestração geral do PolvIn
   ========================================================================= */

const App = {
  async init() {
    if (typeof Cloud !== "undefined") await Cloud.init(); // restaura sessão e sincroniza antes de decidir o que renderizar

    const desbloqueado = await this.ensureVaultUnlocked();
    if (!desbloqueado) return; // usuário fechou a aba na tela de bloqueio; nada mais deve rodar

    Tooltip.init();
    Tabs.init();
    Polvin.init();
    Auth.init();
    Onboarding.init();
    InvestmentsUI.init();
    Simulator.init();
    Wallet.init();
    Installments.init();
    Goals.init();
    Career.init();
    Portfolio.init();
    Stocks.init();
    Energy.init();
    Trail.init();
    Business.init();
    Engagement.init();
    Events.init();
    Achievements.init();
    Progression.init();
    City.init();
    CityLife.init();
    Profile.init();
    Leagues.init();
    Market.init();
    News.init();
    Advanced.init();
    Books.init();
    Privacy.init();

    this.renderHeaderStats();
    this.renderHome();
    this.playHeroEntrance();
    this.bindGlobalEvents();
    this.bindBackupButtons();
  },

  /* Se o cofre (js/vault.js) estiver ativado, trava a inicialização do app
     na tela de bloqueio até a senha local correta ser digitada. Se o cofre
     nunca foi ativado, resolve true imediatamente e nada muda para o usuário. */
  ensureVaultUnlocked() {
    if (typeof Vault === "undefined" || !Vault.isEnabled()) return Promise.resolve(true);

    return new Promise((resolve) => {
      const screen = document.getElementById("vaultLockScreen");
      const input = document.getElementById("vaultUnlockInput");
      const errorBox = document.getElementById("vaultUnlockError");
      const btn = document.getElementById("vaultUnlockBtn");
      const forgotBtn = document.getElementById("vaultForgotBtn");
      screen.classList.remove("hidden");
      input.focus();

      let checking = false;
      const tryUnlock = async () => {
        if (checking) return;
        checking = true;
        errorBox.classList.add("hidden");
        const ok = await Vault.unlock(input.value);
        checking = false;
        if (ok) {
          screen.classList.add("hidden");
          resolve(true);
        } else {
          errorBox.textContent = "Senha incorreta. Tente novamente.";
          errorBox.classList.remove("hidden");
          input.value = "";
          input.focus();
        }
      };

      btn.addEventListener("click", tryUnlock);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") tryUnlock();
      });
      forgotBtn.addEventListener("click", () => {
        if (confirm("Isso vai apagar TODOS os dados salvos neste navegador (perfil, transações, progresso e o cofre) e não pode ser desfeito. Continuar?")) {
          Store.clearAll();
          location.reload();
        }
      });
    });
  },

  bindGlobalEvents() {
    document.addEventListener("profile:updated", () => {
      this.renderHeaderStats();
      this.renderHome();
      Progression.checkAll();
    });
    document.addEventListener("xp:updated", () => this.renderHeaderStats());
    document.addEventListener("coins:updated", () => this.renderHeaderStats());
    document.addEventListener("wallet:updated", () => {
      this.renderHome();
      Achievements.checkAll();
      Progression.checkAll();
    });
    document.addEventListener("course:updated", () => {
      this.renderHome();
      Achievements.checkAll();
      Progression.checkAll();
    });
    document.addEventListener("goals:updated", () => {
      this.renderHome();
      Achievements.checkAll();
      Progression.checkAll();
    });
    document.addEventListener("lesson:passed", () => {
      Achievements.checkAll();
      Progression.checkAll();
    });
    document.addEventListener("tab:changed", (e) => {
      if (e.detail.tabId === "home") this.renderHome();
      if (e.detail.tabId === "aprender") {
        // A aba estava com display:none até agora — os containers da trilha
        // não tinham geometria nenhuma, então o reveal-on-scroll nunca disparou.
        Trail.observeReveal();
        Business.observeReveal(document.getElementById("businessTrailContainer"));
      }
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
    const coins = Learn.getCoins();
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0 });
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);

    const xpEl = document.getElementById("headerXp");
    const displayed = parseInt(xpEl.textContent) || 0;
    if (typeof Fx !== "undefined") Fx.countUp(xpEl, displayed, xp);
    else xpEl.textContent = `${xp} XP`;

    const coinsEl = document.getElementById("headerCoins");
    const coinsDisplayed = parseInt(coinsEl.textContent) || 0;
    if (typeof Fx !== "undefined") Fx.countUp(coinsEl, coinsDisplayed, coins, 650, "");
    else coinsEl.textContent = `${coins}`;

    document.getElementById("headerStreak").textContent = `${streak.dias} dia${streak.dias === 1 ? "" : "s"}`;
    Energy.render();

    const nivelLabels = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };
    document.getElementById("headerLevel").textContent = profile ? nivelLabels[profile.nivel] : "Sem perfil";
  },

  /* Mensagem dinâmica do "Wow Moment" da Início (RFC-008/Conceito B) —
     prioridade: patrimônio virtual em investimentos > ofensiva ativa >
     perto de subir de nível > boas-vindas genéricas. Sempre computada
     a partir de dados reais já existentes, nunca um texto decorativo. */
  pickWowMessage() {
    const totalInvestido = Portfolio.totalsByClass().total;
    if (totalInvestido > 0) {
      return `Seu patrimônio virtual em investimentos já soma ${this.fmt(totalInvestido)}! 📈`;
    }
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias;
    if (streak >= 3) {
      return `Você está numa sequência de ${streak} dias! 🔥 Continue assim.`;
    }
    const faltam = 100 - (Learn.getXp() % 100);
    if (faltam <= 20) {
      return `Faltam só ${faltam} XP pra você subir de nível! ⚡`;
    }
    return `Bem-vindo(a) de volta! Vamos organizar sua vida financeira? 🐙`;
  },

  /* Toca a entrada do POLVIn (mergulho + moeda) uma única vez por sessão —
     chamado pelo init(), não pelo renderHome() (que roda a cada mudança
     de XP/moedas/carteira e não deve repetir a coreografia toda vez). */
  playHeroEntrance() {
    const wrap = document.getElementById("homeMascotWrap");
    if (!wrap || typeof Polvin === "undefined") return;
    wrap.classList.remove("diving");
    void wrap.offsetWidth;
    wrap.classList.add("diving");
    const msgEl = document.getElementById("homeWowMessage");
    setTimeout(() => {
      if (msgEl) Polvin.typewrite(msgEl, this.pickWowMessage(), null, 18);
    }, 650);
  },

  renderHome() {
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    const nivelLabels = { iniciante: "Iniciante 🌱", intermediario: "Intermediário 📈", avancado: "Avançado 🚀" };

    // Wow Moment: POLVIn + mensagem dinâmica sobre o progresso real
    const mascotWrap = document.getElementById("homeMascotWrap");
    if (mascotWrap && !mascotWrap.innerHTML && typeof Polvin !== "undefined") {
      mascotWrap.innerHTML = `${Polvin.avatarHtml("md")}<span class="hero-mascot-coin">🪙</span>`;
    }
    const wowMsgEl = document.getElementById("homeWowMessage");
    if (wowMsgEl) wowMsgEl.textContent = this.pickWowMessage();

    // Perfil
    if (profile) {
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

    // KPIs financeiros do mês
    const totals = Wallet.totals();
    document.getElementById("kpiSaldo").textContent = this.fmt(totals.saldo);
    document.getElementById("kpiEntradas").textContent = this.fmt(totals.entradas);
    document.getElementById("kpiSaidas").textContent = this.fmt(totals.saidas);
    document.getElementById("kpiImpulso").textContent = this.fmt(totals.impulso);

    // Dica do dia (determinística por dia, para não mudar a cada refresh)
    const dayIndex = new Date().getDate() % SPENDING_TIPS.length;
    const tip = SPENDING_TIPS[dayIndex];
    const tipContainer = document.getElementById("polvinTipOfDay");
    if (tipContainer && tipContainer.dataset.day !== String(dayIndex)) {
      tipContainer.dataset.day = String(dayIndex);
      Polvin.renderBubble(tipContainer, `${tip.titulo}: ${tip.texto}`, { title: "Dica do POLVIn" });
    }

    // Modo Carreira: trilha personalizada pelo objetivo de vida escolhido
    Career.render();

    // Snippet da trilha de aprendizado (financeira + história intercaladas)
    Trail.renderHomeSnippet();

    // Missões diárias/semanais e evento do dia
    Engagement.renderHome();

    // Evento temporário ativo (Semana Bitcoin, IR, Férias, Black Friday, Natal)
    Events.render();

    // O que o POLVIn percebeu sobre sua vida financeira (dados reais)
    this.renderPolvinInsights();
  },

  /* Lê dados reais (cofrinhos, investimentos, gastos do mês) e monta um
     "recado" do POLVIn sobre a jornada financeira da própria pessoa. */
  buildFinancialInsights() {
    const facts = [];

    const totalGoals = Goals.getGoals().reduce((s, g) => s + (g.historico || []).reduce((s2, h) => s2 + h.valor, 0), 0);
    if (totalGoals > 0) facts.push(`Você já guardou ${this.fmt(totalGoals)} em cofrinhos desde que começou.`);

    const investido = Portfolio.totalsByClass().total + Stocks.totals().valorInvestido;
    if (investido > 0) facts.push(`Você tem ${this.fmt(investido)} investidos entre a Carteira de Investimentos e Ações & FIIs.`);

    const emAndamento = Goals.getGoals().filter((g) => !g.concluido);
    if (emAndamento.length) {
      const proxima = emAndamento.sort((a, b) => (a.meta - a.acumulado) - (b.meta - b.acumulado))[0];
      facts.push(`Faltam ${this.fmt(proxima.meta - proxima.acumulado)} para completar seu cofrinho "${proxima.nome}".`);
    }

    const saidas = Wallet.currentMonthTransactions().filter((t) => t.tipo === "saida");
    if (saidas.length >= 3) {
      const porCategoria = {};
      saidas.forEach((t) => (porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.valor));
      const [categoria, valor] = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
      facts.push(`Sua maior categoria de gastos este mês é "${categoria}", com ${this.fmt(valor)}.`);
    }

    return facts;
  },

  renderPolvinInsights() {
    const container = document.getElementById("polvinInsights");
    if (!container) return;
    const facts = this.buildFinancialInsights();
    const todayKey = new Date().toDateString();
    if (container.dataset.day === todayKey) return; // já mostrado hoje

    if (!facts.length) {
      container.innerHTML = `<div class="empty-state"><span class="emoji">🐙</span>Continue usando o PolvIn — quanto mais você registrar (cofrinhos, investimentos, transações), mais o POLVIn vai te contar sobre sua própria jornada financeira aqui.</div>`;
      return;
    }
    container.dataset.day = todayKey;
    Polvin.renderBubble(container, facts.slice(0, 3).join(" "), { title: "O que o POLVIn percebeu sobre você" });
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
