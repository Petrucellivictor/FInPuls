/* =========================================================================
   AUTH.JS — Conta do usuário: login real via Supabase (e-mail/senha ou
   Google) quando configurado, com fallback para um perfil só local (sem
   senha, sem sincronização) quando não há Supabase configurado.

   Com Supabase configurado (ver js/supabase-config.js e js/cloud.js):
   - "Criar conta"/"Entrar" cria uma sessão real, e os dados passam a
     sincronizar entre dispositivos (protegidos por RLS no Supabase).
   - O botão do Google passa a abrir uma sessão real via
     Cloud.signInWithGoogleIdToken (token do Google validado pelo próprio
     Supabase) — para isso, o provedor Google precisa estar habilitado em
     Authentication → Providers no painel do Supabase.

   Sem Supabase configurado, tudo funciona exatamente como antes: um
   perfil local sem senha, só para personalizar a saudação, sem nenhuma
   sincronização entre dispositivos.

   Para o botão do Google aparecer (em qualquer um dos dois modos), ainda é
   preciso configurar um Client ID do Google (ver instruções abaixo).

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
  },

  cloudReady() {
    return typeof Cloud !== "undefined" && Cloud.isAvailable();
  },

  /* Conta atualmente "logada" para exibição. Se houver sessão real no
     Supabase, deriva os dados dela (sempre em memória, nunca depende do
     cofre/localStorage). Senão, cai no perfil local antigo. */
  getAccount() {
    if (this.cloudReady() && Cloud.isLoggedIn()) {
      const u = Cloud.session.user;
      const meta = u.user_metadata || {};
      return {
        tipo: "cloud",
        nome: meta.full_name || meta.name || u.email,
        email: u.email,
        foto: meta.avatar_url || meta.picture || null,
      };
    }
    return Store.get(STORAGE_KEYS.ACCOUNT, null);
  },

  setLocalAccount(acc) {
    Store.set(STORAGE_KEYS.ACCOUNT, acc);
    this.renderHeaderChip();
    document.dispatchEvent(new CustomEvent("account:updated"));
    this.closeModal();
  },

  async logout() {
    if (!confirm("Sair da conta? Seus dados financeiros continuam salvos neste navegador.")) return;
    if (this.cloudReady() && Cloud.isLoggedIn()) {
      await Cloud.signOut();
      location.reload();
      return;
    }
    Store.remove(STORAGE_KEYS.ACCOUNT);
    this.renderHeaderChip();
    document.dispatchEvent(new CustomEvent("account:updated"));
  },

  decodeJwtPayload(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  },

  async handleGoogleCredential(response) {
    if (this.cloudReady()) {
      const result = await Cloud.signInWithGoogleIdToken(response.credential);
      if (!result.ok) {
        alert(result.message);
        return;
      }
      location.reload();
      return;
    }
    try {
      const payload = this.decodeJwtPayload(response.credential);
      this.setLocalAccount({
        tipo: "google",
        nome: payload.name || payload.email,
        email: payload.email,
        foto: payload.picture || null,
        criadoEm: new Date().toISOString(),
      });
    } catch (e) {
      alert("Não foi possível ler os dados do Google. Tente novamente.");
    }
  },

  createLocalEmailAccount() {
    const nome = document.getElementById("authNome").value.trim();
    const email = document.getElementById("authEmail").value.trim();
    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Informe um nome e um e-mail válido.");
      return;
    }
    this.setLocalAccount({ tipo: "email", nome, email, foto: null, criadoEm: new Date().toISOString() });
  },

  async submitCloudAuth() {
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const errorBox = document.getElementById("authError");
    const infoBox = document.getElementById("authInfo");
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
    location.reload();
  },

  renderHeaderChip() {
    const el = document.getElementById("accountBtn");
    if (!el) return;
    const acc = this.getAccount();
    if (acc) {
      const inicial = acc.nome.trim().charAt(0).toUpperCase();
      el.innerHTML = acc.foto
        ? `<img src="${acc.foto}" alt="" class="account-avatar" /> ${acc.nome.split(" ")[0]}`
        : `<span class="account-avatar account-avatar-fallback">${inicial}</span> ${acc.nome.split(" ")[0]}`;
    } else {
      el.innerHTML = `👤 Entrar`;
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
      const tipoLabel = { cloud: "Conta sincronizada (Supabase)", google: "Conectado com Google", email: "Perfil local por e-mail" }[acc.tipo] || "";
      overlay.innerHTML = `
        <div class="modal-box auth-modal">
          <button class="modal-close">✕</button>
          <h2>Sua conta</h2>
          <div class="auth-current">
            ${acc.foto ? `<img src="${acc.foto}" alt="" class="account-avatar-lg" />` : `<span class="account-avatar-lg account-avatar-fallback">${acc.nome.charAt(0).toUpperCase()}</span>`}
            <div>
              <b>${acc.nome}</b>
              <div class="text-soft text-sm">${acc.email}</div>
              <div class="text-soft text-sm">${tipoLabel}</div>
            </div>
          </div>
          ${
            acc.tipo === "cloud"
              ? `<div class="alert-box info text-sm">☁️ Seus dados estão sincronizados na nuvem e disponíveis em qualquer dispositivo em que você entrar com esta conta.</div>`
              : `<div class="alert-box warn text-sm">Este perfil só existe neste navegador — não há sincronização entre dispositivos.</div>`
          }
          <button class="btn btn-outline btn-block mt-16" id="authLogoutBtn">Sair</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById("authLogoutBtn").addEventListener("click", () => this.logout());
    } else if (this.cloudReady()) {
      overlay.innerHTML = `
        <div class="modal-box auth-modal">
          <button class="modal-close">✕</button>
          <h2>Entrar no Fin+</h2>
          <p class="text-soft text-sm">Crie uma conta para sincronizar seus dados (transações, investimentos, progresso) entre dispositivos.</p>
          <div id="googleSignInArea" class="mt-16"></div>
          <div class="auth-divider">ou</div>
          <div class="auth-tabs" style="display:flex;gap:8px">
            <button class="btn btn-sm ${this.authTab === "signin" ? "btn-primary" : "btn-outline"}" id="authTabSignin" style="flex:1">Entrar</button>
            <button class="btn btn-sm ${this.authTab === "signup" ? "btn-primary" : "btn-outline"}" id="authTabSignup" style="flex:1">Criar conta</button>
          </div>
          <div class="field mt-16"><label for="authEmail">E-mail</label><input type="email" id="authEmail" placeholder="seu@email.com" /></div>
          <div class="field"><label for="authPassword">Senha</label><input type="password" id="authPassword" placeholder="Mínimo 6 caracteres" /></div>
          <div class="alert-box danger hidden" id="authError"></div>
          <div class="alert-box info hidden" id="authInfo"></div>
          <button class="btn btn-primary btn-block" id="authSubmitBtn">${this.authTab === "signup" ? "Criar conta" : "Entrar"}</button>
        </div>
      `;
      document.body.appendChild(overlay);
      this.renderGoogleButton();

      const submitBtn = document.getElementById("authSubmitBtn");
      const setTab = (tab) => {
        this.authTab = tab;
        document.getElementById("authTabSignin").className = `btn btn-sm ${tab === "signin" ? "btn-primary" : "btn-outline"}`;
        document.getElementById("authTabSignup").className = `btn btn-sm ${tab === "signup" ? "btn-primary" : "btn-outline"}`;
        submitBtn.textContent = tab === "signup" ? "Criar conta" : "Entrar";
      };
      document.getElementById("authTabSignin").addEventListener("click", () => setTab("signin"));
      document.getElementById("authTabSignup").addEventListener("click", () => setTab("signup"));
      submitBtn.addEventListener("click", () => this.submitCloudAuth());
    } else {
      overlay.innerHTML = `
        <div class="modal-box auth-modal">
          <button class="modal-close">✕</button>
          <h2>Entrar no Fin+</h2>
          <p class="text-soft text-sm">Isso só personaliza sua saudação. Seus dados financeiros continuam salvos neste navegador — não há sincronização entre dispositivos.</p>
          <div id="googleSignInArea" class="mt-16"></div>
          <div class="auth-divider">ou</div>
          <h3>Criar perfil com e-mail</h3>
          <p class="text-soft text-sm">Sem senha — é só um identificador local para personalizar sua experiência neste navegador.</p>
          <div class="field"><label for="authNome">Nome</label><input type="text" id="authNome" placeholder="Seu nome" /></div>
          <div class="field"><label for="authEmail">E-mail</label><input type="email" id="authEmail" placeholder="seu@email.com" /></div>
          <button class="btn btn-primary btn-block" id="authEmailBtn">Criar perfil</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById("authEmailBtn").addEventListener("click", () => this.createLocalEmailAccount());
      this.renderGoogleButton();
    }

    overlay.querySelector(".modal-close").addEventListener("click", () => this.closeModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal();
    });
  },

  renderGoogleButton() {
    const area = document.getElementById("googleSignInArea");
    if (!area) return;

    if (location.protocol === "file:") {
      area.innerHTML = `<div class="alert-box warn">⚠️ O login com Google não funciona abrindo o arquivo direto (file://). Abra o Fin+ por um servidor (local ou hospedado) para habilitar essa opção. As outras formas de entrar abaixo funcionam normalmente.</div>`;
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
    google.accounts.id.renderButton(area, { theme: "outline", size: "large", width: 280, locale: "pt-BR" });
  },
};
