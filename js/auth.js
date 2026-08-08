/* =========================================================================
   AUTH.JS — Conta do usuário (RFC-027: conta obrigatória, Supabase é a
   única fonte de identidade).

   Não existe mais um "perfil local sem senha" como estado final: toda
   identidade de exibição (nome, e-mail, foto) deriva sempre de
   Cloud.session.user — sem sessão, Auth.getAccount() retorna null. Quem
   garante que o app nunca funcione sem sessão é o gate bloqueante de boot
   em js/app.js (App.ensureAuthenticated(), Frontend Engineer), não este
   módulo — Auth só cuida de exibir a conta e dos formulários de entrada.

   O formulário de e-mail/senha + botão do Google (authFormHtml/bindAuthForm)
   é reaproveitado tanto pelo modal de conta não bloqueante daqui quanto
   pela tela cheia de gate de autenticação do boot (js/app.js) — mesma peça
   de UI, dois contextos diferentes, sem duplicar a implementação.

   Para o botão do Google aparecer, ainda é preciso configurar um Client ID
   do Google (ver instruções abaixo) e um provedor Google habilitado no
   Supabase (Authentication → Providers).

   Para o login com Google funcionar de verdade, é preciso:
   1) Criar um OAuth Client ID gratuito em https://console.cloud.google.com/
      (APIs e Serviços > Credenciais > Criar credenciais > ID do cliente OAuth
      > Aplicativo da Web), com a origem onde o app for aberto.
   2) Substituir GOOGLE_CLIENT_ID abaixo pelo Client ID gerado.
   3) Abrir o app por um servidor local/remoto (http/https) — o login do
      Google NÃO funciona quando o arquivo é aberto direto (file://).
   ========================================================================= */

const GOOGLE_CLIENT_ID = "SUBSTITUA_PELO_SEU_CLIENT_ID.apps.googleusercontent.com";

