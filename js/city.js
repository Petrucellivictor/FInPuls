/* =========================================================================
   CITY.JS — Cidade Financeira: fundo do mar (RFC-010, Fase 2A).
   As 13 construções continuam derivando 100% de Achievements.getUnlocked()
   (nenhuma mudança de regra desde o RFC-005) — o que muda é a apresentação
   (cenário 2D animado em vez de grade) e uma camada nova, paralela e
   puramente cosmética: decorações compráveis com moedas (CITY_DECORATIONS),
   que nunca afetam desbloqueio nem progresso.
   ========================================================================= */

const City = {
  getOwnedDecorations() {
    return Store.get(STORAGE_KEYS.CITY_DECORATIONS_OWNED, []);
  },

  buyDecoration(id) {
    const item = CITY_DECORATIONS.find((d) => d.id === id);
    if (!item) return;
    const owned = this.getOwnedDecorations();
    if (owned.includes(id)) return;
    if (!Learn.spendCoins(item.preco)) {
      alert("Moedas insuficientes! Complete lições, desafios e cofrinhos para ganhar mais 🪙.");
      return;
    }
    owned.push(id);
    Store.set(STORAGE_KEYS.CITY_DECORATIONS_OWNED, owned);
    this.render();
  },

  showPlotDetail(building, done) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === building.id);
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box" style="text-align:center">
        <button class="modal-close">✕</button>
        <div style="font-size:48px">${done ? building.emoji : "🔒"}</div>
        <h2>${done ? building.nome : "???"}</h2>
        <p class="text-soft">${done ? building.descricaoConstruida : achievement ? `Ainda bloqueado. Para construir: ${achievement.descricao}` : "Ainda bloqueado."}</p>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
  },

  /* Bolhas/peixes/coral gerados com posição/tempo levemente aleatórios —
     decoração pura, nunca afeta layout ou lógica. Decorações COMPRADAS
     (CITY_DECORATIONS) entram na mesma leva, como sprites extras. */
  sceneDecorHtml(ownedDecorations) {
    const bubbles = Array.from({ length: 10 }, (_, i) => {
      const left = 4 + ((i * 37) % 92);
      const size = 6 + (i % 4) * 3;
      const dur = 6 + (i % 5) * 1.4;
      const delay = i * 0.7;
      return `<span class="city-bubble" style="left:${left}%;--size:${size}px;--dur:${dur}s;--delay:${delay}s"></span>`;
    }).join("");

    const fishEmojis = ["🐠", "🐟", "🐡"];
    const fish = Array.from({ length: 3 }, (_, i) => {
      const top = 20 + i * 22;
      const dur = 14 + i * 4;
      const delay = i * 3;
      return `<span class="city-fish" style="top:${top}%;--size:${20 + i * 3}px;--dur:${dur}s;--delay:${delay}s">${fishEmojis[i % fishEmojis.length]}</span>`;
    }).join("");

    const coralEmojis = ["🪸", "🌿", "🪸"];
    const coral = coralEmojis
      .map((e, i) => `<span class="city-coral" style="left:${10 + i * 34}%;--size:${28 + i * 6}px;--dur:${4 + i}s">${e}</span>`)
      .join("");

    const owned = CITY_DECORATIONS.filter((d) => ownedDecorations.includes(d.id));
    const bought = owned
      .map(
        (d, i) =>
          `<span class="city-coral" style="left:${8 + i * 16}%;--size:${26 + (i % 3) * 4}px;--dur:${3.5 + (i % 3)}s" title="${d.nome}">${d.emoji}</span>`
      )
      .join("");

    return `${bubbles}${fish}${coral}${bought}<div class="city-sand"></div>`;
  },

  render() {
    const scrollContainer = document.getElementById("cityOceanScroll");
    if (!scrollContainer) return;

    const unlocked = Achievements.getUnlocked();
    const builtCount = CITY_BUILDINGS.filter((b) => unlocked.includes(b.id)).length;

    scrollContainer.innerHTML = `
      ${this.sceneDecorHtml(this.getOwnedDecorations())}
      <div class="city-guide">
        ${typeof Polvin !== "undefined" ? Polvin.avatarHtml("md") : ""}
        <div class="city-guide-bubble">Cada decisão constrói sua cidade! 🐙</div>
      </div>
      <div class="city-row">
        ${CITY_BUILDINGS.map((b) => {
          const done = unlocked.includes(b.id);
          return `
          <button class="city-plot ${done ? "built" : "locked"}" data-id="${b.id}" title="${done ? b.nome : "???"}">
            <div class="city-shell">${done ? b.emoji : "🔒"}</div>
            <div class="city-plot-nome">${done ? b.nome : "???"}</div>
          </button>`;
        }).join("")}
      </div>
    `;

    scrollContainer.querySelectorAll(".city-plot").forEach((btn) => {
      btn.addEventListener("click", () => {
        const building = CITY_BUILDINGS.find((b) => b.id === btn.dataset.id);
        if (building) this.showPlotDetail(building, unlocked.includes(building.id));
      });
    });

    const label = document.getElementById("cityProgressLabel");
    if (label) label.textContent = `${builtCount}/${CITY_BUILDINGS.length} construções`;

    const bar = document.getElementById("cityProgressBar");
    if (bar) bar.style.width = `${Math.round((builtCount / CITY_BUILDINGS.length) * 100)}%`;

    this.renderShop();
  },

  renderShop() {
    const container = document.getElementById("cityDecorationShop");
    if (!container) return;
    const owned = this.getOwnedDecorations();
    const coins = Learn.getCoins();

    container.innerHTML = CITY_DECORATIONS.map((item) => {
      const isOwned = owned.includes(item.id);
      return `
      <div class="card city-decoration-card ${isOwned ? "owned" : ""}">
        <div class="city-decoration-emoji">${item.emoji}</div>
        <div class="shop-item-name">${item.nome}</div>
        <div class="text-soft text-sm">${item.desc}</div>
        ${
          isOwned
            ? `<div class="badge" style="margin-top:8px">✅ Adquirida</div>`
            : `<button class="btn btn-gold btn-sm btn-block mt-8" data-buy="${item.id}" ${coins < item.preco ? "disabled" : ""}>🪙 ${item.preco}</button>`
        }
      </div>`;
    }).join("");

    container.querySelectorAll("[data-buy]").forEach((btn) => {
      btn.addEventListener("click", () => this.buyDecoration(btn.dataset.buy));
    });
  },

  init() {
    this.render();
  },
};
