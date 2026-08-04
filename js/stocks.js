/* =========================================================================
   STOCKS.JS — Aba "Ações & FIIs": registro de compras e dividendos por
   ticker, com preço atual atualizado manualmente (não depende de nenhuma
   API externa — a maioria das cotações de ações/FIIs exige chave paga em
   APIs públicas, então optamos por 100% de controle manual e confiável).
   Mostra valorização, dividendos recebidos e histórico por ano/mês.
   ========================================================================= */

const MESES_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const Stocks = {
  init() {
    document.getElementById("stockAddTradeBtn")?.addEventListener("click", () => this.addTrade());
    document.getElementById("stockAddDividendBtn")?.addEventListener("click", () => this.addDividend());
    document.getElementById("stockTradeTipo")?.addEventListener("change", () => this.toggleTradeFields());
    const dataTrade = document.getElementById("stockTradeData");
    if (dataTrade) dataTrade.value = new Date().toISOString().slice(0, 10);
    const dataDiv = document.getElementById("stockDividendData");
    if (dataDiv) dataDiv.value = new Date().toISOString().slice(0, 10);
    this.populateCryptoSelect();
    this.toggleTradeFields();
    this.renderAll();
    this.refreshCryptoPrices();
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  fmtQty(p) {
    const maxDigits = p.tipo === "Criptomoeda" ? 8 : 0;
    return p.qty.toLocaleString("pt-BR", { maximumFractionDigits: maxDigits });
  },

  populateCryptoSelect() {
    const select = document.getElementById("stockCryptoTicker");
    if (!select) return;
    select.innerHTML = Object.entries(CRYPTO_IDS)
      .map(([ticker, info]) => `<option value="${ticker}">${info.nome}</option>`)
      .join("");
  },

  toggleTradeFields() {
    const tipo = document.getElementById("stockTradeTipo")?.value;
    const isCripto = tipo === "Criptomoeda";
    document.getElementById("stockFieldsAcaoFii")?.classList.toggle("hidden", isCripto);
    document.getElementById("stockFieldsCripto")?.classList.toggle("hidden", !isCripto);
    const hint = document.getElementById("stockCryptoHint");
    if (hint) hint.style.display = isCripto ? "block" : "none";
  },

  getTrades() {
    return Store.get(STORAGE_KEYS.STOCK_TRADES, []);
  },
  getDividends() {
    return Store.get(STORAGE_KEYS.STOCK_DIVIDENDS, []);
  },
  getPrices() {
    return Store.get(STORAGE_KEYS.STOCK_PRICES, {});
  },

  async addTrade() {
    const tipo = document.getElementById("stockTradeTipo").value;
    const data = document.getElementById("stockTradeData").value || new Date().toISOString().slice(0, 10);

    if (tipo === "Criptomoeda") {
      await this.addCryptoTrade(data);
      return;
    }

    const ticker = document.getElementById("stockTradeTicker").value.trim().toUpperCase();
    const quantidade = parseFloat(document.getElementById("stockTradeQtd").value);
    const precoUnit = parseFloat(document.getElementById("stockTradePreco").value);

    if (!ticker || !quantidade || quantidade <= 0 || !precoUnit || precoUnit <= 0) {
      alert("Preencha o ticker, a quantidade e o preço pago corretamente.");
      return;
    }

    const trades = this.getTrades();
    trades.push({ id: Date.now().toString(), ticker, tipo, quantidade, precoUnit, data: new Date(data).toISOString() });
    Store.set(STORAGE_KEYS.STOCK_TRADES, trades);

    document.getElementById("stockTradeTicker").value = "";
    document.getElementById("stockTradeQtd").value = "";
    document.getElementById("stockTradePreco").value = "";

    this.renderAll();
    if (typeof Achievements !== "undefined") Achievements.checkAll();
  },

  /* Compra de criptomoeda: o usuário informa o valor em R$, e o sistema
     busca a cotação atual (CoinGecko) para calcular a quantidade
     fracionária automaticamente — cripto não se compra em "cotas". */
  async addCryptoTrade(data) {
    const ticker = document.getElementById("stockCryptoTicker").value;
    const valorInvestido = parseFloat(document.getElementById("stockCryptoValor").value);

    if (!valorInvestido || valorInvestido <= 0) {
      alert("Informe o valor investido em reais.");
      return;
    }

    const btn = document.getElementById("stockAddTradeBtn");
    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Buscando cotação...";

    try {
      const precoAtual = await this.fetchCryptoPrice(ticker);
      if (!precoAtual) throw new Error("sem cotação");

      const quantidade = valorInvestido / precoAtual;
      const trades = this.getTrades();
      trades.push({ id: Date.now().toString(), ticker, tipo: "Criptomoeda", quantidade, precoUnit: precoAtual, data: new Date(data).toISOString() });
      Store.set(STORAGE_KEYS.STOCK_TRADES, trades);
      this.setPriceSilent(ticker, precoAtual);

      document.getElementById("stockCryptoValor").value = "";
      this.renderAll();
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    } catch (e) {
      alert("Não foi possível buscar a cotação agora. Verifique sua conexão com a internet e tente novamente.");
    } finally {
      btn.disabled = false;
      btn.textContent = textoOriginal;
    }
  },

  async fetchCryptoPrice(ticker) {
    const info = CRYPTO_IDS[ticker];
    if (!info) return null;
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${info.id}&vs_currencies=brl`);
      const json = await res.json();
      return json[info.id] ? json[info.id].brl : null;
    } catch (e) {
      console.warn("Falha ao buscar cotação de criptomoeda:", e);
      return null;
    }
  },

  /* Atualiza o preço atual de todas as posições em cripto automaticamente,
     sem depender de atualização manual — só as ações/FIIs continuam
     manuais, por causa das limitações das APIs gratuitas de bolsa. */
  async refreshCryptoPrices() {
    const cryptoTickers = [...new Set(this.getTrades().filter((t) => t.tipo === "Criptomoeda").map((t) => t.ticker))];
    if (!cryptoTickers.length) return;
    await Promise.all(
      cryptoTickers.map(async (ticker) => {
        const preco = await this.fetchCryptoPrice(ticker);
        if (preco) this.setPriceSilent(ticker, preco);
      })
    );
    this.renderAll();
  },

  removeTrade(id) {
    Store.set(STORAGE_KEYS.STOCK_TRADES, this.getTrades().filter((t) => t.id !== id));
    this.renderAll();
  },

  addDividend() {
    const ticker = document.getElementById("stockDividendTicker").value;
    const valor = parseFloat(document.getElementById("stockDividendValor").value);
    const data = document.getElementById("stockDividendData").value || new Date().toISOString().slice(0, 10);

    if (!ticker) {
      alert("Cadastre uma compra antes de registrar dividendos.");
      return;
    }
    if (!valor || valor <= 0) {
      alert("Informe um valor de dividendo válido.");
      return;
    }

    const dividends = this.getDividends();
    dividends.push({ id: Date.now().toString(), ticker, valor, data: new Date(data).toISOString() });
    Store.set(STORAGE_KEYS.STOCK_DIVIDENDS, dividends);

    document.getElementById("stockDividendValor").value = "";

    this.renderAll();
    if (typeof Achievements !== "undefined") Achievements.checkAll();
  },

  removeDividend(id) {
    Store.set(STORAGE_KEYS.STOCK_DIVIDENDS, this.getDividends().filter((d) => d.id !== id));
    this.renderAll();
  },

  setPriceSilent(ticker, preco) {
    const prices = this.getPrices();
    prices[ticker] = preco;
    Store.set(STORAGE_KEYS.STOCK_PRICES, prices);
  },

  setPrice(ticker, preco) {
    this.setPriceSilent(ticker, preco);
    this.renderAll();
  },

  tickers() {
    return [...new Set(this.getTrades().map((t) => t.ticker))];
  },

  positions() {
    const trades = this.getTrades();
    const dividends = this.getDividends();
    const prices = this.getPrices();

    return this.tickers().map((ticker) => {
      const tTrades = trades.filter((t) => t.ticker === ticker);
      const qty = tTrades.reduce((s, t) => s + t.quantidade, 0);
      const valorInvestido = tTrades.reduce((s, t) => s + t.quantidade * t.precoUnit, 0);
      const precoMedio = qty > 0 ? valorInvestido / qty : 0;
      const precoAtual = prices[ticker] != null ? prices[ticker] : precoMedio;
      const valorAtual = qty * precoAtual;
      const variacaoValor = valorAtual - valorInvestido;
      const variacaoPct = valorInvestido > 0 ? (variacaoValor / valorInvestido) * 100 : 0;
      const divTotal = dividends.filter((d) => d.ticker === ticker).reduce((s, d) => s + d.valor, 0);
      return { ticker, tipo: tTrades[0].tipo, qty, precoMedio, valorInvestido, precoAtual, valorAtual, variacaoValor, variacaoPct, divTotal };
    });
  },

  totals() {
    const pos = this.positions();
    const valorInvestido = pos.reduce((s, p) => s + p.valorInvestido, 0);
    const valorAtual = pos.reduce((s, p) => s + p.valorAtual, 0);
    const dividendos = pos.reduce((s, p) => s + p.divTotal, 0);
    const valorizacao = valorAtual - valorInvestido;
    return { valorInvestido, valorAtual, valorizacao, dividendos, retornoTotal: valorizacao + dividendos };
  },

  groupByYearMonth(list) {
    const groups = {};
    list.forEach((item) => {
      const d = new Date(item.data);
      const y = d.getFullYear();
      const m = d.getMonth();
      groups[y] = groups[y] || {};
      groups[y][m] = groups[y][m] || [];
      groups[y][m].push(item);
    });
    return groups;
  },

  renderAll() {
    this.populateDividendSelect();
    this.renderKpis();
    this.renderPositions();
    this.renderHistory();
  },

  populateDividendSelect() {
    const select = document.getElementById("stockDividendTicker");
    if (!select) return;
    const tickers = this.tickers();
    select.innerHTML = tickers.length
      ? tickers.map((t) => `<option value="${t}">${t}</option>`).join("")
      : `<option value="">Cadastre uma compra primeiro</option>`;
  },

  renderKpis() {
    const t = this.totals();
    document.getElementById("stockKpiInvestido").textContent = this.fmt(t.valorInvestido);
    document.getElementById("stockKpiAtual").textContent = this.fmt(t.valorAtual);
    const elValorizacao = document.getElementById("stockKpiValorizacao");
    elValorizacao.textContent = this.fmt(t.valorizacao);
    elValorizacao.className = "value " + (t.valorizacao >= 0 ? "pos" : "neg");
    document.getElementById("stockKpiDividendos").textContent = this.fmt(t.dividendos);
    const elRetorno = document.getElementById("stockKpiRetornoTotal");
    elRetorno.textContent = this.fmt(t.retornoTotal);
    elRetorno.className = "value " + (t.retornoTotal >= 0 ? "pos" : "neg");
  },

  renderPositions() {
    const container = document.getElementById("stockPositions");
    if (!container) return;
    const positions = this.positions();
    if (!positions.length) {
      container.innerHTML = `<div class="empty-state"><span class="emoji">📈</span>Nenhuma posição registrada ainda. Adicione sua primeira compra acima.</div>`;
      return;
    }
    container.innerHTML = `
      <table class="compare-table stock-table">
        <thead>
          <tr><th>Ticker</th><th>Qtd.</th><th>Preço médio</th><th>Preço atual</th><th>Valor investido</th><th>Valor atual</th><th>Variação</th><th>Dividendos</th><th></th></tr>
        </thead>
        <tbody>
          ${positions
            .map(
              (p) => `
            <tr>
              <td><b>${p.ticker}</b><br/><span class="text-soft" style="font-size:11px">${p.tipo}</span></td>
              <td class="mono">${this.fmtQty(p)}</td>
              <td class="mono">${this.fmt(p.precoMedio)}</td>
              <td class="mono">
                <input type="number" class="stock-price-input" data-ticker="${p.ticker}" value="${p.precoAtual.toFixed(2)}" step="0.01" min="0" style="width:90px;padding:4px 6px" />
                ${p.tipo === "Criptomoeda" ? `<div class="text-soft" style="font-size:10px">🔄 cotação automática</div>` : ""}
              </td>
              <td class="mono">${this.fmt(p.valorInvestido)}</td>
              <td class="mono">${this.fmt(p.valorAtual)}</td>
              <td class="mono ${p.variacaoValor >= 0 ? "good" : "bad"}">${this.fmt(p.variacaoValor)} (${p.variacaoPct >= 0 ? "+" : ""}${p.variacaoPct.toFixed(1)}%)</td>
              <td class="mono">${this.fmt(p.divTotal)}</td>
              <td><button class="btn btn-outline btn-sm" data-update="${p.ticker}">Atualizar</button></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p class="text-sm text-soft mt-8">Atualize manualmente o "preço atual" de cada ticker sempre que quiser recalcular sua valorização — não há cotação automática em tempo real para todas as ações/FIIs sem uma chave de API paga.</p>
    `;

    container.querySelectorAll("[data-update]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = container.querySelector(`.stock-price-input[data-ticker="${btn.dataset.update}"]`);
        const preco = parseFloat(input.value);
        if (!preco || preco < 0) {
          alert("Informe um preço atual válido.");
          return;
        }
        this.setPrice(btn.dataset.update, preco);
      });
    });
  },

  renderHistory() {
    const iconePorTipo = { Ação: "📈", FII: "🏢", Criptomoeda: "🪙" };
    this.renderHistoryList("stockTradesHistory", this.getTrades(), (t) => ({
      titulo: `${iconePorTipo[t.tipo] || "📊"} ${t.ticker} — ${this.fmtQty({ qty: t.quantidade, tipo: t.tipo })} un.`,
      valor: t.quantidade * t.precoUnit,
      onDelete: () => this.removeTrade(t.id),
    }));
    this.renderHistoryList("stockDividendsHistory", this.getDividends(), (d) => ({
      titulo: `💵 ${d.ticker}`,
      valor: d.valor,
      onDelete: () => this.removeDividend(d.id),
    }));
  },

  renderHistoryList(containerId, list, mapFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<div class="text-soft text-sm">Nenhum registro ainda.</div>`;
      return;
    }
    const groups = this.groupByYearMonth(list);
    const years = Object.keys(groups).sort((a, b) => b - a);

    container.innerHTML = years
      .map((y) => {
        const months = Object.keys(groups[y]).sort((a, b) => b - a);
        const totalAno = months.reduce((s, m) => s + groups[y][m].reduce((s2, it) => s2 + mapFn(it).valor, 0), 0);
        return `
        <details class="history-year" open>
          <summary>${y} — total ${this.fmt(totalAno)}</summary>
          ${months
            .map((m) => {
              const items = groups[y][m];
              const totalMes = items.reduce((s, it) => s + mapFn(it).valor, 0);
              return `
              <details class="history-month">
                <summary>${MESES_PT[m]} — ${this.fmt(totalMes)}</summary>
                <div class="tx-list">
                  ${items
                    .map((it) => {
                      const info = mapFn(it);
                      return `
                    <div class="tx-row">
                      <div class="tx-row-content">
                        <div class="text">
                          <div class="desc">${info.titulo}</div>
                          <div class="meta">${new Date(it.data).toLocaleDateString("pt-BR")}</div>
                        </div>
                      </div>
                      <div class="flex gap-8" style="flex-shrink:0">
                        <div class="amount mono">${this.fmt(info.valor)}</div>
                        <button class="del-btn" data-del="${it.id}" title="Remover">✕</button>
                      </div>
                    </div>`;
                    })
                    .join("")}
                </div>
              </details>`;
            })
            .join("")}
        </details>`;
      })
      .join("");

    container.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = list.find((it) => it.id === btn.dataset.del);
        if (item) mapFn(item).onDelete();
      });
    });
  },
};
