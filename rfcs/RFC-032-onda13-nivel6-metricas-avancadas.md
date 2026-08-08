# RFC-032: Onda 13 da expansão para 300 lições — Trilha Financeira, "Nível 6 · Mercado Avançado (Pro)" fecha as lacunas de Alfa, Drawdown e os usos de derivativos além do hedge

- **Status**: concluída
- **Prioridade**: média (expansão de conteúdo, sem risco de arquitetura)
- **Agentes envolvidos**: Product Owner, Financial Specialist, Backend/Frontend Engineer (integração em `data.js`), QA Engineer, Documentation Specialist

## Descrição
Décima terceira Onda de conteúdo, segunda a tocar a trilha financeira (`COURSE`) depois da Onda 12 (RFC-031, que expandiu `nivel4`). Assim como a Onda 12, esta **não insere um nível novo** — expande um nível já existente (`nivel6`, "Mercado Avançado (Pro)") com 3 lições novas, apendadas ao final do array de lições desse nível. Mesma decisão de menor risco técnico já usada na Onda 12: reaproveita o padrão "retrofit, sempre anexado ao final de um nível já existente" em vez de inserir um nível novo no meio do array `COURSE`.

## Objetivo
Fechar três lacunas do padrão "termo citado sem contexto" (mesmo padrão que motivou as Ondas 9-12) dentro do nível mais técnico da trilha financeira — **Alfa**, **Drawdown** e os dois usos de derivativos que a própria lição `l6_5` promete no título mas nunca ensina (**especulação** e **arbitragem**, além do hedge) — em um dos dois níveis proporcionalmente mais enxutos da trilha (`nivel6`, 6 lições).

## Motivação (investigação feita antes de propor)

**1. Números reais de `COURSE`, lidos diretamente em `js/data.js`:**

| Nível | Título | Lições | XP/lição |
|---|---|---|---|
| `nivel1` | Fundamentos e Comportamento Financeiro | 35 | 20 |
| `nivel2` | Renda Fixa | 20 | 25 |
| `nivel3` | Renda Variável | 22 | 30 |
| `nivel4` | Diversificação e Risco | 8 | 35 |
| `nivel5` | Avançado | **5** | 40 |
| `nivel6` | Mercado Avançado (Pro) | **6** | 50 |
| **Total** | | **96** | |

`nivel5` e `nivel6` são hoje os dois níveis proporcionalmente mais fracos da trilha, e nenhum dos dois foi tocado por nenhuma Onda desta série até agora (Ondas 9-11 tocaram História/Empreender, Onda 12 tocou `nivel4`).

**2. Investigação de "termo citado sem contexto" em `nivel5`/`nivel6`, confirmada por grep em todo `js/data.js`:**

- **`Alfa`**: definido **só** no `GLOSSARY` — confirmado por grep que essa é a única ocorrência da palavra em todo o arquivo fora do dicionário. Nunca aparece em nenhuma lição, apesar de `l6_1` ("Alocação de ativos e teoria de portfólio") já ensinar o conceito irmão — **Beta** — em profundidade. Alfa é literalmente "o que sobra" depois do Beta explicar a parte do retorno atribuível ao mercado.
- **`Drawdown`**: mesmo padrão. Definido **só** no `GLOSSARY`, zero ocorrências em qualquer lição. `l6_1` já ensina desvio padrão e Índice de Sharpe, e `dr_05` (Onda 12) já ensina VaR (estimativa **prospectiva** de perda) — Drawdown é a métrica **retrospectiva** irmã de VaR, hoje ausente.
- **`Especulação` e `arbitragem`**: a lição `l6_5` se chama "**Derivativos**, hedge e finanças comportamentais" — mas ensina **apenas** o uso de hedge. O próprio `GLOSSARY` define "Derivativo" como instrumento "usado para **especulação, hedge ou arbitragem**" — dois dos três usos citados na própria definição nunca são ensinados em lição nenhuma.

**3. Nível proporcionalmente mais fraco**: `nivel5` (5 lições) é hoje o mais enxuto, `nivel6` (6 lições) é o segundo. Escolhido `nivel6` para esta Onda porque os três gaps encontrados são continuações diretas de conteúdo **já existente em `nivel6`** (`l6_1`, `l6_5`) — pedagogicamente pertencem lá. `nivel5` fica registrado como candidato prioritário de uma Onda futura.

## Benefícios
- Fecha 3 lacunas reais de "termo citado sem contexto" — primeira vez que Alfa, Drawdown e os usos não-hedge de derivativos são ensinados na trilha.
- Reduz o desequilíbrio de densidade entre `nivel6` e os níveis vizinhos (6 → 9 lições).
- Avança a trilha financeira rumo à meta de 300 lições (96 → 99), com o mesmo risco técnico baixo da Onda 12.
- Fecha uma inconsistência de conteúdo já publicado: a lição `l6_5` deixa de prometer "Derivativos" no título e entregar só "hedge" no conteúdo.

