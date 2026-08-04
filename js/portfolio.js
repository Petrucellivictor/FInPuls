/* =========================================================================
   PORTFOLIO.JS — Carteira de Investimentos (rastreador de alocação)
   Diferente da Carteira Digital (fluxo de caixa mensal), este módulo
   registra POSIÇÕES de investimento por classe de ativo e compara a
   alocação real do usuário com a carteira-modelo do seu perfil de risco
   (definido no diagnóstico inicial, pergunta sobre reação a quedas).
   ========================================================================= */

const Portfolio = {
  init() {
    document.getElementById("holdingAddBtn")?.addEventListener("click", () => this.addHolding());
    this.populateClassSelect();
    this.renderAll();
    document.addEventListener("profile:updated", () => this.renderAll());
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  populateClassSelect() {
    const select = document.getElementById("holdingClasseSelect");
    if (!select) return;
    select.innerHTML = ASSET_CLASSES.map((c) => `<option value="${c}">${c}</option>`).join("");
  },

  getHoldings() {
    return Store.get(STORAGE_KEYS.HOLDINGS, []);
  },

  addHolding() {
    const classe = document.getElementById("holdingClasseSelect").value;
    const valor = parseFloat(document.getElementById("holdingValorInput").value);
    if (!valor || valor <= 0) {
      alert("Informe um valor investido válido.");
      return;
    }
    const holdings = this.getHoldings();
    holdings.push({ id: Date.now().toString(), classe, valor, criadoEm: new Date().toISOString() });
    Store.set(STORAGE_KEYS.HOLDINGS, holdings);
    document.getElementById("holdingValorInput").value = "";
    this.renderAll();
  },

  removeHolding(id) {
    const holdings = this.getHoldings().filter((h) => h.id !== id);
    Store.set(STORAGE_KEYS.HOLDINGS, holdings);
    this.renderAll();
  },

  totalsByClass() {
    const holdings = this.getHoldings();
    const total = holdings.reduce((s, h) => s + h.valor, 0);
    const porClasse = {};
    ASSET_CLASSES.forEach((c) => (porClasse[c] = 0));
    holdings.forEach((h) => (porClasse[h.classe] = (porClasse[h.classe] || 0) + h.valor));
    return { total, porClasse };
  },

  renderAll() {
    this.renderList();
    this.renderAllocation();
  },

  renderList() {
    const container = document.getElementById("holdingsList");
    if (!container) return;
    const holdings = this.getHoldings();
    if (!holdings.length) {
      container.innerHTML = `<div class="text-soft text-sm">Nenhuma posição registrada ainda. Adicione seus investimentos por classe de ativo acima para ver sua alocação real.</div>`;
      return;
    }
    container.innerHTML = holdings
      .slice()
      .reverse()
      .map(
        (h) => `
      <div class="tx-row">
        <div class="tx-row-content">
          <div class="cat-icon" style="background:${ASSET_CLASS_COLORS[h.classe]}22;color:${ASSET_CLASS_COLORS[h.classe]}">●</div>
          <div class="text">
            <div class="desc">${h.classe}</div>
            <div class="meta">Adicionado em ${new Date(h.criadoEm).toLocaleDateString("pt-BR")}</div>
          </div>
        </div>
        <div class="flex gap-8" style="flex-shrink:0">
          <div class="amount mono">${this.fmt(h.valor)}</div>
          <button class="del-btn" data-id="${h.id}" title="Remover">✕</button>
        </div>
      </div>`
      )
      .join("");

    container.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.removeHolding(btn.dataset.id));
    });
  },

  renderAllocation() {
    const barContainer = document.getElementById("holdingsAllocationBar");
    const compareContainer = document.getElementById("holdingsCompare");
    if (!barContainer || !compareContainer) return;

    const { total, porClasse } = this.totalsByClass();
    document.getElementById("holdingsTotal").textContent = this.fmt(total);

    if (total <= 0) {
      barContainer.innerHTML = "";
      compareContainer.innerHTML = "";
      return;
    }

    barContainer.innerHTML = ASSET_CLASSES.filter((c) => porClasse[c] > 0)
      .map((c) => {
        const pct = (porClasse[c] / total) * 100;
        return `<div class="alloc-seg" style="width:${pct}%;background:${ASSET_CLASS_COLORS[c]}" title="${c}: ${pct.toFixed(1)}%"></div>`;
      })
      .join("");

    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    const riskId = riskProfileFromUserProfile(profile);
    const model = MODEL_PORTFOLIOS.find((m) => m.id === riskId);

    compareContainer.innerHTML = `
      <div class="text-sm text-soft mt-8">Comparando com a carteira-modelo <b>${model.emoji} ${model.nome}</b>, com base na sua reação a quedas no diagnóstico inicial.</div>
      <div class="table-scroll"><table class="compare-table mt-8">
        <thead><tr><th>Classe de ativo</th><th>Sua carteira</th><th>Modelo ${model.nome}</th><th>Diferença</th></tr></thead>
        <tbody>
          ${ASSET_CLASSES.map((c) => {
            const pctReal = total > 0 ? (porClasse[c] / total) * 100 : 0;
            const pctModelo = model.alocacao[c];
            const diff = pctReal - pctModelo;
            const diffCls = Math.abs(diff) >= 10 ? (diff > 0 ? "bad" : "bad") : "";
            const diffLabel = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} p.p.`;
            return `<tr>
              <td><span style="color:${ASSET_CLASS_COLORS[c]}">●</span> ${c}</td>
              <td class="mono">${pctReal.toFixed(1)}%</td>
              <td class="mono">${pctModelo}%</td>
              <td class="mono ${diffCls}">${diffLabel}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table></div>
      <p class="text-sm text-soft mt-8">Diferenças acima de ±10 pontos percentuais aparecem destacadas — considere se fazem sentido para os seus objetivos ou se é hora de rebalancear. Referência educativa, não é recomendação personalizada.</p>
    `;
  },
};