const Auth = {
  authTab: "signin",

  init() {
    this.renderHeaderChip();
    document.getElementById("accountBtn")?.addEventListener("click", () => this.openModal());
    // account:updated agora é disparado pelo próprio Cloud (login, logout,
    // ou perda de sessão em segundo plano) — Auth precisa reagir para
    // manter o chip do cabeçalho correto sem depender de reload.
    document.addEventListener("account:updated", () => this.renderHeaderChip());
  },

  cloudReady() {
    return typeof Cloud !== "undefined" && Cloud.isAvailable();
  },

  /* Conta atualmente "logada" para exibição — único ramo, sempre derivado
     da sessão real do Supabase. Sem sessão, não existe mais um "perfil
     local" de fallback: retorna null. */
  getAccount() {
    if (!this.cloudReady() || !Cloud.isLoggedIn()) return null;
    const u = Cloud.session.user;
    const meta = u.user_metadata || {};
    return {
      tipo: "cloud",
      nome: meta.full_name || meta.name || u.email,
      email: u.email,
      foto: meta.avatar_url || meta.picture || null,
    };
  },

  async logout() {
    if (!confirm("Sair da conta? Seus dados financeiros continuam salvos neste navegador.")) return;
    await Cloud.signOut();
    location.reload();
  },

  async handleGoogleCredential(response) {
    const result = await Cloud.signInWithGoogleIdToken(response.credential);
    if (!result.ok) {
      alert(result.message);
      return;
    }
    location.reload();
  },

  /* ---------- formulário reutilizável (modal de conta + gate de boot) ---------- */

  /* HTML do formulário de e-mail/senha + botão do Google + link "esqueci
     minha senha". Não injeta nenhum comportamento — chame bindAuthForm()
     depois de inserir este HTML no DOM. */
  authFormHtml() {
    return `
      <div id="googleSignInArea" class="mt-16"></div>
      <div class="auth-divider">ou</div>
      <div class="auth-tabs" style="display:flex;gap:8px">
        <button class="btn btn-sm ${this.authTab === "signin" ? "btn-primary" : "btn-outline"}" id="authTabSignin" style="flex:1">Entrar</button>
        <button class="btn btn-sm ${this.authTab === "signup" ? "btn-primary" : "btn-outline"}" id="authTabSignup" style="flex:1">Criar conta</button>
      </div>
      <div class="field mt-16"><label for="authEmail">E-mail</label><input type="email" id="authEmail" placeholder="seu@email.com" /></div>
      <div class="field"><label for="authPassword">Senha</label><input type="password" id="authPassword" placeholder="Mínimo 6 caracteres" /></div>
      <div id="authForgotRow" class="${this.authTab === "signin" ? "" : "hidden"}">
        <a href="#" id="authForgotBtn" class="text-sm">Esqueci minha senha</a>
      </div>
      <div class="alert-box danger hidden" id="authError" role="alert"></div>
      <div class="alert-box info hidden" id="authInfo" role="alert"></div>
      <button class="btn btn-primary btn-block" id="authSubmitBtn">${this.authTab === "signup" ? "Criar conta" : "Entrar"}</button>
    `;
  },

  /* Liga os eventos do formulário produzido por authFormHtml(). `container`
     é o elemento (modal-box, onboarding-card, etc.) que já contém o HTML —
     todas as buscas de elemento são escopadas a ele, para que o mesmo
     formulário possa existir em telas diferentes sem colidir por id. */
  bindAuthForm(container) {
    this.renderGoogleButton(container);

    const submitBtn = container.querySelector("#authSubmitBtn");
    const forgotRow = container.querySelector("#authForgotRow");
    const tabSignin = container.querySelector("#authTabSignin");
    const tabSignup = container.querySelector("#authTabSignup");

    const setTab = (tab) => {
      this.authTab = tab;
      tabSignin.className = `btn btn-sm ${tab === "signin" ? "btn-primary" : "btn-outline"}`;
      tabSignup.className = `btn btn-sm ${tab === "signup" ? "btn-primary" : "btn-outline"}`;
      submitBtn.textContent = tab === "signup" ? "Criar conta" : "Entrar";
      forgotRow?.classList.toggle("hidden", tab !== "signin");
    };

    tabSignin.addEventListener("click", () => setTab("signin"));
    tabSignup.addEventListener("click", () => setTab("signup"));
    submitBtn.addEventListener("click", () => this.submitCloudAuth(container));
    container.querySelector("#authForgotBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.submitForgotPassword(container);
    });
  },

  async submitCloudAuth(container) {
    const root = container || document;
    const email = root.querySelector("#authEmail").value.trim();
    const password = root.querySelector("#authPassword").value;
    const errorBox = root.querySelector("#authError");
    const infoBox = root.querySelector("#authInfo");
    errorBox.classList.add("hidden");
    infoBox.classList.add("hidden");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      errorBox.textContent = "Informe um e-mail válido e uma senha com pelo menos 6 caracteres.";
      errorBox.classList.remove("hidden");
      return;
    }

    const result = this.authTab === "signup" ? await Cloud.signUp(email, password) : await Cloud.signIn(email, password);
    if (!result.ok) {
      errorBox.textContent = result.message;
      errorBox.classList.remove("hidden");
      return;
    }
    if (result.needsConfirmation) {
      infoBox.textContent = "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.";
      infoBox.classList.remove("hidden");
      return;
    }
    // Reload garante um boot limpo, com a cadeia de gates de App.init()
    // (autenticação -> sincronização -> cofre) rodando do zero para esta
    // sessão recém-criada — inclusive a sincronização inicial (RFC-027).
    location.reload();
  },

  async submitForgotPassword(container) {
    const root = container || document;
    const email = root.querySelector("#authEmail").value.trim();
    const errorBox = root.querySelector("#authError");
    const infoBox = root.querySelector("#authInfo");
    errorBox.classList.add("hidden");
    infoBox.classList.add("hidden");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorBox.textContent = "Informe o e-mail da sua conta no campo acima para receber o link de recuperação.";
      errorBox.classList.remove("hidden");
      return;
    }

    const result = await Cloud.resetPasswordForEmail(email);
    if (!result.ok) {
      errorBox.textContent = result.message;
      errorBox.classList.remove("hidden");
      return;
    }
    infoBox.textContent = result.message;
    infoBox.classList.remove("hidden");
  },

  /* ---------- exibição ---------- */

  /* Constrói o avatar da conta (foto ou iniciais) via DOM, nunca por
     interpolação de string: acc.foto/acc.nome vêm de user_metadata do
     Supabase (nome no Google, e-mail digitado no cadastro), controláveis
     pelo dono da própria conta — inseri-los direto em innerHTML permite
     XSS armazenado (RFC-027, auditoria de segurança, achado 1). Atribuir
     .src como propriedade (em vez de concatenar a URL numa string HTML)
     evita também o caso mais sutil de injeção via atributo. */
  avatarEl(acc, sizeClass) {
    if (acc.foto) {
      const img = document.createElement("img");
      img.src = acc.foto;
      img.alt = "";
      img.className = sizeClass;
      return img;
    }
    const span = document.createElement("span");
    span.className = `${sizeClass} account-avatar-fallback`;
    span.textContent = acc.nome.trim().charAt(0).toUpperCase();
    return span;
  },

  renderHeaderChip() {
    const el = document.getElementById("accountBtn");
    if (!el) return;
    const acc = this.getAccount();
    el.innerHTML = "";
    if (acc) {
      el.appendChild(this.avatarEl(acc, "account-avatar"));
      el.appendChild(document.createTextNode(" " + acc.nome.split(" ")[0]));
    } else {
      el.textContent = "👤 Entrar";
    }
  },

  closeModal() {
    document.getElementById("authModalOverlay")?.remove();
  },

  openModal() {
    this.closeModal();
    this.authTab = "signin";
    const acc = this.getAccount();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "authModalOverlay";

    if (acc) {
      // nome/email/foto vêm da conta (user_metadata) e nunca são
      // interpolados em innerHTML — ver Auth.avatarEl() acima e o uso de
      // .textContent abaixo (RFC-027, auditoria de segurança, achado 1).
      overlay.innerHTML = `
        <div class="modal-box auth-modal">
          <button class="modal-close">✕</button>
          <h2>Sua conta</h2>
          <div class="auth-current">
            <div id="authModalAvatarSlot"></div>
            <div>
              <b id="authModalName"></b>
              <div class="text-soft text-sm" id="authModalEmail"></div>
              <div class="text-soft text-sm">Conta sincronizada (Supabase)</div>
            </div>
          </div>
          <div class="alert-box info text-sm">☁️ Seus dados estão sincronizados na nuvem e disponíveis em qualquer dispositivo em que você entrar com esta conta.</div>
          <button class="btn btn-outline btn-block mt-16" id="authLogoutBtn">Sair</button>
        </div>
      `;
      overlay.querySelector("#authModalAvatarSlot").appendChild(this.avatarEl(acc, "account-avatar-lg"));
      overlay.querySelector("#authModalName").textContent = acc.nome;
      overlay.querySelector("#authModalEmail").textContent = acc.email;
      document.body.appendChild(overlay);
      document.getElementById("authLogoutBtn").addEventListener("click", () => this.logout());
    } else {
      overlay.innerHTML = `
        <div class="modal-box auth-modal">
          <button class="modal-close">✕</button>
          <h2>Entrar no PolvIn</h2>
          <p class="text-soft text-sm">Crie uma conta para sincronizar seus dados (transações, investimentos, progresso) entre dispositivos.</p>
          ${this.authFormHtml()}
        </div>
      `;
      document.body.appendChild(overlay);
      this.bindAuthForm(overlay);
    }

    overlay.querySelector(".modal-close").addEventListener("click", () => this.closeModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal();
    });
  },

  renderGoogleButton(container) {
    const root = container || document;
    const area = root.querySelector("#googleSignInArea");
    if (!area) return;

    if (location.protocol === "file:") {
      area.innerHTML = `<div class="alert-box warn">⚠️ O login com Google não funciona abrindo o arquivo direto (file://). Abra o PolvIn por um servidor (local ou hospedado) para habilitar essa opção. As outras formas de entrar abaixo funcionam normalmente.</div>`;
      return;
    }
    if (GOOGLE_CLIENT_ID.startsWith("SUBSTITUA_")) {
      area.innerHTML = `<div class="alert-box info">ℹ️ Login com Google ainda não configurado. Crie um Client ID gratuito no Google Cloud Console e substitua <span class="mono">GOOGLE_CLIENT_ID</span> em <span class="mono">js/auth.js</span> (instruções no topo do arquivo).</div>`;
      return;
    }
    if (typeof google === "undefined" || !google.accounts) {
      area.innerHTML = `<div class="alert-box warn">⚠️ Não foi possível carregar o login do Google agora (verifique sua conexão ou um bloqueador de scripts).</div>`;
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => this.handleGoogleCredential(response),
    });
    // O parâmetro "width" do botão do Google é em pixels fixos (min. 200) —
    // medimos o espaço real disponível para não vazar da tela em celulares.
    const buttonWidth = Math.max(200, Math.min(280, area.clientWidth || 280));
    google.accounts.id.renderButton(area, { theme: "outline", size: "large", width: buttonWidth, locale: "pt-BR" });
  },
};
