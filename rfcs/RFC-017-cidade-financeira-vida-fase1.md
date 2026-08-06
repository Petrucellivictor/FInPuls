# RFC-017: Cidade Financeira — Fase 1 (ciclo semanal de vida financeira)

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário, spec detalhada em 2 mensagens)
- **Agentes envolvidos**: Product Owner, Software Architect, Gamification Designer, Financial Specialist, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
O usuário trouxe uma visão completa para transformar a aba Cidade Financeira num "simulador de vida financeira" — semanas representando meses, cenários econômicos sorteados, emprego/carreira, educação, 12 tipos de investimento com conhecimento bloqueando acesso, mercado imobiliário, empresas, sistema de luxo/status, atributos (patrimônio/saúde/felicidade/disciplina/reputação/etc.), linha do tempo dos 18 anos à aposentadoria, visual isométrico, IA educadora explicando cada consequência, e relatório de fim de temporada.

**Essa RFC entrega a Fase 1**: o núcleo do ciclo (cenário econômico semanal → indicadores → salário/despesas → 1 decisão com consequência → PolvIn explica o porquê → cidade evolui). Todo o resto (carreira multi-nível, 12 investimentos completos + gating por conhecimento, imóveis, empresas, luxo/status, isométrico, linha do tempo/aposentadoria, relatório de temporada) fica para fases seguintes, registradas no ROADMAP — o escopo completo, tentado de uma vez, seria maior que várias RFCs já feitas juntas.

## Objetivo
Um loop jogável e persistente: o jogador clica "Avançar semana", vê um cenário econômico com indicadores (fictícios, da simulação — não confundir com os dados reais do Mercado), recebe salário, paga despesas, toma 1 decisão sobre o que sobrou, e vê o efeito comparativo no patrimônio e em 3 atributos (felicidade, saúde, disciplina) — sem nenhum "Game Over".

## Motivação
Pedido direto do usuário. A Cidade hoje (RFC-005/010) é 100% derivada de conquistas já existentes, sem estado próprio — essa RFC dá à Cidade seu primeiro estado persistente de verdade.

## Benefícios
Aprendizado through prática contínua, não só quiz; reaproveita a maior parte da engine já existente (Selic real do RFC-016, motor de projeção do Simulador, padrão de conquistas) em vez de inventar sistemas paralelos.

## Impacto
- **`js/storage.js`**: nova chave `CITY_LIFE: "if_city_life"` — um único objeto `{ semana, patrimonio, dinheiro, felicidade, saude, disciplina, selicAtual, emprego, decisaoPendente, ultimoCenarioId, historico[] }`.
- **`js/data.js`**: `WEEKLY_ECONOMIC_SCENARIOS` (4 cenários: Boom/Crise/Inflação Alta/Neutro, validados quanto à direção macroeconômica pelo Financial Specialist — ver registro abaixo) e `CITY_LIFE_DECISIONS` (pool de decisões "sobrou R$X, o que faz?", mesmo formato de `SCENARIO_SIMULATIONS` do Simulador). 2 conquistas novas (`vida_na_cidade_iniciada`, `vida_na_cidade_1_ano`) ligadas a marcos de semanas — a única ponte com XP real, e fixa/pequena (não escalável com o patrimônio simulado).
- **`js/citylife.js`** (novo): `CityLife` — `avancarSemana()` (sorteia cenário sem repetir o anterior, atualiza a Selic *fictícia da simulação* por um delta do cenário, sorteia indicadores fictícios dentro da faixa do cenário, credita salário, debita despesas fixas, sorteia 1 decisão), `resolverDecisao(idx)` (aplica o efeito, mostra comparativo estilo `Simulator.chooseScenarioOption`, sem nunca subtrair patrimônio já conquistado — só a escolha do cenário, não a do jogador, pode apertar o orçamento), `render()`.
- **`index.html`**: novo card "🌊 Sua Vida Financeira" em `#tab-cidade`, antes da grade de construções já existente (que continua 100% intacta, sem nenhuma mudança).
- **`js/app.js`**: `CityLife.init()` na lista de módulos.

## Dependências
Reaproveita `Simulator.poupancaTaxaAnual`/o formato de `projectOutcome` (RFC-016 já corrigiu a Selic real do Simulador — a Cidade usa sua PRÓPRIA Selic fictícia, para não confundir com dados reais).