## Impacto
- **`js/data.js`**: 3 lições novas **apendadas ao final** de `COURSE[5].licoes` (`nivel6`, hoje terminando em `l6_6`) — não é inserção no meio do array `COURSE`, e não cria nível novo. `nivel1`-`nivel5` e as 6 lições já existentes de `nivel6` permanecem 100% intactos.
- **`js/trail.js`**: nenhuma mudança de código esperada — mesmo padrão de deslocamento em array achatado já coberto pela generalização de `isUnlocked()` por `doneCount` (RFC-028).
- **`README.md`/`CHANGELOG.md`/`ROADMAP.md`**: contagem de `nivel6` atualizada (6→9) e da trilha (`COURSE`: 96→99).

## Dependências
Nenhuma — expansão de conteúdo dentro de uma estrutura de dados já existente, mesmo padrão de risco técnico da Onda 12.

## Decisão de nomenclatura
**Não se aplica decisão "Nível N"** — não estamos criando um nível novo, só lições dentro de `nivel6` (título/cor inalterados). Convenção de `id`: `nivel6` já usa um único prefixo homogêneo (`l6_1` a `l6_6`) — as 3 lições novas continuam a mesma sequência, `l6_7`, `l6_8`, `l6_9`.

## User Stories
- Como usuário que já concluiu a teoria de portfólio (`l6_1`), quero entender o que é Alfa, para não confundir com Beta nem com retorno bruto.
- Como usuário que já aprendeu VaR (`dr_05`, Onda 12), quero entender Drawdown como a métrica irmã retrospectiva.
- Como usuário curioso sobre o mercado "Pro", quero entender que derivativos servem para mais do que proteção (hedge) — também para especular ou arbitrar — com avisos claros de risco.

## Nível e lições propostos (títulos/temas — conteúdo final é do Financial Specialist)

Nível existente: `nivel6` — "Nível 6 · Mercado Avançado (Pro)" (cor `#1F3A5F`, inalterada). 3 lições novas, apendadas após `l6_6`:

1. **`l6_7` — "Drawdown: medindo o 'estrago máximo' que uma carteira já sofreu"** — define drawdown como a queda percentual entre um pico e o menor ponto seguinte (medida histórica, realizada), diferenciando de VaR (`dr_05`, estimativa estatística prospectiva). Conecta com desvio padrão/volatilidade de `l6_1` sem reensiná-los.
2. **`l6_8` — "Alfa: quando um investimento (ou gestor) realmente 'bate o mercado'"** — define alfa como retorno acima/abaixo do esperado dado o risco (Beta, já ensinado em `l6_1`). Deixa explícito que alfa histórico não garante repetição futura.
3. **`l6_9` — "Especulação e arbitragem: os outros dois usos dos derivativos, além do hedge"** — define especulação (apostar na direção do preço, geralmente com alavancagem) e arbitragem (explorar diferenças de preço entre mercados, pouco acessível a pessoa física na prática). Referencia hedge/opções/futuros de `l6_5` só em prosa.

Padrão técnico idêntico às Ondas 9-12: 3 lições, 10 perguntas + `variante` cada (30 perguntas + 30 variantes = 60 blocos), schema de `COURSE` (`aula`, array de parágrafos), `xp: 50` (consistente com `nivel6`).

## Riscos
| Risco | Mitigação |
|---|---|
| Alfa (CAPM), Drawdown e especulação/arbitragem são conceitos técnicos reais, risco de imprecisão | `WebSearch` obrigatório antes de escrever |
| `l6_8` pode soar como promessa de que é fácil "bater o mercado" | Critério de aceite exige deixar claro que alfa histórico não garante repetição futura |
| `l6_9` é o primeiro conteúdo da trilha sobre alavancagem especulativa | Tom estritamente informativo, aviso de risco de alavancagem obrigatório |
| Sobreposição com `l6_1`/`dr_05`/`l6_5` | Só referenciar em prosa, nunca reensinar/reperguntar |
| `nivel6` (9 lições) ultrapassa `nivel5` (5), que vira o nível mais fraco | Registrar no ROADMAP como próximo candidato |

## Critérios de aceite
- 3 lições novas (`l6_7`, `l6_8`, `l6_9`) apendadas ao final de `COURSE[5].licoes` (`nivel6`), após `l6_6`.
- Exatamente 3 lições, cada uma com exatamente 10 perguntas + `variante` em 100% delas.
- `xp: 50` por lição, consistente com `nivel6`.
- `aula` com estrutura/tamanho comparável às lições existentes de `nivel6` (~5-6 parágrafos).
- Zero sobreposição literal com `l6_1`, `dr_05`, `l6_5`.
- `l6_8` deixa explícito que alfa histórico não garante repetição futura.
- `l6_9` inclui aviso explícito de risco de alavancagem, tom informativo, nunca prescritivo.
- Toda afirmação técnica verificada via `WebSearch`.
- `nivel1`-`nivel5` e as 6 lições já existentes de `nivel6` permanecem 100% inalterados.
- `node --check js/data.js` sem erro (ou revisão manual cuidadosa).
- QA confirma `Trail.isUnlocked()` sem regressão.
- `README.md`/`CHANGELOG.md`/`ROADMAP.md` refletem a nova contagem.
- `ROADMAP.md` registra `nivel5` como próximo candidato prioritário.

