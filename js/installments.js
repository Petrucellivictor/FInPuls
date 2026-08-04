/* =========================================================================
   INSTALLMENTS.JS — Compras parceladas
   Registra compras feitas em N parcelas (valor total + número de parcelas),
   sem exigir que o usuário lance manualmente cada mês. Calcula, a partir
   da data da compra, quantas parcelas já "venceram" e quantas ainda faltam.
   ========================================================================= */

const Installments = {
  init() {
    document.getElementById("instAddBtn")?.addEventListener("click", () => this.addInstallment());
    this.populateCategorySelect();
    const dataInput = document.getElementById("instData");
    if (dataInput) dataInput.value = new Date().toISOString().slice(0, 10);
    this.renderAll();
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  populateCategorySelect() {
    const select = document.getElementById("instCategoriaSelect");
    if (!select) return;
    select.innerHTML = CATEGORIES.saida.map((c) => `<option value="${c}">${c}</option>`).join("");
  },

  getAll() {
    return Store.get(STORAGE_KEYS.INSTALLMENTS, []);
  },

  setAll(list) {
    Store.set(STORAGE_KEYS.INSTALLMENTS, list);
  },

  addInstallment() {
    const descricao = document.getElementById("instDescricao").value.trim();
    const categoria = document.getElementById("instCategoriaSelect").value;
    const valorTotal = parseFloat(document.getElementById("instValorTotal").value);
    const numParcelas = parseInt(document.getElementById("instNumParcelas").value);
    const dataInput = document.getElementById("instData").value;
    const dataCompra = dataInput ? new Date(dataInput) : new Date();

    if (!descricao || !valorTotal || valorTotal <= 0 || !numParcelas || numParcelas <= 0) {
      alert("Preencha a descrição, o valor total da compra e o número de parcelas.");
      return;
    }

    const list = this.getAll();
    list.unshift({
      id: Date.now().toString(),
      descricao,
      categoria,
      valorTotal,
      numParcelas,
      dataCompra: dataCompra.toISOString(),
    });
    this.setAll(list);

    document.getElementById("instDescricao").value = "";
    document.getElementById("instValorTotal").value = "";
    document.getElementById("instNumParcelas").value = "";

    this.renderAll();
    if (typeof Achievements !== "undefined") Achievements.checkAll();
  },

  removeInstallment(id) {
    if (!confirm("Remover esta compra parcelada?")) return;
    this.setAll(this.getAll().filter((c) => c.id !== id));
    this.renderAll();
  },

  /* Quantos meses (0-indexados) se passaram entre a compra e hoje. */
  mesesDecorridos(dataCompra) {
    const c = new Date(dataCompra);
    const now = new Date();
    return Math.max(0, (now.getFullYear() - c.getFullYear()) * 12 + (now.getMonth() - c.getMonth()));
  },

  detalhes(compra) {
    const valorParcela = compra.valorTotal / compra.numParcelas;
    const parcelasPagas = Math.min(compra.numParcelas, this.mesesDecorridos(compra.dataCompra) + 1);
    const parcelasRestantes = compra.numParcelas - parcelasPagas;
    const valorPago = parcelasPagas * valorParcela;
    const valorRestante = compra.valorTotal - valorPago;
    const concluida = parcelasPagas >= compra.numParcelas;
    const parcelaAtivaEsteMes = !concluida;
    return { valorParcela, parcelasPagas, parcelasRestantes, valorPago, valorRestante, concluida, parcelaAtivaEsteMes };
  },

  totalParcelasDoMes() {
    return this.getAll().reduce((sum, c) => {
      const d = this.detalhes(c);
      return sum + (d.parcelaAtivaEsteMes ? d.valorParcela : 0);
    }, 0);
  },

  renderAll() {
    const kpiEl = document.getElementById("instKpiMes");
    if (kpiEl) kpiEl.textContent = this.fmt(this.totalParcelasDoMes());

    const container = document.getElementById("instList");
    if (!container) return;
    const list = this.getAll();
    if (!list.length) {
      container.innerHTML = `<div class="text-soft text-sm">Nenhuma compra parcelada registrada ainda.</div>`;
      return;
    }

    container.innerHTML = list
      .map((c) => {
        const d = this.detalhes(c);
        const pct = (d.parcelasPagas / c.numParcelas) * 100;
        const parcelasHtml = Array.from({ length: c.numParcelas }, (_, i) => {
          const num = i + 1;
          const status = num <= d.parcelasPagas ? "paga" : "futura";
          return `<span class="installment-dot ${status}" title="Parcela ${num}/${c.numParcelas}${status === "paga" ? " — paga" : " — a vencer"}"></span>`;
        }).join("");

        return `
        <div class="card installment-card ${d.concluida ? "done" : ""}">
          <div class="flex-between">
            <div>
              <b>${c.descricao}</b>
              <div class="text-soft text-sm">${c.categoria} · comprado em ${new Date(c.dataCompra).toLocaleDateString("pt-BR")}</div>
            </div>
            <button class="del-btn" data-remove="${c.id}" title="Remover">✕</button>
          </div>
          <div class="budget-bar-bg mt-8"><div class="budget-bar-fill" style="width:${pct}%;background:${d.concluida ? "var(--green)" : "var(--primary)"}"></div></div>
          <div class="flex-between text-sm mt-8">
            <span class="text-soft">${d.concluida ? "Quitada ✅" : `Parcela ${Math.min(d.parcelasPagas, c.numParcelas)} de ${c.numParcelas}`}</span>
            <span class="mono">${this.fmt(d.valorParcela)}/parcela</span>
          </div>
          <div class="installment-dots mt-8">${parcelasHtml}</div>
          <div class="flex-between text-sm mt-8">
            <span class="text-soft">Já pago: <b>${this.fmt(d.valorPago)}</b></span>
            <span class="text-soft">Falta: <b>${this.fmt(d.valorRestante)}</b></span>
          </div>
        </div>`;
      })
      .join("");

    container.querySelectorAll("[data-remove]").forEach((btn) => btn.addEventListener("click", () => this.removeInstallment(btn.dataset.remove)));
  },
};
