/* =========================================================================
   CITYLIFE.JS — Cidade Financeira: ciclo semanal de vida financeira
   (RFC-017, Fase 1). Estado próprio e persistente (STORAGE_KEYS.CITY_LIFE),
   separado de js/city.js (que continua cuidando só da grade de 13
   construções derivadas de conquistas — nenhuma mudança lá).

   Cada "semana" representa ~1 mês de vida: sorteia 1 cenário econômico
   FICTÍCIO (próprio da simulação, não os dados reais da aba Mercado),
   credita salário, debita despesas fixas, e o jogador decide o que fazer
   com a sobra. Patrimônio/atributos são uma métrica PARALELA — nunca
   convertem em COINS/XP reais, pra não permitir "imprimir moeda" clicando
   em avançar semana repetidamente de graça (só 2 conquistas de marco,
   com XP fixo e pequeno, fazem essa ponte).
   ========================================================================= */

const CityLife = {
  DEFAULT_STATE: {
    semana: 0,
    patrimonio: 0,
    felicidade: 70,
    saude: 80,
    disciplina: 50,
    selicAtual: 10.5,
    emprego: { titulo: "Auxiliar Administrativo", salario: 1800 },
    despesasFixas: 900,
    ultimoCenarioId: null,
    decisaoPendente: null,
    historico: [],
  },

  getState() {
    return Store.get(STORAGE_KEYS.CITY_LIFE, this.DEFAULT_STATE);
  },

  setState(state) {
    Store.set(STORAGE_KEYS.CITY_LIFE, state);
  },

  fmt(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },

  randInRange([min, max]) {
    return min + Math.random() * (max - min);
  },

  pickScenario(excludeId) {
    const pool = excludeId ? WEEKLY_ECONOMIC_SCENARIOS.filter((s) => s.id !== excludeId) : WEEKLY_ECONOMIC_SCENARIOS;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  avancarSemana() {
    const state = this.getState();
    if (state.decisaoPendente) return; // precisa resolver a decisão da semana atual antes de avançar

    const cenario = this.pickScenario(state.ultimoCenarioId);
    const selicNova = this.clamp(state.selicAtual + this.randInRange(cenario.selicDeltaPP), 2, 25);
    const indicadores = {
      selic: Math.round(selicNova * 10) / 10,
      inflacao: Math.round(this.randInRange(cenario.inflacaoAnual) * 10) / 10,
      pib: Math.round(this.randInRange(cenario.pibAnual) * 10) / 10,
      ibovespaPct: Math.round(this.randInRange(cenario.ibovespaPct) * 10) / 10,
      dolarPct: Math.round(this.randInRange(cenario.dolarPct) * 10) / 10,
    };
    const sobra = Math.max(0, state.emprego.salario - state.despesasFixas);

    state.semana += 1;
    state.selicAtual = indicadores.selic;
    state.ultimoCenarioId = cenario.id;
    state.decisaoPendente = { cenarioId: cenario.id, indicadores, sobra };
    this.setState(state);

    if (typeof Achievements !== "undefined") Achievements.checkAll();
    this.render();
  },

  /* Efeito de cada opção sobre a MESMA sobra/indicadores da semana — usado
     tanto para aplicar a escolha real quanto para montar o comparativo
     (nunca subtrai patrimônio já acumulado, só decide como a sobra cresce). */
  efeitoOpcao(opcao, sobra, indicadores, selicAtual) {
    if (opcao.categoria === "poupanca") return sobra;
    if (opcao.categoria === "investir_rf") return sobra * (1 + selicAtual / 100 / 12);
    if (opcao.categoria === "investir_rv") return sobra * (1 + indicadores.ibovespaPct / 100);
    return 0; // gasto — dinheiro usado, não investido
  },

  resolverDecisao(optionId) {
    const state = this.getState();
    const pendente = state.decisaoPendente;
    if (!pendente) return;
    const opcao = CITY_LIFE_DECISION_OPTIONS.find((o) => o.id === optionId);
    if (!opcao) return;

    const efeito = this.efeitoOpcao(opcao, pendente.sobra, pendente.indicadores, state.selicAtual);
    state.patrimonio += efeito;
    state.felicidade = this.clamp(state.felicidade + opcao.felicidadeDelta, 0, 100);
    state.saude = this.clamp(state.saude + opcao.saudeDelta, 0, 100);
    state.disciplina = this.clamp(state.disciplina + opcao.disciplinaDelta, 0, 100);

    state.historico.unshift({ semana: state.semana, cenarioId: pendente.cenarioId, sobra: pendente.sobra, opcaoId: opcao.id, efeito });
    state.historico = state.historico.slice(0, 12);

    const comparativo = CITY_LIFE_DECISION_OPTIONS.map((o) => ({
      id: o.id,
      texto: o.texto,
      efeito: this.efeitoOpcao(o, pendente.sobra, pendente.indicadores, state.selicAtual),
    }));

    state.decisaoPendente = null;
    this.setState(state);

    if (typeof Achievements !== "undefined") Achievements.checkAll();
    this.render({ ultimaEscolha: opcao, comparativo });
  },

  /* ---------- Render ---------- */

  scenarioById(id) {
    return WEEKLY_ECONOMIC_SCENARIOS.find((s) => s.id === id);
  },

  render(resultado) {
    const container = document.getElementById("cityLifePanel");
    if (!container) return;
    const state = this.getState();

    const atributosHtml = `
      <div class="city-life-attrs">
        <div class="city-life-attr"><span>😊 Felicidade</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.felicidade}%;background:var(--gold)"></div></div></div>
        <div class="city-life-attr"><span>❤️ Saúde</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.saude}%;background:var(--coral)"></div></div></div>
        <div class="city-life-attr"><span>🏆 Disciplina</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.disciplina}%"></div></div></div>
      </div>
    `;

    const kpisHtml = `
      <div class="grid grid-3 kpi-row">
        <div class="card kpi"><div class="label">Mês (semana)</div><div class="value">${state.semana}</div></div>
        <div class="card kpi"><div class="label">Patrimônio simulado</div><div class="value">${this.fmt(state.patrimonio)}</div></div>
        <div class="card kpi"><div class="label">Emprego atual</div><div class="value" style="font-size:14px">${state.emprego.titulo}<br/><span class="text-soft" style="font-size:12px">${this.fmt(state.emprego.salario)}/mês</span></div></div>
      </div>
    `;

    let cicloHtml;
    if (resultado) {
      const opcao = resultado.ultimaEscolha;
      cicloHtml = `
        <div id="cityLifePolvin"></div>
        <div class="quiz-feedback mt-8">${opcao.narrativa}</div>
        <h4 class="mt-16">📊 O que cada escolha teria feito com essa mesma sobra</h4>
        <div class="grid grid-2 kpi-row">
          ${resultado.comparativo
            .map(
              (c) => `
            <div class="card kpi ${c.id === opcao.id ? "chosen" : ""}" style="${c.id === opcao.id ? "border-color:var(--primary)" : ""}">
              <div class="label">${c.texto}${c.id === opcao.id ? " (sua escolha)" : ""}</div>
              <div class="value" style="font-size:16px">${this.fmt(c.efeito)}</div>
            </div>`
            )
            .join("")}
        </div>
        <p class="text-sm text-soft mt-8">Esse é só o efeito dessa semana — repetir a mesma escolha por vários meses tende a compor esse resultado, pra melhor ou pra pior, dependendo do cenário econômico de cada semana.</p>
        <button class="btn btn-primary btn-block mt-16" id="cityLifeNextBtn">➡️ Avançar semana</button>
      `;
    } else if (state.decisaoPendente) {
      const cenario = this.scenarioById(state.decisaoPendente.cenarioId);
      const ind = state.decisaoPendente.indicadores;
      cicloHtml = `
        <div id="cityLifePolvin"></div>
        <div class="alert-box info mt-8">
          <b>${cenario.emoji} ${cenario.nome}</b><br/>${cenario.narrativa}
        </div>
        <div class="city-life-indicators mt-8">
          <div><span class="text-soft text-sm">Selic simulada</span><div class="mono">${ind.selic}%</div></div>
          <div><span class="text-soft text-sm">Inflação simulada</span><div class="mono">${ind.inflacao}%</div></div>
          <div><span class="text-soft text-sm">PIB simulado</span><div class="mono">${ind.pib}%</div></div>
          <div><span class="text-soft text-sm">Ibovespa simulado</span><div class="mono">${ind.ibovespaPct >= 0 ? "+" : ""}${ind.ibovespaPct}%</div></div>
          <div><span class="text-soft text-sm">Dólar simulado</span><div class="mono">${ind.dolarPct >= 0 ? "+" : ""}${ind.dolarPct}%</div></div>
        </div>
        <p class="text-sm text-soft mt-8">🌊 Indicadores fictícios da sua Cidade Financeira — pra dados reais do mercado, veja a aba Mercado.</p>
        <div class="alert-box mt-16">💰 Você recebeu ${this.fmt(state.emprego.salario)} de salário e pagou ${this.fmt(state.despesasFixas)} em despesas fixas. Sobrou <b>${this.fmt(state.decisaoPendente.sobra)}</b>. O que você faz com essa sobra?</div>
        <div class="flex mt-16" style="flex-direction:column;gap:8px">
          ${CITY_LIFE_DECISION_OPTIONS.map((o) => `<button class="quiz-option" data-opt="${o.id}">${o.texto}</button>`).join("")}
        </div>
      `;
    } else {
      cicloHtml = `
        <div id="cityLifePolvin"></div>
        <p class="text-soft mt-8">${state.semana === 0 ? "Sua vida financeira na Cidade está pronta pra começar." : "Semana resolvida — pronto para o próximo mês."}</p>
        <button class="btn btn-primary btn-block mt-16" id="cityLifeNextBtn">➡️ Avançar semana</button>
      `;
    }

    container.innerHTML = kpisHtml + atributosHtml + cicloHtml;

    const polvinArea = document.getElementById("cityLifePolvin");
    if (polvinArea && typeof Polvin !== "undefined") {
      const fala = resultado
        ? "Vamos ver o que essa decisão fez pela sua vida financeira!"
        : state.decisaoPendente
        ? "Chegou a notícia da semana — vamos entender o que ela significa antes de decidir."
        : "Toda semana representa um mês da sua vida. Vamos seguir construindo com calma?";
      Polvin.renderBubble(polvinArea, fala, { size: "sm", withListen: false });
    }

    container.querySelectorAll("[data-opt]").forEach((btn) => {
      btn.addEventListener("click", () => this.resolverDecisao(btn.dataset.opt));
    });
    container.querySelector("#cityLifeNextBtn")?.addEventListener("click", () => this.avancarSemana());
  },

  init() {
    this.render();
  },
};