## Etapas puladas e por quê
- **Software Architect / Database Engineer / Cyber Security Specialist / DevOps Engineer**: expansão de conteúdo, mesmo risco técnico baixo já validado na Onda 12 — nenhuma mudança de arquitetura/schema/superfície de ataque/infraestrutura.
- **UX/UI Designer**: nenhuma mudança de interface.
- **Gamification Designer**: XP segue padrão já estabelecido (`xp: 50`), sem mecânica nova. Nota de backlog: evitar concentrar respostas corretas no índice 1 (bug já registrado no ROADMAP) nas 60 perguntas novas.

## Registro por etapa

### 1. Product Owner
- **Resumo da etapa**: lido `COURSE` completo, foco em `nivel5`/`nivel6`. Confirmado por grep que `Alfa`/`Drawdown` existem só no `GLOSSARY`, e que `l6_5` só ensina hedge apesar do título "Derivativos".
- **Decisões tomadas**: expandir `nivel6` (não `nivel5`, apesar de ser o mais enxuto) — decisão pedagógica, os 3 gaps continuam conteúdo já existente em `nivel6`. 3 lições apendadas, ids `l6_7`/`l6_8`/`l6_9`, `xp: 50`.
- **Pendências**: registrar `nivel5` como próximo candidato no ROADMAP ao final desta Onda.
- **Riscos**: sem sensibilidade política; risco de conteúdo em `l6_9`, mitigado por aviso de risco obrigatório; risco técnico de precisão, mitigado por `WebSearch`.
- **Próximo agente responsável**: Financial Specialist

### 2. Financial Specialist

- **Resumo da etapa**: ao iniciar, `js/data.js` já continha `l6_7`, `l6_8` e `l6_9` completos, apendados corretamente após `l6_6` (linhas 9665-10368) — resultado de uma tentativa anterior desta mesma etapa que, ao contrário do avisado, havia salvo o conteúdo antes de ser interrompida pelo limite de sessão. Antes de aceitar esse conteúdo como entregue, revisei as 3 lições inteiras linha a linha (não apenas os títulos), against as 3 lições de referência (`l6_1`, `l6_5`, `dr_05`) e o `GLOSSARY`, e refiz a validação técnica via `WebSearch` do zero, como se o conteúdo fosse novo. Não precisei reescrever nada — o conteúdo já atendia a todos os critérios de aceite.
- **Leituras feitas antes de validar**: `l6_1` (Alocação de ativos — Beta, Sharpe, desvio padrão, fronteira eficiente), `l6_5` (Derivativos, hedge e finanças comportamentais — call/put/futuro/prêmio), `l6_6` (Independência financeira), `dr_05` (Value at Risk), e as 3 entradas do `GLOSSARY` (`Alfa`, `Drawdown`, `Derivativo`) — para garantir zero sobreposição literal e consistência de definição entre lição e dicionário.
- **Fontes consultadas via `WebSearch` (verificação técnica, 2026-08-08)**:
  - Jensen's Alpha / CAPM — fórmula confirmada: α = retorno real − [taxa livre de risco + Beta × (retorno do mercado − taxa livre de risco)]. Bate exatamente com a fórmula usada em `l6_8` (pergunta do cálculo com taxa livre de risco 10%, retorno de mercado 20%, Beta 1,2 → retorno esperado 22%). Fontes: Wikipedia "Jensen's alpha", Wall Street Prep "Jensen's Measure", Kotak MF.
  - Maximum Drawdown — fórmula confirmada: MDD = (Valor de vale − Valor de pico) ÷ Valor de pico, medida peak-to-trough, percentual. Bate com o cálculo de `l6_7` (R$ 40.000 → R$ 28.000 = 30% de drawdown). Fontes: Wall Street Prep, Robeco, Financial Edge Training.
  - Arbitragem — definição confirmada: compra e venda simultânea do mesmo ativo (ou equivalente) em mercados diferentes explorando diferença de preço, oportunidades de curtíssima duração, dominadas por participantes com execução rápida e baixo custo — exatamente o enquadramento usado em `l6_9`. Fontes: Britannica Money, HBS Online, StoneX.
