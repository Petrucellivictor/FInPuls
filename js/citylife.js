/* =========================================================================
   CITYLIFE.JS — Cidade Financeira: ciclo semanal de vida financeira
   (RFC-017 Fase 1 + RFC-018 Fase 2). Estado próprio e persistente
   (STORAGE_KEYS.CITY_LIFE), separado de js/city.js (que continua cuidando
   só da grade de 13 construções derivadas de conquistas — nenhuma mudança
   lá) e de js/career.js ("Modo Carreira" — currículo por objetivo de vida,
   um conceito totalmente diferente; por isso aqui usamos "Emprego", não
   "Carreira", para não confundir os dois).

   Cada "semana" representa ~1 mês de vida: sorteia 1 cenário econômico
   FICTÍCIO (próprio da simulação, não os dados reais da aba Mercado),
   credita salário, debita despesas fixas, e o jogador decide o que fazer
   com a sobra. Patrimônio/atributos são uma métrica PARALELA — nunca
   convertem em COINS/XP reais, pra não permitir "imprimir moeda" clicando
   em avançar semana repetidamente de graça (só conquistas de marco, com
   XP fixo e pequeno, fazem essa ponte).

   Fase 2 adiciona: emprego com requisito (curso simulado OU trilha real
   concluída), cursos que custam patrimônio simulado, e 4 opções de
   investimento novas — 2 delas só ficam disponíveis depois de satisfazer
   um requisito, sempre visível mesmo bloqueada (nunca escondida).
   ========================================================================= */

