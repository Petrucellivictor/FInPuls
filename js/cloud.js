/* =========================================================================
   CLOUD.JS — Sincronização com Supabase (RFC-027: Supabase é a fonte de
   verdade dos dados; conta obrigatória).

   Se js/supabase-config.js não tiver URL/chave configuradas, este módulo
   fica inerte (Cloud.isAvailable() === false) — nesse caso o boot do app
   (js/app.js, gate anterior a qualquer outro) mostra uma tela terminal
   explicando que o ambiente não está configurado para uso real; não existe
   mais um "modo 100% local" como caminho de produção.

   Arquitetura (mesmo padrão do cofre local em js/vault.js): a leitura e a
   escrita síncronas via Store.get/set continuam contra o localStorage, que
   passa a ser só um cache local de leitura/escrita otimista — a fonte de
   verdade é a tabela `user_data` no Supabase. Este módulo entra em ação em
   pontos assíncronos: (1) no boot, só restaurando a sessão (init()) — quem
   decide o que fazer com os dados é o gate App.ensureCloudResolved(), que
   chama syncOnLogin() explicitamente; (2) em segundo plano, "empurrando"
   cada escrita local para a nuvem (debounced); (3) nas ações explícitas de
   entrar/criar conta/sair/recuperar senha.

   IMPORTANTE (limitação honesta, ver cabeçalho anterior a esta RFC): a
   sincronização não faz merge inteligente entre dispositivos logados e
   ativos ao mesmo tempo — cada um empurra seu próprio blob debounced sem
   nenhuma heurística de "colisão" (essa só existe no momento do login, via
   syncOnLogin()). Ficou registrado como risco aceito conscientemente na
   RFC-027 (Software Architect, decisão 6); merge de verdade é uma RFC
   futura.
   ========================================================================= */

