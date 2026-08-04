/* =========================================================================
   MARKET.JS — Indicadores em tempo real
   Fontes públicas, sem necessidade de chave de API:
   - AwesomeAPI (economia.awesomeapi.com.br) → cotações de moedas
   - CoinGecko (api.coingecko.com) → criptomoedas
   - Banco Central do Brasil / SGS (api.bcb.gov.br) → Selic, CDI, IPCA
   Caso a rede do usuário bloqueie alguma dessas APIs, a interface exibe
   um aviso e mantém o restante do app funcionando normalmente.
   ========================================================================= */

const Market = {
  data: { moedas: [], criptos: [], bcb: [] },
  refreshIntervalMs: 60000, // 1 minuto

  init() {
    this.refresh();
    setInterval(() => this.refresh(), this.refreshIntervalMs);
  },

  async refresh() {
    await Promise.all([this.fetchMoedas(), this.fetchCriptos(), this.fetchBcb()]);
    this.renderTicker();
    this.renderMarketGrid();
    this.renderBcbGrid();
    this.renderRanking();
    const now = new Date();
    const el = document.getElementById("marketLastUpdate");
    if (el) el.textContent = `atualizado às ${now.toLocaleTimeString("pt-BR")}`;
  },

  async fetchMoedas() {
    try {
      const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL");
      const json = await res.json();
      this.data.moedas = Object.values(json).map((m) => ({
        nome: `${m.code}/${m.codein}`,
        valor: parseFloat(m.bid),
        variacaoPct: parseFloat(m.pctChange),
      }));
    } catch (e) {
      console.warn("Falha ao buscar cotações de moedas:", e);
      this.data.moedas = [];
    }
  },

  async fetchCriptos() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=brl&include_24hr_change=true"
      );
      const json = await res.json();
      const labels = { bitcoin: "Bitcoin (BTC)", ethereum: "Ethereum (ETH)", solana: "Solana (SOL)", cardano: "Cardano (ADA)" };
      this.data.criptos = Object.entries(json).map(([id, v]) => ({
        nome: labels[id] || id,
        valor: v.brl,
        variacaoPct: v.brl_24h_change,
      }));
    } catch (e) {
      console.warn("Falha ao buscar cotações de criptomoedas:", e);
      this.data.criptos = [];
    }
  },

  async fetchBcb() {
    try {
      const results = await Promise.all(
        BCB_SERIES.map(async (serie) => {
          try {
            const res = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie.codigo}/dados/ultimos/1?formato=json`);
            const json = await res.json();
            const ultimo = json[json.length - 1];
            return { nome: serie.nome, valor: ultimo ? parseFloat(ultimo.valor) : null, data: ultimo ? ultimo.data : null };
          } catch (e) {
            return { nome: serie.nome, valor: null, data: null };
          }
        })
      );
      this.data.bcb = results;
    } catch (e) {
      console.warn("Falha ao buscar séries do Banco Central:", e);
      this.data.bcb = [];
    }
  },

  fmtMoeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  renderTicker() {
    const track = document.getElementById("tickerTrack");
    const items = [...this.data.moedas, ...this.data.criptos];
    if (!items.length) {
      track.innerHTML = `<span class="ticker-item">Não foi possível carregar as cotações agora. Verifique sua conexão.</span>`;
      return;
    }
    const buildItems = () =>
      items
        .map((i) => {
          const up = i.variacaoPct >= 0;
          return `<span class="ticker-item"><b>${i.nome}</b> ${this.fmtMoeda(i.valor)} <span class="${up ? "ticker-up" : "ticker-down"}">${up ? "▲" : "▼"} ${Math.abs(i.variacaoPct || 0).toFixed(2)}%</span></span>`;
        })
        .join("");
    // duplica a lista para permitir o loop contínuo do CSS
    track.innerHTML = buildItems() + buildItems();
  },

  renderMarketGrid() {
    const grid = document.getElementById("marketGrid");
    const items = [...this.data.moedas, ...this.data.criptos];
    if (!items.length) {
      grid.innerHTML = `<div class="card empty-state" style="grid-column:1/-1"><span class="emoji">📡</span>Não foi possível carregar as cotações. Tente novamente em alguns instantes.</div>`;
      return;
    }
    grid.innerHTML = items
      .map((i) => {
        const up = i.variacaoPct >= 0;
        return `
        <div class="card market-card">
          <div class="text-soft text-sm">${i.nome}</div>
          <div class="value">${this.fmtMoeda(i.valor)}</div>
          <div class="change ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(i.variacaoPct || 0).toFixed(2)}% (24h)</div>
        </div>`;
      })
      .join("");
  },

  renderBcbGrid() {
    const grid = document.getElementById("bcbGrid");
    if (!this.data.bcb.length) {
      grid.innerHTML = `<div class="card empty-state" style="grid-column:1/-1"><span class="emoji">🏦</span>Indicadores do Banco Central indisponíveis no momento.</div>`;
      return;
    }
    grid.innerHTML = this.data.bcb
      .map(
        (s) => `
      <div class="card market-card">
        <div class="text-soft text-sm">${s.nome}</div>
        <div class="value">${s.valor !== null ? s.valor.toLocaleString("pt-BR", { maximumFractionDigits: 4 }) : "—"}</div>
        <div class="text-soft" style="font-size:11px">${s.data ? "ref. " + s.data : "sem dados"}</div>
      </div>`
      )
      .join("");
  },

  renderRanking() {
    const container = document.getElementById("rankingList");
    const selic = this.data.bcb.find((s) => s.nome.includes("Selic"));
    const selicVal = selic && selic.valor !== null ? selic.valor : 10.5; // fallback educativo

    const ranking = [
      { nome: "Tesouro Selic / CDB liquidez diária", risco: "Baixo", estimativa: `≈ ${selicVal.toFixed(2)}% a.a.`, perfil: "Conservador" },
      { nome: "CDB prefixado (bancos médios)", risco: "Baixo-Médio", estimativa: `≈ ${(selicVal + 1.5).toFixed(2)}% a.a.`, perfil: "Conservador/Moderado" },
      { nome: "LCI/LCA isentas de IR", risco: "Baixo-Médio", estimativa: `≈ ${(selicVal - 1).toFixed(2)}% a.a. líquido`, perfil: "Moderado" },
      { nome: "FIIs de papel/tijolo (dividendos)", risco: "Médio", estimativa: "Dividend yield ≈ 8-11% a.a.", perfil: "Moderado/Arrojado" },
      { nome: "Ações (índice Ibovespa, longo prazo)", risco: "Alto", estimativa: "Variável — histórico ≈ acima da inflação no longo prazo", perfil: "Arrojado" },
      { nome: "Criptomoedas", risco: "Muito alto", estimativa: "Extremamente variável", perfil: "Arrojado/Especulativo" },
    ];

    container.innerHTML = `
      <div class="table-scroll"><table class="compare-table">
        <thead><tr><th>Opção</th><th>Risco</th><th>Estimativa</th><th>Perfil indicado</th></tr></thead>
        <tbody>
          ${ranking
            .map(
              (r) => `<tr><td>${r.nome}</td><td>${r.risco}</td><td class="mono">${r.estimativa}</td><td>${r.perfil}</td></tr>`
            )
            .join("")}
        </tbody>
      </table></div>
      <p class="text-sm text-soft mt-8">Estimativas com base nas taxas oficiais mais recentes disponíveis, apenas para fins educativos.</p>
    `;
  },
};