- **Decisões de conteúdo confirmadas nesta revisão**:
  - `l6_7` (Drawdown): define como medida histórica/retrospectiva (pico a vale já ocorrido), diferencia explicitamente de VaR (prospectivo, `dr_05`) em pergunta dedicada, e acrescenta o ponto pedagogicamente valioso da assimetria de recuperação (queda de 50% exige alta de 100%) — não ensinado em nenhuma lição anterior da trilha.
  - `l6_8` (Alfa): define via CAPM, conecta explicitamente com Beta (`l6_1`) em pergunta dedicada ("Beta explica a parte do retorno ligada ao risco de mercado; Alfa é o que sobra depois de descontar essa parte"), e cumpre o critério de aceite mais sensível — a pergunta 8 (com variante) e o último parágrafo da `aula` deixam explícito que "alfa histórico não garante alfa futuro", citando a dificuldade de separar habilidade de sorte estatística e a mudança de condições de mercado.
  - `l6_9` (Especulação e arbitragem): cumpre o aviso obrigatório de risco de alavancagem — pergunta 2 (com variante) define alavancagem e o efeito multiplicador sobre ganhos/perdas; pergunta 3 (com variante) explicita que "as perdas podem superar o valor inicialmente depositado como margem" e introduz "chamada de margem" (margin call) sem exagero nem alarmismo. A pergunta 7 (com variante) e o último parágrafo da `aula` fixam o tom estritamente informativo, no mesmo espírito das lições de day trade/criptomoedas já existentes na trilha (`nivel3`), sem nenhuma recomendação prescritiva.
- **Confirmação dos critérios de aceite (RFC linhas 78-89)**: 3 lições (`l6_7`/`l6_8`/`l6_9`) apendadas ao final de `COURSE[5].licoes`, após `l6_6` — confirmado por grep de `id: "l6_\d"` (sequência intacta `l6_1`...`l6_9`, sem duplicata, sem gap) e de `id: "nivel\d"` (6 níveis, sem duplicata). Cada lição tem exatamente 10 perguntas com `variante` em 100% delas (conferido pergunta a pergunta nas 3 lições). `xp: 50` nas 3. `aula` com 5-6 parágrafos, tom/analogias consistentes com `l6_1`/`l6_5`/`l6_6` (trilha de futebol/prova/montanha/seguro). Zero sobreposição literal confirmada por leitura completa de `l6_1`, `dr_05`, `l6_5` antes da validação — referências a Beta, VaR e hedge aparecem só em prosa, nunca reensinadas nem reperguntadas. `l6_8` deixa explícito que alfa histórico não garante repetição futura. `l6_9` inclui aviso explícito de risco de alavancagem em tom informativo. Toda afirmação técnica verificada via `WebSearch`. `nivel1`-`nivel5` e as 6 lições já existentes de `nivel6` (`l6_1`-`l6_6`) permanecem intactas — nenhuma edição foi feita nelas nesta etapa, confirmado por leitura completa das 6 e por grep de contagem.
- **Ressalva de processo**: não tenho acesso a uma ferramenta de shell/Bash nesta sessão para rodar `node --check js/data.js` e `git diff` como pedido no protocolo. A validação de sintaxe foi feita manualmente (leitura estrutural completa das 3 lições, checagem de chaves/colchetes de abertura-fechamento, `opcoes.length === 4` e `correta` dentro do intervalo válido em cada uma das 30 perguntas + 30 variantes, uma a uma) e a confirmação de que `nivel1`-`nivel5`/`l6_1`-`l6_6` não foram tocados foi feita por leitura direta do arquivo (não por `git diff`), já que nenhuma edição foi submetida nesta etapa — o arquivo já estava exatamente no estado esperado ao ser lido. Recomendo que o próximo agente (Backend/Frontend Engineer ou QA) rode `node --check js/data.js` com acesso a shell antes de fechar a RFC, como camada extra de segurança.
- **Pendências**: nenhuma para esta etapa. Nada foi escrito/editado em `js/data.js` porque o conteúdo já estava completo e correto; a etapa consistiu em auditoria completa + validação técnica.
- **Riscos**: nenhum risco de conteúdo identificado. Risco de processo (ausência de shell para `node --check`) sinalizado acima e delegado ao próximo agente com acesso a essa ferramenta.
- **Próximo agente responsável**: Backend/Frontend Engineer (rodar `node --check js/data.js`, confirmar `git diff` mostra só a adição das 3 lições, e QA Engineer para o restante dos testes)

### 3. Backend/Frontend Engineer (integração em `data.js`)
Etapa consolidada com a do Financial Specialist (mesmo padrão já usado nas Ondas 9-12) — a inserção das 3 lições já foi feita diretamente pelo Financial Specialist, apendada corretamente ao final de `nivel6.licoes`, sem tocar nenhum outro nível. `node --check` não disponível neste ambiente (mesma limitação já registrada em RFCs anteriores); balanceamento de chaves/colchetes/parênteses de `js/data.js` verificado pelo Orchestrator via checagem lexical — 2073 `{`/`}`, 1980 `[`/`]`, 15 `(`/`)`, todos batendo. `git diff` confirmado como inserção pura (705 inserções, 0 remoções) pelo próprio QA Engineer na etapa seguinte.

**Próximo agente responsável**: QA Engineer.

### 4. QA Engineer

**Ambiente**: Node.js e Python indisponiveis nesta sessao (mesma limitacao registrada pelo Financial Specialist na etapa 2). Foi possivel montar novamente o driver CDP-sobre-WebSocket contra um Chrome real (--remote-debugging-port=9333, perfil isolado chrome-profile-qa032) e reaproveitar o servidor estatico local em PowerShell (System.Net.HttpListener, porta 8792) ja usado em sessoes QA anteriores (scratchpad/server.ps1, scratchpad/cdplib.ps1). Isso permitiu teste real no navegador, nao so leitura de codigo - cobrindo o item 8 dos criterios de teste pedidos.