const CityLife = {
  DEFAULT_STATE: {
    semana: 0,
    patrimonio: 0,
    felicidade: 70,
    saude: 80,
    disciplina: 50,
    status: 20,
    reputacao: 20,
    selicAtual: 10.5,
    empregoId: "auxiliar",
    cursosComprados: [],
    bensComprados: {},
    negocio: null,
    despesasFixas: 900,
    ultimoCenarioId: null,
    decisaoPendente: null,
    historico: [],
  },

  getState() {
    const state = Store.get(STORAGE_KEYS.CITY_LIFE, this.DEFAULT_STATE);
    // Migração de saves da Fase 1 (RFC-017), que guardavam `emprego` como
    // objeto fixo em vez de `empregoId` — Fase 1 só tinha o cargo inicial,
    // então a migração é exata, sem perda. Fase 3 (RFC-019) adiciona
    // `bensComprados`/`status`; Fase 4 (RFC-020) adiciona `negocio`/
    // `reputacao`, ausentes em saves anteriores.
    if (!state.empregoId) state.empregoId = "auxiliar";
    if (!state.cursosComprados) state.cursosComprados = [];
    if (!state.bensComprados) state.bensComprados = {};
    if (state.status === undefined) state.status = 20;
    if (state.reputacao === undefined) state.reputacao = 20;
    if (state.negocio === undefined) state.negocio = null;
    delete state.emprego;
    return state;
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

  currentJob(state) {
    return CITY_LIFE_JOBS.find((j) => j.id === state.empregoId) || CITY_LIFE_JOBS[0];
  },

  /* Satisfeito se: sem requisito (null); OU comprou o curso indicado; OU
     concluiu de verdade (Learn.getProgress()) o nível da trilha indicado —
     mesmo "múltiplos caminhos pro mesmo gate" já usado em
     Progression.CHECKERS.acoesfiis (perfil avançado OU trilha completa). */
  requisitoSatisfeito(requisito, state) {
    if (!requisito) return true;
    if (requisito.tipo === "curso") return state.cursosComprados.includes(requisito.cursoId);
    if (requisito.tipo === "trilha") {
      const nivel = COURSE.find((lvl) => lvl.id === requisito.nivelId);
      const progress = typeof Learn !== "undefined" ? Learn.getProgress() : {};
      return !!nivel && nivel.licoes.every((l) => !!progress[l.id]);
    }
    return false;
  },

  requisitoTexto(requisito) {
    if (!requisito) return "";
    if (requisito.tipo === "curso") {
      const curso = CITY_LIFE_COURSES.find((c) => c.id === requisito.cursoId);
      return curso ? `comprar o curso "${curso.nome}"` : "";
    }
    const nivel = COURSE.find((lvl) => lvl.id === requisito.nivelId);
    return nivel ? `concluir "${nivel.titulo}" na trilha Aprender` : "";
  },

  opcaoDisponivel(opcao, state) {
    if (!opcao.requisitoOu) return true;
    return opcao.requisitoOu.some((r) => this.requisitoSatisfeito(r, state));
  },

  opcaoRequisitoTexto(opcao) {
    if (!opcao.requisitoOu) return "";
    return opcao.requisitoOu.map((r) => this.requisitoTexto(r)).join(" OU ");
  },

  /* ---------- Emprego / promoção ---------- */

  promocaoDisponivel(state) {
    const idxAtual = CITY_LIFE_JOBS.findIndex((j) => j.id === state.empregoId);
    const proximo = CITY_LIFE_JOBS[idxAtual + 1];
    if (!proximo) return null;
    return this.requisitoSatisfeito(proximo.requisito, state) ? proximo : null;
  },

  aceitarPromocao(jobId) {
    const state = this.getState();
    const job = CITY_LIFE_JOBS.find((j) => j.id === jobId);
    if (!job) return;
    state.empregoId = job.id;
    // "mais responsabilidade, mais estresse" — queda pequena e única, não é
    // punição: o jogador recupera escolhendo "lazer" depois, como qualquer
    // outro atributo no jogo.
    state.felicidade = this.clamp(state.felicidade - 5, 0, 100);
    state.saude = this.clamp(state.saude - 3, 0, 100);
    this.setState(state);
    this.render();
  },

  /* ---------- Educação ---------- */

  comprarCurso(cursoId) {
    const state = this.getState();
    const curso = CITY_LIFE_COURSES.find((c) => c.id === cursoId);
    if (!curso || state.cursosComprados.includes(cursoId)) return;
    if (state.patrimonio < curso.custo) {
      alert("Patrimônio simulado insuficiente pra esse curso ainda.");
      return;
    }
    state.patrimonio -= curso.custo;
    state.cursosComprados.push(cursoId);
    this.setState(state);
    if (typeof Achievements !== "undefined") Achievements.checkAll();
    this.render();
  },

  /* ---------- Patrimônio físico (RFC-019, Fase 3) ---------- */

  /* Comprar um bem de valor justo (imóvel) não reduz patrimônio — só
     converte dinheiro em ativo de valor equivalente. Itens de luxo têm
     `valorInicial` menor que o `custo` (ágio de status, nunca recuperável),
     então o patrimônio cai exatamente esse ágio no ato da compra — nunca o
     valor cheio, que continua existindo como o `valorAtual` do bem. */
  comprarBem(assetId) {
    const state = this.getState();
    const asset = CITY_LIFE_ASSETS.find((a) => a.id === assetId);
    if (!asset || state.bensComprados[assetId] !== undefined) return;
    if (state.patrimonio < asset.custo) {
      alert("Patrimônio simulado insuficiente pra esse bem ainda.");
      return;
    }
    state.patrimonio -= asset.custo - asset.valorInicial;
    state.bensComprados[assetId] = asset.valorInicial;
    state.status = this.clamp(state.status + asset.statusDelta, 0, 100);
    state.felicidade = this.clamp(state.felicidade + asset.felicidadeDelta, 0, 100);
    state.saude = this.clamp(state.saude + asset.saudeDelta, 0, 100);
    this.setState(state);
    if (typeof Achievements !== "undefined") Achievements.checkAll();
    this.render();
  },

  manutencaoTotalMensal(state) {
    return Object.keys(state.bensComprados).reduce((soma, id) => {
      const asset = CITY_LIFE_ASSETS.find((a) => a.id === id);
      return soma + (asset ? asset.manutencaoMensal : 0);
    }, 0);
  },

  aluguelTotalMensal(state) {
    return Object.keys(state.bensComprados).reduce((soma, id) => {
      const asset = CITY_LIFE_ASSETS.find((a) => a.id === id);
      return soma + (asset ? asset.aluguelMensal : 0);
    }, 0);
  },

  /* Valorização (imóveis, conforme o cenário sorteado) ou depreciação
     (veículos, taxa fixa — não some numa alta de mercado) de cada bem
     possuído, aplicada toda semana. A variação de cada bem soma direto no
     patrimônio, porque o valor do bem É parte do patrimônio total. */
  aplicarValorizacaoSemanal(state, cenario) {
    Object.keys(state.bensComprados).forEach((id) => {
      const asset = CITY_LIFE_ASSETS.find((a) => a.id === id);
      if (!asset) return;
      const pct = asset.categoria === "imovel" ? this.randInRange(cenario.imovelValorizacaoPct) : VEICULO_DEPRECIACAO_PCT_SEMANA;
      const delta = state.bensComprados[id] * (pct / 100);
      state.bensComprados[id] += delta;
      state.patrimonio += delta;
    });
  },

  /* ---------- Negócio (RFC-020, Fase 4) ---------- */

  FUNCIONARIOS_MAX: 5,
  RECEITA_POR_FUNCIONARIO: 0.15, // cada funcionário multiplica a receita potencial em +15%

  abrirNegocio(businessId) {
    const state = this.getState();
    if (state.empregoId !== "empresario") {
      alert("Só é possível abrir um negócio como Empresário(a) — veja os requisitos na seção de Educação/Emprego.");
      return;
    }
    if (state.negocio) return; // só 1 negócio por vez nesta fase
    const biz = CITY_LIFE_BUSINESSES.find((b) => b.id === businessId);
    if (!biz) return;
    if (state.patrimonio < biz.custoAbertura) {
      alert("Patrimônio simulado insuficiente pra abrir esse negócio ainda.");
      return;
    }
    state.patrimonio -= biz.custoAbertura;
    state.negocio = { businessId, funcionarios: 0, semanasOperando: 0, ultimoLucro: 0 };
    this.setState(state);
    if (typeof Achievements !== "undefined") Achievements.checkAll();
    this.render();
  },

  contratarFuncionario() {
    const state = this.getState();
    if (!state.negocio || state.negocio.funcionarios >= this.FUNCIONARIOS_MAX) return;
    state.negocio.funcionarios += 1;
    this.setState(state);
    this.render();
  },

  demitirFuncionario() {
    const state = this.getState();
    if (!state.negocio || state.negocio.funcionarios <= 0) return;
    state.negocio.funcionarios -= 1;
    this.setState(state);
    this.render();
  },

  /* Fechar não devolve o investimento de abertura — risco real de
     empreender, deliberadamente diferente da regra "sem penalidade" das
     decisões semanais de investimento (RFC-017): abrir negócio é uma
     aposta que o jogador assume conscientemente, não uma alocação de
     sobra mensal. */
  fecharNegocio() {
    const state = this.getState();
    if (!state.negocio) return;
    state.negocio = null;
    this.setState(state);
    this.render();
  },

  /* Lucro/prejuízo da semana soma direto ao patrimônio (mesmo padrão da
     valorização de bens); Reputação sobe em semana lucrativa, cai um pouco
     em semana de prejuízo — nunca some/reseta, só oscila. */
  aplicarNegocioSemanal(state, cenario) {
    if (!state.negocio) return;
    const biz = CITY_LIFE_BUSINESSES.find((b) => b.id === state.negocio.businessId);
    if (!biz) return;
    const receitaPct = this.randInRange(cenario.negocioReceitaPct);
    const receita = biz.receitaBase * (1 + receitaPct / 100) * (1 + state.negocio.funcionarios * this.RECEITA_POR_FUNCIONARIO);
    const despesa = biz.despesaBase + state.negocio.funcionarios * biz.custoPorFuncionario;
    const lucro = receita - despesa;
    state.patrimonio += lucro;
    state.reputacao = this.clamp(state.reputacao + (lucro > 0 ? 1 : -0.5), 0, 100);
    state.negocio.semanasOperando += 1;
    state.negocio.ultimoLucro = lucro;
  },

  /* ---------- Ciclo semanal ---------- */

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
      fiiPct: Math.round(this.randInRange(cenario.fiiPct) * 10) / 10,
      etfPct: Math.round(this.randInRange(cenario.etfPct) * 10) / 10,
      criptoPct: Math.round(this.randInRange(cenario.criptoPct) * 10) / 10,
      ouroPct: Math.round(this.randInRange(cenario.ouroPct) * 10) / 10,
    };
    this.aplicarValorizacaoSemanal(state, cenario);
    this.aplicarNegocioSemanal(state, cenario);

    const salario = this.currentJob(state).salario;
    const manutencao = this.manutencaoTotalMensal(state);
    const aluguel = this.aluguelTotalMensal(state);
    const despesasTotais = state.despesasFixas + manutencao;
    const sobra = Math.max(0, salario + aluguel - despesasTotais);

    state.semana += 1;
    state.selicAtual = indicadores.selic;
    state.ultimoCenarioId = cenario.id;
    state.decisaoPendente = { cenarioId: cenario.id, indicadores, sobra, salario, manutencao, aluguel, despesasTotais };
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
    if (opcao.categoria === "investir_fii") return sobra * (1 + indicadores.fiiPct / 100);
    if (opcao.categoria === "investir_etf") return sobra * (1 + indicadores.etfPct / 100);
    if (opcao.categoria === "investir_cripto") return sobra * (1 + indicadores.criptoPct / 100);
    if (opcao.categoria === "investir_ouro") return sobra * (1 + indicadores.ouroPct / 100);
    return 0; // gasto — dinheiro usado, não investido
  },

  resolverDecisao(optionId) {
    const state = this.getState();
    const pendente = state.decisaoPendente;
    if (!pendente) return;
    const opcao = CITY_LIFE_DECISION_OPTIONS.find((o) => o.id === optionId);
    if (!opcao || !this.opcaoDisponivel(opcao, state)) return;

    const efeito = this.efeitoOpcao(opcao, pendente.sobra, pendente.indicadores, state.selicAtual);
    state.patrimonio += efeito;
    state.felicidade = this.clamp(state.felicidade + opcao.felicidadeDelta, 0, 100);
    state.saude = this.clamp(state.saude + opcao.saudeDelta, 0, 100);
    state.disciplina = this.clamp(state.disciplina + opcao.disciplinaDelta, 0, 100);

    state.historico.unshift({ semana: state.semana, cenarioId: pendente.cenarioId, sobra: pendente.sobra, opcaoId: opcao.id, efeito });
    state.historico = state.historico.slice(0, 12);

    const disponiveisAgora = CITY_LIFE_DECISION_OPTIONS.filter((o) => this.opcaoDisponivel(o, state));
    const comparativo = disponiveisAgora.map((o) => ({
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

  renderOpcoesHtml(state) {
    return CITY_LIFE_DECISION_OPTIONS.map((o) => {
      const disponivel = this.opcaoDisponivel(o, state);
      if (disponivel) return `<button class="quiz-option" data-opt="${o.id}">${o.texto}</button>`;
      return `<button class="quiz-option locked" disabled title="Bloqueado">🔒 ${o.texto}<div class="text-soft" style="font-size:11px;font-weight:400">Requisito: ${this.opcaoRequisitoTexto(o)}</div></button>`;
    }).join("");
  },

  renderPatrimonioFisicoHtml(state) {
    return `
      <h4 class="mt-16">🏠 Patrimônio Físico (imóveis e itens de luxo)</h4>
      <div class="grid grid-2 city-life-courses">
        ${CITY_LIFE_ASSETS.map((a) => {
          const possuido = state.bensComprados[a.id] !== undefined;
          const podePagar = state.patrimonio >= a.custo;
          const agio = a.custo - a.valorInicial;
          return `
          <div class="card city-life-course ${possuido ? "owned" : ""}">
            <div style="font-size:22px">${a.emoji}</div>
            <b>${a.nome}</b>
            <div class="text-soft text-sm">${a.descricao}</div>
            <div class="text-soft text-sm mt-8">Manutenção: ${this.fmt(a.manutencaoMensal)}/mês${a.aluguelMensal ? ` · Aluguel: +${this.fmt(a.aluguelMensal)}/mês` : ""}${agio > 0 ? ` · Ágio de status: ${this.fmt(agio)}` : ""}</div>
            ${
              possuido
                ? `<div class="badge mt-8">✅ Possui — valor atual: ${this.fmt(state.bensComprados[a.id])}</div>`
                : `<button class="btn btn-outline btn-sm mt-8" data-bem="${a.id}" ${podePagar ? "" : "disabled"}>${this.fmt(a.custo)}</button>`
            }
          </div>`;
        }).join("")}
      </div>
    `;
  },

  renderEducacaoHtml(state) {
    return `
      <h4 class="mt-16">🎓 Educação (custa patrimônio simulado)</h4>
      <div class="grid grid-2 city-life-courses">
        ${CITY_LIFE_COURSES.map((c) => {
          const comprado = state.cursosComprados.includes(c.id);
          const podePagar = state.patrimonio >= c.custo;
          return `
          <div class="card city-life-course ${comprado ? "owned" : ""}">
            <div style="font-size:22px">${c.emoji}</div>
            <b>${c.nome}</b>
            <div class="text-soft text-sm">${c.descricao}</div>
            ${
              comprado
                ? `<div class="badge mt-8">✅ Concluído</div>`
                : `<button class="btn btn-outline btn-sm mt-8" data-curso="${c.id}" ${podePagar ? "" : "disabled"}>${this.fmt(c.custo)}</button>`
            }
          </div>`;
        }).join("")}
      </div>
    `;
  },

  renderNegocioHtml(state) {
    if (!state.negocio) {
      const podeAbrir = state.empregoId === "empresario";
      return `
        <h4 class="mt-16">🏢 Seu Negócio</h4>
        ${podeAbrir ? "" : `<p class="text-soft text-sm">Só é possível abrir um negócio como <b>Empresário(a)</b> — desbloqueie esse emprego na seção de Educação.</p>`}
        <div class="grid grid-2 city-life-courses">
          ${CITY_LIFE_BUSINESSES.map((b) => {
            const podePagar = state.patrimonio >= b.custoAbertura;
            return `
            <div class="card city-life-course">
              <div style="font-size:22px">${b.emoji}</div>
              <b>${b.nome}</b>
              <div class="text-soft text-sm">${b.descricao}</div>
              <button class="btn btn-outline btn-sm mt-8" data-negocio="${b.id}" ${podeAbrir && podePagar ? "" : "disabled"}>${this.fmt(b.custoAbertura)}</button>
            </div>`;
          }).join("")}
        </div>
      `;
    }

    const biz = CITY_LIFE_BUSINESSES.find((b) => b.id === state.negocio.businessId);
    return `
      <h4 class="mt-16">🏢 Seu Negócio</h4>
      <div class="card city-life-course" style="text-align:left">
        <b>${biz.emoji} ${biz.nome}</b> — ${state.negocio.semanasOperando} semana(s) operando
        <div class="text-soft text-sm mt-8">Funcionários: <b>${state.negocio.funcionarios}</b>/${this.FUNCIONARIOS_MAX} (cada um aumenta a receita potencial e a despesa)</div>
        <div class="mt-8" style="color:${state.negocio.ultimoLucro >= 0 ? "var(--green-dark)" : "var(--coral-dark)"}"><b>Resultado da última semana: ${this.fmt(state.negocio.ultimoLucro)}</b></div>
        <div class="flex mt-8" style="gap:8px">
          <button class="btn btn-outline btn-sm" id="cityLifeContratarBtn" ${state.negocio.funcionarios >= this.FUNCIONARIOS_MAX ? "disabled" : ""}>+ Contratar</button>
          <button class="btn btn-outline btn-sm" id="cityLifeDemitirBtn" ${state.negocio.funcionarios <= 0 ? "disabled" : ""}>− Demitir</button>
          <button class="btn btn-outline btn-sm" id="cityLifeFecharNegocioBtn" style="margin-left:auto">Fechar negócio</button>
        </div>
        <p class="text-sm text-soft mt-8">Fechar não devolve o valor de abertura — abrir um negócio é um risco real, diferente das decisões semanais de investimento.</p>
      </div>
    `;
  },

  render(resultado) {
    const container = document.getElementById("cityLifePanel");
    if (!container) return;
    const state = this.getState();
    const jobAtual = this.currentJob(state);
    const promocao = this.promocaoDisponivel(state);

    const atributosHtml = `
      <div class="city-life-attrs">
        <div class="city-life-attr"><span>😊 Felicidade</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.felicidade}%;background:var(--gold)"></div></div></div>
        <div class="city-life-attr"><span>❤️ Saúde</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.saude}%;background:var(--coral)"></div></div></div>
        <div class="city-life-attr"><span>🏆 Disciplina</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.disciplina}%"></div></div></div>
        <div class="city-life-attr"><span>⭐ Status Social</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.status}%;background:var(--primary-light)"></div></div></div>
        <div class="city-life-attr"><span>🤝 Reputação</span><div class="budget-bar-bg"><div class="budget-bar-fill" style="width:${state.reputacao}%;background:var(--green)"></div></div></div>
      </div>
    `;

    const kpisHtml = `
      <div class="grid grid-3 kpi-row">
        <div class="card kpi"><div class="label">Mês (semana)</div><div class="value">${state.semana}</div></div>
        <div class="card kpi"><div class="label">Patrimônio simulado</div><div class="value">${this.fmt(state.patrimonio)}</div></div>
        <div class="card kpi"><div class="label">Emprego atual</div><div class="value" style="font-size:14px">${jobAtual.emoji} ${jobAtual.titulo}<br/><span class="text-soft" style="font-size:12px">${this.fmt(jobAtual.salario)}/mês</span></div></div>
      </div>
    `;

    const promocaoHtml = promocao
      ? `
      <div class="alert-box info mt-16">
        🎉 <b>Promoção disponível: ${promocao.emoji} ${promocao.titulo}</b> (${this.fmt(promocao.salario)}/mês).
        Mais salário, mais responsabilidade — aceitar reduz um pouco felicidade/saúde no início.
        <button class="btn btn-primary btn-sm mt-8" id="cityLifeAceitarPromocaoBtn" data-job="${promocao.id}">Aceitar promoção</button>
      </div>`
      : "";

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
        <p class="text-sm text-soft mt-8">Esse é só o efeito dessa semana — repetir a mesma escolha por vários meses tende a compor esse resultado, pra melhor ou pra pior, dependendo do cenário econômico de cada semana. Só as opções já desbloqueadas nessa semana entram no comparativo.</p>
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
        <div class="alert-box mt-16">💰 Você recebeu ${this.fmt(state.decisaoPendente.salario)} de salário${state.decisaoPendente.aluguel ? ` + ${this.fmt(state.decisaoPendente.aluguel)} de aluguel` : ""} e pagou ${this.fmt(state.decisaoPendente.despesasTotais)} em despesas${state.decisaoPendente.manutencao ? ` (incluindo ${this.fmt(state.decisaoPendente.manutencao)} de manutenção dos seus bens)` : ""}. Sobrou <b>${this.fmt(state.decisaoPendente.sobra)}</b>. O que você faz com essa sobra?</div>
        <div class="flex mt-16" style="flex-direction:column;gap:8px">
          ${this.renderOpcoesHtml(state)}
        </div>
      `;
    } else {
      cicloHtml = `
        <div id="cityLifePolvin"></div>
        <p class="text-soft mt-8">${state.semana === 0 ? "Sua vida financeira na Cidade está pronta pra começar." : "Semana resolvida — pronto para o próximo mês."}</p>
        <button class="btn btn-primary btn-block mt-16" id="cityLifeNextBtn">➡️ Avançar semana</button>
      `;
    }

    container.innerHTML = kpisHtml + promocaoHtml + atributosHtml + cicloHtml + this.renderNegocioHtml(state) + this.renderPatrimonioFisicoHtml(state) + this.renderEducacaoHtml(state);

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
    container.querySelector("#cityLifeAceitarPromocaoBtn")?.addEventListener("click", (e) => this.aceitarPromocao(e.target.dataset.job));
    container.querySelectorAll("[data-curso]").forEach((btn) => {
      btn.addEventListener("click", () => this.comprarCurso(btn.dataset.curso));
    });
    container.querySelectorAll("[data-bem]").forEach((btn) => {
      btn.addEventListener("click", () => this.comprarBem(btn.dataset.bem));
    });
    container.querySelectorAll("[data-negocio]").forEach((btn) => {
      btn.addEventListener("click", () => this.abrirNegocio(btn.dataset.negocio));
    });
    container.querySelector("#cityLifeContratarBtn")?.addEventListener("click", () => this.contratarFuncionario());
    container.querySelector("#cityLifeDemitirBtn")?.addEventListener("click", () => this.demitirFuncionario());
    container.querySelector("#cityLifeFecharNegocioBtn")?.addEventListener("click", () => {
      if (confirm("Fechar o negócio não devolve o valor de abertura. Continuar?")) this.fecharNegocio();
    });
  },

  init() {
    this.render();
  },
};
