/* =========================================================================
   WALLET.JS — Carteira digital: controle de gastos e ferramentas
   contra compras compulsivas
   ========================================================================= */

const CATEGORIES = {
  entrada: ["Salário", "Freelance/Renda extra", "Rendimento de investimentos", "Outros"],
  saida: [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras por impulso",
    "Investimentos",
    "Outros",
  ],
};

const CATEGORY_ICONS = {
  Salário: "💼", "Freelance/Renda extra": "🧑‍💻", "Rendimento de investimentos": "📈",
  Moradia: "🏠", Alimentação: "🍽️", Transporte: "🚌", Saúde: "🏥", Educação: "📚",
  Lazer: "🎮", "Compras por impulso": "🛍️", Investimentos: "💹", Outros: "🗂️",
};

const Wallet = {
  tipoAtual: "entrada",

  init() {
    this.populateCategorySelect();
    this.bindTypeToggle();
    document.getElementById("txAddBtn").addEventListener("click", () => this.addTransaction());
    document.getElementById("txClearBtn").addEventListener("click", () => this.clearAll());
    document.getElementById("budgetAddBtn").addEventListener("click", () => this.setBudget());
    document.getElementById("wishAddBtn").addEventListener("click", () => this.addWish());
    this.populateBudgetCategorySelect();
    this.renderAll();
    // dica de gasto compulsivo aleatória — o POLVIn como "fiscal" dos seus gastos
    const tip = SPENDING_TIPS[Math.floor(Math.random() * SPENDING_TIPS.length)];
    const tipContainer = document.getElementById("polvinSpendingTip");
    if (tipContainer) Polvin.renderBubble(tipContainer, `${tip.titulo}: ${tip.texto}`, { title: "POLVIn avisa: cuidado com gastos por impulso" });
  },

  bindTypeToggle() {
    document.getElementById("btnTipoEntrada").addEventListener("click", () => this.setTipo("entrada"));
    document.getElementById("btnTipoSaida").addEventListener("click", () => this.setTipo("saida"));
  },

  setTipo(tipo) {
    this.tipoAtual = tipo;
    document.getElementById("btnTipoEntrada").classList.toggle("active", tipo === "entrada");
    document.getElementById("btnTipoSaida").classList.toggle("active", tipo === "saida");
    this.populateCategorySelect();
  },

  populateCategorySelect() {
    const select = document.getElementById("txCategoria");
    select.innerHTML = CATEGORIES[this.tipoAtual].map((c) => `<option value="${c}">${c}</option>`).join("");
  },

  populateBudgetCategorySelect() {
    const select = document.getElementById("budgetCategoriaSelect");
    select.innerHTML = CATEGORIES.saida.map((c) => `<option value="${c}">${c}</option>`).join("");
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  getTransactions() {
    return Store.get(STORAGE_KEYS.TRANSACTIONS, []);
  },

  addTransaction() {
    const desc = document.getElementById("txDescricao").value.trim();
    const valor = parseFloat(document.getElementById("txValor").value);
    const categoria = document.getElementById("txCategoria").value;

    if (!desc || !valor || valor <= 0) {
      alert("Preencha uma descrição e um valor válido.");
      return;
    }

    const transactions = this.getTransactions();
    transactions.unshift({
      id: Date.now().toString(),
      tipo: this.tipoAtual,
      descricao: desc,
      valor,
      categoria,
      data: new Date().toISOString(),
    });
    Store.set(STORAGE_KEYS.TRANSACTIONS, transactions);

    document.getElementById("txDescricao").value = "";
    document.getElementById("txValor").value = "";

    this.renderAll();
    document.dispatchEvent(new CustomEvent("wallet:updated"));
  },

  deleteTransaction(id) {
    const transactions = this.getTransactions().filter((t) => t.id !== id);
    Store.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    this.renderAll();
    document.dispatchEvent(new CustomEvent("wallet:updated"));
  },

  clearAll() {
    if (!confirm("Remover todas as transações registradas?")) return;
    Store.set(STORAGE_KEYS.TRANSACTIONS, []);
    this.renderAll();
    document.dispatchEvent(new CustomEvent("wallet:updated"));
  },

  currentMonthTransactions() {
    const now = new Date();
    return this.getTransactions().filter((t) => {
      const d = new Date(t.data);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  },

  totals() {
    const txs = this.currentMonthTransactions();
    const entradas = txs.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
    const saidas = txs.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);
    const impulso = txs
      .filter((t) => t.tipo === "saida" && t.categoria === "Compras por impulso")
      .reduce((s, t) => s + t.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas, impulso };
  },

  setBudget() {
    const categoria = document.getElementById("budgetCategoriaSelect").value;
    const valor = parseFloat(document.getElementById("budgetValorInput").value);
    if (!valor || valor <= 0) {
      alert("Informe um limite válido.");
      return;
    }
    const budgets = Store.get(STORAGE_KEYS.BUDGETS, {});
    budgets[categoria] = valor;
    Store.set(STORAGE_KEYS.BUDGETS, budgets);
    document.getElementById("budgetValorInput").value = "";
    this.renderBudgets();
  },

  addWish() {
    const item = document.getElementById("wishItemInput").value.trim();
    const valor = parseFloat(document.getElementById("wishValorInput").value) || 0;
    if (!item) {
      alert("Descreva o item que você deseja comprar.");
      return;
    }
    const list = Store.get(STORAGE_KEYS.WISHLIST, []);
    list.unshift({
      id: Date.now().toString(),
      item,
      valor,
      criadoEm: new Date().toISOString(),
    });
    Store.set(STORAGE_KEYS.WISHLIST, list);
    document.getElementById("wishItemInput").value = "";
    document.getElementById("wishValorInput").value = "";
    this.renderWishlist();
  },

  removeWish(id) {
    const list = Store.get(STORAGE_KEYS.WISHLIST, []).filter((w) => w.id !== id);
    Store.set(STORAGE_KEYS.WISHLIST, list);
    this.renderWishlist();
  },

  buyWish(id) {
    this.removeWish(id);
    alert("Compra confirmada! Se quiser, registre-a na aba de transações.");
  },

  /* ---------- Renderização ---------- */

  renderAll() {
    this.renderKpis();
    this.renderList();
    this.renderBudgets();
    this.renderAlerts();
    this.renderWishlist();
  },

  renderKpis() {
    const t = this.totals();
    document.getElementById("wSaldo").textContent = this.fmt(t.saldo);
    document.getElementById("wEntradas").textContent = this.fmt(t.entradas);
    document.getElementById("wSaidas").textContent = this.fmt(t.saidas);
  },

  renderList() {
    const list = document.getElementById("txList");
    const txs = this.getTransactions();
    if (!txs.length) {
      list.innerHTML = `<div class="empty-state"><span class="emoji">🗒️</span>Nenhuma transação registrada ainda. Adicione a primeira ao lado.</div>`;
      return;
    }
    list.innerHTML = txs
      .map((t) => {
        const icon = CATEGORY_ICONS[t.categoria] || "🗂️";
        const dataFmt = new Date(t.data).toLocaleDateString("pt-BR");
        const bg = t.tipo === "entrada" ? "#e3f1ec" : "#fbe8e7";
        return `
        <div class="tx-row">
          <div class="tx-row-content">
            <div class="cat-icon" style="background:${bg}">${icon}</div>
            <div class="text">
              <div class="desc">${t.descricao}</div>
              <div class="meta">${t.categoria} · ${dataFmt}</div>
            </div>
          </div>
          <div class="flex gap-8" style="flex-shrink:0">
            <div class="amount ${t.tipo === "entrada" ? "in" : "out"}">${t.tipo === "entrada" ? "+" : "-"} ${this.fmt(t.valor)}</div>
            <button class="del-btn" data-id="${t.id}" title="Remover">✕</button>
          </div>
        </div>`;
      })
      .join("");

    list.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.deleteTransaction(btn.dataset.id));
    });
  },

  renderBudgets() {
    const container = document.getElementById("budgetList");
    const budgets = Store.get(STORAGE_KEYS.BUDGETS, {});
    const txs = this.currentMonthTransactions();
    const entries = Object.entries(budgets);

    if (!entries.length) {
      container.innerHTML = `<div class="text-soft text-sm">Nenhum limite definido ainda. Defina um limite mensal por categoria abaixo.</div>`;
      return;
    }

    container.innerHTML = entries
      .map(([categoria, limite]) => {
        const gasto = txs
          .filter((t) => t.tipo === "saida" && t.categoria === categoria)
          .reduce((s, t) => s + t.valor, 0);
        const pct = Math.min(100, (gasto / limite) * 100);
        const cls = pct >= 100 ? "over" : pct >= 80 ? "warn" : "";
        return `
        <div class="budget-row">
          <div class="budget-row-head">
            <span>${CATEGORY_ICONS[categoria] || ""} ${categoria}</span>
            <span>${this.fmt(gasto)} / ${this.fmt(limite)}</span>
          </div>
          <div class="budget-bar-bg"><div class="budget-bar-fill ${cls}" style="width:${pct}%"></div></div>
        </div>`;
      })
      .join("");
  },

  renderAlerts() {
    const container = document.getElementById("walletAlerts");
    const t = this.totals();
    const txs = this.currentMonthTransactions();
    const impulsoCount = txs.filter((tx) => tx.tipo === "saida" && tx.categoria === "Compras por impulso").length;
    const alerts = [];

    if (t.saidas > 0 && t.impulso / (t.entradas || t.saidas) > 0.15) {
      alerts.push({
        tipo: "danger",
        texto: `⚠️ Compras por impulso já representam <b>${((t.impulso / (t.entradas || t.saidas)) * 100).toFixed(0)}%</b> da sua movimentação este mês. Considere usar a "Lista de espera de desejos" abaixo antes da próxima compra.`,
      });
    } else if (impulsoCount >= 3) {
      alerts.push({
        tipo: "warn",
        texto: `Você já registrou <b>${impulsoCount}</b> compras por impulso este mês. Que tal revisar seus gatilhos na aba Educação?`,
      });
    }

    if (t.saldo < 0) {
      alerts.push({
        tipo: "danger",
        texto: `Seu saldo do mês está negativo (${this.fmt(t.saldo)}). Priorize cortar categorias não essenciais antes de investir.`,
      });
    }

    // limites de orçamento excedidos
    const budgets = Store.get(STORAGE_KEYS.BUDGETS, {});
    Object.entries(budgets).forEach(([categoria, limite]) => {
      const gasto = txs.filter((tx) => tx.tipo === "saida" && tx.categoria === categoria).reduce((s, tx) => s + tx.valor, 0);
      if (gasto > limite) {
        alerts.push({ tipo: "warn", texto: `Você ultrapassou o limite de <b>${categoria}</b> (${this.fmt(gasto)} de ${this.fmt(limite)}).` });
      }
    });

    if (!alerts.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = alerts.map((a) => `<div class="alert-box ${a.tipo}">${a.tipo === "danger" ? "🚨" : "⚠️"} ${a.texto}</div>`).join("");
  },

  renderWishlist() {
    const container = document.getElementById("wishList");
    const list = Store.get(STORAGE_KEYS.WISHLIST, []);
    if (!list.length) {
      container.innerHTML = `<div class="text-soft text-sm">Sua lista de espera está vazia — ótimo sinal!</div>`;
      return;
    }
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    container.innerHTML = list
      .map((w) => {
        const elapsed = Date.now() - new Date(w.criadoEm).getTime();
        const ready = elapsed >= SEVEN_DAYS;
        const diasRestantes = Math.max(0, Math.ceil((SEVEN_DAYS - elapsed) / (24 * 60 * 60 * 1000)));
        return `
        <div class="wishlist-item">
          <div>
            <b>${w.item}</b> <span class="text-soft text-sm">${w.valor ? "· " + this.fmt(w.valor) : ""}</span><br/>
            <span class="cd-badge ${ready ? "ready" : "waiting"}">${ready ? "Pronto para decidir" : `Aguarde ${diasRestantes} dia(s)`}</span>
          </div>
          <div class="flex gap-8">
            ${ready ? `<button class="btn btn-primary btn-sm" data-buy="${w.id}">Comprei</button>` : ""}
            <button class="btn btn-outline btn-sm" data-remove="${w.id}">Remover</button>
          </div>
        </div>`;
      })
      .join("");

    container.querySelectorAll("[data-remove]").forEach((btn) => btn.addEventListener("click", () => this.removeWish(btn.dataset.remove)));
    container.querySelectorAll("[data-buy]").forEach((btn) => btn.addEventListener("click", () => this.buyWish(btn.dataset.buy)));
  },
};