**Metodologia**:
1. Leitura completa da RFC (motivacao, decisoes das etapas 1 e 2) antes de testar.
2. git status / git diff --stat js/data.js / git diff js/data.js: confirmacao de que a mudanca esta no working tree (nao commitada), com 705 insercoes e 0 remocoes, um unico hunk contiguo.
3. Validacao estrutural das 3 licoes novas via grep/sed/awk (Node indisponivel): contagem de pergunta/opcoes/correta/explicacao/variante/xp por licao, extracao dos 60 valores de correta com verificacao de intervalo [0,3], contagem de itens de cada um dos 60 arrays opcoes.
4. Leitura completa de l6_1 (Beta/Sharpe/desvio padrao/correlacao/fronteira eficiente), l6_5 (hedge/call/put/futuros/financas comportamentais) e dr_05 (VaR) para comparacao textual direta com l6_7/l6_8/l6_9, e leitura das entradas Alfa/Drawdown/Derivativo do GLOSSARY.
5. Leitura de js/trail.js (isUnlocked, flatLessons, levels, startLesson, finishLesson, observeReveal) para checar regressao do bug historico da trilha invisivel (IntersectionObserver contra display:none, CHANGELOG v1.16.0) e do mecanismo de destravamento por doneCount (RFC-028).
6. Teste real no Chrome via CDP: cadastro de conta de teste nova, navegacao ate a aba Aprender, simulacao de progresso via Store/Trail.getProgress (mesma API de producao usada pelo app) ate imediatamente antes de l6_7, e execucao completa (10/10) de l6_7, l6_8 e l6_9, forcando deliberadamente uma resposta errada na pergunta 1 de cada licao para acionar o fluxo de variante, monitorando Runtime.consoleAPICalled(error)/Runtime.exceptionThrown durante todo o processo.
7. Checagem de Trail.isUnlocked() na fronteira imediatamente apos l6_9 (ultima licao de nivel6, mas nao a ultima do array achatado - a trilha de Historia continua depois), para confirmar ausencia de regressao do deslocamento causado pela insercao no final de nivel6.
8. Page.reload completo (ignoreCache: true) com Runtime.enable/console monitorados, para validar sintaxe/parse de js/data.js em tempo real (na ausencia de node --check, a execucao bem-sucedida do parser V8 real do Chrome, sem exceptions e com COURSE.length === 6 / COURSE[5].licoes.length === 9, e evidencia equivalente ou mais forte).
9. Checagem de js/supabase-config.js (item de seguranca do escopo de QA) e de js/energy.js (reset por data, clamp 0..ENERGY_MAX) - nenhum dos dois foi tocado por esta RFC, confirmado por git diff, mas revisados por completude do escopo padrao de QA.

**Resultado item a item** (criterios de aceite da RFC, linhas 78-89):

1. **3 licoes (l6_7/l6_8/l6_9) apendadas ao final de COURSE[5].licoes (nivel6), apos l6_6 - nenhum nivel novo, nenhuma insercao no meio** - PASSOU. git diff js/data.js: 705 insercoes, 0 remocoes, unico hunk (@@ -9661,6 +9661,711 @@) logo apos o fechamento de l6_6 e antes do fechamento do array licoes/objeto nivel6/array COURSE. Em runtime: COURSE.length === 6 (nenhum nivel novo), COURSE[5].licoes.map(l=>l.id) -> ["l6_1","l6_2","l6_3","l6_4","l6_5","l6_6","l6_7","l6_8","l6_9"], total de licoes de COURSE 96->99.

2. **Exatamente 3 licoes, cada uma com exatamente 10 perguntas + variante completo em 100%** - PASSOU. Para cada uma de l6_7/l6_8/l6_9: 20 ocorrencias de "pergunta:" (10 principais + 10 de variante), 20 de "opcoes:", 20 de "correta:", 20 de "explicacao:", 10 de "variante: {". Os 60 blocos opcoes (3 licoes x 20) tem exatamente 4 itens cada, sem excecao. Confirmado tambem em runtime: as 3 licoes tem nq:10 e hasVariant:true; as 3 licoes completadas via quiz real terminaram em "10 de 10 perguntas (100%)".

3. **xp: 50 por licao** - PASSOU. Confirmado estaticamente (1 ocorrencia de "xp: 50" por licao) e dinamicamente: XP do jogador foi 5->55 (l6_7), 55->105 (l6_8), 105->155 (l6_9) - sempre exatamente +50, batendo com lesson.xp. Moedas 5->10->15->20 (+5 por licao, via Learn.addCoins(5) em finishLesson).

