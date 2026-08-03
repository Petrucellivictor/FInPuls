/* =========================================================================
   SIMULATOR.JS — Simulador de juros compostos (investir x não investir)
   ========================================================================= */

const Simulator = {
  init() {
    document.getElementById("simCalcBtn").addEventListener("click", () => this.calc());
    this.calc(); // roda uma vez com os valores padrão
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
};
