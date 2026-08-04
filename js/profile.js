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
  },

  renderHeader() {
    const container = document.getElementById("profileAvatarArea");
    if (!container) return;
    const acc = Store.get(STORAGE_KEYS.ACCOUNT, null);
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

  renderShop() {
    const container = document.getElementById("profileShop");
    if (!container) return;
    const owned = Store.get(STORAGE_KEYS.SHOP_OWNED, []);
    const equipped = Store.get(STORAGE_KEYS.EQUIPPED, {});
    const coins = Learn.getCoins();

    container.innerHTML = SHOP_ITEMS.map((item) => {
      const isOwned = owned.includes(item.id);
      const isEquipped = equipped[item.tipo] === item.id;
      return `
        <div class="card shop-item ${isEquipped ? "equipped" : ""}">
          <div class="shop-item-emoji">${item.emoji}</div>
          <div class="shop-item-name">${item.nome}</div>
          <div class="text-soft text-sm">${item.desc}</div>
          ${
            isOwned
              ? `<button class="btn btn-sm btn-block ${isEquipped ? "btn-outline" : "btn-primary"}" data-equip="${item.id}">${isEquipped ? "Equipado ✓" : "Equipar"}</button>`
              : `<button class="btn btn-gold btn-sm btn-block" data-buy="${item.id}" ${coins < item.preco ? "disabled" : ""}>🪙 ${item.preco}</button>`
          }
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
};