4. **Zero sobreposicao literal com l6_1, dr_05, l6_5** - PASSOU. Leitura completa das 3 licoes de referencia confirma que Beta, VaR e hedge sao citados so em prosa nas licoes novas (ex.: "Beta explica a parte do retorno ligada ao risco de mercado; Alfa e o que sobra..."), nunca reensinados nem reperguntados com o mesmo texto. l6_7 (Drawdown) tem pergunta dedicada diferenciando-se explicitamente de VaR sem reexplicar VaR. l6_8 (Alfa) referencia Beta/Sharpe de l6_1 so como base de comparacao, nunca repetindo as perguntas originais sobre Beta. l6_9 (Especulacao/arbitragem) referencia call/put/premio/contrato futuro de l6_5 em prosa, mas as perguntas sao inteiramente sobre especulacao/alavancagem/arbitragem, temas nunca tratados em l6_5. Nenhuma frase de pergunta, opcao ou explicacao das 3 licoes novas e identica a nenhuma das 3 licoes de referencia.

5. **l6_8 deixa explicito que alfa historico nao garante repeticao futura** - PASSOU, com folga acima do minimo exigido. Pergunta 8 (e sua variante) trata exatamente disso: "Nao - alfa historico e uma medida do que ja aconteceu; distinguir habilidade genuina de sorte estatistica e dificil mesmo com bons historicos, as condicoes de mercado mudam, e desempenhos passados nao garantem repeticao futura" (correta: 3). O ultimo paragrafo da aula reforca: "alfa historico nao garante alfa futuro... um gestor que gerou alfa consistente no passado pode simplesmente regredir a media no futuro."

6. **l6_9 inclui aviso explicito de risco de alavancagem, tom informativo, nunca prescritivo** - PASSOU. Pergunta 2 (e variante) define alavancagem e o efeito multiplicador sobre ganhos/perdas. Pergunta 3 (e variante) explicita que "as perdas podem superar o valor inicialmente depositado como margem" e introduz "chamada de margem" sem alarmismo. Tom informativo confirmado explicitamente na pergunta 7 (e variante): "Apresentar os conceitos de forma informativa, sem recomendar a pratica - especulacao alavancada e arbitragem profissional envolvem alto risco e alta complexidade tecnica..." (correta: 2), e no ultimo paragrafo da aula: "especulacao alavancada e arbitragem profissional sao territorio de alto risco e alta complexidade tecnica, normalmente mais associado a investidores institucionais e profissionais especializados do que a carteiras de pessoa fisica iniciantes ou intermediarias." Nenhuma pergunta ou trecho de aula recomenda a pratica.

7. **nivel1-nivel5 e as 6 licoes ja existentes de nivel6 permanecem 100% inalterados** - PASSOU. git diff js/data.js mostra 0 linhas removidas/alteradas em qualquer parte do arquivo - a unica linha iniciada por "-" no diff e o cabecalho "--- a/js/data.js"; a mudanca e puramente aditiva, um unico bloco inserido entre o fechamento de l6_6 e o fechamento do array licoes de nivel6. Confirmado tambem em runtime, apos reload limpo (Page.reload com ignoreCache: true): COURSE.length === 6, COURSE[5].licoes.length === 9.

8. **Teste real no navegador (Aprender -> nivel6 -> completar licao, incluindo erro->variante -> XP/moedas -> zero erro de console)** - PASSOU. Cadastro de conta de teste bem-sucedido (qa032rfc032.test@mailinator.com) sem exigencia de confirmacao de e-mail para liberar sessao (Cloud.isLoggedIn() === true logo apos o submit). Navegacao ate a aba Aprender confirmada (trailContainer renderizado). Progresso simulado via Store/Trail.getProgress (mesma API de persistencia do app) ate imediatamente antes de l6_7, com Trail.isUnlocked() confirmando o destravamento. Fluxo completo e real de clique em botao para cada uma das 3 licoes:
   - **l6_7**: intro (aula) -> pergunta 1 respondida errada de proposito (clique no indice 1, resposta certa era 0) -> banner "Vamos reforcar esse mesmo conceito com outro exemplo" exibido, Trail.activeQuiz.onVariant === true -> variante respondida corretamente (indice 2) -> demais 9 perguntas respondidas corretamente em sequencia -> tela "Licao concluida! Voce acertou 10 de 10 perguntas (100%). +50 XP e +5 moedas adicionadas a sua conta." -> XP 5->55, moedas 5->10, Trail.getProgress('financeira').l6_7 === true.
   - **l6_8**: mesmo fluxo (erro proposital na pergunta 1 -> variante -> 9 corretas) -> XP 55->105, moedas 10->15, l6_8 === true.
   - **l6_9**: mesmo fluxo -> XP 105->155, moedas 15->20, l6_9 === true.
   Nenhum Runtime.consoleAPICalled(error) nem Runtime.exceptionThrown em nenhum momento - nem no carregamento inicial, nem durante o cadastro, nem durante os 3 fluxos completos de quiz (intro -> erro -> variante -> 9 perguntas -> tela de conclusao), nem no reload limpo final.

