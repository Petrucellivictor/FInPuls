/* =========================================================================
   ADVANCED.JS — Aba "Avançado": carteiras-modelo, calculadoras pro e
   dicionário do mercado. Conteúdo pensado para quem já domina o básico
   e quer ferramentas de verdade: alocação de ativos, tributação de renda
   fixa, independência financeira e retorno real.
   ========================================================================= */

const Advanced = {
  activeSection: "carteiras",
  glossarioFiltro: "todos",
  glossarioBusca: "",

  init() {
    document.querySelectorAll("#advSubnav .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.goSection(chip.dataset.adv));
    });
    this.renderCarteiras();
    this.renderCalculadoras();
    this.renderGlossario();
  },

  goSection(section) {
    this.activeSection = section;
    document.querySelectorAll("#advSubnav .filter-chip").forEach((c) => c.classList.toggle("active", c.dataset.adv === section));
    ["carteiras", "calculadoras", "glossario"].forEach((s) => {
      document.getElementById(`adv${this.cap(s)}Content`).classList.toggle("hidden", s !== section);
    });
  },

  cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  /* -------------------------------------------------------------------
     1) CARTEIRAS-MODELO
     ------------------------------------------------------------------- */
  renderCarteiras() {
    const container = document.getElementById("advCarteirasContent");
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    const seuPerfil = riskProfileFromUserProfile(profile);

    container.innerHTML = `
      <p class="text-sm text-soft mt-8">Alocação de referência por perfil de risco — use como ponto de partida para montar ou revisar sua carteira, nunca como recomendação individual.</p>
      <div class="grid grid-2 mt-16">
        ${MODEL_PORTFOLIOS.map((m) => this.portfolioCardHtml(m, m.id === seuPerfil)).join("")}
      </div>
    `;
  },

  portfolioCardHtml(model, isUserProfile) {
    const total = Object.values(model.alocacao).reduce((s, v) => s + v, 0);
    return `
      <div class="card model-portfolio-card ${isUserProfile ? "highlighted" : ""}">
        ${isUserProfile ? `<div class="model-badge">Compatível com seu perfil</div>` : ""}
        <h3>${model.emoji} ${model.nome}</h3>
        <p class="text-sm text-soft">${model.descricao}</p>
        <div class="alloc-bar">
          ${ASSET_CLASSES.filter((c) => model.alocacao[c] > 0)
            .map((c) => `<div class="alloc-seg" style="width:${(model.alocacao[c] / total) * 100}%;background:${ASSET_CLASS_COLORS[c]}" title="${c}: ${model.alocacao[c]}%"></div>`)
            .join("")}
        </div>
        <div class="alloc-legend">
          ${ASSET_CLASSES.filter((c) => model.alocacao[c] > 0)
            .map((c) => `<span class="alloc-legend-item"><span class="dot" style="background:${ASSET_CLASS_COLORS[c]}"></span>${c} — <b>${model.alocacao[c]}%</b></span>`)
            .join("")}
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------------
     2) CALCULADORAS PRO
     ------------------------------------------------------------------- */
  renderCalculadoras() {
    const container = document.getElementById("advCalculadorasContent");
    container.innerHTML = `
      <div class="grid grid-3 calc-grid">
        <div class="card calc-card">
          <h3>💸 Comparador de tributação (RF)</h3>
          <p class="text-sm text-soft">Compare CDB, LCI/LCA e Tesouro Selic líquidos de IR para um mesmo prazo.</p>
          <div class="field"><label for="calcTaxValor">Valor investido (R$)</label><input type="number" id="calcTaxValor" value="10000" min="0" /></div>
          <div class="field"><label for="calcTaxPrazo">Prazo (dias)</label><input type="number" id="calcTaxPrazo" value="720" min="1" /></div>
          <div class="field"><label for="calcTaxCdi">CDI/Selic estimado (% a.a.)</label><input type="number" id="calcTaxCdi" value="10.5" min="0" step="0.1" /></div>
          <div class="field"><label for="calcTaxCdb">CDB paga (% do CDI)</label><input type="number" id="calcTaxCdb" value="100" min="0" step="1" /></div>
          <div class="field"><label for="calcTaxLci">LCI/LCA paga (% do CDI, isenta de IR)</label><input type="number" id="calcTaxLci" value="90" min="0" step="1" /></div>
          <button class="btn btn-primary btn-block" id="calcTaxBtn">Comparar</button>
          <div id="calcTaxResult" class="mt-16"></div>
        </div>

        <div class="card calc-card">
          <h3>🏖️ Independência financeira</h3>
          <p class="text-sm text-soft">Quanto capital você precisa e quanto tempo falta, na regra dos 4% (ajustável).</p>
          <div class="field"><label for="calcFireRenda">Renda passiva mensal desejada (R$)</label><input type="number" id="calcFireRenda" value="5000" min="0" /></div>
          <div class="field"><label for="calcFireTaxa">Taxa real esperada (% a.a. acima da inflação)</label><input type="number" id="calcFireTaxa" value="5" min="0.1" step="0.1" /></div>
          <div class="field"><label for="calcFireAtual">Capital já investido (R$)</label><input type="number" id="calcFireAtual" value="0" min="0" /></div>
          <div class="field"><label for="calcFireAporte">Aporte mensal (R$)</label><input type="number" id="calcFireAporte" value="1500" min="0" /></div>
          <button class="btn btn-primary btn-block" id="calcFireBtn">Calcular</button>
          <div id="calcFireResult" class="mt-16"></div>
        </div>

        <div class="card calc-card">
          <h3>📐 Retorno real (Fisher)</h3>
          <p class="text-sm text-soft">Descubra quanto seu investimento realmente rendeu acima (ou abaixo) da inflação.</p>
          <div class="field"><label for="calcRealNominal">Taxa nominal (% a.a.)</label><input type="number" id="calcRealNominal" value="12" min="-50" step="0.1" /></div>
          <div class="field"><label for="calcRealInflacao">Inflação no período (% a.a.)</label><input type="number" id="calcRealInflacao" value="4.5" min="-50" step="0.1" /></div>
          <button class="btn btn-primary btn-block" id="calcRealBtn">Calcular</button>
          <div id="calcRealResult" class="mt-16"></div>
        </div>
      </div>
    `;

    document.getElementById("calcTaxBtn").addEventListener("click", () => this.calcTax());
    document.getElementById("calcFireBtn").addEventListener("click", () => this.calcFire());
    document.getElementById("calcRealBtn").addEventListener("click", () => this.calcReal());

    this.calcTax();
    this.calcFire();
    this.calcReal();
  },

  calcTax() {
    const valor = parseFloat(document.getElementById("calcTaxValor").value) || 0;
    const dias = parseInt(document.getElementById("calcTaxPrazo").value) || 1;
    const cdiAno = (parseFloat(document.getElementById("calcTaxCdi").value) || 0) / 100;
    const pctCdb = (parseFloat(document.getElementById("calcTaxCdb").value) || 0) / 100;
    const pctLci = (parseFloat(document.getElementById("calcTaxLci").value) || 0) / 100;
    const aliquota = irAliquotaPorPrazo(dias).aliquota;

    const produtos = [
      { nome: "CDB", taxaAno: cdiAno * pctCdb, isento: false },
      { nome: "LCI/LCA", taxaAno: cdiAno * pctLci, isento: true },
      { nome: "Tesouro Selic", taxaAno: cdiAno, isento: false },
    ];

    const resultados = produtos.map((p) => {
      const bruto = valor * Math.pow(1 + p.taxaAno, dias / 365);
      const ganhoBruto = bruto - valor;
      const ir = p.isento ? 0 : ganhoBruto * aliquota;
      const liquido = bruto - ir;
      const rentLiquidaAno = (Math.pow(liquido / valor, 365 / dias) - 1) * 100;
      return { ...p, bruto, ir, liquido, rentLiquidaAno };
    });

    const melhor = resultados.reduce((a, b) => (b.liquido > a.liquido ? b : a));

    document.getElementById("calcTaxResult").innerHTML = `
      <table class="compare-table">
        <thead><tr><th>Produto</th><th>Bruto</th><th>IR (${(aliquota * 100).toFixed(1)}%)</th><th>Líquido</th><th>Líq. % a.a.</th></tr></thead>
        <tbody>
          ${resultados
            .map(
              (r) => `<tr class="${r === melhor ? "row-best" : ""}">
            <td>${r.nome}${r === melhor ? " 🏆" : ""}</td>
            <td class="mono">${this.fmt(r.bruto)}</td>
            <td class="mono">${r.isento ? "isento" : this.fmt(r.ir)}</td>
            <td class="mono">${this.fmt(r.liquido)}</td>
            <td class="mono">${r.rentLiquidaAno.toFixed(2)}%</td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p class="text-sm text-soft mt-8">Cálculo aproximado (juros compostos sobre a taxa anual informada, prazo em dias/365). IR regressivo aplicado conforme a tabela vigente para renda fixa. Estimativa educativa — não considera custódia, taxas de corretora ou come-cotas de fundos.</p>
    `;
  },

  calcFire() {
    const rendaMensal = parseFloat(document.getElementById("calcFireRenda").value) || 0;
    const taxaRealAno = (parseFloat(document.getElementById("calcFireTaxa").value) || 0.1) / 100;
    const capitalAtual = parseFloat(document.getElementById("calcFireAtual").value) || 0;
    const aporteMensal = parseFloat(document.getElementById("calcFireAporte").value) || 0;

    const capitalNecessario = (rendaMensal * 12) / taxaRealAno;
    const taxaRealMensal = Math.pow(1 + taxaRealAno, 1 / 12) - 1;

    let capital = capitalAtual;
    let meses = 0;
    const LIMITE_MESES = 600; // 50 anos
    if (capital < capitalNecessario && aporteMensal <= 0 && taxaRealMensal <= 0) {
      meses = Infinity;
    } else {
      while (capital < capitalNecessario && meses < LIMITE_MESES) {
        capital = capital * (1 + taxaRealMensal) + aporteMensal;
        meses++;
      }
      if (capital < capitalNecessario) meses = Infinity;
    }

    const anos = Math.floor(meses / 12);
    const mesesResto = meses % 12;

    document.getElementById("calcFireResult").innerHTML = `
      <div class="alert-box info">
        🎯 Capital necessário (regra dos ${(taxaRealAno * 100).toFixed(1)}%): <b>${this.fmt(capitalNecessario)}</b><br/>
        ${
          meses === Infinity
            ? "Com os valores informados, essa meta não é alcançável em 50 anos — aumente o aporte mensal ou revise a taxa real esperada."
            : `⏱️ Tempo estimado para chegar lá: <b>${anos} ano(s) e ${mesesResto} mês(es)</b>, aportando ${this.fmt(aporteMensal)}/mês.`
        }
      </div>
      <p class="text-sm text-soft">A "taxa real" é o retorno já descontada a inflação. A regra dos 4% (ou outra taxa de retirada que você definir) é uma referência de planejamento, não uma garantia — depende da carteira e dos retornos reais no período.</p>
    `;
  },

  calcReal() {
    const nominal = (parseFloat(document.getElementById("calcRealNominal").value) || 0) / 100;
    const inflacao = (parseFloat(document.getElementById("calcRealInflacao").value) || 0) / 100;
    const real = ((1 + nominal) / (1 + inflacao) - 1) * 100;
    const positivo = real >= 0;

    document.getElementById("calcRealResult").innerHTML = `
      <div class="alert-box ${positivo ? "info" : "danger"}">
        ${positivo ? "✅" : "🚨"} Retorno real estimado: <b>${real.toFixed(2)}% a.a.</b><br/>
        ${positivo ? "Seu dinheiro está ganhando poder de compra." : "Seu dinheiro está perdendo poder de compra mesmo rendendo nominalmente — a inflação está comendo o retorno."}
      </div>
      <p class="text-sm text-soft">Fórmula de Fisher: (1 + taxa nominal) / (1 + inflação) − 1. Use a inflação (IPCA) do mesmo período da taxa nominal para o cálculo fazer sentido.</p>
    `;
  },

  /* -------------------------------------------------------------------
     3) DICIONÁRIO DO MERCADO
     ------------------------------------------------------------------- */
  renderGlossario() {
    const container = document.getElementById("advGlossarioContent");
    container.innerHTML = `
      <div class="flex gap-8" style="flex-wrap:wrap;margin-bottom:12px">
        <input type="text" id="glossarioBusca" placeholder="Buscar termo (ex: duration, ROE, hedge...)" style="flex:2;min-width:220px" />
      </div>
      <div class="invest-filters" id="glossarioFiltros">
        <button class="filter-chip active" data-nivel="todos">Todos</button>
        <button class="filter-chip" data-nivel="iniciante">Iniciante</button>
        <button class="filter-chip" data-nivel="intermediario">Intermediário</button>
        <button class="filter-chip" data-nivel="avancado">Avançado</button>
      </div>
      <div id="glossarioList" class="glossary-list"></div>
    `;

    document.getElementById("glossarioBusca").addEventListener("input", (e) => {
      this.glossarioBusca = e.target.value.toLowerCase();
      this.renderGlossarioList();
    });

    document.querySelectorAll("#glossarioFiltros .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        this.glossarioFiltro = chip.dataset.nivel;
        document.querySelectorAll("#glossarioFiltros .filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderGlossarioList();
      });
    });

    this.renderGlossarioList();
  },

  renderGlossarioList() {
    const list = document.getElementById("glossarioList");
    const nivelLabel = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };
    const items = GLOSSARY.filter((g) => this.glossarioFiltro === "todos" || g.nivel === this.glossarioFiltro)
      .filter((g) => !this.glossarioBusca || g.termo.toLowerCase().includes(this.glossarioBusca))
      .sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"));

    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><span class="emoji">🔎</span>Nenhum termo encontrado.</div>`;
      return;
    }

    list.innerHTML = items
      .map(
        (g) => `
      <div class="glossary-item">
        <div class="flex-between">
          <b>${g.termo}</b>
          <span class="badge ${g.nivel === "avancado" ? "badge-variavel" : g.nivel === "intermediario" ? "badge-ref" : "badge-fixa"}">${nivelLabel[g.nivel]}</span>
        </div>
        <p class="text-sm text-soft" style="margin:4px 0 0">${g.definicao}</p>
      </div>`
      )
      .join("");
  },
};