const Cloud = {
  session: null,
  recoveryMode: false,
  _pushTimers: {},

  isAvailable() {
    return typeof sb !== "undefined" && !!sb;
  },

  isLoggedIn() {
    return this.isAvailable() && !!this.session;
  },

  /* Só restaura a sessão (se houver) e passa a escutar mudanças futuras.
     NÃO decide sozinho o que fazer com os dados — isso é responsabilidade
     do gate App.ensureCloudResolved(), que chama syncOnLogin() de forma
     explícita depois de App.ensureAuthenticated() confirmar que há sessão. */
  async init() {
    if (!this.isAvailable()) return;

    const { data } = await sb.auth.getSession();
    this.session = data.session || null;

    sb.auth.onAuthStateChange((event, session) => {
      this.session = session || null;
      // Retorno do link de "esqueci minha senha": o Supabase entrega uma
      // sessão de recuperação temporária e dispara este evento. Expomos
      // como estado para App.init() decidir se mostra a tela de "defina
      // uma nova senha" antes do gate de autenticação normal.
      if (event === "PASSWORD_RECOVERY") this.recoveryMode = true;
      // Mesmo evento de identidade já usado no projeto (antes disparado só
      // por Auth.setLocalAccount/logout) — agora é o próprio Cloud quem
      // avisa qualquer módulo interessado (Profile, Auth, etc.) sempre que
      // a sessão muda: login, logout, ou perda de sessão em segundo plano.
      document.dispatchEvent(new CustomEvent("account:updated"));
    });
  },

  /* ---------- ações de conta ---------- */

  async signUp(email, password) {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) return { ok: false, message: this.translateError(error) };
    this.session = data.session || null;
    if (!this.session) {
      return { ok: true, needsConfirmation: true };
    }
    // Não chama syncOnLogin() aqui: quem faz login/cadastro sempre recarrega
    // a página em seguida (ver Auth.submitCloudAuth) e o gate
    // App.ensureCloudResolved() cuida da sincronização uma única vez, já no
    // boot seguinte. Chamar aqui também duplicaria a detecção de colisão —
    // um push/hydrate feito antes do reload faria o segundo diagnóstico (já
    // com os dois lados populados) reportar colisão mesmo quando os dados
    // são idênticos.
    return { ok: true, needsConfirmation: false };
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: this.translateError(error) };
    this.session = data.session || null;
    return { ok: true };
  },

  async signInWithGoogleIdToken(idToken) {
    const { data, error } = await sb.auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error) return { ok: false, message: this.translateError(error) };
    this.session = data.session || null;
    return { ok: true };
  },

  async signOut() {
    if (!this.isAvailable()) return;
    await sb.auth.signOut();
    this.session = null;
  },

  async resetPasswordForEmail(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) return { ok: false, message: this.translateError(error) };
    return { ok: true, message: "Enviamos um link de recuperação para o seu e-mail. Verifique também a caixa de spam." };
  },

  async updatePassword(newPassword) {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, message: this.translateError(error) };
    // Fluxo de recuperação concluído: a sessão de recuperação temporária já
    // vale como sessão normal a partir daqui (Supabase não exige novo
    // login), então o boot não precisa mais tratar isso como recuperação.
    this.recoveryMode = false;
    return { ok: true, message: "Senha atualizada com sucesso." };
  },

  translateError(error) {
    const msg = (error && error.message) || "";
    if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("User already registered")) return "Já existe uma conta com este e-mail — tente entrar em vez de criar.";
    if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
    if (msg.includes("New password should be different")) return "A nova senha precisa ser diferente da senha atual.";
    if (msg.includes("For security purposes")) return "Por segurança, aguarde um pouco antes de pedir outro link de recuperação.";
    if (msg.toLowerCase().includes("auth session missing")) return "Sua sessão de recuperação expirou. Solicite um novo link de redefinição de senha.";
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

  /* "Dado real do usuário" presente neste navegador — exclui as 4 chaves de
     metadado do cofre (if_vault_*), que não contam para fins de detecção de
     colisão (RFC-027, decisão do Software Architect item 2). */
  hasLocalData() {
    return Object.values(STORAGE_KEYS).some((key) => key.indexOf("if_vault_") !== 0 && localStorage.getItem(key) !== null);
  },

  /* Serialização canônica: ordena chaves de objetos recursivamente antes de
     comparar, para que diferença de ORDEM de serialização entre o localStorage
     (escrito pelo próprio app) e o retorno jsonb do Postgres (via driver do
     Supabase) nunca seja confundida com diferença de CONTEÚDO. Arrays mantêm
     a ordem original — ordem em array é dado, não é estrutura de objeto.
     (RFC-027, revisão do Software Architect pós-QA sobre o Bug 1.) */
  _stableStringify(value) {
    if (Array.isArray(value)) {
      return "[" + value.map((v) => this._stableStringify(v)).join(",") + "]";
    }
    if (value && typeof value === "object") {
      return "{" + Object.keys(value).sort()
        .map((k) => JSON.stringify(k) + ":" + this._stableStringify(value[k]))
        .join(",") + "}";
    }
    return JSON.stringify(value);
  },

  /* true só se existir ao menos uma chave presente NOS DOIS LADOS (local e
     nuvem) com conteúdo diferente. Chave que só existe de um lado nunca conta
     como divergência aqui — isso não é colisão, é união (ver syncOnLogin). */
  _hasDivergentCommonKeys(rows) {
    const remoteByKey = new Map(rows.map((r) => [r.key, r.value]));
    return Object.values(STORAGE_KEYS)
      .filter((key) => key.indexOf("if_vault_") !== 0)
      .some((key) => {
        const raw = localStorage.getItem(key);
        if (raw === null || !remoteByKey.has(key)) return false; // só existe de um lado: não é conflito
        let localValue;
        try {
          localValue = JSON.parse(raw);
        } catch (e) {
          return true; // JSON local ilegível: não dá pra provar igualdade -> trata como divergente
        }
        return this._stableStringify(localValue) !== this._stableStringify(remoteByKey.get(key));
      });
  },

  /* Decide, no momento do login, o estado relativo entre a nuvem (fonte de
     verdade) e o cache local deste navegador. Detecção de colisão é
     sem heurística de timestamp, de propósito (ver RFC-027): quando os dois
     lados têm dado, colisão real é definida por DIVERGÊNCIA DE CONTEÚDO em
     alguma chave comum (_hasDivergentCommonKeys), não pela mera coexistência
     de dados nos dois lados — correção de bug pós-QA (Bug 1), revisão do
     Software Architect: a decisão original ("binário, sem timestamp") era
     sobre quem vence um conflito, não sobre se existe conflito.

     Contrato: retorna sempre { case, rows }, nunca muta nada sozinho
     quando há colisão real — quem decide o que fazer é a UI (App.ensureCloudResolved
     -> #syncCollisionScreen -> applyCloudWins/applyLocalWins). Nos outros
     casos (incluindo o novo "reconciled"), continua agindo sozinho
     (push/hydrate), sem que a UI precise inspecionar `rows` — App.ensureCloudResolved
     já trata qualquer case !== "collision" genericamente. Chamado uma única vez por
     boot-com-sessão (o próprio App.ensureCloudResolved), nunca de dentro de
     signIn/signUp/signInWithGoogleIdToken (ver comentário em signUp). */
  async syncOnLogin() {
    const rows = await this.fetchRemoteRows();
    const cloudHasData = rows.length > 0;
    const localHasData = this.hasLocalData();

    if (!cloudHasData && !localHasData) return { case: "both-empty", rows };
    if (!cloudHasData && localHasData) {
      await this.pushAllLocal();
      return { case: "cloud-empty", rows };
    }
    if (cloudHasData && !localHasData) {
      this.hydrateLocalFrom(rows);
      return { case: "local-empty", rows };
    }

    // cloudHasData && localHasData: só é colisão de verdade se alguma chave
    // presente nos dois lados tiver conteúdo diferente.
    if (this._hasDivergentCommonKeys(rows)) {
      return { case: "collision", rows };
    }

    // Chaves em comum são idênticas; chaves só de um lado (se houver) não são
    // conflito — resolve sozinho, sem UI, unindo os dois lados. Idempotente
    // para as chaves já iguais (hydrate/push não mudam nada nelas).
    this.hydrateLocalFrom(rows);
    await this.pushAllLocal();
    return { case: "reconciled", rows };
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

  /* "Usar dados da nuvem" na tela de colisão: limpa todas as STORAGE_KEYS
     locais (exceto if_vault_*, que são metadado do cofre deste aparelho,
     não dado de conta) e então aplica `rows`. A limpeza prévia é o que
     evita uma chave que só existisse localmente sobreviver "escondida"
     mesmo depois de escolher a nuvem. */
  applyCloudWins(rows) {
    Object.values(STORAGE_KEYS)
      .filter((key) => key.indexOf("if_vault_") !== 0)
      .forEach((key) => localStorage.removeItem(key));
    this.hydrateLocalFrom(rows);
  },

  /* "Usar dados deste aparelho" na tela de colisão: sobe tudo que existe
     localmente (pushAllLocal) e apaga na nuvem qualquer chave que não
     exista mais localmente — sem isso, o "espelho" ficaria inconsistente
     com o lado escolhido como vencedor (uma chave só-nuvem sobreviveria
     escondida mesmo depois de escolher o aparelho). */
  async applyLocalWins() {
    const remoteRows = await this.fetchRemoteRows();
    await this.pushAllLocal();
    const localKeys = new Set(Object.values(STORAGE_KEYS).filter((key) => localStorage.getItem(key) !== null));
    const staleKeys = remoteRows.map((row) => row.key).filter((key) => !localKeys.has(key));
    await Promise.all(staleKeys.map((key) => this.removeKey(key)));
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
    if (error) {
      console.warn("Cloud: falha ao sincronizar", key, error.message);
      // Além do log, avisa qualquer UI interessada (chip de "sincronização
      // pendente" no header, RFC-027) — antes disso, uma falha de escrita
      // era só um console.warn, sem nenhum jeito de o usuário saber ou
      // tentar de novo sem recarregar a página.
      document.dispatchEvent(new CustomEvent("cloud:sync-error", { detail: { key, error: error.message } }));
    }
  },

  async removeKey(key) {
    if (!this.isLoggedIn()) return;
    const { error } = await sb.from("user_data").delete().eq("user_id", this.userId()).eq("key", key);
    if (error) console.warn("Cloud: falha ao remover", key, error.message);
  },

  async deleteAll() {
    if (!this.isLoggedIn()) return;
    const { error } = await sb.from("user_data").delete().eq("user_id", this.userId());
    if (error) console.warn("Cloud: falha ao limpar dados na nuvem:", error.message);
  },
};
