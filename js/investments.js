/* =========================================================================
   INVESTMENTS.JS — Guia de investimentos (renda fixa, variável e cripto)
   ========================================================================= */

const InvestmentsUI = {
  filtroAtivo: "todos",

  init() {
    this.renderFilters();
    this.renderGrid();
    this.renderPolvinTip();
  },

  renderPolvinTip() {
    const container = document.getElementById("polvinInvestTip");
    if (!container) return;
    const dayIndex = new Date().getDate() % INVESTMENT_TIPS.length;
    const tip = INVESTMENT_TIPS[dayIndex];
    Polvin.renderBubble(container, `${tip.titulo}: ${tip.texto}`, { title: "Dica de investimento do POLVIn" });
  },

  renderFilters() {
    document.querySelectorAll("#investFilters .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        this.filtroAtivo = chip.dataset.filtro;
        document.querySelectorAll("#investFilters .filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderGrid();
      });
    });
  },

  badgeClass(categoria) {
    if (categoria.includes("Variável")) return "badge-variavel";
    if (categoria.includes("Digital")) return "badge-cripto";
    if (categoria.includes("Referência")) return "badge-ref";
    return "badge-fixa";
  },

  riskDots(risco) {
    let html = '<span class="risk-dots">';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="risk-dot ${i <= risco ? "filled" : ""}"></span>`;
    }
    return html + "</span>";
  },

  filtered() {
    if (this.filtroAtivo === "todos") return INVESTMENTS;
    if (this.filtroAtivo === "iniciante") return INVESTMENTS.filter((i) => i.nivel === "iniciante");
    if (this.filtroAtivo === "avancado") return INVESTMENTS.filter((i) => i.nivel === "avancado");
    return INVESTMENTS.filter((i) => i.categoria === this.filtroAtivo);
  },

  renderGrid() {
    const grid = document.getElementById("investGrid");
    const items = this.filtered();
    grid.innerHTML = items
      .map(
        (inv) => `
      <div class="card invest-card" data-id="${inv.id}">
        <div class="invest-card-head">
          <h3>${inv.nome}</h3>
          <span class="badge ${this.badgeClass(inv.categoria)}">${inv.categoria}</span>
        </div>
        <div class="text-sm text-soft">Risco: ${this.riskDots(inv.risco)}</div>
        <p class="text-sm mt-8">${inv.descricao.slice(0, 110)}${inv.descricao.length > 110 ? "…" : ""}</p>
        <button class="btn btn-outline btn-sm btn-block mt-8">Ver detalhes</button>
      </div>
    `
      )
      .join("");

    grid.querySelectorAll(".invest-card").forEach((card) => {
      card.addEventListener("click", () => this.openModal(card.dataset.id));
    });
  },

  openModal(id) {
    const inv = INVESTMENTS.find((i) => i.id === id);
    if (!inv) return;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box">
        <button class="modal-close">✕</button>
        <span class="badge ${this.badgeClass(inv.categoria)}">${inv.categoria}</span>
        <h2 class="mt-8">${inv.nome}</h2>
        <div class="text-sm text-soft">Nível de risco: ${this.riskDots(inv.risco)}</div>
        <p class="mt-16">${inv.descricao}</p>
        <div class="invest-detail-grid">
          <div><div class="k">Liquidez</div><div class="v">${inv.liquidez}</div></div>
          <div><div class="k">Rentabilidade</div><div class="v">${inv.rentabilidade}</div></div>
          <div><div class="k">Tributação</div><div class="v">${inv.tributacao}</div></div>
          <div><div class="k">Garantia</div><div class="v">${inv.garantia}</div></div>
        </div>
        <p><b>Indicado para:</b> ${inv.indicadoPara}</p>
        <div class="pros-cons">
          <div class="prós">
            <h4>✅ Vantagens</h4>
            <ul>${inv.prosCons.prós.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="contras">
            <h4>⚠️ Pontos de atenção</h4>
            <ul>${inv.prosCons.contras.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector(".modal-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  },
};
