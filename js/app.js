/* =========================================================================
   APP.JS — Inicialização e orquestração geral do PolvIn
   ========================================================================= */

const App = {
  // RFC-027 — estado dos indicadores não bloqueantes do header (sessão
  // expirada / falha de sincronização). _booted só vira true depois que a
  // cadeia de gates termina: é o que permite distinguir "sessão que caiu
  // em segundo plano" de "nunca logou" a partir do mesmo evento
  // account:updated (Auth.getAccount() === null sozinho não diferencia
  // os dois casos — ver seção 5/Backend Engineer da RFC-027).
  _booted: false,
  _lastKnownAccount: null,
  _syncErrorKeys: new Set(),

  async init() {
    this.showGateLoading();

    if (typeof Cloud !== "undefined") await Cloud.init(); // RFC-027: só restaura a sessão — quem decide o que fazer com os dados é ensureCloudResolved()

    // Cadeia de gates bloqueantes (RFC-027), cada um no mesmo padrão de
    // ensureVaultUnlocked() (Promise que só resolve com a tela cheia
    // escondida): 0) Supabase configurado -> 1) retorno de recuperação de
    // senha (condicional) -> 2) autenticado -> 3) sincronização resolvida
    // -> 4) cofre local desbloqueado (já existia, inalterado, por último).
    await this.ensureCloudAvailable(); // nunca resolve se o Supabase não estiver configurado (tela terminal)
    await this.ensurePasswordReset();
    await this.ensureAuthenticated();
    await this.ensureCloudResolved();

    this.hideGateLoading();
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
    Profile.init();
    Leagues.init();
    Market.init();
    News.init();
    Advanced.init();
    Books.init();
    Privacy.init();

    this._booted = true;
    this._lastKnownAccount = Auth.getAccount();

    this.renderHeaderStats();
    this.renderHome();
    this.playHeroEntrance();
    this.bindGlobalEvents();
    this.bindBackupButtons();
  },

  /* =======================================================================
     RFC-027 — GATES DE CONTA/NUVEM (bloqueantes, boot)
     ======================================================================= */

  /* Overlay genérico "Preparando o PolvIn…", usado só para cobrir os
     trechos ASSÍNCRONOS entre gates (ex.: a busca de dados na nuvem em
     Cloud.syncOnLogin()) — sem ele, haveria um instante sem nenhuma tela
     cheia visível assim que um gate anterior escondesse a própria tela,
     exatamente o "flash" que esta cadeia inteira existe para evitar. Cada
     gate que mostra sua própria tela chama hideGateLoading() antes e, se a
     etapa seguinte também for assíncrona, showGateLoading() de novo antes
     de resolver. Não faz parte do contrato de telas da RFC (não tem nome
     próprio no documento) — é um detalhe de implementação do Frontend. */
  showGateLoading() {
    let el = document.getElementById("gateLoadingScreen");
    if (el) {
      el.classList.remove("hidden");
      return;
    }
    el = document.createElement("div");
    el.id = "gateLoadingScreen";
    el.className = "onboarding-screen";
    el.innerHTML = `<div class="onboarding-card gate-loading-card">${Fx.loadingOrbitHtml()}<p class="text-soft mt-16">Preparando o PolvIn…</p></div>`;
    document.body.appendChild(el);
  },

  hideGateLoading() {
    document.getElementById("gateLoadingScreen")?.remove();
  },

  /* GATE 0: sem Supabase configurado não existe mais "modo local
     completo" como caminho de produção (Software Architect, decisão 5) —
     a Promise NUNCA resolve, de propósito: é uma tela terminal, não um
     obstáculo temporário que o usuário supera. */
  ensureCloudAvailable() {
    if (typeof Cloud !== "undefined" && Cloud.isAvailable()) return Promise.resolve(true);

    this.hideGateLoading();
    return new Promise(() => {
      const screen = document.getElementById("cloudUnavailableScreen");
      screen.classList.remove("hidden");
      document.getElementById("cloudUnavailableCloseBtn")?.addEventListener("click", () => window.close());
    });
  },

  /* Gate condicional: só aparece quando o usuário voltou de um link de
     "esqueci minha senha" (Cloud.recoveryMode, setado por
     onAuthStateChange no evento PASSWORD_RECOVERY). Checado logo após
     Cloud.init(), antes do gate de autenticação normal — entrar direto
     numa tela de login logo depois de clicar num link cujo propósito era
     justamente não precisar da senha antiga seria um passo a mais inútil. */
  ensurePasswordReset() {
    if (typeof Cloud === "undefined" || !Cloud.recoveryMode) return Promise.resolve(true);

    this.hideGateLoading();
    return new Promise((resolve) => {
      const screen = document.getElementById("passwordResetScreen");
      const card = screen.querySelector(".onboarding-card");
      Polvin.renderBubble(document.getElementById("passwordResetHero"), "Vamos criar uma senha nova! Escolhe algo que só você lembra.", { withListen: false });
      screen.classList.remove("hidden");

      const pass1 = document.getElementById("newPasswordInput");
      const pass2 = document.getElementById("newPasswordConfirmInput");
      const errorBox = document.getElementById("passwordResetError");
      const btn = document.getElementById("passwordResetBtn");

      const showError = (message, fieldEl) => {
        errorBox.textContent = message;
        errorBox.classList.remove("hidden");
        if (fieldEl) Fx.shake(fieldEl.closest(".field"));
      };

      const trySave = async () => {
        errorBox.classList.add("hidden");
        if (pass1.value.length < 6) return showError("A senha precisa ter pelo menos 6 caracteres.", pass1);
        if (pass1.value !== pass2.value) return showError("As senhas não coincidem.", pass2);

        btn.disabled = true;
        btn.innerHTML = Fx.loadingOrbitHtml();
        const result = await Cloud.updatePassword(pass1.value);
        if (!result.ok) {
          btn.disabled = false;
          btn.textContent = "Salvar nova senha";
          showError(result.message, pass1);
          return;
        }

        btn.innerHTML = "✓ Senha atualizada!";
        Fx.successGlow(card);
        setTimeout(() => {
          Fx.screenTransition(screen, "exit").then(() => {
            screen.classList.add("hidden");
            this.showGateLoading();
            resolve(true);
          });
        }, 900);
      };

      btn.addEventListener("click", trySave);
      [pass1, pass2].forEach((input) => input.addEventListener("keydown", (e) => e.key === "Enter" && trySave()));
    });
  },

  /* GATE 1: autenticação obrigatória. Reaproveita o mesmo formulário do
     modal de conta (Auth.authFormHtml/bindAuthForm) dentro da tela cheia
     — nenhuma lógica de conta é duplicada aqui, só orquestração visual. */
  ensureAuthenticated() {
    if (typeof Cloud !== "undefined" && Cloud.isLoggedIn()) return Promise.resolve(true);

    this.hideGateLoading();
    return new Promise((resolve) => {
      const screen = document.getElementById("authGateScreen");
      const card = screen.querySelector(".onboarding-card");
      const formArea = document.getElementById("authGateFormArea");

      this.renderAuthGateHero(document.getElementById("authGateHero"));
      formArea.innerHTML = Auth.authFormHtml();
      Auth.bindAuthForm(formArea);
      screen.classList.remove("hidden");

      const submitBtn = formArea.querySelector("#authSubmitBtn");
      const errorBox = formArea.querySelector("#authError");
      const infoBox = formArea.querySelector("#authInfo");

      formArea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.target.id === "authEmail" || e.target.id === "authPassword")) {
          e.preventDefault();
          submitBtn.click();
        }
      });

      // Feedback de "enviando"/"erro" observado por fora do formulário
      // compartilhado, sem duplicar a lógica de negócio de
      // Auth.submitCloudAuth (RFC-027, UX/UI seção 1, "Estados"). Este
      // listener é registrado DEPOIS do que Auth.bindAuthForm já ligou,
      // então roda em seguida a cada clique.
      submitBtn.addEventListener("click", () => {
        submitBtn.disabled = true;
        submitBtn.dataset.loading = "1";
        submitBtn.innerHTML = Fx.loadingOrbitHtml();
      });

      const revertSubmitBtn = () => {
        if (!submitBtn.dataset.loading) return;
        delete submitBtn.dataset.loading;
        submitBtn.disabled = false;
        submitBtn.textContent = Auth.authTab === "signup" ? "Criar conta" : "Entrar";
      };

      const watchAlert = (box, onShow) => {
        new MutationObserver(() => {
          if (!box.classList.contains("hidden")) onShow();
        }).observe(box, { attributes: true, attributeFilter: ["class"] });
      };
      watchAlert(errorBox, () => {
        revertSubmitBtn();
        const email = formArea.querySelector("#authEmail").value.trim();
        const password = formArea.querySelector("#authPassword").value;
        const badFieldSelector = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "#authEmail" : "#authPassword";
        const fieldWrap = formArea.querySelector(badFieldSelector)?.closest(".field");
        if (fieldWrap) Fx.shake(fieldWrap);
        navigator.vibrate?.(30);
      });
      watchAlert(infoBox, revertSubmitBtn);

      // Sucesso: Cloud dispara account:updated (contrato documentado pelo
      // Backend Engineer) quando o login/cadastro é concluído. Login e
      // cadastro bem-sucedidos recarregam a página logo em seguida
      // (Auth.submitCloudAuth) para rodar a cadeia de gates do zero — a
      // animação de saída abaixo é por isso "best-effort": começa a
      // tempo de dar uma sensação de conclusão, mesmo que o reload a
      // interrompa antes do fim dos ~900ms.
      const onAccountUpdated = () => {
        if (!Cloud.isLoggedIn()) return;
        document.removeEventListener("account:updated", onAccountUpdated);
        Fx.successGlow(card);
        setTimeout(() => {
          Fx.screenTransition(screen, "exit").then(() => {
            screen.classList.add("hidden");
            this.showGateLoading();
            resolve(true);
          });
        }, 900);
      };
      document.addEventListener("account:updated", onAccountUpdated);
    });
  },

  /* Balão de boas-vindas do #authGateScreen — duas variantes de copy
     (RFC-027, UX/UI seção 1) decididas por um dado real e observável (XP/
     moedas já salvos neste navegador), nunca um placeholder: se o número
     mostrado estivesse errado, o "Wow Moment" vira desconfiança (risco
     sinalizado pela própria UX/UI Designer). */
  renderAuthGateHero(container) {
    if (!container) return;
    const xp = Store.get(STORAGE_KEYS.XP, 0);
    const coins = Store.get(STORAGE_KEYS.COINS, 0);
    const hasProgress = xp > 0 || coins > 0;

    container.innerHTML = `
      <div class="polvin-bubble-row">
        ${Polvin.avatarHtml("md")}
        <div class="polvin-bubble">
          <b class="polvin-bubble-title">POLVIn</b>
          <p class="polvin-bubble-text" id="authGateBubbleText"></p>
        </div>
      </div>`;

    const avatarEl = container.querySelector(".polvin-3d");
    Fx.mascotWave(avatarEl);
    const textEl = container.querySelector("#authGateBubbleText");

    if (hasProgress) {
      // O número sobe (Fx.countUp) antes da frase completa — que já
      // inclui o mesmo valor real — terminar de ser digitada.
      const counter = document.createElement("span");
      textEl.appendChild(counter);
      Fx.countUp(counter, 0, xp, 650, " XP");
      setTimeout(() => {
        Polvin.typewrite(
          textEl,
          `Show, você já tem ${xp} XP guardado aqui! Cria sua conta pra eu não deixar isso se perder — e você ainda leva pra qualquer aparelho.`,
          avatarEl,
          14
        );
      }, 700);
    } else {
      Polvin.typewrite(
        textEl,
        "Oi, eu sou o POLVIn 🐙 Antes de começar, cria uma conta rapidinho — é assim que eu guardo sua jornada em qualquer lugar que você abrir o app.",
        avatarEl,
        16
      );
    }
  },

  /* GATE 2: resolve a sincronização inicial com a nuvem. Só mostra UI
     quando há colisão de verdade (nuvem E local com dados) — os outros 3
     casos já foram resolvidos sozinhos por Cloud.syncOnLogin(), sem
     nenhuma tela. */
  async ensureCloudResolved() {
    const result = await Cloud.syncOnLogin();
    if (result.case !== "collision") return true;

    this.hideGateLoading();
    return new Promise((resolve) => {
      const screen = document.getElementById("syncCollisionScreen");
      this.renderSyncCollisionScreen(screen, result.rows, resolve);
      screen.classList.remove("hidden");
    });
  },

  /* Leitura local direta (não via Store.get) porque este gate roda ANTES
     do cofre (js/vault.js) desbloquear — mas XP/moedas/streak nunca são
     chaves sensíveis (Vault.SENSITIVE_KEYS), então já estão em texto
     puro no localStorage neste ponto do boot, cofre ativado ou não. */
  localStat(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },

  cloudStat(rows, key, fallback) {
    const row = rows.find((r) => r.key === key);
    return row ? row.value : fallback;
  },

  /* Fileira de mini stat-chip usada nos dois cards da tela de colisão —
     mesmo componente visual do header (RFC-027, UX/UI seção 2), só que
     sobre um fundo escuro (o texto claro dos .stat-chip foi pensado para
     o cabeçalho, não para o card claro do onboarding). */
  statChipsHtml(xp, coins, streakDias) {
    return `
      <div class="sync-compare-chips">
        <span class="stat-chip xp"><span class="ico">⭐</span>${xp} XP</span>
        <span class="stat-chip coins"><span class="ico">🪙</span>${coins}</span>
        <span class="stat-chip streak"><span class="ico">🔥</span>${streakDias} dia${streakDias === 1 ? "" : "s"}</span>
      </div>`;
  },

  renderSyncCollisionScreen(screen, rows, resolve) {
    const card = screen.querySelector(".onboarding-card");
    const localXp = this.localStat(STORAGE_KEYS.XP, 0);
    const localCoins = this.localStat(STORAGE_KEYS.COINS, 0);
    const localStreak = (this.localStat(STORAGE_KEYS.STREAK, { dias: 0 }) || {}).dias || 0;
    const cloudXp = this.cloudStat(rows, STORAGE_KEYS.XP, 0);
    const cloudCoins = this.cloudStat(rows, STORAGE_KEYS.COINS, 0);
    const cloudStreak = (this.cloudStat(rows, STORAGE_KEYS.STREAK, { dias: 0 }) || {}).dias || 0;

    card.innerHTML = `
      <h2>Encontramos dois progressos diferentes</h2>
      <p class="text-soft text-sm">Este aparelho tem dados salvos aqui, e sua conta já tem dados guardados na nuvem. Escolha qual dos dois você quer manter — não dá pra usar os dois ao mesmo tempo.</p>
      <div class="sync-collision-options">
        <button type="button" class="sync-collision-card cloud" data-choice="cloud">
          <span class="sync-collision-armed-badge">✓ Selecionado</span>
          <div class="sync-collision-card-title">☁️ Usar dados da nuvem</div>
          <p class="text-sm">Vamos trazer o progresso salvo na sua conta. Tudo que está só neste aparelho agora (XP, moedas, histórico) será substituído.</p>
          ${this.statChipsHtml(cloudXp, cloudCoins, cloudStreak)}
        </button>
        <button type="button" class="sync-collision-card local" data-choice="local">
          <span class="sync-collision-armed-badge">✓ Selecionado</span>
          <div class="sync-collision-card-title">📱 Usar dados deste aparelho</div>
          <p class="text-sm">Vamos manter o que está aqui agora. O que estava guardado na nuvem para esta conta será substituído por isso.</p>
          ${this.statChipsHtml(localXp, localCoins, localStreak)}
        </button>
      </div>
      <p class="text-sm text-soft sync-collision-reassure">Isso não afeta sua senha nem o acesso à sua conta — é só sobre o progresso salvo.</p>
      <button type="button" class="btn btn-primary btn-block hidden" id="syncCollisionConfirmBtn"></button>
    `;

    // Confirmação em duas etapas (RFC-027, UX/UI seção 2): clicar num
    // card só "arma" a escolha — nada é aplicado até o botão de
    // confirmação (que nomeia explicitamente o que foi escolhido) ser
    // clicado. Sem cancelar/voltar por decisão do Software Architect:
    // é binário e bloqueante de propósito.
    let armedChoice = null;
    const cards = card.querySelectorAll(".sync-collision-card");
    const confirmBtn = card.querySelector("#syncCollisionConfirmBtn");

    cards.forEach((c) => {
      c.addEventListener("click", () => {
        armedChoice = c.dataset.choice;
        cards.forEach((other) => other.classList.toggle("armed", other === c));
        confirmBtn.classList.remove("hidden");
        confirmBtn.textContent = armedChoice === "cloud" ? "Confirmar: usar dados da nuvem" : "Confirmar: usar dados deste aparelho";
      });
    });

    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = Fx.loadingOrbitHtml();
      cards.forEach((c) => (c.disabled = true));

      if (armedChoice === "cloud") await Cloud.applyCloudWins(rows);
      else await Cloud.applyLocalWins();

      await Fx.screenTransition(screen, "exit");
      screen.classList.add("hidden");
      this.showGateLoading();
      resolve(true);
    });
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
          // RFC-027: NUNCA usar Store.clearAll() aqui — isso apagaria a
          // conta na nuvem inteira por causa de uma senha secundária local
          // esquecida. clearLocalOnly() só limpa o cache deste navegador;
          // com a sessão de conta ainda válida, o boot re-hidrata a partir
          // da nuvem (fonte de verdade) normalmente após o reload.
          Store.clearLocalOnly();
          location.reload();
        }
      });
    });
  },

  bindGlobalEvents() {
    // RFC-027 — sessão expirada em segundo plano: como a cadeia de gates
    // já garante que o app nunca renderiza sem sessão, qualquer
    // account:updated com Auth.getAccount() nulo DEPOIS do boot (_booted)
    // é necessariamente uma sessão que caiu — nunca "nunca logou". É essa
    // distinção que Auth.getAccount() sozinho não dá (ver seção 5/Backend
    // Engineer da RFC). Reentrada continua sendo o modal de conta já
    // existente (Auth.openModal()), nunca uma tela cheia — o app segue
    // usável com os dados do cache local (critério de aceite 6).
    document.addEventListener("account:updated", () => {
      if (!this._booted) return;
      const acc = Auth.getAccount();
      if (acc) {
        this._lastKnownAccount = acc;
        this.clearSessionExpiredChip();
      } else {
        this.renderSessionExpiredChip(this._lastKnownAccount);
      }
    });

    // RFC-027 — indicador de falha ao sincronizar: chip persistente no
    // header, nunca um toast (uma queda de rede pode falhar várias vezes
    // seguidas, e um toast reaparecendo a cada tentativa seria o
    // "histérico" que o Product Owner pediu para evitar).
    document.addEventListener("cloud:sync-error", (e) => {
      const isFirst = this._syncErrorKeys.size === 0;
      this._syncErrorKeys.add(e.detail.key);
      this.renderSyncErrorChip();
      if (isFirst) navigator.vibrate?.(20);
    });

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
      if (e.detail.tabId === "cidade") {
        // Mesma armadilha (RFC-021): o container do Phaser tinha display:none
        // até a 1ª visita à aba — inicializar aqui, não no boot do app, evita
        // o motor de jogo nascer com geometria zero (mesmo motivo do Trail
        // acima). Em visitas seguintes, só recalcula o tamanho.
        if (typeof CityGame !== "undefined") {
          if (!CityGame.game) CityGame.init();
          else CityGame.game.scale.refresh();
        }
      }
    });
  },

  /* RFC-027 — chip "⚠️ Reconectar": mantém o avatar/nome da última conta
     conhecida (esmaecido) quando existir, para o usuário reconhecer que é
     ELE que precisa reconectar, não uma conta desconhecida. */
  renderSessionExpiredChip(lastKnown) {
    const el = document.getElementById("accountBtn");
    if (!el) return;
    el.classList.add("session-expired");
    if (lastKnown) {
      const inicial = lastKnown.nome.trim().charAt(0).toUpperCase();
      el.innerHTML = lastKnown.foto
        ? `<img src="${lastKnown.foto}" alt="" class="account-avatar" /> ⚠️ Reconectar`
        : `<span class="account-avatar account-avatar-fallback">${inicial}</span> ⚠️ Reconectar`;
    } else {
      el.innerHTML = `⚠️ Reconectar`;
    }
  },

  clearSessionExpiredChip() {
    document.getElementById("accountBtn")?.classList.remove("session-expired");
  },

  /* RFC-027 — chip "⚠️ Sincronização pendente" (item 6, UX/UI): sempre um
     único chip, mesmo com várias chaves pendentes ao mesmo tempo (vira um
     contador). Inserido dinamicamente ao lado de #accountBtn — sai do DOM
     de verdade quando resolvido, não fica só escondido. */
  renderSyncErrorChip() {
    const accountBtn = document.getElementById("accountBtn");
    if (!accountBtn) return;
    let chip = document.getElementById("syncStatusChip");
    if (this._syncErrorKeys.size === 0) {
      chip?.remove();
      return;
    }
    if (!chip) {
      chip = document.createElement("button");
      chip.type = "button";
      chip.id = "syncStatusChip";
      chip.className = "stat-chip sync-status error tip-trigger";
      chip.setAttribute("aria-live", "polite");
      chip.dataset.tip = "Não conseguimos salvar sua última alteração na nuvem. Ela continua segura neste aparelho — toque para tentar de novo.";
      accountBtn.insertAdjacentElement("afterend", chip);
      chip.addEventListener("click", () => this.retrySyncErrors());
    }
    const n = this._syncErrorKeys.size;
    chip.innerHTML =
      n === 1 ? `<span class="ico">⚠️</span><span>Sincronização pendente</span>` : `<span class="ico">⚠️</span><span>${n} pendentes</span>`;
  },

  /* Reenvia o valor ATUAL de cada chave pendente (não o valor antigo que
     falhou) — mais correto do que reenviar um snapshot obsoleto, e o
     upsert por (user_id,key) já é idempotente de qualquer forma. */
  async retrySyncErrors() {
    const chip = document.getElementById("syncStatusChip");
    if (!chip || this._syncErrorKeys.size === 0) return;
    const keys = Array.from(this._syncErrorKeys);
    chip.disabled = true;
    chip.innerHTML = Fx.loadingOrbitHtml();

    const stillFailing = new Set();
    const onError = (e) => stillFailing.add(e.detail.key);
    document.addEventListener("cloud:sync-error", onError);

    await Promise.all(
      keys.map(async (key) => {
        let value;
        try {
          const raw = localStorage.getItem(key);
          if (raw === null) return; // chave não existe mais localmente — nada para reenviar
          value = JSON.parse(raw);
        } catch (e) {
          return;
        }
        await Cloud.pushKey(key, value);
      })
    );

    document.removeEventListener("cloud:sync-error", onError);
    this._syncErrorKeys = stillFailing;
    chip.disabled = false;

    if (this._syncErrorKeys.size === 0) {
      Fx.successGlow(chip);
      setTimeout(() => chip.remove(), 900);
    } else {
      this.renderSyncErrorChip();
    }
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