## Critérios de aceite
- "Avançar semana" sempre resolve num cenário + indicadores + decisão, sem travar.
- Indicadores da simulação claramente rotulados como fictícios, distintos da aba Mercado (dados reais).
- Nenhuma escolha do jogador reduz patrimônio já acumulado — só a decisão pendente (que soma) e o cenário sorteado (não a escolha) podem apertar o orçamento de uma semana.
- Patrimônio/atributos da Cidade NÃO alimentam `COINS`/`XP` diretamente — só 2 marcos fixos de conquista.
- Teste real (Node + Playwright): várias semanas avançadas em sequência, decisão resolvida, conquista de marco disparada, zero erro de console.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: mudança é só `localStorage` local (mesmo padrão de toda a app), sem esquema novo de banco, sem superfície de ataque nova, sem deploy.

## Registro por etapa

### 1. Product Owner
Escopo cortado para "núcleo do loop" — carreira/educação/12 investimentos/imóveis/empresas/luxo/isométrico/linha-do-tempo/relatório-de-temporada ficam para fases seguintes (ROADMAP). Decisão explícita: os indicadores da simulação semanal são **fictícios** (não os dados reais do Mercado) — misturar os dois criaria o risco de o jogador achar que o PIB/inflação "daquela semana" é informação real do Brasil.

### 2. Software Architect
Estado novo isolado em `STORAGE_KEYS.CITY_LIFE` (um objeto só) — não reaproveita nem contamina `PROFILE`/`ACHIEVEMENTS_UNLOCKED`/`COINS`. `js/citylife.js` é um módulo novo, não uma extensão de `js/city.js` (que continua cuidando só da grade de 13 construções) — os dois vivem na mesma aba, visualmente empilhados, logicamente separados.

### 3. Gamification Designer
Decisões travadas (consultado antes de implementar):
- "Avançar semana" é **clique manual, sem limite diário, sem custo de energia/XP** — energia já governa o ritmo diário via lições; um segundo limitador confundiria o jogador.
- **Sem penalidade dura**: toda decisão soma; o comparativo (igual ao Simulador de Decisões) mostra "se tivesse escolhido X, seu patrimônio estaria em Y" — nunca subtrai o que já foi conquistado. Só o cenário sorteado (não a escolha do jogador) pode apertar o orçamento de uma semana específica.
- Diferenciação do Simulador de Decisões (mesmo formato "cenário → escolha → comparativo"): o Simulador é **sem estado** (ferramenta isolada, repetível à vontade); a Cidade-Vida é **com estado** (patrimônio acumulado, atributos, histórico, ligada ao personagem contínuo).
- Patrimônio/atributos da Cidade são métrica **paralela** — não convertem em `COINS`/`XP` diretos (evitaria "imprimir moeda real" clicando "avançar semana" repetidamente de graça). Única ponte: 2 conquistas de marco, XP fixo e pequeno.

### 4. Financial Specialist
Validou a direção dos 4 cenários e corrigiu 2 pontos que pareceriam bug se não explicados: no Boom, a queda do dólar não vem da Selic caindo (juro menor atrai *menos* capital, não mais) — vem do otimismo/capital estrangeiro entrando via bolsa; a narrativa do cenário já reflete isso. Na Crise, Selic e dólar sobem *juntos* porque a Selic sobe na defensiva (tentando conter a fuga de capital) sem conseguir impedi-la — também refletido na narrativa, pra não parecer contraditório. Forneceu as faixas ilustrativas usadas em `WEEKLY_ECONOMIC_SCENARIOS` e a frase do PolvIn sobre por que a Selic sobe com inflação alta (usada literalmente no cenário "Inflação Alta").

### 5. Frontend Engineer
Implementado: `js/citylife.js`, `WEEKLY_ECONOMIC_SCENARIOS`/`CITY_LIFE_DECISIONS`/2 conquistas novas em `js/data.js`, chave nova em `js/storage.js`, card novo em `index.html`, init em `js/app.js`.

### 6. QA Engineer
Testado via Node (harness real, carregando os módulos de produção) + Playwright: `avancarSemana()` roda várias vezes em sequência sem erro, nunca repete o cenário anterior consecutivamente, decisão pendente bloqueia novo avanço até ser resolvida, patrimônio só cresce ou se mantém (nunca cai por escolha do jogador), conquista de marco dispara na semana certa, `COINS`/`XP` reais não se movem com o avanço de semana (só com o marco). Zero erro de console/página.

### 7. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados, com as fases futuras (2, 3, 4...) explicitamente listadas para não se perderem.
