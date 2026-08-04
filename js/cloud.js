/* =========================================================================
   CLOUD.JS — Sincronização multiusuário via Supabase (opcional).

   Se js/supabase-config.js não tiver URL/chave configuradas, este módulo
   fica inerte e o Fin+ funciona exatamente como antes (100% local). Com o
   Supabase configurado, cada conta (e-mail/senha ou Google) passa a ter
   seus dados sincronizados numa tabela protegida por RLS (ver
   supabase/schema.sql) — cada pessoa só acessa as próprias linhas.

   Arquitetura (mesmo padrão do cofre local em js/vault.js): a leitura e a
   escrita síncronas via Store.get/set continuam funcionando exatamente
   como hoje, sempre contra o localStorage. Este módulo só entra em ação
   em três pontos assíncronos: (1) no boot, restaurando a sessão e "puxando"
   os dados da nuvem para dentro do localStorage; (2) em segundo plano,
   "empurrando" cada escrita local para a nuvem (debounced); (3) nas ações
   explícitas de entrar/criar conta/sair.

   IMPORTANTE (limitação honesta): como é uma ferramenta em fase de testes,
   a sincronização não faz merge inteligente entre dispositivos — ao logar
   ou abrir o app com uma sessão já ativa, os dados da nuvem sempre
   sobrescrevem os dados locais deste navegador (a não ser na primeira vez,
   quando a nuvem ainda está vazia: nesse caso os dados locais são enviados
   para a nuvem). Use um dispositivo por vez com a mesma conta para evitar
   perder alterações feitas offline.
   ========================================================================= */

const Cloud = {
  session: null,
  _pushTimers: {},

  isAvailable() {
    return typeof sb !== "undefined" && !!sb;
  },

  isLoggedIn() {
    return this.isAvailable() && !!this.session;
  },

  async init() {
    if (!this.isAvailable()) return;

    const { data } = await sb.auth.getSession();
    this.session = data.session || null;

    sb.auth.onAuthStateChange((_event, session) => {
      this.session = session || null;
    });

    if (this.session) {
      await this.syncOnLogin();
    }
  },

  /* ---------- ações de conta ---------- */

  async signUp(email, password) {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) return { ok: false, message: this.translateError(error) };
    this.session = data.session || null;
    if (!this.session) {
      return { ok: true, needsConfirmation: true };
    }
    await this.syncOnLogin();
    return { ok: true, needsConfirmation: false };
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: this.translateError(error) };
    this.session = data.session || null;
    await this.syncOnLogin();
    return { ok: true };
  },

  async signInWithGoogleIdToken(idToken) {
    const { data, error } = await sb.auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error) return { ok: false, message: this.translateError(error) };
    this.session = data.session || null;
    await this.syncOnLogin();
    return { ok: true };
  },

  async signOut() {
    if (!this.isAvailable()) return;
    await sb.auth.signOut();
    this.session = null;
  },

  translateError(error) {
    const msg = (error && error.message) || "";
    if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("User already registered")) return "Já existe uma conta com este e-mail — tente entrar em vez de criar.";
    if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
    if (msg.toLowerCase().includes("provider is not enabled")) return "Login com Google via Supabase ainda não foi habilitado neste projeto (peça para o administrador ativar o provedor Google em Authentication → Providers).";
    return msg || "Não foi possível completar a operação. Tente novamente.";
  },

  /* ---------- sincronização de dados (tabela genérica chave/valor) ---------- */

  userId() {
    return this.session && this.session.user && this.session.user.id;
  },

  async fetchRemoteRows() {
    const userId = this.userId();
    const { data, error } = await sb.from("user_data").select("key,value").eq("user_id", userId);
    if (error) {
      console.warn("Cloud: falha ao buscar dados da nuvem:", error.message);
      return [];
    }
    return data || [];
  },

  /* Decide, no momento do login, se a nuvem está vazia (primeiro acesso
     desta conta: sobe os dados locais) ou já tem dados (baixa e substitui
     os locais). Chamado uma única vez por login/signup/boot-com-sessão. */
  async syncOnLogin() {
    const rows = await this.fetchRemoteRows();
    if (rows.length === 0) {
      await this.pushAllLocal();
    } else {
      this.hydrateLocalFrom(rows);
    }
  },

  hydrateLocalFrom(rows) {
    rows.forEach(({ key, value }) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn("Cloud: falha ao gravar localmente a chave", key, e);
      }
    });
  },

  async pushAllLocal() {
    const userId = this.userId();
    const rows = Object.values(STORAGE_KEYS)
      .map((key) => {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        try {
          return { user_id: userId, key, value: JSON.parse(raw), updated_at: new Date().toISOString() };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    if (!rows.length) return;
    const { error } = await sb.from("user_data").upsert(rows, { onConflict: "user_id,key" });
    if (error) console.warn("Cloud: falha ao enviar dados iniciais:", error.message);
  },

  /* Escrita em segundo plano (debounced por chave) — chamada pelo
     Store.set/remove em js/storage.js sempre que algo muda localmente. */
  schedulePush(key, value) {
    if (!this.isLoggedIn()) return;
    clearTimeout(this._pushTimers[key]);
    this._pushTimers[key] = setTimeout(() => this.pushKey(key, value), 500);
  },

  async pushKey(key, value) {
    if (!this.isLoggedIn()) return;
    const { error } = await sb
      .from("user_data")
      .upsert({ user_id: this.userId(), key, value, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
    if (error) console.warn("Cloud: falha ao sincronizar", key, error.message);
  },

  removeKey(key) {
    if (!this.isLoggedIn()) return;
    sb.from("user_data")
      .delete()
      .eq("user_id", this.userId())
      .eq("key", key)
      .then(({ error }) => {
        if (error) console.warn("Cloud: falha ao remover", key, error.message);
      });
  },

  async deleteAll() {
    if (!this.isLoggedIn()) return;
    const { error } = await sb.from("user_data").delete().eq("user_id", this.userId());
    if (error) console.warn("Cloud: falha ao limpar dados na nuvem:", error.message);
  },
};
