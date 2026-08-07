/* =========================================================================
   PROFILE.JS — Aba Perfil: avatar do POLVIn, estatísticas do jogador,
   medalha atual e a Loja (compra/equipa acessórios, insígnias e molduras
   com moedas ganhas em lições, desafios, missões e cofrinhos).
   ========================================================================= */

const Profile = {
  init() {
    this.render();
    document.addEventListener("xp:updated", () => this.renderStats());
    document.addEventListener("coins:updated", () => this.renderStats());
    document.addEventListener("account:updated", () => this.renderHeader());
    document.addEventListener("achievements:updated", () => this.renderStats());
  },

  render() {
    this.renderHeader();
    this.renderStats();
    this.renderShop();
    this.renderSecurity();
  },

  renderHeader() {
    const container = document.getElementById("profileAvatarArea");
    if (!container) return;
    const acc = Auth.getAccount();
    container.innerHTML = `
      <div class="profile-header">
        ${Polvin.avatarHtml("lg")}
        <div>
          <h2>${acc ? acc.nome : "Visitante"}</h2>
          <div class="text-soft text-sm">${acc ? acc.email : "Ainda sem conta — clique em ”👤 Entrar” no topo da tela"}</div>
        </div>
      </div>
    `;
  },

  renderStats() {
    const container = document.getElementById("profileStats");
    if (!container) return;
    const xp = Learn.getXp();
    const coins = Learn.getCoins();
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0 }).dias;
    const level = Learn.playerLevel();
    const tier = playerLevelTitle(level);
    const score = Learn.totalScore();
    const medal = medalForScore(score);
    const nextMedal = MEDAL_TIERS.find((t) => t.min > score);

    container.innerHTML = `
      <div class="grid grid-4 kpi-row">
        <div class="card kpi"><div class="label">Nível</div><div class="value">${tier.emoji} ${level}</div></div>
        <div class="card kpi"><div class="label">XP total</div><div class="value">${xp}</div></div>
        <div class="card kpi"><div class="label">Moedas</div><div class="value">🪙 ${coins}</div></div>
        <div class="card kpi"><div class="label">Ofensiva</div><div class="value">🔥 ${streak}</div></div>
      </div>
      <div class="card mt-16">
        <div class="text-soft text-sm">Pontuação total (usada nas Ligas e nas medalhas)</div>
        <div class="profile-score">${medal.emoji} ${score.toLocaleString("pt-BR")} pontos — Medalha ${medal.nome}</div>
        ${
          nextMedal
            ? `<div class="budget-bar-bg mt-8"><div class="budget-bar-fill" style="width:${Math.min(100, (score / nextMedal.min) * 100)}%"></div></div>
               <p class="text-sm text-soft mt-8">Faltam <b>${(nextMedal.min - score).toLocaleString("pt-BR")}</b> pontos para a medalha ${nextMedal.nome} ${nextMedal.emoji}.</p>`
            : `<p class="text-sm text-soft mt-8">Você atingiu a medalha máxima! 🎉</p>`
        }
        <p class="text-sm text-soft mt-8">Pontuação = XP + moedas×2 + conquistas×20 + dias de ofensiva×5.</p>
      </div>
    `;
  },

  SHOP_CATEGORIES: [
    { tipo: "cor", titulo: "🎨 Cor" },
    { tipo: "acessorio", titulo: "🎩 Acessórios" },
    { tipo: "bandeira", titulo: "🚩 Bandeiras" },
    { tipo: "moldura", titulo: "🖼️ Molduras" },
  ],

  /* Guarda-roupa do POLVIn (RFC-011): preview grande ao vivo no topo,
     itens agrupados por categoria (cor/acessório/bandeira/moldura) em
     vez de uma vitrine única misturada. Comprar/equipar continua sendo
     exatamente o mesmo fluxo de sempre (buy/toggleEquip), só a
     apresentação mudou. */
  renderShop() {
    const container = document.getElementById("profileShop");
    if (!container) return;
    const owned = Store.get(STORAGE_KEYS.SHOP_OWNED, []);
    const equipped = Store.get(STORAGE_KEYS.EQUIPPED, {});
    const coins = Learn.getCoins();
    const activeEvent = typeof Events !== "undefined" ? Events.getActiveEvent() : null;

    const previewEl = document.getElementById("profileWardrobePreview");
    if (previewEl) previewEl.innerHTML = Polvin.avatarHtml("lg");

    /* Itens de evento (eventoExclusivo) só aparecem na vitrine enquanto o
       evento correspondente está ativo, ou se o jogador já os possui —
       nunca desaparecem depois de comprados, só ficam indisponíveis para
       quem ainda não comprou fora da janela do evento. */
    const visibleItems = SHOP_ITEMS.filter(
      (item) => !item.eventoExclusivo || owned.includes(item.id) || (activeEvent && activeEvent.id === item.eventoExclusivo)
    );

    const itemCardHtml = (item) => {
      const isOwned = owned.includes(item.id);
      const isEquipped = equipped[item.tipo] === item.id;
      return `
        <div class="card shop-item ${isEquipped ? "equipped" : ""}">
          <div class="shop-item-emoji">${item.emoji}</div>
          <div class="shop-item-name">${item.nome}${item.eventoExclusivo ? " 🎉" : ""}</div>
          <div class="text-soft text-sm">${item.desc}</div>
          ${
            isOwned
              ? `<button class="btn btn-sm btn-block ${isEquipped ? "btn-outline" : "btn-primary"}" data-equip="${item.id}">${isEquipped ? "Equipado ✓" : "Equipar"}</button>`
              : `<button class="btn btn-gold btn-sm btn-block" data-buy="${item.id}" ${coins < item.preco ? "disabled" : ""}>🪙 ${item.preco}</button>`
          }
        </div>`;
    };

    container.innerHTML = this.SHOP_CATEGORIES.map((cat) => {
      const itemsInCat = visibleItems.filter((item) => item.tipo === cat.tipo);
      if (!itemsInCat.length) return "";
      return `
        <div class="shop-category">
          <h4 class="shop-category-title">${cat.titulo}</h4>
          <div class="shop-grid">${itemsInCat.map(itemCardHtml).join("")}</div>
        </div>`;
    }).join("");

    container.querySelectorAll("[data-buy]").forEach((btn) => btn.addEventListener("click", () => this.buy(btn.dataset.buy)));
    container.querySelectorAll("[data-equip]").forEach((btn) => btn.addEventListener("click", () => this.toggleEquip(btn.dataset.equip)));
  },

  buy(id) {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return;
    if (!Learn.spendCoins(item.preco)) {
      alert("Moedas insuficientes! Complete lições, desafios, missões e cofrinhos para ganhar mais 🪙.");
      return;
    }
    const owned = Store.get(STORAGE_KEYS.SHOP_OWNED, []);
    owned.push(id);
    Store.set(STORAGE_KEYS.SHOP_OWNED, owned);
    this.equip(id);
    this.render();
  },

  toggleEquip(id) {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return;
    const equipped = Store.get(STORAGE_KEYS.EQUIPPED, {});
    if (equipped[item.tipo] === id) delete equipped[item.tipo];
    else equipped[item.tipo] = id;
    Store.set(STORAGE_KEYS.EQUIPPED, equipped);
    this.render();
    document.dispatchEvent(new CustomEvent("equipped:updated"));
  },

  equip(id) {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return;
    const equipped = Store.get(STORAGE_KEYS.EQUIPPED, {});
    equipped[item.tipo] = id;
    Store.set(STORAGE_KEYS.EQUIPPED, equipped);
    document.dispatchEvent(new CustomEvent("equipped:updated"));
  },

  /* ---------- Segurança: cofre local de criptografia (js/vault.js) ---------- */

  renderSecurity() {
    const container = document.getElementById("profileSecurity");
    if (!container) return;

    if (typeof Vault === "undefined" || !Vault.isAvailable()) {
      container.innerHTML = `<div class="alert-box danger">Seu navegador não é compatível com criptografia local (Web Crypto API). Seus dados continuam salvos normalmente neste dispositivo, apenas sem essa cifra extra — considere atualizar o navegador.</div>`;
      return;
    }

    if (!Vault.isEnabled()) {
      container.innerHTML = `
        <div class="alert-box info">O cofre cifra perfil, transações, orçamentos, cofrinhos, investimentos, ações/FIIs, parcelamentos e ligas com AES-256, usando uma senha que existe só neste navegador.</div>
        <p class="text-sm text-soft"><b>Atenção:</b> se você esquecer essa senha, não há como recuperar os dados cifrados depois — nenhum servidor guarda uma cópia dela. Exporte um backup (⬇️ Exportar, no topo da tela) antes de ativar, por segurança.</p>
        <div class="field">
          <label for="vaultSetupPass">Criar senha do cofre</label>
          <input type="password" id="vaultSetupPass" placeholder="Mínimo 6 caracteres" />
        </div>
        <div class="field">
          <label for="vaultSetupPass2">Confirmar senha</label>
          <input type="password" id="vaultSetupPass2" placeholder="Repita a senha" />
        </div>
        <div class="alert-box danger hidden" id="vaultSetupError"></div>
        <button class="btn btn-primary" id="vaultSetupBtn">Ativar cofre e cifrar meus dados</button>
      `;
      document.getElementById("vaultSetupBtn").addEventListener("click", () => this.setupVault());
      return;
    }

    container.innerHTML = `
      <div class="alert-box info">Cofre ativo ✅ — seus dados sensíveis estão cifrados em repouso neste navegador.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap" class="mt-16">
        <button class="btn btn-outline btn-sm" id="vaultLockNowBtn">Bloquear agora</button>
        <button class="btn btn-outline btn-sm" id="vaultChangePassBtn">Trocar senha</button>
        <button class="btn btn-outline btn-sm" id="vaultDisableBtn" style="color:#8c2a27;border-color:#f0bcba">Desativar proteção</button>
      </div>
      <div id="vaultChangePassForm" class="hidden mt-16">
        <div class="field">
          <label for="vaultOldPass">Senha atual</label>
          <input type="password" id="vaultOldPass" />
        </div>
        <div class="field">
          <label for="vaultNewPass">Nova senha</label>
          <input type="password" id="vaultNewPass" placeholder="Mínimo 6 caracteres" />
        </div>
        <div class="alert-box danger hidden" id="vaultChangePassError"></div>
        <button class="btn btn-primary btn-sm" id="vaultConfirmChangeBtn">Confirmar troca</button>
      </div>
    `;
    document.getElementById("vaultLockNowBtn").addEventListener("click", () => this.lockVaultNow());
    document.getElementById("vaultChangePassBtn").addEventListener("click", () => {
      document.getElementById("vaultChangePassForm").classList.toggle("hidden");
    });
    document.getElementById("vaultConfirmChangeBtn").addEventListener("click", () => this.changeVaultPassphrase());
    document.getElementById("vaultDisableBtn").addEventListener("click", () => this.disableVault());
  },

  async setupVault() {
    const pass1 = document.getElementById("vaultSetupPass").value;
    const pass2 = document.getElementById("vaultSetupPass2").value;
    const errorBox = document.getElementById("vaultSetupError");
    errorBox.classList.add("hidden");

    if (pass1.length < 6) {
      errorBox.textContent = "Use uma senha com pelo menos 6 caracteres.";
      errorBox.classList.remove("hidden");
      return;
    }
    if (pass1 !== pass2) {
      errorBox.textContent = "As senhas digitadas não são iguais.";
      errorBox.classList.remove("hidden");
      return;
    }

    await Vault.setup(pass1);
    alert("Cofre ativado! Seus dados sensíveis agora estão cifrados neste navegador.");
    this.renderSecurity();
  },

  lockVaultNow() {
    if (!confirm("Isso vai bloquear o cofre agora e recarregar a página — você precisará digitar a senha para continuar usando o PolvIn. Continuar?")) return;
    Vault.lock();
    location.reload();
  },

  async changeVaultPassphrase() {
    const oldPass = document.getElementById("vaultOldPass").value;
    const newPass = document.getElementById("vaultNewPass").value;
    const errorBox = document.getElementById("vaultChangePassError");
    errorBox.classList.add("hidden");

    if (newPass.length < 6) {
      errorBox.textContent = "A nova senha precisa ter pelo menos 6 caracteres.";
      errorBox.classList.remove("hidden");
      return;
    }

    const ok = await Vault.changePassphrase(oldPass, newPass);
    if (!ok) {
      errorBox.textContent = "Senha atual incorreta.";
      errorBox.classList.remove("hidden");
      return;
    }
    alert("Senha do cofre alterada com sucesso!");
    this.renderSecurity();
  },

  disableVault() {
    if (!confirm("Isso vai descriptografar seus dados e voltar a salvá-los em texto puro neste navegador, removendo a proteção extra do cofre. Continuar?")) return;
    Vault.disable();
    alert("Proteção do cofre desativada.");
    this.renderSecurity();
  },
};
