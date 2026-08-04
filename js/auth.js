/* =========================================================================
   AUTH.JS — Entrar com Google ou criar um perfil local com e-mail
   IMPORTANTE: este app não tem backend. Não existe senha real, nem
   sincronização entre dispositivos — os dados continuam 100% salvos no
   localStorage deste navegador. O login serve só para personalizar a
   saudação (nome/foto), tanto via Google quanto via e-mail.

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
  init() {
    this.renderHeaderChip();
    document.getElementById("accountBtn")?.addEventListener("click", () => this.openModal());
  },

  getAccount() {
    return Store.get(STORAGE_KEYS.ACCOUNT, null);
  },

  setAccount(acc) {
    Store.set(STORAGE_KEYS.ACCOUNT, acc);
    this.renderHeaderChip();
    document.dispatchEvent(new CustomEvent("account:updated"));
    this.closeModal();
  },

  logout() {
    if (!confirm("Sair da conta? Seus dados financeiros continuam salvos neste navegador.")) return;
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

  handleGoogleCredential(response) {
    try {
      const payload = this.decodeJwtPayload(response.credential);
      this.setAccount({
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

  createEmailAccount() {
    const nome = document.getElementById("authNome").value.trim();
    const email = document.getElementById("authEmail").value.trim();
    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Informe um nome e um e-mail válido.");
      return;
    }
    this.setAccount({ tipo: "email", nome, email, foto: null, criadoEm: new Date().toISOString() });
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
    const acc = this.getAccount();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "authModalOverlay";

    if (acc) {
      overlay.innerHTML = `
        <div class="modal-box auth-modal">
          <button class="modal-close">✕</button>
          <h2>Sua conta</h2>
          <div class="auth-current">
            ${acc.foto ? `<img src="${acc.foto}" alt="" class="account-avatar-lg" />` : `<span class="account-avatar-lg account-avatar-fallback">${acc.nome.charAt(0).toUpperCase()}</span>`}
            <div>
              <b>${acc.nome}</b>
              <div class="text-soft text-sm">${acc.email}</div>
              <div class="text-soft text-sm">${acc.tipo === "google" ? "Conectado com Google" : "Perfil local por e-mail"}</div>
            </div>
          </div>
          <button class="btn btn-outline btn-block mt-16" id="authLogoutBtn">Sair</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById("authLogoutBtn").addEventListener("click", () => {
        this.logout();
        this.closeModal();
      });
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
      document.getElementById("authEmailBtn").addEventListener("click", () => this.createEmailAccount());
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
      area.innerHTML = `<div class="alert-box warn">⚠️ O login com Google não funciona abrindo o arquivo direto (file://). Abra o Fin+ por um servidor local (ex.: extensão "Live Server" do VS Code) para habilitar essa opção. O cadastro por e-mail abaixo funciona normalmente.</div>`;
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