9. **Trail.isUnlocked() sem regressao para o cenario de insercao no final de nivel6 (ultimo nivel de COURSE)** - PASSOU. l6_9 ocupa o indice 110 do array achatado (Trail.flatLessons(), totalFlat === 114 - a trilha continua depois com capitulos de Historia intercalados, ja que HISTORY_COURSE tem mais niveis que COURSE). Imediatamente apos concluir l6_9, Trail.isUnlocked(111) (proxima entrada, de Historia) retornou true, sem gap residual nem regressao - o deslocamento causado por apendar 3 licoes ao final de nivel6 (ultimo nivel de COURSE) nao quebrou o destravamento por doneCount (RFC-028) de nada que vem depois na ordem intercalada. Consistente com a analise da RFC (linha 45): como a insercao foi no final de nivel6, e nao no meio, nao ha nenhum nivel "depois" dentro de COURSE cuja posicao relativa muda - so a posicao de HISTORY_COURSE no array achatado se desloca, e isso ja e coberto pela generalizacao por contagem total (isUnlocked), nao por posicao relativa.

**Verificacoes adicionais dentro do escopo padrao de QA**:
- **Bug historico do IntersectionObserver contra display:none** (CHANGELOG v1.16.0): comentario e guarda em observeReveal() (js/trail.js, linhas 167-178) permanecem intactos - sem regressao, arquivo nao tocado por esta RFC.
- **js/energy.js**: reset por data (ensureFresh, comparacao de toDateString()), spend() nunca deixa atual negativo (if (e.atual <= 0) return false), bonus() sempre limitado por Math.min(ENERGY_MAX, ...). Arquivo nao tocado por esta RFC (confirmado por git diff); os 3 Trail.startLesson() reais consumiram energia corretamente via Energy.tryStart() sem erro.
- **Seguranca (js/supabase-config.js)**: contem apenas SUPABASE_URL e uma chave sb_publishable_... (anon/publica) - nenhuma chave service_role/sb_secret_... exposta ao navegador. Arquivo nao tocado por esta RFC.
- **Sintaxe de js/data.js**: node --check indisponivel nesta sessao (mesma limitacao de ambiente ja registrada nas etapas anteriores). Em substituicao, o parser V8 real do Chrome processou o arquivo com sucesso em multiplos carregamentos completos da pagina, incluindo um Page.reload limpo (ignoreCache: true) executado por ultimo, sem Runtime.exceptionThrown, com COURSE.length === 6 e COURSE[5].licoes.length === 9 - evidencia funcional equivalente (e arguivelmente mais forte, pois testa tambem a semantica em runtime, nao so a sintaxe).

**Achados** (nenhum bloqueia esta RFC):

- **Bug**: nenhum bug funcional, de UI, de seguranca, de conteudo ou de regressao encontrado nos 9 criterios de aceite testados. Um achado de processo, sem relacao com a qualidade do conteudo entregue, listado abaixo.

- **Achado 1 - processo**. **Gravidade**: baixa. **Descricao**: a secao "### 3. Backend/Frontend Engineer" desta RFC esta vazia, embora a insercao em js/data.js ja esteja presente no working tree (nao commitada) - o registro por etapa nao foi preenchido por quem de fato aplicou/confirmou a insercao. Mesmo padrao de lacuna ja registrado como Achado 1 do QA da RFC-031. **Como reproduzir**: comparar git status/git diff js/data.js (mudanca real, presente, nao commitada) com o conteudo da secao 3 desta RFC (vazio). **Sugestao**: Orchestrator deve preencher retroativamente a secao 3 (ou o proprio agente responsavel, se puder ser identificado) antes de marcar a RFC como "concluida", e so entao commitar js/data.js junto da atualizacao de README.md/CHANGELOG.md/ROADMAP.md (Documentation Specialist). Nao e um bug de produto - encaminhar ao Orchestrator/Documentation Specialist.

**Distribuicao de correta nas 60 perguntas novas (nota de gamificacao, nao e bug)**: indice 0 -> 15, indice 1 -> 15, indice 2 -> 16, indice 3 -> 14 - distribuicao bem equilibrada entre os 4 indices, diferente do vies ja registrado como Achado 2 da RFC-031 (60/60 respostas corretas no indice 1 nas licoes daquela Onda). A nota de backlog da propria RFC-032 (secao "Etapas puladas e por que", Gamification Designer: "evitar concentrar respostas corretas no indice 1") foi respeitada nesta Onda.

**Veredito final: RFC-032 APROVADA sem ressalvas de bloqueio.** Todos os 9 criterios de aceite testaveis pelo QA Engineer passaram, com evidencia estatica (leitura/grep/git diff) e dinamica (teste real no Chrome via CDP, incluindo cadastro de conta, os 3 fluxos completos de erro->variante->conclusao, XP/moedas, e checagem de Trail.isUnlocked() na fronteira pos-insercao). Nenhuma regressao em nivel1-nivel5, nas 6 licoes pre-existentes de nivel6, no bug historico do IntersectionObserver, ou no sistema de energia. O unico achado e de processo (secao 3 vazia), baixa gravidade, nao bloqueia a conclusao desta RFC, mas deve ser resolvido pelo Orchestrator antes do commit final.

