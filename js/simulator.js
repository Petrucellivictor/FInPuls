/* =========================================================================
   SIMULATOR.JS — Simulador de juros compostos (investir x não investir)
   ========================================================================= */

const Simulator = {
  init() {
    document.getElementById("simCalcBtn").addEventListener("click", () => this.calc());
    this.calc(); // roda uma vez com os valores padrão

    document.getElementById("cmpCalcBtn")?.addEventListener("click", () => this.compare());
    this.compare();
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  calc() {
    const inicial = parseFloat(document.getElementById("simAporteInicial").value) || 0;
    const mensal = parseFloat(document.getElementById("simAporteMensal").value) || 0;
    const taxaAno = parseFloat(document.getElementById("simTaxa").value) || 0;
    const anos = parseInt(document.getElementById("simAnos").value) || 1;

    const taxaMensal = Math.pow(1 + taxaAno / 100, 1 / 12) - 1;
    const meses = anos * 12;

    let montanteInvestido = inicial;
    let totalAportado = inicial;
    const pontosPorAno = [];

    for (let m = 1; m <= meses; m++) {
      montanteInvestido = montanteInvestido * (1 + taxaMensal) + mensal;
      totalAportado += mensal;
      if (m % 12 === 0) {
        pontosPorAno.push({ ano: m / 12, investido: montanteInvestido, semRender: totalAportado });
      }
    }

    document.getElementById("simResultInvest").textContent = this.fmt(montanteInvestido);
    document.getElementById("simResultNoInvest").textContent = this.fmt(totalAportado);

    const diferenca = montanteInvestido - totalAportado;
    document.getElementById("simDiffText").innerHTML = `
      <div class="alert-box info">
        💰 Investindo, você teria <b>${this.fmt(diferenca)}</b> a mais só de juros — sem contar que, sem investir, esse valor ainda perderia poder de compra para a inflação.
      </div>
    `;

    this.renderBars(pontosPorAno);
  },

  renderBars(pontos) {
    const container = document.getElementById("simBars");
    if (!pontos.length) {
      container.innerHTML = "";
      return;
    }
    const max = Math.max(...pontos.map((p) => p.investido));
    // mostra no máximo 10 barras (a cada X anos, se o período for longo)
    const passo = Math.ceil(pontos.length / 10);
    const amostra = pontos.filter((_, i) => i % passo === 0 || i === pontos.length - 1);

    container.innerHTML = amostra
      .map((p) => {
        const hInvest = Math.max(4, (p.investido / max) * 100);
        const hSem = Math.max(4, (p.semRender / max) * 100);
        return `
        <div class="sim-bar-group">
          <div style="width:100%;display:flex;gap:3px;align-items:flex-end;height:150px;">
            <div class="sim-bar invest" style="height:${hInvest}%"></div>
            <div class="sim-bar noinvest" style="height:${hSem}%"></div>
          </div>
          <div class="sim-bar-label">Ano ${p.ano}</div>
        </div>`;
      })
      .join("");
  },

  /* ---------- Comparador de investimentos (renda fixa + 1 renda variável) ---------- */

  currentSelic() {
    const bcb = (typeof Market !== "undefined" && Market.data && Market.data.bcb) || [];
    const entry = bcb.find((s) => s.nome.includes("Selic"));
    return entry && entry.valor != null ? entry.valor / 100 : 0.105; // fallback educativo: 10,5% a.a.
  },

  compare() {
    const valor = parseFloat(document.getElementById("cmpValor").value) || 0;
    const dias = parseInt(document.getElementById("cmpPrazo").value) || 360;
    const pctCdb = (parseFloat(document.getElementById("cmpPctCdb").value) || 100) / 100;
    const pctLci = (parseFloat(document.getElementById("cmpPctLci").value) || 90) / 100;
    const dyFii = (parseFloat(document.getElementById("cmpDyFii").value) || 9) / 100;

    if (!valor || valor <= 0) {
      this.renderComparisonError("Informe um valor a investir válido para comparar.");
      return;
    }

    const selic = this.currentSelic();
    // Regra real da poupança: 70% da Selic quando Selic ≤ 8,5% a.a.; senão TR + 0,5% a.m. (TR ≈ 0 aproximado).
    const poupancaTaxa = selic <= 0.085 ? selic * 0.7 : Math.pow(1.005, 12) - 1;
    const aliquota = irAliquotaPorPrazo(dias).aliquota;

    const produtos = [
      { nome: "Poupança", taxaAno: poupancaTaxa, isento: true },
      { nome: "CDB", taxaAno: selic * pctCdb, isento: false },
      { nome: "LCI/LCA", taxaAno: selic * pctLci, isento: true },
      { nome: "Tesouro Selic", taxaAno: selic, isento: false },
    ];

    const resultados = produtos.map((p) => {
      const bruto = valor * Math.pow(1 + p.taxaAno, dias / 365);
      const ganho = bruto - valor;
      const ir = p.isento ? 0 : ganho * aliquota;
      const liquido = bruto - ir;
      const rentLiquidaAno = (Math.pow(liquido / valor, 365 / dias) - 1) * 100;
      return { ...p, bruto, ir, liquido, rentLiquidaAno };
    });

    resultados.sort((a, b) => b.liquido - a.liquido);
    const top3 = resultados.slice(0, 3);
    const vencedor = top3[0];

    const fiiFinal = valor * Math.pow(1 + dyFii, dias / 365);
    const fiiGanho = fiiFinal - valor;
    const fiiRentAno = (Math.pow(fiiFinal / valor, 365 / dias) - 1) * 100;

    this.renderComparison({
      selic,
      dias,
      valor,
      aliquota,
      resultados,
      top3,
      vencedor,
      fii: { final: fiiFinal, ganho: fiiGanho, rentAno: fiiRentAno, dy: dyFii * 100 },
    });
  },

  renderComparisonError(msg) {
    const container = document.getElementById("cmpResult");
    if (container) container.innerHTML = `<div class="alert-box warn">⚠️ ${msg}</div>`;
  },

  renderComparison(data) {
    const { selic, dias, valor, aliquota, resultados, top3, vencedor, fii } = data;
    const container = document.getElementById("cmpResult");
    if (!container) return;

    const motivoVencedor = vencedor.isento
      ? `<b>${vencedor.nome}</b> venceu porque é isenta de Imposto de Renda — mesmo sem ter a maior taxa nominal, a isenção compensa no valor líquido final.`
      : `<b>${vencedor.nome}</b> venceu porque a taxa nominal oferecida superou a vantagem de isenção de IR das opções isentas, mesmo pagando o imposto regressivo de ${(aliquota * 100).toFixed(1)}% sobre o ganho.`;

    container.innerHTML = `
      <div class="alert-box info">📌 Selic/CDI de referência usada: <b>${(selic * 100).toFixed(2)}% a.a.</b> (Banco Central — confira a aba Mercado para o valor mais recente). Prazo simulado: <b>${dias} dias</b> · Valor: <b>${this.fmt(valor)}</b>.</div>

      <h4 class="mt-16">🏆 Top 3 opções de Renda Fixa (das 4 simuladas)</h4>
      <div class="table-scroll"><table class="compare-table">
        <thead><tr><th>Opção</th><th>Bruto</th><th>IR</th><th>Líquido</th><th>Líq. % a.a.</th></tr></thead>
        <tbody>
          ${resultados
            .map(
              (r) => `
            <tr class="${top3.includes(r) ? "row-best" : ""}">
              <td>${r.nome}${r === vencedor ? " 🏆" : ""}</td>
              <td class="mono">${this.fmt(r.bruto)}</td>
              <td class="mono">${r.isento ? "isento" : this.fmt(r.ir)}</td>
              <td class="mono">${this.fmt(r.liquido)}</td>
              <td class="mono">${r.rentLiquidaAno.toFixed(2)}%</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table></div>
      <p class="text-sm text-soft">${motivoVencedor}</p>

      <h4 class="mt-16">📈 E a renda variável? Comparando com 1 FII (via dividendos)</h4>
      <div class="grid grid-3 kpi-row">
        <div class="card kpi"><div class="label">FII — valor final estimado</div><div class="value">${this.fmt(fii.final)}</div></div>
        <div class="card kpi"><div class="label">Dividendos recebidos (isentos de IR)</div><div class="value pos">${this.fmt(fii.ganho)}</div></div>
        <div class="card kpi"><div class="label">Rentabilidade estimada</div><div class="value">${fii.rentAno.toFixed(2)}% a.a.</div></div>
      </div>
      <p class="text-sm text-soft">Esse cálculo considera só o dividend yield estimado (${fii.dy.toFixed(1)}% a.a.) reinvestido — não inclui a variação do preço da cota, que pode ser positiva ou negativa e é o que faz do FII uma renda <b>variável</b>, com um risco de mercado que nenhuma das opções de renda fixa acima tem. Um FII pode "perder" da renda fixa em rentabilidade pontual e ainda valer a pena para quem busca diversificação e topa esse risco extra — são categorias de risco diferentes, não só números diferentes.</p>
      <p class="text-sm text-soft mt-8">Estimativa educativa com juros compostos sobre a taxa anual informada — não considera custódia, taxas de corretora, come-cotas de fundos ou mudanças futuras na Selic. Não é recomendação de investimento personalizada.</p>
    `;
  },
};