**Limitacao declarada**: Node.js/Python indisponiveis nesta sessao - a validacao de sintaxe usou o parser real do Chrome (via CDP) em vez de node --check, e a validacao estrutural (contagem de perguntas/opcoes/correta) usou grep/sed/awk em vez de um script Node dedicado. Ambas as abordagens sao consideradas equivalentes em cobertura para os criterios desta RFC, mas isso e registrado explicitamente em vez de presumido.

**Proximo agente responsavel**: Documentation Specialist (e Orchestrator, para preencher retroativamente a secao 3 vazia desta RFC antes de marcar como "concluida" e antes do commit).

### 5. Documentation Specialist

- **Resumo da etapa**: confirmada a versão atual antes de escrever (`git tag --sort=-v:refname | head -3` → topo `v1.51.0`, batendo com o topo de `CHANGELOG.md`) e atribuída `v1.52.0` a esta entrega, seguindo a sequência SemVer já em uso (minor bump — conteúdo novo, sem breaking change). Atualizados os 3 arquivos de documentação:
  - **`CHANGELOG.md`**: nova entrada `## [1.52.0] - 2026-08-08`, seção "Adicionado", resumindo as 3 lições novas (`l6_7`/`l6_8`/`l6_9`), o padrão técnico (10 perguntas + variante cada, `xp: 50`), a ausência de sobreposição com `l6_1`/`dr_05`/`l6_5`, a verificação via `WebSearch` das fórmulas de Alfa (CAPM) e Maximum Drawdown, a contagem `nivel6` 6→9 e trilha financeira 96→99, e o resultado do teste ao vivo do QA — mesmo estilo/tom das entradas anteriores (Onda 12, v1.50.0, usada como referência direta de formato).
  - **`README.md`**: seção "Gamificação ('Academia PolvIn')" — trocado `96 lições` por `99 lições` no total da trilha financeira, e a descrição de "Nível 6 'Mercado Avançado (Pro)'" de `6` para `9` lições, com a lista de conteúdo do nível estendida (Sharpe/desvio padrão/Beta, já existentes) para incluir Drawdown, Alfa e os usos de derivativos para especulação/arbitragem, com referência a "Onda 13, RFC-032" no mesmo padrão já usado para Onda 12/RFC-031 na frase anterior. Confirmado por grep que não havia nenhuma outra ocorrência solta de "96" ligada à contagem da trilha em outro ponto do README.
  - **`ROADMAP.md`**: nova entrada "✅ Onda 13" na seção "Expansão das trilhas de conteúdo", mesmo local/padrão das entradas de Onda 9-12 (uma linha por Onda, resumo + versão + RFC + link implícito ao CHANGELOG). Verificado antes de escrever, por grep em `ROADMAP.md` e leitura de `RFC-031-onda12-trilha-financeira-risco.md` inteira, se a nota sobre `nivel5` como candidato prioritário já existia ali (premissa recebida na tarefa) — **não existia**: a entrada de Onda 12 no ROADMAP descreve só o que foi feito em `nivel4`, sem nota prospectiva sobre `nivel5`; a única menção correlata em RFC-031 (linha 71, tabela de riscos) fala de `nivel4` continuar enxuto e sugere registrar no ROADMAP, não de `nivel5` — e essa sugestão não chegou a ser registrada. A nota sobre `nivel5` como próximo candidato aparece pela primeira vez na motivação da própria RFC-032 (linha 35) e no seu critério de aceite (linha 91), não em algo já deixado por Onda 12. Registrada agora, ao final da entrada de Onda 13, como frase própria ("Nota registrada por esta Onda") para não passar a impressão de que já existia — atende ao critério de aceite da RFC-032 sem duplicar nada.
- **Decisão de documentação**: a nota de `nivel5` foi anexada à própria entrada de Onda 13 no ROADMAP (não como bullet separado), porque nasce diretamente da mudança que a Onda 13 fez (`nivel6` ultrapassando `nivel5` em contagem) — mantém o raciocínio "o quê aconteceu → o quê isso implica" no mesmo lugar, seguindo o mesmo padrão já usado por Onda 10 (nota sobre o bug crítico de `SUPABASE_URL` vazio, registrada dentro da própria entrada de Onda 10, não à parte).
- **Verificação de processo (Achado 1 do QA)**: confirmado que a seção "### 3. Backend/Frontend Engineer" desta RFC, que o QA havia sinalizado como vazia, já estava preenchida ao início desta etapa (linhas 125-128) — o achado foi endereçado antes desta etapa começar, nenhuma ação adicional necessária aqui além de confirmar.
- **Pendências**: nenhuma. Commit de `js/data.js` (3 lições) junto com `README.md`/`CHANGELOG.md`/`ROADMAP.md`/esta RFC fica a cargo do Orchestrator/DevOps Engineer, incluindo a tag `v1.52.0`.
- **Riscos**: nenhum identificado nesta etapa.
- **Próximo agente responsável**: nenhum — RFC concluída. DevOps Engineer só entra se/quando o Orchestrator decidir commitar/taguear/fazer deploy desta entrega.
