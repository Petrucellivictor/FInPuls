# RFC-025: Cidade Financeira — Linha do tempo até a aposentadoria + Relatório de Fim de Temporada

- **Status**: concluída
- **Prioridade**: alta (usuário pediu para "terminar o jogo" da aba Cidade)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
O ciclo semanal da Cidade Financeira (RFC-017 a RFC-024) é hoje um loop infinito sem objetivo declarado — o jogador avança semanas indefinidamente, sem nunca "terminar" o jogo. Esta RFC fecha esse loop: adiciona idade/aposentadoria derivada do contador de semanas já existente, e um Relatório de Fim de Temporada ao atingir a aposentadoria, com opção de recomeçar. Inclui também a correção do bug conhecido de migração de estado (`Achievements.CHECKERS` de Cidade lançando `TypeError` no boot para saves antigos), por tocar o mesmo objeto de estado que esta fase precisa estender.

## Objetivo
- Dar ao jogo um "fim" claro e comemorativo, sem inventar mecânica paralela nova.
- Corrigir a persistência da migração de `CityLife.getState()` na mesma passada, já que o novo campo de idade/aposentadoria entra no mesmo objeto de estado afetado pelo bug.

## Motivação
Pedido direto do usuário ("terminar o jogo"). O próprio ROADMAP.md já registrava "linha do tempo dos 18 anos à aposentadoria e relatório de fim de temporada" como próxima fronteira não escopada da Cidade.

## Benefícios
Fecha o loop de "jogo de simulação de vida" com uma meta e um momento de celebração; corrige um bug de boot já documentado como média-alta gravidade; reaproveita 100% do estado (`semana`) já existente, sem sistema paralelo novo.

## Impacto
- **`js/citylife.js`** (dono de todo o estado/regra — a maior parte da mudança):
  - `DEFAULT_STATE`: novo campo `aposentado: false`.
  - `getState()`: reescrito pra rastrear `migrated` e persistir via `this.setState(state)` quando qualquer migração ocorreu (corrige o bug de origem) — inclui a migração do novo campo `aposentado` no mesmo mecanismo, não como caso especial.
  - Novo `freshState()` (clona `DEFAULT_STATE` via `JSON.parse(JSON.stringify(...))`) — usado como fallback de `getState()` e por `novaTemporada()`, elimina um risco de referência mutável compartilhada (detalhado abaixo).
  - Novas constantes: `IDADE_INICIAL`, `SEMANAS_POR_ANO`, `IDADE_APOSENTADORIA`.
  - Novo método `idadeAtual(state)`.
  - `avancarSemana()`: guarda `state.aposentado` no early-return; branch novo após incrementar `state.semana` que detecta aposentadoria, credita a sobra automaticamente, seta `state.aposentado = true`, não seta `decisaoPendente`, e dispara `citylife:aposentadoria`.
  - Novo método `montarRelatorioFinal(state)` (monta o objeto de dados do relatório a partir de campos já existentes + lookups em `data.js`).
  - Novo método `renderRelatorioFinalHtml(state)`.
  - `renderCicloHtml(state, resultado)`: novo branch no topo, antes de `resultado`/`decisaoPendente`, checando `state.aposentado`.
  - `renderCicloInto()`: novo listener pro botão de "Nova Temporada".
  - Novo método `novaTemporada()`.
- **`js/citygame.js`**: novo método `updateAgeHud()` chamado em `create()` e em `onScenarioChanged()` (reaproveita o evento `citylife:scenario`, que já dispara toda semana — nenhum evento novo é necessário só pra isso); novo listener de `citylife:aposentadoria` registrado em `init()` (mesmo padrão do listener de `citylife:scenario`) — hook estrutural disponível para uma reação celebrativa futura (câmera/partícula), MVP pode deixar vazio ou só fechar o diálogo, decisão do UX/UI Designer.
- **`js/achievements.js`** (linhas ~63-65): os 3 checkers (`primeiro_curso_cidade`, `primeiro_bem_cidade`, `primeiro_negocio_cidade`) passam a chamar `CityLife.getState()` em vez de `Store.get(STORAGE_KEYS.CITY_LIFE, ...)` direto.
- **`index.html`**: novo elemento `<div id="cityGameAgeHud" class="city-game-age-hud"></div>` dentro de `#cityGameCanvas` (irmão de `#cityGamePrompt`, linha ~498).
- **`css/style.css`**: nova classe `.city-game-age-hud` (posicionamento — UX/UI Designer define, Frontend Engineer implementa; sem impacto em nenhuma classe existente).
- **`js/data.js`**: nenhuma mudança necessária — o relatório reaproveita 100% os lookups já existentes (`CITY_LIFE_JOBS`, `CITY_LIFE_COURSES`, `CITY_LIFE_ASSETS`, `CITY_LIFE_BUSINESSES`).
- **Nenhum `STORAGE_KEYS` novo** — tudo entra como campo novo dentro do objeto já existente em `STORAGE_KEYS.CITY_LIFE`.

## Dependências
RFC-017 (ciclo semanal e `CityLife.getState()`/`setState()`), RFC-018/019/020 (patrimônio, bens, negócio, reputação — dados que o relatório final vai exibir), RFC-024 (mais recente, mesmo padrão de evento `citylife:*`).

## Critérios de aceite
- Idade inicial (18) e de aposentadoria calculadas a partir do contador de semanas já existente (`CityLife.getState().semana`), visíveis no HUD do mapa da Cidade.
- Ao atingir a semana de aposentadoria, o ciclo semanal para e mostra um Relatório de Fim de Temporada (patrimônio, bens, negócio, reputação, felicidade/saúde/disciplina).
- Opção "Nova Temporada" reseta somente o estado da Cidade (`STORAGE_KEYS.CITY_LIFE`) — XP/moedas/conquistas reais do resto do app permanecem intocados.
- `CityLife.getState()` persiste a migração de campos ausentes (ou os 3 checkers de Cidade em `achievements.js` passam a usar `getState()` em vez de ler `Store` direto) — o cenário de reprodução documentado no ROADMAP.md deixa de lançar erro.
- Nenhuma regra econômica das Fases 1-4 muda.
- Teste real (Playwright): simular saves em semanas próximas/na aposentadoria, confirmar relatório e "Nova Temporada"; zero erro de console, incluindo o cenário do bug antigo.

## Etapas puladas e por quê
(preenchido ao final, se alguma etapa for de fato dispensada — nenhuma dispensa decidida ainda)

## Registro por etapa

### 1. Product Owner
**Fase escolhida**: fechar o loop do jogo com idade/aposentadoria + Relatório de Fim de Temporada, incluindo o bug fix de migração de estado (mesmo objeto de estado, mesma RFC, evita duas RFCs tocando o mesmo arquivo em sequência).

**User stories**:
- Como jogador, quero ver minha idade atual e quanto falta para a aposentadoria, para entender que o jogo tem um objetivo final.
- Como jogador, quero, ao chegar na aposentadoria, ver um relatório com patrimônio, bens, empresa, reputação e status final, para sentir conquista.
- Como jogador, quero poder iniciar uma nova temporada depois do relatório, para rejogar.
- Como jogador com save antigo, quero que o app abra sem erro.

**Riscos levantados**: relatório com gráfico elaborado infla escopo (manter texto/lista no MVP); aposentadoria fixa aos 65 pode conflitar com o Modo Carreira (objetivo de vida do diagnóstico) — pediu validação do Financial Specialist antes de codar; fix do bug + feature nova tocam o mesmo state, exige teste de regressão dos 3 checkers.

**Fica de fora desta fase**: cenário isométrico animado (fase própria futura, padrão 2A/2B/2C); NPCs, Quest System, Audio Manager, Character Customization, World Events (visão de longo prazo, uma fase por vez); migração para Supabase (já sequenciada pelo usuário para depois de todas as fases da Cidade).

**Próximo agente responsável**: Software Architect.

### 2. Software Architect

## Decisão técnica (CTO/Software Architect)

**1. Idade — cálculo e taxa de conversão.** O comentário de cabeçalho de `js/citylife.js` (linha 10) já declara a convenção: "Cada 'semana' representa ~1 mês de vida". O checker `vida_na_cidade_1_ano` em `js/achievements.js:62` já codifica essa taxa implicitamente (`semana >= 12` = "1 ano"). Formalizo essa constante em vez de deixá-la espalhada como número mágico em 2 arquivos:

```js
// js/citylife.js — novo bloco de constantes, perto de FUNCIONARIOS_MAX/RECEITA_POR_FUNCIONARIO
IDADE_INICIAL: 18,
SEMANAS_POR_ANO: 12,
IDADE_APOSENTADORIA: 65, // default original desta etapa — SUBSTITUÍDO por 45 na reconciliação Gamification Designer × Financial Specialist (ver seção 5, "Reconciliação final")

idadeAtual(state) {
  return this.IDADE_INICIAL + Math.floor(state.semana / this.SEMANAS_POR_ANO);
},
```

Recomendo que o Backend Engineer também substitua o `12` hardcoded em `Achievements.CHECKERS.vida_na_cidade_1_ano` (`js/achievements.js:62`) por `CityLife.SEMANAS_POR_ANO`, pra não haver 2 fontes da mesma verdade — não é bloqueante, mas evita deriva se algum dia o valor mudar.

**2. Idade de aposentadoria — campo fixo, não configurável nesta fase.** Decido `IDADE_APOSENTADORIA` como constante única em `CityLife` (não um campo em `state`, não um valor por perfil). Justificativa: (a) o PO já delimitou "manter texto/lista no MVP" como princípio de simplicidade — um valor configurável por jogador infla escopo sem pedido explícito; (b) uma constante nomeada única é trivialmente promovível a campo configurável depois, se o Financial Specialist decidir que precisa variar por perfil — bastaria adicionar `state.idadeAposentadoriaEscolhida` (default = a constante) seguindo o mesmíssimo padrão de "campo novo dentro do objeto existente" já usado por todo o resto do arquivo, sem redesenho de schema. Não estou pré-construindo esse campo agora (YAGNI) — só deixando registrado o caminho de extensão.
**Risco de ritmo, sinalizado para Financial Specialist/Gamification Designer, não decidido aqui**: com os defaults acima, 65 − 18 = 47 anos × 12 semanas/ano = **564 cliques em "Avançar semana"** até o fim de jogo. Isso pode ser longo demais pra uma "temporada" de simulação — vale considerar ajustar `SEMANAS_POR_ANO` (menos semanas por ano) e/ou `IDADE_APOSENTADORIA` antes de codar. A estrutura suporta qualquer valor nas duas constantes sem mudança de arquitetura.
Risco levantado pelo PO (conflito com "Modo Carreira"/`js/career.js`) confirmado como não-estrutural: `career.js` é um currículo por objetivo de vida, sem nenhum conceito de idade ou semana — não há acoplamento de dados entre os dois módulos, então não há colisão técnica; é uma questão de coerência narrativa/didática, do Financial Specialist.

**3. Bug de migração — as duas correções, cada uma resolvendo uma falha diferente (não é redundância).** Recomendo AMBAS as abordagens da tarefa, não uma só:

- **(a) `CityLife.getState()` passa a persistir a migração** — correção de raiz, necessária de qualquer forma porque esta fase adiciona um campo novo (`aposentado`) ao mesmo mecanismo de migração:
```js
getState() {
  const state = Store.get(STORAGE_KEYS.CITY_LIFE, this.freshState());
  let migrated = false;
  if (!state.empregoId) { state.empregoId = "auxiliar"; migrated = true; }
  if (!state.cursosComprados) { state.cursosComprados = []; migrated = true; }
  if (!state.bensComprados) { state.bensComprados = {}; migrated = true; }
  if (state.status === undefined) { state.status = 20; migrated = true; }
  if (state.reputacao === undefined) { state.reputacao = 20; migrated = true; }
  if (state.negocio === undefined) { state.negocio = null; migrated = true; }
  if (state.aposentado === undefined) { state.aposentado = false; migrated = true; } // RFC-025
  if (state.emprego !== undefined) { delete state.emprego; migrated = true; }
  if (migrated) this.setState(state);
  return state;
},
```
  O flag `migrated` evita um `Store.set`/`JSON.stringify` a cada leitura (que aconteceria em toda chamada se `setState()` fosse incondicional) — só grava quando algo de fato mudou.

- **(b) Os 3 checkers em `js/achievements.js:63-65` passam a chamar `CityLife.getState()`** em vez de `Store.get` direto. Isso **não é defesa em profundidade redundante** — é necessário mesmo com (a) aplicado: `js/app.js` (linhas 6-39) nunca chama `CityLife.getState()` durante o boot — `CityGame.init()` só roda quando o jogador clica na aba Cidade (linha ~134-136, dentro do handler de `tab:changed`), e nada mais no boot toca `js/citylife.js`. Só `Achievements.checkAll()`, chamado a partir de `Engagement.init()` (linha 28, antes de `City.init()`/qualquer coisa de Cidade), roda no boot. Ou seja: para um save antigo sem os campos migrados, o **primeiro** código a ler `STORAGE_KEYS.CITY_LIFE` na sessão inteira são exatamente esses 3 checkers — a correção (a) só passaria a valer a partir da primeira vez que ALGO chamasse `getState()`, o que nesse cenário só aconteceria depois, se o jogador abrisse a aba Cidade. (b) fecha essa janela de crash no boot; (a) garante que, a partir do primeiro `getState()`, qualquer consumidor futuro (inclusive a lógica nova desta RFC) nunca mais vê um estado não migrado. Confirmar ordem de `<script>`: `js/achievements.js` (linha 756) carrega antes de `js/citylife.js` (linha 759) no `index.html`, mas isso não é problema — o corpo da função `CHECKERS.primeiro_curso_cidade` só referencia `CityLife` quando é *chamado* (dentro de `Achievements.checkAll()`, disparado por `app.js` depois de todos os `<script>` já terem rodado), nunca no momento da definição. Mesmo padrão já usado por `requisitoSatisfeito` em `citylife.js`, que referencia `Learn`/`COURSE` sem guard.
```js
primeiro_curso_cidade: () => CityLife.getState().cursosComprados.length > 0,
primeiro_bem_cidade: () => Object.keys(CityLife.getState().bensComprados || {}).length > 0,
primeiro_negocio_cidade: () => !!CityLife.getState().negocio,
```

**4. Fluxo de fim de temporada.** A única forma de `avancarSemana()` ser chamado é pelo botão `#cityLifeNextBtn`, renderizado só dentro do painel de diálogo do Banco (`renderCicloHtml`/`renderCicloInto`, `js/citylife.js:516-591`) — ou seja, o jogador sempre está dentro do Banco quando a aposentadoria é atingida. Isso significa que **não precisamos de nenhum overlay novo em tela cheia**: o relatório final reaproveita 100% o mesmo painel de diálogo que já hospeda o ciclo semanal, via o mesmo `_activeContainer`/`_activeRenderer`/`_refreshActive()` já existente.

Branch de detecção, dentro de `avancarSemana()`, logo após `state.semana += 1` / dispatch de `citylife:scenario` (que continua disparando incondicionalmente, inclusive na semana da aposentadoria — o clima/mar não devem "congelar" antes do relatório):
```js
const idade = this.idadeAtual(state);
if (idade >= this.IDADE_APOSENTADORIA) {
  // Não há próxima semana pra resolver uma decisão pendente que o jogador
  // nunca vai poder ver — a sobra final é poupada automaticamente.
  state.patrimonio += sobra;
  state.aposentado = true;
  state.decisaoPendente = null;
  this.setState(state);
  document.dispatchEvent(new CustomEvent("citylife:aposentadoria", { detail: { idade } }));
} else {
  state.decisaoPendente = { cenarioId: cenario.id, indicadores, sobra, salario, manutencao, aluguel, despesasTotais };
  this.setState(state);
}
```
O early-return do topo de `avancarSemana()` passa a ser `if (state.decisaoPendente || state.aposentado) return;` — trava novos avanços tanto na camada de dados (mesmo se algo externo tentasse chamar o método) quanto na UI (o botão "Avançar semana" deixa de ser renderizado quando `state.aposentado`, ver abaixo).

**Evento novo: `citylife:aposentadoria`** (detail: `{ idade }`), mesmo padrão de `citylife:scenario`. Dispatch em `avancarSemana()`; listener registrado em `CityGame.init()` (não `create()`, mesmo motivo já documentado no RFC-024). Diferente de `citylife:scenario`, este evento não é estritamente necessário pro relatório aparecer (isso já é resolvido pelo `_refreshActive()` que roda no fim de `avancarSemana()`, re-renderizando o painel do Banco já aberto) — ele existe como **hook estrutural** pra uma reação visual distinta e celebrativa (câmera, partícula, som), no espírito de "para sentir conquista" do Product Owner, sem acoplar `CityGame` a `CityLife` além do padrão de evento já estabelecido. Decidir SE o MVP usa esse hook pra algo além de nada (ex.: só fechar o diálogo) é do UX/UI Designer/Gamification Designer, não desta etapa.

`renderCicloHtml(state, resultado)` ganha um novo branch, verificado **antes** de `resultado`/`decisaoPendente`:
```js
renderCicloHtml(state, resultado) {
  if (state.aposentado) return this.renderRelatorioFinalHtml(state);
  if (resultado) { /* ...conteúdo atual... */ }
  if (state.decisaoPendente) { /* ...conteúdo atual... */ }
  return /* ...conteúdo atual (semana 0 / próxima semana)... */;
},
```

**HUD de idade no mapa** (fora do diálogo — critério de aceite pede idade visível no HUD do mapa, não só dentro do Banco). Novo elemento `#cityGameAgeHud` em `index.html`, atualizado por um novo método `CityGame.updateAgeHud()`:
```js
updateAgeHud() {
  const el = document.getElementById("cityGameAgeHud");
  if (!el || typeof CityLife === "undefined") return;
  const state = CityLife.getState();
  const idade = CityLife.idadeAtual(state);
  el.textContent = state.aposentado
    ? `🏖️ Aposentado(a) aos ${idade} anos`
    : `${idade} anos — aposentadoria aos ${CityLife.IDADE_APOSENTADORIA}`;
}
```
Chamado 1x em `create()` (junto do bloco que já lê `CityLife.getState()` pra cor inicial do mar, `js/citygame.js:155-159`) e novamente dentro de `onScenarioChanged()` — **sem evento novo pra isso**: `citylife:scenario` já dispara toda semana (inclusive na semana da aposentadoria, conforme decidido acima), então é o gancho natural pra manter o HUD sincronizado sem duplicar mecanismo.

**5. Estrutura de dados do relatório.** Novo método `CityLife.montarRelatorioFinal(state)`, chamado por `renderRelatorioFinalHtml(state)` — todos os campos vêm de dados já existentes no estado + lookups já existentes em `js/data.js`, nenhum dado novo precisa ser calculado ou armazenado:
```js
montarRelatorioFinal(state) {
  return {
    idadeFinal: this.idadeAtual(state),
    semanasTotais: state.semana,
    patrimonioFinal: state.patrimonio,
    emprego: this.currentJob(state),
    cursos: state.cursosComprados.map((id) => CITY_LIFE_COURSES.find((c) => c.id === id)).filter(Boolean),
    bens: Object.keys(state.bensComprados).map((id) => ({
      asset: CITY_LIFE_ASSETS.find((a) => a.id === id),
      valorAtual: state.bensComprados[id],
    })).filter((b) => b.asset),
    negocio: state.negocio ? { ...state.negocio, biz: CITY_LIFE_BUSINESSES.find((b) => b.id === state.negocio.businessId) } : null,
    reputacao: state.reputacao,
    status: state.status,
    felicidade: state.felicidade,
    saude: state.saude,
    disciplina: state.disciplina,
  };
},
```
`renderRelatorioFinalHtml(state)` é responsabilidade de conteúdo/copy (Gamification Designer define tom/celebração, UX/UI Designer define layout) — estruturalmente, só precisa terminar com o botão `id="cityLifeNovaTemporadaBtn"`, wireado no bloco de listeners já existente em `renderCicloInto()`:
```js
container.querySelector("#cityLifeNovaTemporadaBtn")?.addEventListener("click", () => {
  if (confirm("Isso reinicia sua vida na Cidade do zero (patrimônio, bens, negócio, emprego). Continuar?")) this.novaTemporada();
});
```
(mesmo padrão de `confirm()` já usado em `fecharNegocio()`, `js/citylife.js:652-654`).

**6. "Nova Temporada" — o que reseta e como.** Só `STORAGE_KEYS.CITY_LIFE` é tocado. Confirmado por leitura de `js/city.js` (grade das 13 construções permanentes, RFC-005/010): lê exclusivamente `STORAGE_KEYS.CITY_DECORATIONS_OWNED` e conquistas/XP reais — nenhuma referência a `STORAGE_KEYS.CITY_LIFE` em todo o arquivo. Ou seja, resetar `CITY_LIFE` não risca nem uma construção da grade original, nem XP/moedas/conquistas do resto do app — são namespaces de dados completamente disjuntos, como já era de se esperar da separação documentada no cabeçalho de `citylife.js` (linhas 1-8).

Ponto de atenção estrutural que encontrei e preciso corrigir na mesma passada: `Store.get(key, fallback)` (`js/storage.js:65-77`) retorna o `fallback` **por referência**, sem clonar, quando a chave ainda não existe no `localStorage`. Isso significa que, no primeiro `getState()` de todos (save novo, chave inexistente), `state === this.DEFAULT_STATE` — e a primeira mutação de um array/objeto aninhado (ex. `state.cursosComprados.push(...)` em `comprarCurso()`) mutaria `DEFAULT_STATE.cursosComprados` diretamente em memória, contaminando o template compartilhado pro resto da sessão. Isso já era um risco latente antes desta RFC, mas fica crítico agora porque `novaTemporada()` precisa devolver um estado **realmente limpo**, não um objeto que pode ter sido silenciosamente contaminado por uma temporada anterior. Correção: `freshState()` (clone profundo via `JSON.parse(JSON.stringify(this.DEFAULT_STATE))`), usado tanto como fallback de `getState()` quanto por `novaTemporada()` — elimina o compartilhamento de referência na raiz, não só no ponto de uso.
```js
freshState() {
  return JSON.parse(JSON.stringify(this.DEFAULT_STATE));
},

novaTemporada() {
  this.setState(this.freshState());
  // Reaproveita o evento já existente (não cria um novo): um estado
  // fresco tem ultimoCenarioId=null, e "neutro" é exatamente a cor/clima
  // que CityGame já usa como fallback nesse caso (create(), linha ~156).
  document.dispatchEvent(new CustomEvent("citylife:scenario", { detail: { cenarioId: "neutro" } }));
  this._refreshActive();
},
```
`_refreshActive()` re-renderiza o painel do Banco (ainda aberto, é de onde o botão foi clicado) através do mesmíssimo `_activeRenderer` (`renderCicloInto`) — como o novo estado tem `semana: 0` e nenhum `decisaoPendente`/`resultado`, `renderCicloHtml` cai naturalmente no branch já existente "Sua vida financeira na Cidade está pronta pra começar", sem precisar de nenhum HTML novo pra essa tela de boas-vindas. Reaproveitar `citylife:scenario` (em vez de criar um evento `citylife:novaTemporada` dedicado) evita um evento novo cujo único consumidor faria exatamente o que o listener de `citylife:scenario` já faz.

**7. `STORAGE_KEYS` novo?** Não. Tudo entra como campo novo (`aposentado`) dentro do objeto já existente em `STORAGE_KEYS.CITY_LIFE`, seguindo o padrão-padrão do projeto (chave-valor genérica é suficiente — nenhum dado desta fase precisa de índice/consulta relacional).

**Extensão opcional fora do escopo desta RFC, sinalizada para o Gamification Designer**: uma conquista nova (ex. `aposentadoria_alcancada`, checker `() => CityLife.getState().aposentado === true`) se encaixaria no mesmo mecanismo dos outros 3 checkers de Cidade em `achievements.js`, sem nenhuma mudança estrutural — `Achievements.checkAll()` já é chamado dentro de `avancarSemana()` na própria semana em que `aposentado` vira `true`. Não é decisão desta etapa se essa conquista deve existir nem qual XP ela vale.

**Resumo de dependência de ordem para quem for implementar**: (1) `getState()`/`freshState()` primeiro — tudo mais depende dessa base; (2) constantes de idade + `idadeAtual()`; (3) branch de aposentadoria em `avancarSemana()` + evento `citylife:aposentadoria`; (4) `montarRelatorioFinal()`/`renderRelatorioFinalHtml()`/branch em `renderCicloHtml()`; (5) `novaTemporada()`; (6) `achievements.js` (os 3 checkers) e `citygame.js` (HUD + listener) podem ser feitos em paralelo com (3)-(5), já que dependem só de `getState()`/eventos já especificados aqui, não da implementação interna do relatório.

**Próximo agente responsável**: UX/UI Designer — precisa desenhar (a) o conteúdo/layout de `renderRelatorioFinalHtml()` dentro do painel de diálogo existente do Banco, (b) a posição/estilo visual de `#cityGameAgeHud` sobre o canvas do Phaser, e (c) decidir, junto com o Gamification Designer, se o hook `citylife:aposentadoria` em `CityGame` recebe alguma reação visual no MVP ou fica vazio por enquanto.

### 3. UX/UI Designer

**Teste de identidade aplicado antes de desenhar qualquer coisa**: "se eu tirar a logo/cores do PolvIn, alguém reconhece que isso é do PolvIn?" Para o HUD, a resposta só é "sim" se eu reusar a linguagem visual já estabelecida do `.level-ring` (anel `conic-gradient` dourado com número dentro — já é assinatura do app noutro lugar) em vez de inventar um badge genérico. Para o relatório, só é "sim" se o momento final parecer "tela de vitória de jogo" (troféu, confete, POLVIn comemorando, número subindo), não uma tabela de extrato bancário.

#### Três conceitos (obrigatório antes de decidir) — HUD de idade

- **A — Minimalista**: só texto pequeno no canto, `"42/65 anos"`, sem anel, sem ícone, fundo transparente com apenas `text-shadow` para contraste. Leve, mas indistinguível de qualquer HUD genérico de jogo — falha o teste de identidade.
- **B — Gamer**: anel `conic-gradient` (mesma técnica do `.level-ring` já usado no app) com a idade dentro, pulso dourado a cada aniversário (12 semanas), vibração tátil leve no marco.
- **C — Premium**: cápsula "vidro" (glassmorphism, blur forte), tipografia fina, sem anel — só uma barrinha horizontal discreta abaixo do número, paleta monocromática dourada sutil.

**Recomendação: B, com a técnica de contraste de C.** Puro A falha o teste de identidade (poderia ser HUD de qualquer app). Puro C arrisca ilegibilidade sobre o mar ciano vibrante do cenário "Boom" sem um fundo escuro sólido por trás. B reaproveita uma assinatura visual que o PolvIn já tem (o anel de nível) — decisão pró-consistência de marca, não repetição preguiçosa — e herda de C só o truque técnico (fundo escuro translúcido + blur) para garantir legibilidade em qualquer clima/hora do dia do RFC-024.

#### Três conceitos (obrigatório antes de decidir) — Relatório de Fim de Temporada

- **A — Minimalista**: lista vertical dos 6 números em cards iguais, sem herói, botão outline no fim. Rápido de escanear, mas frio — falha diretamente o pedido do PO de "sentir conquista".
- **B — Gamer**: tela de "vitória" estilo Clash Royale/Genshin — troféu grande central com confete, patrimônio contando para cima (`Fx.countUp`), POLVIn comemorando, botão dourado/gradiente de destaque.
- **C — Premium**: layout editorial tipo "resumo anual" (Spotify Wrapped/Apple) — tipografia grande, espaçamento generoso, 1 métrica hero por vez, paleta dourada sóbria, sem confete.

**Recomendação: B, com a disciplina de espaçamento de C.** O PO pediu explicitamente "sentir conquista" — isso é o objetivo central de B; A falha esse critério por design; C sozinho é elegante mas frio demais para um momento de "fim de jogo" comemorativo. Uso o herói/troféu/confete/contagem de B, mas com a hierarquia limpa e o respiro de C para não virar poluição visual em cima do que já é uma tela cheia de KPIs.

---

#### 1. HUD de idade — `#cityGameAgeHud`

**Por que é DOM, não Phaser**: o Software Architect já decidiu que é um elemento HTML (não um `Rectangle`/`Text` do Phaser) — correto do ponto de vista de design também, porque a câmera do mundo (`WORLD_W:1750`) rola seguindo o jogador enquanto o viewport (`.city-game-canvas`, `aspect-ratio:800/420`) é fixo; um HUD "sempre no canto da tela" só é trivial como overlay HTML posicionado sobre o canvas, não como objeto no mundo do jogo.

**Posição**: `position:absolute; top:10px; right:10px;` dentro de `#cityGameCanvas` (irmão de `#cityGamePrompt`). `z-index:4` — abaixo do balão de construção (`.city-game-prompt`, `z-index:5`), para o balão sempre vencer se algum dia colidirem visualmente perto do topo do mapa. `pointer-events:none` — é um widget informativo, nunca precisa capturar clique/toque, e isso também isenta o componente da regra de alvo de toque ≥44px (não é interativo).

**Estrutura** (Frontend Engineer implementa; HTML ilustrativo, não final):
```html
<div id="cityGameAgeHud" class="city-game-age-hud">
  <div class="city-game-age-ring" style="--pct:51">
    <span class="n">42</span>
  </div>
  <div class="city-game-age-text">
    <span class="lbl">idade</span>
    <span class="sub">23 p/ aposentar</span>
  </div>
</div>
```
Quando `state.aposentado`: `--pct:100`, `.n` vira `🏖️` (em vez do número), `.sub` vira `"aposentado(a)"`.

**Estilo visual** (`css/style.css`, nova seção `/* ---------- Cidade Financeira: HUD de idade (RFC-025) ---------- */`):
```css
.city-game-age-hud {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 14, 48, 0.68); /* primary-dark escurecido, opaco o bastante pra
    garantir contraste independente do clima/hora do dia por baixo (mar ciano do Boom,
    céu claro do dia) — o efeito "vidro" é reforço, não a fonte de contraste. */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid rgba(232, 163, 61, 0.55); /* --gold translúcido, mesmo peso
    visual do border dourado do .city-game-prompt (2px sólido) mas mais discreto,
    pra não competir com o balão de interação quando os dois aparecem juntos. */
  border-radius: 999px;
  padding: 4px 12px 4px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35); /* fallback de separação visual em
    navegadores sem suporte a backdrop-filter — bg opaco a 68% já resolve contraste
    sozinho nesse caso. */
}

.city-game-age-ring {
  width: 36px; height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background: conic-gradient(var(--gold) calc(var(--pct, 0) * 1%), rgba(255, 255, 255, 0.18) 0);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.6s ease; /* só anima de verdade em navegadores que suportam
    @property abaixo — nos demais, a mudança de --pct é instantânea (degrada bem,
    nunca quebra). */
}
@property --pct { syntax: '<number>'; inherits: false; initial-value: 0; }

.city-game-age-ring::before {
  content: "";
  position: absolute;
}
.city-game-age-ring .n {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--primary-dark);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 11px; font-weight: 700;
  color: #ffe3b0; /* mesmo tom já usado em .stat-chip.xp — reaproveita um token de cor
    já validado pra "dourado sobre fundo escuro", não inventa um novo. */
}
.city-game-age-hud.aposentado .city-game-age-ring .n { font-size: 15px; } /* emoji 🏖️ precisa de mais espaço que 2 dígitos */

.city-game-age-text { display: flex; flex-direction: column; line-height: 1.2; }
.city-game-age-text .lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.65); }
.city-game-age-text .sub { font-size: 11px; font-weight: 700; color: #ffe3b0; }
.city-game-age-hud.aposentado .city-game-age-text .sub { color: var(--gold); }

/* Pulso de "aniversário" — dispara só quando o número de anos muda de fato
   (a cada 12 semanas), nunca a cada avanço semanal (evitaria virar ruído visual). */
@keyframes cityGameAgeHudPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232, 163, 61, 0.6); }
  50% { transform: scale(1.18); box-shadow: 0 0 0 6px rgba(232, 163, 61, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232, 163, 61, 0); }
}
.city-game-age-ring.pulse { animation: cityGameAgeHudPulse 500ms ease-out; }

/* Brilho idle contínuo e sutil só depois de aposentado — sinaliza "jogo concluído"
   mesmo com o HUD fora de foco. */
@keyframes cityGameAgeHudGlow {
  0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 0 0 0 rgba(232,163,61,0.35); }
  50% { box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 0 0 5px rgba(232,163,61,0); }
}
.city-game-age-hud.aposentado { animation: cityGameAgeHudGlow 2.6s ease-in-out infinite; }

@media (max-width: 640px) {
  .city-game-age-hud { padding: 3px 10px 3px 3px; gap: 6px; }
  .city-game-age-ring { width: 30px; height: 30px; }
  .city-game-age-ring .n { width: 23px; height: 23px; font-size: 10px; }
}
@media (max-width: 380px) {
  .city-game-age-text .lbl { display: none; } /* só "idade" some; número + "sub" seguem visíveis */
}
```

**Função nova em `js/fx.js`** (chamada por `CityGame.updateAgeHud()` só quando o valor de `idade` muda entre uma chamada e a próxima — comparação simples de apresentação, não regra de negócio):
```js
/* Pulso rápido no anel do HUD de idade quando o jogador "faz aniversário"
   (a cada 12 semanas) — nunca a cada avanço de semana, só quando o número
   de fato muda, senão vira ruído visual constante. */
ageHudPulse(ringEl) {
  if (!ringEl) return;
  ringEl.classList.remove("pulse");
  void ringEl.offsetWidth;
  ringEl.classList.add("pulse");
  if (navigator.vibrate) navigator.vibrate(15);
},
```

**Acessibilidade do HUD**: fundo `rgba(20,14,48,0.68)` + blur garante contraste ≥ 4.5:1 para o texto claro (`#ffe3b0`/branco) em qualquer combinação de clima (`corAgua` do RFC-017/024) e fase dia/noite (RFC-024), porque o painel é essencialmente opaco/escuro independentemente do que está atrás — a mesma técnica de "painel escuro translúcido sobre fundo variável" já usada por `.achievement-toast`. `prefers-reduced-motion`: adicionar `.city-game-age-hud`, `.city-game-age-ring.pulse` à lista de seletores neutralizados no bloco `@media (prefers-reduced-motion: reduce)` já existente (linha ~1600) — a versão reduzida ainda muda a cor/número instantaneamente (a identidade "anel dourado com progresso" continua visível), só perde o pulso/glow animado, conforme a regra do projeto de nunca remover identidade, só intensidade.

#### 2. Relatório de Fim de Temporada — `renderRelatorioFinalHtml(state)`

**Economia de escopo importante, encontrada ao ler `renderCicloInto` com atenção**: `container.innerHTML = this.renderKpisHtml(state) + this.renderAtributosHtml(state) + this.renderCicloHtml(state, resultado)` já roda **incondicionalmente**, mesmo quando `renderCicloHtml` cai no branch de `state.aposentado`. Ou seja, **patrimônio final, mês/semana final, último emprego** (via `renderKpisHtml`) e **felicidade, saúde, disciplina, status social, reputação** (via `renderAtributosHtml`) já aparecem automaticamente, sem eu precisar duplicá-los dentro de `renderRelatorioFinalHtml`. Isso cobre 5 dos "6 números" pedidos pelo Product Owner só de ordem de concatenação já decidida pelo Software Architect. O que falta desenhar é: **bens possuídos, negócio, cursos, o momento herói/comemorativo, e o botão "Nova Temporada"**.

**Ordem final na tela** (de cima para baixo, tudo dentro do mesmo painel `.city-game-dialogue` que já existe):
1. KPI row existente (mês, patrimônio, emprego) — sem mudança estrutural, só 2 ajustes de copy condicionais (ver abaixo).
2. Barras de atributos existentes (felicidade/saúde/disciplina/status/reputação) — sem nenhuma mudança.
3. **Bloco novo — hero comemorativo** (`renderRelatorioFinalHtml`).
4. **Bloco novo — grid de bens/negócio/cursos**.
5. **Botão novo — "Nova Temporada"**.

**Ajustes condicionais em `renderKpisHtml(state)`** (mudança de copy/classe, não de lógica — dentro do que posso alterar):
```js
// dentro do template existente, só quando state.aposentado:
// - label "Patrimônio simulado" → "🏆 Patrimônio final"
// - card ganha a classe "kpi-final-glow" (nova, ver CSS abaixo)
// - label "Emprego atual" → "Última carreira"
```
```css
/* ---------- Cidade Financeira: Relatório de Fim de Temporada (RFC-025) ---------- */
.kpi-final-glow {
  border-left-color: var(--gold);
  background: radial-gradient(ellipse at top left, rgba(232, 163, 61, 0.14), var(--surface-2) 70%);
}
```

**Contagem animada do patrimônio final** — em vez do valor estático de sempre, quando `state.aposentado` o Frontend Engineer deve chamar, logo após o `innerHTML` ser aplicado:
```js
const patEl = container.querySelector(".kpi-final-glow .value");
if (patEl) Fx.countUp(patEl, 0, state.patrimonio, 1400, ""); // suffix vazio — não é XP, é R$ (this.fmt já formata o valor final via textContent na função countUp? — ver nota abaixo)
```
*Nota de implementação para o Frontend Engineer*: `Fx.countUp` hoje formata o número cru com `suffix`, sem passar por `CityLife.fmt()` (formatação de moeda BRL). Ele pode either (a) estender `countUp` para aceitar uma função `format` opcional (mantendo compatibilidade com todo uso existente que passa `suffix`), ou (b) passar `from`/`to` já em reais inteiros e aceitar o número sem `R$`/separador de milhar durante a animação, corrigindo pro formato final só no último frame. Prefiro (a) — é a mesma filosofia de "estender `Fx.countUp`, não substituir" já usada no resto do app.

**Bloco hero** (novo HTML, gerado por `renderRelatorioFinalHtml`):
```html
<div class="city-life-final-hero">
  <span class="city-life-final-badge">🏆</span>
  <h3>Você se aposentou aos ${idadeFinal} anos!</h3>
  <p class="text-soft">${semanasTotais} semanas de jornada na Cidade Financeira.</p>
</div>
```
```css
.city-life-final-hero {
  text-align: center;
  padding: 20px 12px;
  margin: 16px 0;
  border-radius: var(--radius);
  background: radial-gradient(ellipse at center, rgba(232, 163, 61, 0.18), transparent 70%);
}
.city-life-final-badge {
  display: inline-block;
  font-size: 48px;
  position: relative; /* exigido pelo .fx-badge-unlock (::after de brilho) */
  overflow: visible;
}
.city-life-final-hero h3 { font-family: var(--font-display); color: var(--gold-dark); margin: 8px 0 4px; }
```
O emoji de troféu recebe `Fx.badgeUnlock(badgeEl)` no mount — reaproveita a animação de desbloqueio de conquista já existente (pop + brilho passando), sem inventar uma nova.

**Grid de bens/negócio/cursos** (reaproveita a classe `.kpi`/`.grid-2` já usada no resto do arquivo, não um componente novo):
```html
<div class="grid grid-2 kpi-row">
  <div class="card kpi">
    <div class="label">🏠 Bens possuídos</div>
    <div class="value">${bens.length}</div>
    <div class="text-soft text-sm">${fmt(somaValorAtualDosBens)} em valor atual</div>
  </div>
  <div class="card kpi">
    <div class="label">🏢 Negócio</div>
    ${negocio
      ? `<div class="value" style="font-size:16px">${negocio.biz.emoji} ${negocio.biz.nome}</div><div class="text-soft text-sm">${negocio.funcionarios} funcionário(s)</div>`
      : `<div class="value" style="font-size:14px" class="text-soft">Nenhum negócio aberto</div>`}
  </div>
</div>
<p class="text-sm text-soft mt-8">🎓 ${cursos.length} curso(s) concluído(s) ao longo da vida.</p>
```

**POLVIn comemorando** — reaproveita o mesmo `#cityLifePolvin` já usado em `renderCicloInto` (não é elemento novo), com uma fala dinâmica (nunca estática, seguindo o exemplo canônico da filosofia do produto: mencionar o número real, não um texto genérico):
```js
const fala = `Consegui! Você levou sua vida financeira até a aposentadoria com ${this.fmt(state.patrimonio)} de patrimônio. Que jornada! 🐙🎉`;
Polvin.renderBubble(polvinArea, fala, { size: "sm", withListen: false });
```

**Botão "Nova Temporada"** — identidade própria, não um `.btn-outline`/`.btn-gold` genérico reaproveitado sem diferenciação. Gradiente "amanhecer" (roxo→dourado) simbolizando literalmente um novo dia — callback visual direto ao ciclo dia/noite do RFC-024, reforçando "isso é do PolvIn":
```css
.city-life-new-season-btn {
  background: linear-gradient(135deg, var(--primary), var(--gold));
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.25);
}
.city-life-new-season-btn:hover { filter: brightness(1.08); box-shadow: 0 4px 16px rgba(232, 163, 61, 0.35); }
```
```html
<button class="btn city-life-new-season-btn btn-block mt-16" id="cityLifeNovaTemporadaBtn">🌅 Nova Temporada</button>
```
Ícone `🌅` (nascer do sol) em vez de um genérico `🔄`/`↻` — reforça a metáfora de recomeço em vez de "reset de app". Herda gratuitamente a física elástica de `:active { transform: scale(0.94) }` já definida globalmente em `.btn`.

**Confirmação antes de resetar**: o `confirm()` nativo já especificado pelo Software Architect é aceitável para o MVP — é destrutivo mas de baixo risco (só apaga progresso de um modo opcional dentro de uma aba, não a conta do usuário), e o texto já escrito ("Isso reinicia sua vida na Cidade do zero...") é claro sobre o que será perdido. Registro como melhoria não-bloqueante para uma RFC futura: substituir por um modal próprio do design system (`.modal-overlay`/`.modal-box` já existentes) com um resumo visual do que será perdido (ex.: mini-lista "❌ patrimônio, ❌ bens, ❌ negócio") — mais no estilo do produto que um `confirm()` de browser, mas não vale reabrir a arquitetura desta RFC só por isso.

**`Fx.retirementCelebration(container)`** — nova função de orquestração em `js/fx.js`, chamada 1x pelo Frontend Engineer logo após `renderCicloInto` injetar o HTML do relatório (dispara toda vez que o painel é renderizado nesse estado — inclusive se o jogador fechar e reabrir o Banco depois de aposentado; ver ela de novo é um bônus, não um bug, mesmo espírito de streak animations do Duolingo):
```js
/* Orquestra o "momento herói" do fim de temporada — reaproveita 3 efeitos
   que já existem (confete, desbloqueio de troféu, POLVIn comemorando) em
   vez de inventar um mecanismo novo. Chamar 1x sempre que o painel do
   Relatório de Fim de Temporada for renderizado. */
retirementCelebration(container) {
  if (!container) return;
  this.confetti(container, 40); // acima do padrão (26) — é o maior momento do jogo
  const badge = container.querySelector(".city-life-final-badge");
  if (badge) this.badgeUnlock(badge);
  const polvinArea = container.querySelector("#cityLifePolvin");
  if (polvinArea) this.mascotCelebrate(polvinArea);
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
},
```
**Pré-requisito de CSS**: `.city-game-dialogue` precisa ganhar `position: relative; overflow: hidden;` (hoje é `static` — não declarado) para que `.confetti-piece` (`position:absolute`, usado por `Fx.confetti`) fique contido dentro do painel em vez de posicionar relativo ao `<body>`. Confirmar que isso não quebra `.city-game-dialogue .btn-outline.close-dialogue { float:right }`, já existente — `overflow:hidden` não interfere com `float`.

#### 3. Reação no mapa 2D ao evento `citylife:aposentadoria` — SIM, celebração leve, não fica vazio

Decisão, junto com o hook estrutural que o Software Architect deixou pronto: **vale reagir no mapa**, não deixar o MVP só com o relatório dentro do diálogo. Motivo de layout que encontrei ao ler `index.html` (linha ~494-500): `#cityGameCanvas` e `#cityGameDialogue` não são overlay um do outro — o diálogo renderiza **abaixo** do canvas (`margin-top:12px`), então o mapa continua visível na tela ao mesmo tempo em que o relatório aparece. Isso significa que uma reação no mapa não compete com o relatório por atenção — as duas coisas reforçam o mesmo momento em duas áreas da tela.

Escopo deliberadamente pequeno (reaproveita 100% do vocabulário de tween já estabelecido pelo RFC-024 em `buildWeather`, não introduz nenhuma biblioteca nova):
- **Brilho dourado no jogador** — ~24 partículas (mesmo visual dos pontinhos do cenário "Boom": círculos 2-3px, `0xffe9b8`, cintilação de alpha), só que em modo *burst* (nascem na posição do player, sobem levemente e desaparecem em ~2.5s) em vez de loop contínuo — reaproveita a mesma técnica de partícula, não o mesmo comportamento (loop vs. burst), então não é cópia 1:1 nem invenção do zero.
- **"Punch" de câmera** — `scene.cameras.main.zoomTo(1.12, 700, 'Sine.easeInOut')` e retorno a `1.0` em mais 700ms, usando a API nativa de câmera do Phaser (nenhuma dependência nova). Único efeito puramente novo desta lista, mas é 2 linhas reaproveitando capacidade já embutida no motor.
- Nome do método: `CityGame.celebrateRetirement()`, no mesmo espírito de `buildWeather` — segue o precedente do RFC-024 de que animações nativas do canvas Phaser vivem como métodos próprios em `js/citygame.js`, não roteadas por `Fx` (que é DOM-only, via CSS classes/WAAPI). Chamado pelo listener de `citylife:aposentadoria` já scaffolded pelo Software Architect em `init()`.

**Acessibilidade do efeito de câmera**: o "punch" de zoom é o único elemento desta lista com risco real de desconforto (parallax/movimento brusco) — checar `window.matchMedia("(prefers-reduced-motion: reduce)").matches` antes de rodar o `zoomTo`; se reduzido, pular a câmera e manter só o brilho de partículas (mais curto e sem movimento de câmera). O brilho dourado em si é um efeito pequeno e estacionário (não desloca a tela), então pode continuar mesmo em modo reduzido, na mesma lógica já aplicada ao HUD: reduzir intensidade de movimento, nunca apagar a identidade.

#### 4. Resumo de acessibilidade (consolidado)

- **Contraste do HUD**: resolvido por design (fundo quase opaco + blur, independente de clima/hora do dia) — não depende de nenhum valor específico de `corAgua`/fase dia-noite para continuar legível.
- **`prefers-reduced-motion`**: `.city-game-age-hud`/`.city-game-age-ring.pulse`/`.city-game-age-hud.aposentado` (glow idle) entram na lista já existente no `@media (prefers-reduced-motion: reduce)` (`css/style.css` ~linha 1600); o "punch" de câmera no mapa é condicionado via JS (`matchMedia`), não CSS, porque afeta a câmera do Phaser, fora do alcance de uma regra CSS.
- **Botão "Nova Temporada"**: `confirm()` nativo aceito para o MVP (ver ponto 2 acima), com melhoria de modal customizado registrada como não-bloqueante para depois.
- **Alvo de toque**: HUD é `pointer-events:none` (não interativo, isento da regra de 44px); botão "Nova Temporada" herda `.btn.btn-block` já dimensionado corretamente pelo design system existente.

**Arquivos que este registro impacta** (a implementar pelo Frontend Engineer, nada tocado por mim nesta etapa): `index.html` (`#cityGameAgeHud`), `css/style.css` (2 seções novas: HUD de idade + Relatório de Fim de Temporada, mais `position:relative;overflow:hidden` em `.city-game-dialogue`), `js/fx.js` (`ageHudPulse`, `retirementCelebration`), `js/citygame.js` (`updateAgeHud()`, `celebrateRetirement()`), `js/citylife.js` (`renderRelatorioFinalHtml` gerando exatamente os blocos HTML especificados acima, mais os 2 ajustes de copy condicionais em `renderKpisHtml`).

**Próximo agente responsável**: Gamification Designer — validar se o "momento herói" (troféu, confete, contagem de patrimônio, fala do POLVIn) reforça a mecânica de progressão do jogo do jeito certo, se vale propor a conquista `aposentadoria_alcancada` sinalizada pelo Software Architect, e se o ritmo de 564 cliques até a aposentadoria (risco também sinalizado pelo Software Architect) deveria mudar antes desta especificação de UI ser implementada.

### 4. Gamification Designer

**1. Horizonte de 564 semanas — reduzir, mas não pelo `SEMANAS_POR_ANO`.**

O loop de `avancarSemana()` não tem gate de energia nem cooldown (`js/citylife.js` não referencia `Energy` em nenhum lugar) — ao contrário de lições/quiz, aqui um jogador motivado pode clicar as 564 semanas em uma única sessão de ~50-90 min. Isso muda a análise: 564 não é primariamente um problema de "força hábito diário" (essa função já é do sistema de Energia) — é um problema de **percepção de alcançabilidade**. Um contador "23 anos — aposentadoria aos 65" alimentando um objetivo 40+ anos-jogo à frente é psicologicamente equivalente a "não vou nunca chegar lá" pra maioria dos jogadores casuais — o efeito colateral é que "sentir conquista" (objetivo do PO) nunca se realiza pra a maioria.

**Decisão: `IDADE_APOSENTADORIA = 40`** (não 65; não mexo em `SEMANAS_POR_ANO`).

- Rejeito mexer em `SEMANAS_POR_ANO`: `manutencaoMensal`/`aluguelMensal`/salário já são valores calibrados como *mensais*, debitados a cada tick — retunar o significado do tick sem retunar essas 3 fases de economia já balanceadas violaria em espírito o critério "nenhuma regra econômica das Fases 1-4 muda". `idadeAtual()` é 100% derivado/de exibição — mexer só nele é seguro; mexer no tick não é.
- `IDADE_APOSENTADORIA` é a alavanca correta: puramente de exibição/trigger, sem efeito econômico (a checagem roda **depois** de toda a resolução financeira da semana).
- **40 anos**: (40-18) × 12 = **264 cliques**, redução de ~53%. Framing deliberado de aposentadoria antecipada (FIRE — Financial Independence Retire Early, conceito real de educação financeira) em vez de um valor que descaracterizaria a palavra "aposentadoria".
- Referência de escala: `streak_100` (gate mais difícil hoje) exige 100 dias-calendário reais, intransponíveis por clique. 264 cliques sem gate de tempo fecham em ~20-25 sessões casuais — comparável ou mais fácil que `streak_100`, apropriado pra um marco de submódulo (não deveria ser mais difícil que a conquista mais dura do app inteiro).
- **Handoff para o Financial Specialist**: validar se 40 é pedagogicamente defensável como "aposentadoria antecipada", com faixa aceitável de ~35-50 anos.

**2. Recompensa real — SIM, 3ª ponte, mas SEM XP/moedas. Só badge + monumento, igual às outras 2.**

Nenhuma conquista do app dá XP ou moeda ao ser desbloqueada (busca em `js/achievements.js` não encontra `addXp`/`addCoins` em nenhum checker) — XP/moedas vêm exclusivamente das ações em si. As 2 pontes já existentes (`vida_na_cidade_iniciada`, `vida_na_cidade_1_ano`) seguem esse padrão: viram badge (`ACHIEVEMENTS`) **e** monumento na grade real (`CITY_BUILDINGS`, `js/city.js`), nada além disso.

- **Decisão: replicar exatamente esse padrão.** Dar XP/moeda só aqui seria a única exceção do sistema inteiro.
- **Risco de abuso que reforça a decisão**: sem gate de energia em `avancarSemana()`, XP real na aposentadoria seria o cheat mais eficiente do app — clicar decisões triviais por 30-60min renderia mais XP/hora que estudar lições de verdade. Quebraria o propósito educacional do produto.
- **Nova conquista `aposentadoria_alcancada`**:
  - `js/achievements.js` → `CHECKERS.aposentadoria_alcancada: () => CityLife.getState().aposentado === true` (usa `getState()`, mesmo padrão corrigido pelo Software Architect nos outros 3 checkers).
  - `js/data.js` → `ACHIEVEMENTS`: `{ id: "aposentadoria_alcancada", emoji: "⚓", titulo: "Porto Seguro", descricao: "Você levou sua vida financeira simulada na Cidade até a aposentadoria." }`
  - `js/data.js` → `CITY_BUILDINGS` (nova entrada — array já é usado dinamicamente em `js/city.js`, sem limite fixo de grade): `{ id: "aposentadoria_alcancada", emoji: "⚓", nome: "Farol do Porto Seguro", descricaoConstruida: "Erguido ao levar sua vida financeira simulada na Cidade até a aposentadoria — o fim seguro de uma longa jornada de decisões." }`
  - Não reutilizo 👑 (reservado ao topo real do app — `trilha_unificada_completa`/"Monumento da Lenda Financeira"). ⚓ mantém a linha temática oceânica já usada (🪸 Recife, 🏝️ Ilha) sem competir com a hierarquia visual existente.
  - Sobrevive a "Nova Temporada" automaticamente (achievements nunca são removidos) — é badge de "primeira aposentadoria alcançada", não estado corrente.

**3. "Nova Temporada" — reset limpo, com UMA exceção cosmética: contador de temporadas.**

- **Decisão: NÃO há bônus de New Game+** em patrimônio, custo de cursos, bens ou qualquer variável econômica. Reset limpo é didaticamente correto — a lição é que resultado vem de decisão consistente, não de vantagem herdada. Coerente com `novaTemporada()`/`freshState()` do Software Architect.
- **Adição pontual, só de exibição**: `state.temporadasCompletadas` (inteiro, default `0`), único campo que sobrevive ao reset:
```js
novaTemporada() {
  const state = this.getState();
  const temporadasCompletadas = (state.temporadasCompletadas || 0) + 1;
  const fresh = this.freshState();
  fresh.temporadasCompletadas = temporadasCompletadas;
  this.setState(fresh);
  // ...resto conforme já especificado (evento citylife:scenario, _refreshActive())
},
```
  Exibição: selo junto ao HUD de idade ou na tela pós-reset ("3ª Temporada"), citado também no relatório seguinte ("Sua 2ª aposentadoria!"). Zero impacto em fórmulas da simulação. Nenhum desbloqueio (skin/loja/conquista repetível) atrelado a esse contador nesta RFC — escopo novo se o PO quiser depois.

**4. Nome — trocar "Relatório de Fim de Temporada".**

"Relatório" comunica documento frio, destoa do tom do app (nomes evocativos: "Ilha de 1 Ano", "Monumento da Lenda Financeira"). Numa tela cujo objetivo é "sentir conquista", "relatório" trabalha contra o objetivo.

**Decisão: "Legado da Sua Vida Financeira"** como título visível da tela ("Relatório de Fim de Temporada" continua só como nome técnico do método/RFC). Cabeçalho: **"⚓ Você chegou à aposentadoria! Conheça o legado da sua vida financeira."** — reaproveita o mesmo ⚓ do badge/monumento.

**Reação do hook `citylife:aposentadoria`: usar, não deixar vazio.** `js/fx.js` já expõe `Fx.confetti(container)` e `Fx.mascotCelebrate(container)`, reutilizados hoje em `trail.js`/`books.js`/`business.js` — mesmo padrão, zero mecanismo novo. Ao renderizar `renderRelatorioFinalHtml()`, chamar `Fx.confetti(box)` + `Fx.mascotCelebrate(box)`. **Não** uso `Fx.xpPop` (não há XP a mostrar, por decisão do item 2) — usá-lo aqui sinalizaria erroneamente recompensa de XP.

**Especificação de entrega (Database/Backend/Frontend Engineer):**

| Item | Onde | Regra exata |
|---|---|---|
| `IDADE_APOSENTADORIA` | `js/citylife.js`, constante | **`45`** (ajustado pelo Financial Specialist dentro da faixa ~35-50 proposta aqui — não 40, não 65; ver seção 5, "Reconciliação final", para a justificativa) |
| `state.temporadasCompletadas` | `STORAGE_KEYS.CITY_LIFE`, campo novo | inteiro, default `0`; `novaTemporada()` incrementa e reinjeta no `freshState()` — único campo que sobrevive ao reset |
| Conquista nova | `js/data.js` → `ACHIEVEMENTS` | `{ id: "aposentadoria_alcancada", emoji: "⚓", titulo: "Porto Seguro", descricao: "Você levou sua vida financeira simulada na Cidade até a aposentadoria." }` |
| Checker novo | `js/achievements.js` → `CHECKERS` | `aposentadoria_alcancada: () => CityLife.getState().aposentado === true` |
| Monumento novo | `js/data.js` → `CITY_BUILDINGS` | `{ id: "aposentadoria_alcancada", emoji: "⚓", nome: "Farol do Porto Seguro", descricaoConstruida: "Erguido ao levar sua vida financeira simulada na Cidade até a aposentadoria — o fim seguro de uma longa jornada de decisões." }` |
| Recompensa XP/moeda | — | **Nenhuma.** Não chamar `Learn.addXp`/`Learn.addCoins` em nenhum ponto desta feature. |
| Nome da tela | copy de `renderRelatorioFinalHtml()` | Título: "Legado da Sua Vida Financeira". Cabeçalho: "⚓ Você chegou à aposentadoria! Conheça o legado da sua vida financeira." |
| Celebração | render do relatório | `Fx.confetti(box)` + `Fx.mascotCelebrate(box)`, sem `Fx.xpPop` |
| Bônus de New Game+ | `novaTemporada()` | Nenhum bônus econômico. Reset 100% limpo via `freshState()`, exceto `temporadasCompletadas` |

**Nota de processo**: esta seção foi produzida em paralelo com a etapa 5 (Financial Specialist), que validou `IDADE_APOSENTADORIA=65` sem ver esta proposta de 40. O Orchestrator reabriu a etapa 5 para reconciliar os dois pareceres antes de seguir — ver resolução registrada logo abaixo.

**Próximo agente responsável**: Financial Specialist — validar `IDADE_APOSENTADORIA = 40` como framing pedagogicamente correto de "aposentadoria antecipada", e confirmar que a ausência de XP/moedas não deixa a mecânica "sem propósito" educacional (posição do Gamification Designer: o propósito é o badge/monumento + fechamento narrativo, não recompensa material).

### 5. Financial Specialist

**Reconciliação final (após a proposta paralela do Gamification Designer, item 1 da seção 4): `IDADE_APOSENTADORIA = 45`.** Não é 65 (minha validação original, abaixo, mantida como registro histórico do raciocínio) nem 40 (proposta original do Gamification Designer). Justificativa da mudança de valor:

- **40 é agressivo demais mesmo dentro do framing FIRE.** O movimento FIRE (Financial Independence, Retire Early) é um conceito real de educação financeira, e a Cidade pode perfeitamente adotá-lo — mas casos de aposentadoria aos 40 são o extremo superior de dedicação até dentro da própria comunidade FIRE (poupança de 50-70% da renda por ~20 anos seguidos). Ancorar o "resultado padrão" do jogo em 40 corre o risco de comunicar implicitamente "isso é alcançável pela maioria com disciplina razoável", o que não é verdade nem dentro do universo FIRE, nem batendo com o resto do app (`CAREER_PATHS.aposentadoria` já ensina, via `f1_26`/`f1_27`/`av_03`/`l6_6`, que isso exige décadas de juros compostos — 22 anos de acumulação, do 18 ao 40, é curto até pros parâmetros mais otimistas dessas próprias lições).
- **45 preserva a mensagem "aposentadoria antecipada é possível" sem soar como promessa fácil.** Ainda é bem abaixo da idade real do INSS (65/62), continua sendo uma conquista narrativamente forte e alinhada ao objetivo "Me aposentar bem"/"Viver de renda" do Modo Carreira — só desloca a barra pra uma faixa mais consistente com relatos reais de quem atinge FIRE (a maior parte dos cases de aposentadoria antecipada documentados fica entre os 40 e 50 anos, não nos 30-40 citados como extremos).
- **Ainda resolve o problema de ritmo do Gamification Designer**: (45-18) × 12 = **324 cliques**, redução de 42% frente aos 564 originais — menos agressivo que os 264 cliques da proposta de 40, mas dentro da mesma ordem de grandeza, e ainda mais curto que o gate de `streak_100` em esforço percebido (sem intransponibilidade por tempo real). A faixa de ~35-50 que o Gamification Designer definiu como aceitável já previa essa negociação — 45 está dentro dela.
- **A recompensa segue sendo só badge + monumento (concordo com o item 2 da seção 4)**: não há XP/moeda em nenhuma conquista do app hoje, e dar aqui seria a única exceção — abriria a mesma brecha de abuso (sem gate de energia em `avancarSemana()`) que o Gamification Designer identificou corretamente. Nenhuma objeção financeira/didática a essa parte — é decisão de gamificação, e está correta.

Com 45 fixado, meu parecer original abaixo (itens 1-4) permanece válido em espírito, com **dois ajustes de texto** necessários por causa da mudança de framing (de "idade padrão" para "aposentadoria antecipada"): a ressalva sobre a regra do INSS precisa deixar explícito que 45 é deliberadamente adiantado (não uma alegação de que "essa é a idade real de aposentar"), e as falas do POLVIn precisam trocar "aos 65" por uma referência genérica à idade final (`${idadeFinal}`) em vez de um número fixo no texto.

**Ressalva textual revisada** (substitui a versão da validação original, que citava "65" como se fosse a idade padrão sendo simulada):

> *"Na Cidade, a aposentadoria chega aos 45 anos — bem antes da idade oficial do INSS (hoje, regra geral: 65 anos para homens e 62 para mulheres, mais tempo de contribuição, com regras de transição que mudam com a lei). É de propósito: aqui você está simulando aposentadoria antecipada, o conceito por trás do movimento FIRE (Financial Independence, Retire Early) — juntar patrimônio suficiente pra parar de trabalhar bem antes da idade padrão. Na vida real, isso exige um nível de poupança bem acima da média; é possível, mas não é o caminho mais comum."*

**Mensagens do POLVIn revisadas** (mesmos arquétimos da matriz patrimônio × bem-estar do item 3 abaixo, agora sem número fixo hardcoded — usar `${idadeFinal}` no template real, já que a Cidade também precisa continuar funcionando corretamente após uma eventual mudança futura de constante):

- *Patrimônio alto + bem-estar alto (equilíbrio):* **"Você chegou à aposentadoria aos ${idadeFinal} anos com patrimônio construído e vida em equilíbrio — isso não foi sorte, foi disciplina toda semana. 🐙💙"**
- *Patrimônio alto + bem-estar baixo:* **"Seu patrimônio impressiona, mas felicidade e saúde ficaram para trás no caminho. Dinheiro guardado só vale a pena se sobrar vida pra aproveitar — na próxima temporada, vale testar um pouco mais de equilíbrio."**
- *Patrimônio baixo + bem-estar alto:* **"Você aproveitou cada semana da sua vida na Cidade — só que sobrou pouco patrimônio pra aposentadoria. Guardar um pouco também é cuidar do seu eu do futuro."**
- *Patrimônio baixo + bem-estar baixo (tom de recomeço, não de fracasso):* **"Essa temporada foi dura, mas o jogo não acabou aqui — toda Nova Temporada é uma chance de testar uma estratégia diferente. Até quem entende de dinheiro de verdade já teve um ano ruim."**
- *Se o marco de independência financeira (25x gastos) foi cruzado antes dos ${idadeFinal} anos:* **"Reparou que seu patrimônio já sustentava seu padrão de vida antes da aposentadoria? Isso é o que se chama de independência financeira — na vida real, é exatamente esse tipo de conquista que quem escolhe 'Me aposentar bem' ou 'Viver de renda' está buscando: não parar de trabalhar por obrigação, e sim ter a opção de escolher."**

---

**Validação original (65), mantida como registro do raciocínio de base — a lógica de fundamentação abaixo não muda com o valor final, só a idade citada nos exemplos deixou de ser literal:**

**Veredito resumido original**: `IDADE_APOSENTADORIA: 65` estava **aprovado, sem mudança de valor**, antes da proposta paralela do Gamification Designer. O conflito com o Modo Carreira não era de dado nem de regra — era uma lacuna de *copy* no relatório final, fechada abaixo com texto sugerido. Essa parte do raciocínio (o conflito é de mensagem, não de dado) continua valendo integralmente com 45.

**1) 65 é didaticamente correto/razoável no contexto brasileiro?** Sim. Confirmei a regra vigente do INSS (Reforma da Previdência, EC 103/2019): a regra geral por idade é **65 anos para homens e 62 para mulheres**, mais tempo mínimo de contribuição (20 e 15 anos respectivamente); regras de transição (idade mínima progressiva, regra de pontos) variam ano a ano e não fazem parte do que a Cidade Financeira precisa simular. 65 é, portanto, um valor real, reconhecível e didaticamente honesto como "idade padrão de aposentadoria" no imaginário brasileiro — não é um número inventado. Fontes abaixo.

Recomendo **uma única linha de ressalva textual** no relatório (mesmo padrão já usado em `RF_TAX_TABLE`/simuladores — "os números aqui são aproximados"), porque o jogo usa uma idade única para todos os jogadores, enquanto a regra real do INSS varia por gênero, tempo de contribuição e regra de transição:

> *"Na vida real, a idade mínima de aposentadoria pelo INSS varia (hoje, regra geral: 65 anos para homens e 62 para mulheres, mais tempo de contribuição, com regras de transição que mudam com a lei). Aqui na Cidade usamos 65 como uma idade única e fictícia, só para fechar o ciclo do jogo."*

Não bloqueante para o código desta RFC — é só uma linha de texto a mais no HTML que o UX/UI Designer já vai desenhar; sinalizo para o Gamification Designer incluir no copy final.

**2) 65 fixo conflita pedagogicamente com "aposentadoria antecipada" do Modo Carreira?** Não, **se o relatório final comunicar a distinção certa** — e é exatamente aí que o risco do PO precisa de tratamento textual, não de código. A Software Architect já confirmou (corretamente) que não há acoplamento técnico entre `career.js`/`LIFE_GOALS` e `citylife.js` — o risco é 100% de mensagem, não de dado. A distinção que o relatório precisa deixar clara:

- **"Fim de temporada" (mecânica do jogo, sempre aos 65)** ≠ **"independência financeira" (conquista possível a qualquer momento, se o patrimônio sustentar o padrão de vida)**. O jogo sempre *encerra* aos 65 — mas o jogador pode ter *alcançado* liberdade financeira muito antes disso dentro da própria simulação, e o relatório deveria capturar esse momento, não só o resultado final.
- Sugestão concreta de conteúdo (para Gamification/UX Designer avaliarem escopo, não é código meu): usar a heurística real e amplamente ensinada de independência financeira — **patrimônio ≥ 25× o gasto anual sustenta retirada perpétua a ~4% ao ano** ("regra dos 4%"/"regra do 25x", regra aproximada de planejamento financeiro pessoal, não uma lei; deve ser marcada como estimativa simplificada no texto, mesmo padrão do projeto). Com os dados que `montarRelatorioFinal(state)` já expõe (`patrimonioFinal`, despesas recorrentes do emprego/bens), dá pra checar, a cada semana ou só no relatório final, se em algum ponto da temporada `patrimonio >= 25 * despesaAnualEstimada` — e, se sim, o relatório celebra isso como um marco distinto da "aposentadoria do jogo aos 65". Isso transforma o número fixo de 65 de uma "regra que ignora aposentadoria antecipada" em uma "linha de chegada do jogo que **mede** se o jogador teria conquistado aposentadoria antecipada de verdade" — reforça a lição do objetivo "Me aposentar bem"/"Viver de renda" do Modo Carreira em vez de contradizê-la. Se o orçamento de escopo desta RFC não permitir essa checagem semanal, uma versão mínima (calcular só no momento do relatório final, sem histórico) já entrega a mesma mensagem educativa com custo de implementação quase zero — decisão de escopo é do PO/Gamification Designer, não minha.
- Não recomendo tornar `IDADE_APOSENTADORIA` variável por perfil nesta fase — concordo com a Software Architect que isso seria escopo extra não pedido, e pedagogicamente também não é necessário: a idade fixa não impede a mensagem de "aposentadoria antecipada é possível", ela só passa a *precisar* de uma métrica de independência financeira dentro do relatório para comunicar isso corretamente.

**3) Os 6 números do relatório formam uma "mensagem financeira" coerente?** Ainda não, do jeito que estão especificados em `montarRelatorioFinal(state)` (passo 5 da Software Architect) — é uma lista neutra de campos, sem hierarquia nem cruzamento. Recomendo que o relatório (copy/layout, não estrutura de dados — nenhuma mudança em `montarRelatorioFinal` é necessária, os campos já existem) cruze pelo menos dois eixos antes de apresentar os números crus:

- **Eixo patrimonial** (`patrimonioFinal` + valor dos `bens` + `negocio`, se houver) — "quanto construiu".
- **Eixo de bem-estar** (`felicidade`, `saude`, `disciplina`, já em escala 0-100 com `clamp`, então dá pra usar as mesmas faixas já usadas nas barras visuais: baixo <40, médio 40-69, alto ≥70) — "como chegou lá".

Cruzando os dois eixos nascem arquétipos de fechamento que **ensinam trade-off**, em vez de só descrever números — sugestão de rótulos (o Gamification Designer decide nomes/emoji finais):

| Patrimônio | Bem-estar | Lição implícita |
|---|---|---|
| Alto | Alto | Equilíbrio — disciplina sem sacrificar qualidade de vida. O resultado a reforçar como "ideal". |
| Alto | Baixo | Construiu patrimônio à custa de saúde/felicidade — dinheiro guardado só vale se sobra vida pra aproveitar (mensagem contra o extremo oposto ao consumismo: acumular sem propósito). |
| Baixo | Alto | Aproveitou a vida, mas não guardou — ilustra o custo de oportunidade de gastar tudo, sem soar como punição. |
| Baixo | Baixo | Temporada difícil nos dois eixos — tom de recomeço, nunca de fracasso (ver mensagens do POLVIn abaixo). |

`reputacao` e `negocio` (quando existir) funcionam bem como um terceiro adjetivo dentro de cada arquétipo ("e ainda por cima, construiu uma reputação sólida na comunidade") em vez de virarem uma terceira dimensão separada — evita explodir a matriz em algo grande demais pro MVP.

**4) Mensagens sugeridas do POLVIn para o relatório final** — **substituídas pela versão revisada no topo desta seção** ("Mensagens do POLVIn revisadas"), que usa `${idadeFinal}` em vez do número fixo "65" citado nesta versão original. A matriz de arquétipos (item 3 acima) e a lógica de tom (educativa, nunca alarmista, tom de recomeço no pior caso) não mudaram — só o texto literal do número foi generalizado.

**Aprovação final (vale esta, não a de 65 acima): `IDADE_APOSENTADORIA = 45` aprovado.** Pendências de conteúdo (não bloqueiam o código já especificado pela Software Architect/Gamification Designer) para o Gamification Designer/UX Designer: (a) incluir a linha de ressalva revisada sobre a regra real do INSS + framing FIRE explícito (texto no topo desta seção); (b) decidir se o marco de independência financeira (25x gastos) entra no MVP do relatório ou fica como extensão futura; (c) usar a matriz patrimônio×bem-estar acima para dar coerência narrativa ao relatório, em vez de listar os 6 números sem hierarquia; (d) usar as mensagens do POLVIn revisadas (com `${idadeFinal}` dinâmico, não número fixo) no template real, para o texto continuar correto se a constante mudar de novo no futuro.

**Fontes consultadas** (regra do INSS, para verificação de atualidade):
- [Regras de aposentadoria mudam em 2026 — gov.br/INSS](https://www.gov.br/inss/pt-br/noticias/noticias/regras-de-transicao-mudam-os-requisitos-para-aposentadoria-em-2026)
- [Nova idade mínima para aposentadoria em 2026](https://previdenciarista.com/blog/nova-idade-minima-para-aposentadoria-em-2026-veja-o-que-muda/)

**Próximo agente responsável**: Database Engineer (sem mudança de schema esperada — RFC já documenta que tudo entra como campo dentro do objeto existente em `STORAGE_KEYS.CITY_LIFE`).

### 6. Database Engineer

Revisão de modelagem sobre o já decidido pelo Software Architect (seção 2) e pelo Gamification Designer (seção 4) — nenhuma mudança de arquitetura, um ajuste factual a fazer antes da implementação.

**1) Tipagem dos 2 campos — suficiente, sem necessidade de timestamp.** `aposentado: boolean` e `temporadasCompletadas: integer` bastam para tudo que os critérios de aceite pedem (gatilho do relatório, exibição do contador). Cogitei recomendar `dataAposentadoria` (ISO timestamp) para debug/auditoria futura, mas não há consumidor especificado para isso em nenhuma etapa — nem relatório, nem QA, nem Documentation pedem "quando" além de "quantas semanas/que idade". Não recomendo adicionar; é campo especulativo sem caso de uso (YAGNI), fácil de acrescentar depois pelo mesmíssimo padrão de migração incremental se algum dia for pedido. `historico` (linha 41 do `DEFAULT_STATE`, já existente) já é podado para as últimas 12 entradas (`state.historico.slice(0, 12)`, `js/citylife.js:356`) — nenhum array novo desta RFC cresce sem limite; `temporadasCompletadas` é um contador escalar, não uma lista.

**2) Bug real encontrado — `temporadasCompletadas` está fora do bloco de migração do `getState()`.** O bloco de migração do Software Architect (seção 2, item 3a) trata só `aposentado`:
```js
if (state.aposentado === undefined) { state.aposentado = false; migrated = true; } // RFC-025
```
Mas o campo `state.temporadasCompletadas`, especificado depois pelo Gamification Designer (seção 4, tabela de entrega), **não** ganhou uma linha equivalente — nem no bloco de `getState()`, nem confirmação de que entra em `DEFAULT_STATE`. O único lugar do RFC onde esse campo é lido defensivamente é dentro de `novaTemporada()`:
```js
const temporadasCompletadas = (state.temporadasCompletadas || 0) + 1;
```
Esse `|| 0` cobre só o caminho de escrita (incrementar ao resetar). Qualquer leitura futura fora desse método — HUD, selo "3ª Temporada", ou o próprio relatório citando "sua 2ª aposentadoria" (ambos mencionados na seção 4) — vai ler `state.temporadasCompletadas` direto do objeto de `getState()`. Para todo save existente antes desta RFC (ou mesmo saves criados nesta RFC mas por um caminho que não passe por `novaTemporada()` — todo jogador na primeira temporada, nunca resetou), esse campo fica **`undefined`**, não `0`, e viraria literalmente a string `"undefinedª Temporada"` se renderizado sem guarda.

**Correção recomendada para o Backend Engineer** (mesmo padrão dos outros 6 campos do bloco, `=== undefined` — não `!state.x`, pelos mesmos motivos do item 3 abaixo):
- `DEFAULT_STATE`: adicionar `temporadasCompletadas: 0,`.
- `getState()`: adicionar `if (state.temporadasCompletadas === undefined) { state.temporadasCompletadas = 0; migrated = true; }` no mesmo bloco, junto da linha de `aposentado`.

Com isso, `freshState()` (clone de `DEFAULT_STATE`) já nasce com o campo certo, `getState()` migra qualquer save antigo antes de qualquer leitor externo tocar nele, e `novaTemporada()` pode manter o `|| 0` como reforço defensivo (inofensivo, não é preciso removê-lo).

**3) Padrão de migração incremental (`!state.campo` vs `=== undefined`) — revisado linha a linha, sem bug nos campos desta RFC.** No bloco de `getState()` da seção 2 (item 3a):
```js
if (!state.empregoId) { ... }          // string não-vazia sempre — sem valor legítimo "" no domínio (confirmado em CITY_LIFE_JOBS)
if (!state.cursosComprados) { ... }    // array — [] é *truthy* em JS, então `![]` é false; um array vazio legítimo NÃO seria tratado como ausente
if (!state.bensComprados) { ... }      // objeto — mesmo raciocínio, {} é truthy
if (state.status === undefined) { ... }      // número que pode ser 0 legitimamente — usa === undefined, correto
if (state.reputacao === undefined) { ... }   // idem
if (state.negocio === undefined) { ... }     // objeto ou null — usa === undefined, correto (null é um valor válido e distinto de "ausente")
if (state.aposentado === undefined) { ... }  // boolean que É false na maior parte do jogo — usa === undefined, correto. Se tivesse usado `!state.aposentado`, todo state com aposentado:false legítimo cairia no branch e disparia um `Store.set` redundante a cada chamada de getState() (sem corromper o valor, já que reescreveria false de novo — mas seria uma escrita desnecessária a cada leitura, incluindo o `updateAgeHud()` do CityGame chamado toda semana).
```
Conclusão: **não há bug de coerção de tipo em nenhum dos 7 campos já especificados.** `!x` é seguro aqui porque os 3 campos que usam esse operador (`empregoId`, `cursosComprados`, `bensComprados`) nunca têm um valor legítimo falsy no domínio do jogo (string vazia não é um id de emprego válido; array/objeto vazios são truthy). Os campos que *podem* legitimamente ser `0`/`false`/`null` (`status`, `reputacao`, `negocio`, `aposentado`) corretamente usam `=== undefined`. O único problema real é a omissão do campo 8 (`temporadasCompletadas`, item 2 acima) — não um erro de operador nos campos que estão presentes.

**4) `novaTemporada()` — reset atômico, confirmado.** `Store.set()` (`js/storage.js:80-95`) é síncrono: `localStorage.setItem()` é uma chamada bloqueante, sem `await`/callback. `novaTemporada()` não tem nenhum ponto de suspensão (`await`, `setTimeout`, callback assíncrono) entre montar `fresh` e chamar `this.setState(fresh)` — é uma única escrita síncrona de um objeto já completo. JavaScript é single-threaded: não existe uma janela em que a aba possa fechar "no meio" da escrita de um `localStorage.setItem()` já iniciado — ou a call stack termina antes do fechamento da aba (caso normal, inclusive em `beforeunload`) ou o processo é encerrado abruptamente (crash do navegador/SO), risco que já existe para qualquer escrita do app inteiro e não é específico desta RFC. `Cloud.schedulePush()` (chamado dentro de `Store.set`, `js/storage.js:89`) é o único componente assíncrono/adiável do caminho, mas isso é sincronização remota opcional, fora do escopo desta RFC (confirmado: nenhuma tabela/coluna do Supabase muda) — não afeta a integridade do estado local, que já está gravado antes desse ponto. Único risco real, não específico desta RFC: duas abas abertas simultaneamente na Cidade podem se pisar via last-write-wins do `localStorage` (sem lock entre abas) — comportamento pré-existente de todo o app, não uma regressão desta mudança.

**5) Migração de saves muito antigos (pré-Fase 1/RFC-017) — coberta pelo fallback existente.** `Store.get(key, fallback)` (`js/storage.js:65-77`) retorna `fallback` inteiro quando a chave não existe no `localStorage` (`raw === null`) — ou seja, um jogador que nunca abriu a Cidade Financeira (chave `if_city_life` nunca escrita) recebe `freshState()` completo, com todos os campos, incluindo `aposentado`/`temporadasCompletadas` já corrigidos pela recomendação do item 2. Não há cenário de objeto "parcialmente vazio" nesse caso — ou a chave não existe (fallback completo) ou existe com algum subconjunto de campos de uma versão anterior do jogo (coberto campo a campo pelo bloco de migração). O bug documentado no RFC (`TypeError` no boot) não vem de um save "vazio demais" — vem de código lendo `STORAGE_KEYS.CITY_LIFE` direto via `Store.get` sem passar pelo bloco de migração do `getState()` (os 3 checkers de `achievements.js`, já corrigidos na seção 2, item 3b). Nenhuma ação adicional de schema necessária aqui.

**6) Índices/estrutura de consulta — confirmado, não se aplica.** `CITY_LIFE` continua sendo um único objeto por usuário sob uma chave (`if_city_life`), sem Supabase envolvido nesta RFC (nenhum `STORAGE_KEYS` novo, nenhuma tabela `user_data` nova linha de schema). `bensComprados` (mapa `id → valorAtual`) e `cursosComprados` (array de ids) já são a estrutura certa para os campos novos funcionarem — `montarRelatorioFinal()` só faz `Object.keys()`/`.map()`/`.length` sobre eles, nenhuma consulta que se beneficiaria de reestruturação. Nenhuma recomendação de índice — não há tabela relacional aqui, e um único objeto chave-valor por usuário não tem esse conceito.

**Próximo agente responsável**: Backend Engineer — aplicar a correção do item 2 (`DEFAULT_STATE.temporadasCompletadas = 0` + linha equivalente no bloco de migração de `getState()`) na mesma passada em que implementar `getState()`/`freshState()`/`novaTemporada()`, para não introduzir o campo já quebrado para saves existentes.

### 7. Backend Engineer

Implementado exatamente o escopo de dados/regra especificado pelas etapas anteriores — nenhuma decisão de arquitetura, gamificação ou copy foi revisitada. Detalhamento por arquivo:

**`js/citylife.js`**
- `DEFAULT_STATE` ganhou `aposentado: false` e `temporadasCompletadas: 0` (item 1 do Gamification Designer / correção do Database Engineer aplicada na mesma passada, não depois).
- Constantes `IDADE_INICIAL: 18`, `SEMANAS_POR_ANO: 12`, `IDADE_APOSENTADORIA: 45` — confirmei o valor final na seção 5 antes de codar (não 65, não 40); comentário no código referencia a reconciliação para quem ler o arquivo sem o histórico da RFC.
- `idadeAtual(state)` e `freshState()` implementados verbatim conforme a seção 2.
- `getState()` reescrito: usa `freshState()` como fallback de `Store.get`, rastreia `migrated` e só chama `setState()` quando algo de fato mudou. Migração dos 2 campos novos usa `=== undefined` (não `!state.campo`), conforme a análise campo-a-campo do Database Engineer na seção 6 — inclui a linha de `temporadasCompletadas` que a seção 2 (Software Architect) tinha deixado de fora e a seção 6 sinalizou como bug a corrigir "na mesma passada".
- `avancarSemana()`: guard atualizado para `if (state.decisaoPendente || state.aposentado) return;`; branch de aposentadoria inserido logo após o dispatch incondicional de `citylife:scenario` (mantém clima/mar "vivos" até o relatório aparecer), creditando a sobra, setando `aposentado=true`/`decisaoPendente=null`, e disparando `citylife:aposentadoria` com `{ idade }` — código idêntico ao da seção 2, item 4.
- `montarRelatorioFinal(state)` implementado verbatim conforme a seção 2, item 5 (mesmos 12 campos, mesmas expressões).
- `renderRelatorioFinalHtml(state)` novo, com os blocos exigidos pela seção 3 (UX/UI: hero `.city-life-final-hero`/`.city-life-final-badge`, grid de bens/negócio, contador de cursos) e o conteúdo da seção 4 (Gamification: título "Legado da Sua Vida Financeira", cabeçalho "⚓ Você chegou à aposentadoria!...") e da seção 5 (Financial: ressalva revisada sobre INSS/FIRE, matriz patrimônio×bem-estar para escolher entre as 5 falas do POLVIn). Botão `id="cityLifeNovaTemporadaBtn"` no fim, como exigido estruturalmente pela seção 2.
- `renderCicloHtml(state, resultado)` ganhou o branch `if (state.aposentado) return this.renderRelatorioFinalHtml(state);` antes de `resultado`/`decisaoPendente`, verbatim conforme especificado.
- `renderCicloInto()`: novo listener em `#cityLifeNovaTemporadaBtn` com o mesmo texto de `confirm()` da seção 2 (mesmo padrão de `fecharNegocio()`).
- `novaTemporada()` implementado conforme a versão final do Gamification Designer (seção 4, item 3) — incrementa `temporadasCompletadas` a partir do estado atual, injeta no `freshState()`, `setState()`, dispara `citylife:scenario` com `cenarioId:"neutro"` e chama `_refreshActive()`.

**Ajustes finos não previstos literalmente no texto das etapas anteriores, mas necessários para o código funcionar (não são decisões de arquitetura/gamificação novas):**
1. **Nova função `falaPolvinRelatorioFinal(state, relatorio)`** — nenhuma etapa anterior escreveu o código que efetivamente decide *qual* das 5 falas do Financial Specialist usar; a seção 5 só listou as 5 opções e o critério textual (matriz patrimônio×bem-estar + marco de independência financeira de 25x). Implementei a seleção como função pura: prioriza o marco de independência financeira (patrimônio total — incluindo bens — ≥ 25× a despesa anual estimada a partir de `despesasFixas + manutencaoTotalMensal(state)`, checado só no momento do relatório, exatamente a "versão mínima sem histórico" que a seção 5 explicitamente aceita como suficiente); senão cruza patrimônio "alto" (≥10× a despesa anual — limiar deliberadamente abaixo do próprio 25x, para as duas mensagens não colidirem) com bem-estar "alto" (média de felicidade/saúde/disciplina ≥ 55, o ponto médio da faixa "médio" 40-69 já usada nas barras). Esses dois limiares numéricos são detalhe de implementação meu, não da RFC — deixei comentário explícito no código sinalizando para o Gamification Designer revisar se o QA achar a classificação estranha em algum teste manual.
2. **Fiação da fala do POLVIn no relatório**: a seção 3 (UX/UI) tinha um exemplo ilustrativo de fala fixa ("Consegui!... Que jornada!"), mas a instrução recebida pra esta etapa pediu explicitamente a matriz de 5 opções do Financial Specialist — segui a instrução mais específica. Como `#cityLifePolvin` só ganha conteúdo via `Polvin.renderBubble` dentro de `renderCicloInto()` (não dentro de `renderRelatorioFinalHtml`, que só devolve HTML), adicionei `state.aposentado` como primeiro ramo do ternário de seleção de fala já existente em `renderCicloInto()`, chamando `falaPolvinRelatorioFinal()`. Sem esse ramo, o relatório mostraria a fala genérica de "toda semana representa um mês da sua vida", incorreta nesse estado.
3. **Título/cabeçalho**: a seção 4 especifica "Título: Legado da Sua Vida Financeira" e "Cabeçalho: ⚓ Você chegou à aposentadoria!..." como dois textos distintos, mas a seção 3 (UX/UI) não desenhou explicitamente um elemento de título separado do bloco hero. Renderizei ambos como um `<h2>`/`<p>` antes do hero (classes novas `city-life-final-title`/`city-life-final-subtitle`, sem CSS ainda — herdam estilo de texto padrão até o UX/UI Designer/Frontend Engineer estilizarem, se quiserem).
4. **Correção de bug de markup do exemplo da seção 3**: o HTML ilustrativo do card "Negócio" no UX/UI Designer tinha `class` duplicado (`class="value" style="..." class="text-soft"`) para o caso "sem negócio" — implementei como `class="value text-soft" style="font-size:14px"` (um único atributo `class`).
5. **`renderKpisHtml()` não foi tocado** — os 2 ajustes condicionais de copy (label "🏆 Patrimônio final", classe `kpi-final-glow`, "Última carreira") estão listados na seção 3 explicitamente como parte do que "o Frontend Engineer deve implementar" (tabela final da seção 3), então deixei fora do meu escopo desta etapa mesmo o método vivendo em `js/citylife.js`.
6. **Nada de `Fx.*` chamado a partir de `citylife.js`** — `Fx.confetti`/`Fx.mascotCelebrate`/`Fx.badgeUnlock`/`Fx.retirementCelebration`/`Fx.countUp` são todos explicitamente atribuídos ao Frontend Engineer nas seções 2 e 3 ("chamado 1x pelo Frontend Engineer logo após renderCicloInto injetar o HTML"). `renderRelatorioFinalHtml()` só devolve HTML puro — os `id`/classes necessários (`.city-life-final-badge`, `#cityLifePolvin`, `#cityLifeNovaTemporadaBtn`) já estão no markup para esses efeitos serem plugados por fora.

**`js/achievements.js`**: os 3 checkers (`primeiro_curso_cidade`, `primeiro_bem_cidade`, `primeiro_negocio_cidade`) passam a chamar `CityLife.getState()`; novo checker `aposentadoria_alcancada: () => CityLife.getState().aposentado === true`. Não toquei em `vida_na_cidade_1_ano`/`SEMANAS_POR_ANO` — a sugestão do Software Architect de eliminar o `12` hardcoded ali era explicitamente "não bloqueante" e fora da lista de mudanças desta etapa.

**`js/data.js`**: nova entrada em `ACHIEVEMENTS` (`aposentadoria_alcancada`, ⚓, "Porto Seguro") e em `CITY_BUILDINGS` (`aposentadoria_alcancada`, ⚓, "Farol do Porto Seguro") — copiei a estrutura exata dos objetos vizinhos (`vida_na_cidade_1_ano` em ambos os arrays) antes de escrever os novos, confirmando os mesmos 4 campos (`id`/`emoji`/`titulo`/`descricao` em `ACHIEVEMENTS`; `id`/`emoji`/`nome`/`descricaoConstruida` em `CITY_BUILDINGS`) — texto de copy usado literalmente como especificado pelo Gamification Designer.

**Verificação**: `node --check js/citylife.js js/achievements.js js/data.js` **não pôde ser executado** — Node.js não está instalado/disponível no PATH deste ambiente (confirmado via `where.exe node`, busca em `Program Files`, `AppData`, e todo `C:\Users\victo`, sem resultado). Como substituto, revisei manualmente: (a) leitura integral do `js/citylife.js` resultante após as edições, conferindo balanceamento de chaves/parênteses/template literals e a ordem de definição dos métodos novos; (b) leitura do trecho editado de `js/achievements.js` (linhas 8-73) confirmando vírgulas e o objeto `CHECKERS` fechando corretamente; (c) leitura via grep do entorno das 2 linhas novas em `js/data.js`, confirmando que os arrays `ACHIEVEMENTS`/`CITY_BUILDINGS` continuam fechando com `];` logo após as novas entradas. Nenhum erro de sintaxe aparente nessa revisão manual — mas recomendo que o Frontend Engineer ou QA Engineer rodem `node --check` (ou abram o app no navegador e chequem o console) num ambiente com Node disponível antes do merge, já que a verificação automatizada pedida não pôde ser completada aqui.

**Próximo agente responsável**: Frontend Engineer.

### 8. Frontend Engineer

Implementado o escopo visual/interativo completo especificado pelo UX/UI Designer (seção 3), com uma extensão de escopo pontual (item 5 abaixo) e um bug real encontrado e corrigido durante o teste real no navegador (item 6).

**`index.html`**: `<div id="cityGameAgeHud" class="city-game-age-hud"></div>` adicionado dentro de `#cityGameCanvas`, irmão de `#cityGamePrompt` (linha ~499), conforme especificado.

**`css/style.css`**:
- Nova seção "Cidade Financeira: HUD de idade (RFC-025)" — `.city-game-age-hud`/`.city-game-age-ring`/`.city-game-age-text` + `@keyframes cityGameAgeHudPulse`/`cityGameAgeHudGlow`, media queries de 640px/380px — copiados verbatim da seção 3.
- `.city-game-dialogue` ganhou `position:relative; overflow:hidden` (pré-requisito do `Fx.confetti` dentro do painel, documentado pelo UX/UI Designer) — confirmado que não quebra `.close-dialogue { float:right }` já existente.
- Nova seção "Cidade Financeira: Relatório de Fim de Temporada (RFC-025)" — `.kpi-final-glow`, `.city-life-final-hero`/`.city-life-final-badge`/`h3`, `.city-life-new-season-btn` + hover, verbatim da seção 3. Adicionei também `.city-life-final-title`/`.city-life-final-subtitle` (usadas no HTML gerado por `renderRelatorioFinalHtml()`, mas sem CSS correspondente — o próprio Backend Engineer sinalizou isso na seção 7, item 3, como pendência para "UX/UI Designer/Frontend Engineer estilizarem, se quiserem"): título em `--font-display`/`--gold-dark`, subtítulo sem margin extra (já herda `.text-soft`).
- `.city-game-age-ring.pulse`/`.city-game-age-hud.aposentado` adicionados à lista explícita de `prefers-reduced-motion: reduce` já existente (~linha 1600). Nota: o app também tem um segundo bloco `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important } }` mais abaixo, que já neutralizaria essas animações de qualquer forma (comentário do próprio arquivo confirma isso) — mantive a entrada explícita mesmo assim, por clareza e porque foi pedido literalmente pela seção 3.

**`js/fx.js`**:
- `countUp(el, from, to, duration, suffix, format)` — parâmetro `format` novo e opcional, exatamente a opção (a) que a seção 3 pediu ("estender countUp para aceitar uma função format opcional, mantendo compatibilidade com todo uso existente que passa suffix"). Nenhum call site existente (XP) precisou mudar.
- `ageHudPulse(ringEl)` e `retirementCelebration(container)` novos, copiados verbatim da seção 3 (`Fx.confetti(container, 40)` + `Fx.badgeUnlock` no troféu + `Fx.mascotCelebrate` no `#cityLifePolvin` + vibração).

**`js/citygame.js`**:
- `updateAgeHud()` novo — lê `CityLife.getState()`/`CityLife.idadeAtual()`, monta o HTML do anel+texto (marcação idêntica ao exemplo ilustrativo da seção 3), aplica `Fx.ageHudPulse()` só quando o número de anos muda de fato entre uma chamada e a próxima (guardado em `this._lastAgeHudIdade`).
- Chamado 1x em `create()`, junto do bloco que já lê `CityLife.getState()` pra cor inicial do mar (conforme pedido).
- Chamado dentro de `onScenarioChanged()` — **com um ajuste que não estava no texto da RFC**: adiei a chamada com `setTimeout(fn, 0)`. Motivo (bug real que encontrei lendo `avancarSemana()` com atenção antes de codar, não só depois): `citylife:scenario` é disparado **antes** de `CityLife.setState()` persistir a semana/estado novos (tanto no branch normal quanto no de aposentadoria) — uma leitura síncrona de `CityLife.getState()` dentro do handler leria o estado da semana **anterior**. Um `setTimeout(0)` empurra a leitura para depois que `avancarSemana()` termina de rodar (é 100% síncrono), sem precisar de nenhuma mudança em `citylife.js`. Validei isso na prática: sem o adiamento, o HUD ficava sistematicamente "1 semana atrasado"; com ele, sincroniza corretamente a cada avanço — confirmado no teste do item 6.
- Listener de `citylife:aposentadoria` registrado em `init()` (mesmo padrão do listener de `citylife:scenario`, não em `create()`).
- `onAposentadoria(idade)`: atualiza o HUD imediatamente (o `setState()` da aposentadoria já rodou antes deste dispatch específico, então aqui a leitura é sempre fresca — sem necessidade do mesmo adiamento), dispara `celebrateRetirement()` (reação no mapa) e agenda `celebrateReportIfRetired()` via `setTimeout(0)` — o relatório só existe no DOM depois que `avancarSemana()` chama `_refreshActive()`, que roda depois deste evento na mesma cadeia síncrona.
- `celebrateRetirement()`: brilho dourado em burst (24 partículas, mesma técnica/cor do clima "Boom" do RFC-024, modo burst em vez de loop) + "punch" de câmera (`zoomTo(1.12, 700) → zoomTo(1, 700)`), pulado quando `prefers-reduced-motion: reduce`, verbatim da seção 3.
- `celebrateReportIfRetired(container)` + `applyFinalKpiStyling(container, state)`: chamado (a) dentro de `openBuilding()`, só para a construção `"banco"`, depois de `building.open(...)` — cobre reabrir o Banco já aposentado; (b) via `onAposentadoria()` — cobre a transição em tempo real. `applyFinalKpiStyling` localiza os cards do KPI row **pelo texto do rótulo** (`"Patrimônio simulado"`/`"Emprego atual"`), não por índice, para não depender da ordem exata do HTML de `renderKpisHtml()` — troquei os rótulos, apliquei `.kpi-final-glow` e chamei `Fx.countUp(valueEl, 0, state.patrimonio, 1400, "", (n) => CityLife.fmt(n))` conforme a opção (a) que a própria seção 3 preferiu.

**5. Extensão de escopo pontual, fora da lista de arquivos que recebi originalmente**: a seção 3 (UX/UI Designer) atribui explicitamente ao Frontend Engineer "os 2 ajustes de copy condicionais em `renderKpisHtml()`" (label "🏆 Patrimônio final"/classe `kpi-final-glow`/label "Última carreira") e a chamada de `Fx.countUp`/`Fx.retirementCelebration` "logo após `renderCicloInto` injetar o HTML". Decidi implementar isso **sem tocar `js/citylife.js`** (arquivo do Backend Engineer, que na seção 7 item 6 registrou explicitamente que deixou esses ganchos de fora de propósito, "plugados por fora"): toda a lógica de estilo condicional/celebração vive em `js/citygame.js`, operando sobre o DOM já renderizado por `CityLife.renderCicloInto()` via `container.querySelector`/`classList`, sem alterar nenhuma string HTML gerada por `citylife.js`. Isso respeita a fronteira de arquivo que recebi (`index.html`, `css/style.css`, `js/citygame.js`, `js/fx.js`) e ainda assim entrega 100% do comportamento especificado pela seção 3.

**6. Bug real encontrado e corrigido durante o teste**: ao escrever o comentário de `celebrateReportIfRetired()` inclui acidentalmente a sequência `Fx.*/DOM` dentro de um bloco `/* ... */` — como `*/` fecha comentários de bloco em JS, isso terminava o comentário no meio da frase e deixava o resto do texto em português ("DOM de apresentação é responsabilidade...") como código JS literal, quebrando o parse de **todo o arquivo `citygame.js`** com `SyntaxError: Unexpected identifier 'de'`. Só encontrei isso porque testei de verdade no navegador (ver abaixo) — uma revisão manual de chaves/parênteses não pega esse tipo de erro. Corrigido trocando para `efeitos Fx/DOM de apresentação são responsabilidade...` (sem `*/` no meio da frase).

**Teste real (não só leitura de código)**: Node.js e Python não estão disponíveis neste ambiente (confirmado por tentativa direta — mesma limitação que o Backend Engineer já havia documentado na seção 7), e não há `chromium-cli`/Playwright instalados. Em vez de pular a verificação, eu:
1. Escrevi um servidor HTTP estático mínimo em PowerShell (`System.Net.HttpListener`) para servir o app em `http://127.0.0.1:8791/`.
2. Escrevi um driver Chrome DevTools Protocol em PowerShell puro (`System.Net.WebSockets.ClientWebSocket`, sem nenhuma lib externa) contra o Chrome já instalado no ambiente (`chrome.exe --headless=new --remote-debugging-port=...`), com captura de `Runtime.exceptionThrown`/`Runtime.consoleAPICalled(type=error)` e `Page.captureScreenshot`.
3. Rodei o fluxo completo: carreguei o app, semeei `localStorage` (`if_profile` + `if_city_life` com `semana:323`, 1 semana antes da aposentadoria aos 45), fui para a aba Cidade (`Tabs.go('cidade')`), abri o Banco (`CityGame.openBuilding(...)`), cliquei "Avançar semana" (cruza para `semana:324`/idade 45 → aposenta), inspecionei o DOM resultante, cliquei "Nova Temporada" e verifiquei o reset.

**Resultados confirmados**:
- **Zero erros de console em todo o fluxo** (após corrigir o bug do item 6 — antes da correção, o `SyntaxError` aparecia consistentemente).
- HUD mostra `44` / "1 p/ aposentar" antes de avançar; após avançar, mostra `🏖️` / "aposentado(a)", com a classe `.aposentado` aplicada (confirmado tanto via `outerHTML` quanto visualmente no screenshot — anel dourado pleno, cápsula com glow).
- Relatório final renderiza com `.city-life-final-title`, `.city-life-final-hero`, `.city-life-final-badge`, `.kpi-final-glow` (label "🏆 Patrimônio final", valor animado corretamente formatado em BRL via `Fx.countUp` + `CityLife.fmt`, ex. `R$ 50.900,00`), label "Última carreira" no card de emprego, e `#cityLifeNovaTemporadaBtn` presentes — todos confirmados via `querySelector` **escopado ao `#cityGameDialogueContent`** (um teste inicial meu, sem escopo, pegou por engano um `.grid-3.kpi-row` não relacionado do simulador de FIIs em outra aba do mesmo DOM — corrigi o próprio script de teste, não o app; documentado aqui para não confundir quem reler os logs).
- Toast de conquista "⚓ Porto Seguro" apareceu automaticamente ao aposentar (confirma que `Achievements.checkAll()`, já disparado por `avancarSemana()`, pegou o checker novo do Backend/Gamification Designer — fora do meu escopo, mas bom sinal de integração ponta a ponta).
- "Nova Temporada": `CityLife.getState()` pós-clique confirmou `semana:0, aposentado:false, temporadasCompletadas:1`; HUD voltou a `18` / "27 p/ aposentar" corretamente (via o mesmo caminho `citylife:scenario` → `onScenarioChanged` → `updateAgeHud` adiado).
- Confetti (`.confetti-piece`) não estava mais presente no DOM quando checado ~2.8s após o clique — **não é bug**: cada peça se autorremove via `setTimeout(1700ms)` já existente em `Fx.confetti`, e meu `celebrateReportIfRetired()` dispara poucos milissegundos após o clique (via o `setTimeout(0)` explicado acima), então aos 2.8s elas já tinham cumprido o ciclo e sumido — comportamento esperado, só percebido tarde demais no meu próprio timing de verificação.
- Não testei o "punch" de câmera (`zoomTo`) nem o `prefers-reduced-motion` do Phaser visualmente (screenshot estático não mostra uma animação de ~1.4s em andamento, e emular `prefers-reduced-motion` via CDP exigiria uma segunda passada completa) — revisão manual do código confirma o guard `matchMedia("(prefers-reduced-motion: reduce)")` antes de qualquer `zoomTo`, mesmo padrão já usado em outros lugares do app.

**Próximo agente responsável**: Cyber Security Specialist.

### 9. Cyber Security Specialist

**Metodologia**: leitura completa do `git diff` de todos os arquivos alterados (`js/citylife.js`, `js/citygame.js`, `js/fx.js`, `js/achievements.js`, `js/data.js`, `index.html`, `css/style.css` — via `git diff --stat`/`git diff` linha a linha, não a descrição da RFC), com checklist adaptado à realidade client-side/Supabase deste projeto (XSS via `innerHTML`, vazamento de segredo, RLS, vault, boot resiliente contra `localStorage` malformado).

**Escopo confirmado**: esta RFC não toca `js/cloud.js`, `js/vault.js`, `js/auth.js` nem `js/supabase-config.js` — não há mudança de superfície de rede, autenticação ou RLS a auditar aqui. Toda a mudança é estado local (`STORAGE_KEYS.CITY_LIFE`) + renderização de DOM.

**Achados**:

1. **XSS via `innerHTML` — não encontrado (item 1 do escopo confirmado, sem achado).** Rastreei toda a origem dos valores interpolados nos dois HTMLs novos (`renderRelatorioFinalHtml()` em `js/citylife.js` e o template de `updateAgeHud()` em `js/citygame.js`):
   - `renderRelatorioFinalHtml()`: `r.idadeFinal`/`r.semanasTotais` (números derivados de `state.semana`), `r.bens.length`/`somaValorAtualDosBens` (números), `r.negocio.biz.emoji`/`r.negocio.biz.nome` (strings fixas de `CITY_LIFE_BUSINESSES` em `js/data.js`, catálogo do próprio time, não editável pelo jogador), `r.negocio.funcionarios` (número, só incrementado/decrementado por `contratar()`/`demitir()`, nunca digitado em texto livre), `r.cursos.length`, `this.IDADE_APOSENTADORIA` (constante), `state.temporadasCompletadas` (número, só incrementado por `novaTemporada()`). Nenhum campo de texto livre do jogador (nome de perfil, campo de busca, etc.) é interpolado aqui.
   - `updateAgeHud()`: `pct`/`idade` (números derivados de `state.semana`), string fixa `"aposentado(a)"`/emoji `"🏖️"`. Mesma conclusão.
   - Confirmei via `grep` em `js/citylife.js` que não há nenhum `prompt()`/`<input>` de texto livre associado ao fluxo de Cidade Financeira (nomes de negócio/bens vêm de botões com `dataset` referenciando IDs de catálogo fixo, nunca de campo digitado) — o padrão desta RFC é consistente com o resto do arquivo (que já interpola `state.negocio.funcionarios` sem escape em `renderNegocioHtml()`, código pré-existente, não introduzido aqui).
   - **Nota informacional, não é vulnerabilidade**: como qualquer campo de `STORAGE_KEYS.CITY_LIFE` pode em tese ser editado manualmente pelo próprio jogador via DevTools (ex. forçar `state.negocio.funcionarios` para uma string com HTML), isso é *self-XSS* — o único afetado seria o próprio jogador, no próprio navegador, e o valor nunca passa por um campo compartilhado com outros usuários (esta RFC não toca `js/cloud.js`). Não é uma vulnerabilidade real neste contexto (mesmo racional do enunciado desta tarefa sobre "editar `localStorage` pra se dar XP infinito").

2. **`confirm()` antes de `novaTemporada()` — sem vetor de bypass relevante.** `js/citylife.js`, listener em `renderCicloInto()`: `if (confirm(...)) this.novaTemporada();`. Chamar `CityLife.novaTemporada()` direto do console pula a confirmação, mas isso não é uma vulnerabilidade — quem tem acesso ao console já tem controle total do próprio `localStorage` (poderia apagar `if_city_life` diretamente, sem passar por nenhum código do app). Nenhuma chamada de rede/estado de terceiros envolvida.

3. **`eval`/`Function`/HTML não escapado novo — nenhum encontrado.** Busca dirigida por `eval(`, `new Function(`, `document.write` nos 7 arquivos alterados: zero ocorrências novas. Toda inserção de HTML nesta RFC usa `.innerHTML =` com template literal (padrão já estabelecido no resto do app), nunca concatenação de strings vindas de input do usuário sem escape.

4. **Migração de `getState()` / `localStorage` malformado — sem crash de boot; risco pré-existente reduzido, não ampliado.**
   - `Store.get()` (`js/storage.js:65-78`) já envolve `JSON.parse` em `try/catch`, retornando o `fallback` (agora `this.freshState()`, um clone profundo — correção introduzida por esta própria RFC) em caso de JSON corrompido. Um `localStorage["if_city_life"]` malformado (JSON inválido) não quebra o boot: cai no fallback normalmente.
   - A introdução de `freshState()` no lugar de `this.DEFAULT_STATE` como fallback **corrige** um problema de referência mutável compartilhada que já existia antes desta RFC (mutação de `DEFAULT_STATE.cursosComprados` etc. por referência) — é uma melhoria de robustez, não uma regressão.
   - Testei mentalmente o caso de campos com *tipo* errado (não ausentes, mas corrompidos) — ex. `state.negocio.businessId` apontando para um ID que não existe mais em `CITY_LIFE_BUSINESSES`, ou `state.cursosComprados` sendo um objeto em vez de array por edição manual. Nesses casos, `montarRelatorioFinal()`/`renderRelatorioFinalHtml()` podem lançar `TypeError` (`r.negocio.biz.emoji` com `biz === undefined`, ou `.map` chamado em não-array) ao abrir o Relatório de Fim de Temporada — mas isso exige edição manual de `localStorage` pelo próprio jogador (fora do fluxo normal do app, que só grava valores válidos), afeta só quem editou o próprio save, e não é um crash de boot permanente (só quebraria a renderização daquele painel específico, recuperável limpando a chave ou clicando outra construção). Não atende ao critério de severidade que o enunciado pediu para destacar ("`JSON.parse` sem try/catch que quebra o boot pra sempre") — não há esse cenário aqui. Sinalizo como nota de robustez de baixa prioridade (não é achado de segurança) para o Frontend/Backend Engineer considerarem `?.`/fallback defensivo em `r.negocio?.biz?.emoji`, se quiserem blindar contra saves corrompidos.
   - Os 3 checkers migrados em `js/achievements.js` para `CityLife.getState()` (em vez de `Store.get` direto) foram confirmados como corretos quanto a ordem de `<script>` — `CityLife` só é referenciado dentro do corpo das funções, chamadas depois de todos os scripts carregarem, nunca na definição.

5. **`navigator.vibrate()` em `js/fx.js` — guardado corretamente.** Ambos os usos novos (`ageHudPulse`, linha nova em `js/fx.js`, e `retirementCelebration`) estão atrás de `if (navigator.vibrate) navigator.vibrate(...)`. Em navegadores/contextos sem suporte (ex. desktop, iOS Safari, iframe sem permissão), `navigator.vibrate` é `undefined` e o `if` curto-circuita sem lançar exceção — não quebra o fluxo.

**Veredito sobre RLS/Supabase/segredos**: fora do escopo desta RFC (nenhum arquivo relacionado a `cloud.js`/`vault.js`/`auth.js`/`supabase-config.js` foi alterado) — nada a reportar aqui; a auditoria dessa superfície deve ocorrer na próxima RFC que tocar esses arquivos.

**Conclusão**: nenhuma vulnerabilidade real foi encontrada nesta RFC. Todos os 5 pontos do escopo solicitado foram verificados e vieram limpos, com uma única nota de robustez (não-segurança) sobre acesso defensivo a campos aninhados no relatório final em caso de save manualmente corrompido. Aprovado para seguir ao QA Engineer.

**Próximo agente responsável**: QA Engineer.

### 10. QA Engineer

**Metodologia**: Node.js, Python e Playwright confirmados indisponiveis neste ambiente (mesma limitacao ja documentada pelo Backend/Frontend Engineer). Em vez de revisar so por leitura de codigo, montei um ambiente de teste real e independente do Frontend Engineer (nao reaproveitei o script dele): servidor estatico em PowerShell (System.Net.HttpListener, servindo o app em http://127.0.0.1:8791/) + Chrome headless real (chrome.exe --headless=new --remote-debugging-port=9333) + um driver CDP em PowerShell puro (System.Net.WebSockets.ClientWebSocket, sem libs externas), rodando 11 cenarios de teste diretamente contra o app vivo no navegador: seeding de localStorage via Runtime.evaluate, leitura de estado de volta, captura de Runtime.exceptionThrown/Runtime.consoleAPICalled(type=error) para verificacao de "zero erro de console", e aceite automatico de confirm() via Page.javascriptDialogOpening (pra testar o fluxo real do botao "Nova Temporada", nao so chamar novaTemporada() direto).

**Gotcha de ambiente encontrado e corrigido no proprio harness de teste** (registro a parte, nao e bug do app): o ConvertFrom-Json do Windows PowerShell 5.1 (a unica versao disponivel aqui) nao aceita o parametro -Depth. Passa-lo lanca um erro de binding de parametro a cada chamada; se esse erro for engolido por um try/catch (como no meu primeiro rascunho do driver), a resposta do CDP nunca e reconhecida, o loop de polling continua ate estourar o timeout real, e -- achado curioso de .NET -- cancelar um ClientWebSocket.ReceiveAsync pendente via CancellationToken aborta a conexao WebSocket inteira (nao so aquela chamada), quebrando todos os comandos CDP seguintes. Levei um tempo pra isolar a causa raiz (script de bisseccao ate achar o parametro problematico), mas depois de remover -Depth de todo ConvertFrom-Json o driver ficou 100% estavel. Registro isso porque e o tipo de causa raiz enganosa (parecia problema de timing/rede) que vale documentar caso outro agente precise montar um harness similar neste ambiente.

#### Criterios de aceite — resultado item a item

**1. Idade inicial (18) e de aposentadoria (45) calculadas a partir de `state.semana`, visiveis no HUD do mapa — PASSOU.**
Evidencia ao vivo: `CityLife.IDADE_INICIAL` -> `18`, `CityLife.IDADE_APOSENTADORIA` -> `45` (confirma o valor final da reconciliacao da secao 5, nao 65 nem 40). `idadeAtual({semana:0})` -> `18`; `idadeAtual({semana:323})` -> `44`; `idadeAtual({semana:324})` -> `45`. HUD real no DOM (`#cityGameAgeHud`) antes de aposentar: "44 ... idade ... 1 p/ aposentar"; depois de "Nova Temporada": "18 ... idade ... 27 p/ aposentar".

**2. Ao atingir a aposentadoria, o ciclo semanal PARA e mostra o Relatorio — PASSOU.**
Semeei `semana:323` (1 semana antes do gatilho), abri o Banco, chamei o fluxo real (`resolverDecisao`/`avancarSemana`) — em exatamente 1 avanco, `semana` foi a `324`, `aposentado` virou `true`. Testei explicitamente o guard: chamar `CityLife.avancarSemana()` de novo depois disso e um no-op puro (`semana` continua `324`, zero excecao) — confirma `if (state.decisaoPendente || state.aposentado) return;` funcionando na pratica, nao so na leitura do codigo. No DOM: `#cityLifeNextBtn` ausente, `#cityLifeNovaTemporadaBtn` presente, titulo "Legado da Sua Vida Financeira" renderizado, HUD muda para "aposentado(a)" com a classe `.aposentado` aplicada.

**3. "Nova Temporada" reseta so `STORAGE_KEYS.CITY_LIFE` — PASSOU.**
Semeei `if_xp=9999`, `if_coins=500`, `if_achievements_unlocked=["aposentadoria_alcancada","primeira_meta"]` e `if_city_decorations_owned=["praca","farol"]` antes do reset. Depois de `CityLife.novaTemporada()` e, num segundo teste, depois de um clique real no botao passando pelo `confirm()` de verdade (aceito via CDP, nao bypassado): `CITY_LIFE` voltou a `semana:0`/`aposentado:false`/`temporadasCompletadas` incrementado corretamente (0->1), enquanto os 4 valores de XP/moedas/conquistas/decoracoes vieram de volta byte-identicos. Confirmei tambem por leitura de `js/city.js` (grep) que o arquivo nunca referencia `STORAGE_KEYS.CITY_LIFE` — so `CITY_DECORATIONS_OWNED` — entao a grade de 13+1 construcoes permanentes e estruturalmente disjunta do estado da Cidade Financeira, nao so "nao tocada por acaso".

**4. Bug de migracao do ROADMAP nao lanca mais `TypeError` no boot — PASSOU (o teste mais importante).**
Reproduzi literalmente o cenario do enunciado: `localStorage.setItem("if_city_life", JSON.stringify({ semana: 3, ultimoCenarioId: "crise" }))` (sem `cursosComprados`) + `if_profile` valido + reload. Zero excecoes durante o boot inteiro. `CityLife.getState()` chamado logo em seguida devolveu um objeto 100% migrado (`empregoId`, `cursosComprados`, `bensComprados`, `status`, `reputacao`, `negocio`, `aposentado`, `temporadasCompletadas` todos presentes com os defaults corretos). Fui alem do que o criterio pede e confirmei que a migracao foi persistida de fato no `localStorage` (nao so no objeto em memoria devolvido) lendo `localStorage.getItem('if_city_life')` cru logo apos — o JSON salvo ja vem com os 9 campos migrados, confirmando que `getState()` chamou `setState()` internamente como a secao 2 (Software Architect) especificou.

**5. Nenhuma regra economica das Fases 1-4 mudou — PASSOU.**
Semeei `semana:10` (bem longe da aposentadoria), chamei `CityLife.avancarSemana()` uma vez fora da janela de aposentadoria e comparei a `sobra` calculada pelo motor com o calculo manual esperado: `salario (1800) - despesasFixas (900) = 900`. Resultado ao vivo: `sobraCalculada: 900`, batendo exatamente. Formulas de `efeitoOpcao`/`aplicarValorizacaoSemanal`/`aplicarNegocioSemanal` nao foram tocadas pelo diff desta RFC (confirmado por leitura), e o teste ao vivo confirma que o comportamento observavel tambem nao mudou.

**6. Zero erro de console em qualquer fluxo tocado — PASSOU em 10 dos 11 cenarios, FALHOU em 1 (ver Bug #1 abaixo).**
Todos os fluxos "felizes" (boot limpo, boot com save antigo migravel, HUD, aposentadoria em tempo real, no-op pos-aposentadoria, Nova Temporada via metodo direto e via clique real no botao, ciclo semanal normal, usuario 100% novo sem nenhum localStorage) rodaram com zero `Runtime.exceptionThrown`/`console.error` capturados via CDP. O unico cenario com erro de console e um caso de borda especifico, documentado como Bug #1.

#### Achados sinalizados por etapas anteriores — resultado da reverificacao

**Database Engineer (secao 6) — `temporadasCompletadas` sem default/migracao — CONFIRMADO CORRIGIDO.** Semeei um save com `aposentado` presente mas sem `temporadasCompletadas`. `CityLife.getState().temporadasCompletadas` -> `0` (nao `undefined`, nao a string "undefinedª Temporada" que o Database Engineer alertou). O bloco de migracao em `getState()` (`js/citylife.js:91`) tem a linha `if (state.temporadasCompletadas === undefined) { state.temporadasCompletadas = 0; migrated = true; }`, exatamente como recomendado.

**Cyber Security Specialist (secao 9) — `state.negocio.businessId` inexistente em `CITY_LIFE_BUSINESSES` — NAO CONFIRMADO como "sem achado"; reproduzi um `TypeError` real e nao tratado.** O parecer original classificou isso como "nota de robustez de baixa prioridade, nao e achado de seguranca" e concluiu que "nao e um crash de boot permanente". Testei ao vivo (nao so mentalmente) e o resultado e mais grave do que a previsao: com `state.negocio = { businessId: "ID_QUE_NAO_EXISTE", ... }` e `state.aposentado: true`, o fluxo real do jogador (`CityGame.openBuilding` -> `building.open` -> `CityLife.renderCicloInto` -> `renderCicloHtml` -> `renderRelatorioFinalHtml`) lanca um `TypeError: Cannot read properties of undefined (reading 'emoji')` nao capturado em lugar nenhum da cadeia de chamadas — nenhum desses metodos tem `try/catch`. Documentado como Bug #1 abaixo, com gravidade reclassificada.

#### Bugs encontrados

**Bug #1 — `TypeError` nao tratado ao renderizar o Relatorio de Fim de Temporada quando `state.negocio.businessId` nao existe em `CITY_LIFE_BUSINESSES`.**
- **Gravidade**: media (nao critica/alta — nao e alcancavel em jogo normal, exige estado corrompido manualmente OU uma futura RFC que remova/renomeie um id de `CITY_LIFE_BUSINESSES` sem migrar saves existentes que referenciam o id antigo; mas quando o gatilho ocorre, o resultado e um crash de verdade, nao cosmetico — o painel do Banco fica preso aberto e vazio, sem forma de recuperacao pela UI).
- **Como reproduzir**:
  1. `localStorage.setItem("if_city_life", JSON.stringify({ semana: 324, empregoId:"empresario", cursosComprados:[], bensComprados:{}, status:20, reputacao:20, negocio:{businessId:"ID_QUE_NAO_EXISTE", funcionarios:2, semanasOperando:5, ultimoLucro:100}, aposentado:true, temporadasCompletadas:0, ultimoCenarioId:"crise", patrimonio:20000, felicidade:70, saude:80, disciplina:50, selicAtual:10.5, despesasFixas:900, decisaoPendente:null, historico:[] }))` + `if_profile` valido + reload.
  2. Ir para a aba Cidade, entrar no Banco (`CityGame.openBuilding(...)` ou clicar no balao).
  3. Excecao nao capturada, confirmada ao vivo via CDP: `Uncaught TypeError: Cannot read properties of undefined (reading 'emoji')`, stack `CityLife.renderRelatorioFinalHtml (js/citylife.js:664:76)` <- `renderCicloHtml (js/citylife.js:676)` <- `renderCicloInto (js/citylife.js:735)` <- `building.open (js/citygame.js:76)` <- `CityGame.openBuilding (js/citygame.js:583)`.
  4. Resultado observado: `CityGame.dialogueOpen` fica `true`, o painel (`#cityGameDialogue`) fica visivel mas `#cityGameDialogueContent` vazio (so o botao "Saida" funciona) — o jogador fica travado, sem ver KPIs/atributos/relatorio algum, precisando fechar e nao podendo mais reabrir o Banco sem editar o localStorage manualmente.
- **Causa raiz**: em `CityLife.montarRelatorioFinal(state)`, o campo `bens` ja e defendido contra ids orfaos (`.filter((b) => b.asset)`, `js/citylife.js:582`), mas o campo `negocio` nao recebe o mesmo tratamento (`js/citylife.js:583`): `negocio: state.negocio ? { ...state.negocio, biz: CITY_LIFE_BUSINESSES.find(...) } : null` — se o `find` nao encontrar nada, `negocio` continua truthy (e o spread de `state.negocio`, sempre verdadeiro) mas `negocio.biz` fica `undefined`, e `renderRelatorioFinalHtml` acessa `r.negocio.biz.emoji` sem guarda (`js/citylife.js:664`).
- **Sugestao**: em `montarRelatorioFinal`, tratar `negocio` com a mesma defesa ja usada em `bens` — ex.: calcular `const biz = state.negocio ? CITY_LIFE_BUSINESSES.find((b) => b.id === state.negocio.businessId) : null;` e so devolver `negocio: biz ? { ...state.negocio, biz } : null` (um negocio "orfao" passa a cair no mesmo branch visual ja existente para "nenhum negocio aberto", em vez de quebrar a tela). Encaminhar para o **Frontend Engineer** ou **Backend Engineer** — arquivo e linha ja identificados (`js/citylife.js:583`), fix e de baixo custo e o arquivo ja esta sendo tocado nesta propria RFC. Nao bloqueante para o merge (nao e alcancavel em nenhum fluxo normal de jogo e nao afeta nenhum criterio de aceite), mas recomendo fortemente corrigir antes do commit, dado o custo trivial da correcao.
- **Correção aplicada (Orchestrator, pós-QA)**: exatamente a sugestão acima, aplicada em `js/citylife.js:583` — `negocio` agora é calculado via IIFE que resolve `biz` primeiro e só retorna o objeto combinado quando `biz` existe, senão `null`. Confirmado por leitura que `renderRelatorioFinalHtml` (linha ~666) já trata `r.negocio` falsy corretamente (branch "Nenhum negócio aberto", mesmo usado quando o jogador nunca abriu negócio) — nenhuma mudança adicional necessária nesse método. Não há regressão no caminho feliz: quando `businessId` é válido, `biz` é truthy e o objeto retornado é idêntico ao anterior.

#### O que nao pode ser testado

- **`prefers-reduced-motion` no "punch" de camera do Phaser e no burst de particulas de `celebrateRetirement()`** — o harness usado e baseado em DOM/CDP (`Runtime.evaluate`), sem captura de frames/video do canvas; confirmar visualmente uma animacao de ~1.4s exigiria uma segunda passada com `Page.captureScreenshot` em sequencia ou emulacao de midia via `Emulation.setEmulatedMedia`, que nao rodei por tempo. Revisao de codigo confirma o guard `matchMedia("(prefers-reduced-motion: reduce)")` antes de qualquer `zoomTo` (`js/citygame.js`), consistente com o ja reportado pelo Frontend Engineer.
- **`node --check js/data.js`/`js/citylife.js`/`js/achievements.js`** — Node.js indisponivel neste ambiente, mesma limitacao ja documentada pelo Backend Engineer. Confirmei manualmente (grep + leitura) que as 2 entradas novas em `ACHIEVEMENTS`/`CITY_BUILDINGS` fecham corretamente com `];`, e que nenhuma pergunta de quiz foi tocada por esta RFC. O boot real no navegador (11 cenarios, incluindo o de save corrompido) nao apresentou nenhum `SyntaxError`, o que ja e uma confirmacao indireta forte de que os arquivos JS parseiam corretamente.
- Nota a parte, nao e bug: durante a captura de saida do meu harness em terminal Windows (cmd/PowerShell, nao UTF-8 por padrao), o emoji do HUD apareceu como caracteres invalidos no console — confirmei que e so um artefato de encoding do terminal, nao um problema real do app; o `textContent` do elemento no DOM contem o emoji correto (confirmado por outras leituras do mesmo elemento que preservaram outros textos corretamente na mesma sessao).

#### Veredito final

**Aprovado para commit.** Todos os 6 criterios de aceite da RFC passaram em teste real (nao so leitura de codigo), incluindo o bug de migracao documentado no ROADMAP.md (o mais critico da lista) e os 2 achados sinalizados por etapas anteriores foram reverificados — um confirmado corrigido (Database Engineer), o outro reclassificado de "nota de robustez" para bug real e documentado (Bug #1, Security Specialist). Bug #1 nao bloqueia o merge: nao e alcancavel em nenhum fluxo normal de jogo, nao regride nenhum comportamento pre-existente, e nao afeta nenhum criterio de aceite desta RFC — mas recomendo fortemente que o Frontend/Backend Engineer aplique a correcao de uma linha antes do commit final, ja que `js/citylife.js` ja esta sendo editado nesta mesma RFC e o custo da correcao e minimo.

**Proximo agente responsavel**: Documentation Specialist.

### 11. Documentation Specialist

**Metodologia**: leitura integral desta RFC (as 10 etapas anteriores, incluindo a reconciliação de `IDADE_APOSENTADORIA` entre Gamification Designer/seção 4 e Financial Specialist/seção 5, e o achado + correção pós-QA do "negócio órfão" no fim da seção 10) + `git diff --stat`/`git tag --sort=-v:refname` para confirmar os arquivos de fato alterados e a próxima versão SemVer, antes de escrever qualquer linha de documentação.

**Versão**: confirmado por `git tag --sort=-v:refname` que a última tag é `v1.45.0` (RFC-024) — esta RFC entra como **`v1.46.0`** (minor bump, mesmo padrão consistente de RFC-017 a RFC-024: feature nova + correção de bug no mesmo pacote, sem breaking change de dado ou API pública).

**`CHANGELOG.md`**: nova entrada `## [1.46.0] - 2026-08-06`, com duas seções:
- `### Adicionado` — fim de jogo (idade/aposentadoria aos 45, com a reconciliação de valor resumida em 1 frase), HUD de idade, Relatório de Fim de Temporada "Legado da Sua Vida Financeira" (patrimônio animado, bens/negócio/cursos, fala do POLVIn, confete/celebração no mapa com fallback de `prefers-reduced-motion`), conquista `aposentadoria_alcancada` (badge ⚓ + monumento "Farol do Porto Seguro", sem XP/moeda), botão "Nova Temporada" (reset só de `STORAGE_KEYS.CITY_LIFE`, sem bônus de New Game+, `temporadasCompletadas` como única exceção de exibição).
- `### Corrigido` — o bug de migração de estado (checkers de Cidade lendo `Store` direto sem migração persistida), citando explicitamente que fecha o item do `ROADMAP.md`.

**`ROADMAP.md`**: três edições.
1. Nova entrada `✅ **RFC-025 — aposentadoria, HUD de idade e Relatório de Fim de Temporada** (v1.46.0)` no topo da seção "Cidade Financeira — jogo de simulação de vida" (mesmo padrão `✅ **RFC-NNN — título** (vNN.NN.NN)` das 5 entradas anteriores), incluindo o valor final da idade (45) e um resumo de 1 parágrafo do processo de reconciliação 65→40→45 entre Gamification Designer e Financial Specialist — registrado porque é um caso interessante de duas etapas do workflow ajustando o parecer uma da outra dentro da mesma RFC, não só um número escolhido a dedo.
2. A linha "Fases seguintes, ainda não escopadas em detalhe" (antiga, citava "linha do tempo dos 18 anos à aposentadoria e relatório de fim de temporada" como pendente) foi reescrita: esse item agora está marcado como concluído pela RFC-025, com um link de volta à entrada nova; o que resta não escopado é só o cenário isométrico animado, mais a visão de longo prazo (NPCs, Quest System, Audio Manager, Character Customization, World Events).
3. Na seção "Bugs conhecidos (backlog técnico)", o item do `Achievements.CHECKERS.primeiro_curso_cidade` foi marcado com `✅ RESOLVIDO na RFC-025 (v1.46.0)` no início do bullet (histórico do achado mantido, não removido — mesma convenção do resto do documento), e o bullet "Correção sugerida" ganhou uma nota confirmando que ambas as abordagens (a) e (b) descritas ali foram de fato implementadas, com uma frase remetendo à seção 2 desta RFC (Software Architect) para o raciocínio de por que as duas eram necessárias, não redundantes.

**`README.md`**: verificado — segue sem existir uma seção dedicada que descreva a Cidade Financeira feature a feature (confirmado por `grep -in cidade README.md`; as únicas ocorrências de "cidade" no arquivo são incidentais, fora de contexto de jogo). A conclusão da RFC-024 sobre isso continua válida. A seção "Fora do escopo (e por quê)" e o "Roadmap sugerido" também foram lidos por inteiro — nenhum item ali faz referência a loop infinito/fim de jogo/aposentadoria da Cidade, então nenhuma edição era necessária. Nenhuma mudança feita no `README.md` nesta RFC.

**Comentários de cabeçalho em código**: `js/citylife.js` (linhas 1-22) e `js/citygame.js` (linhas 1-25) já documentavam as fases anteriores (RFC-017/018 e RFC-021/022/023/024 respectivamente) mas nenhum dos dois tinha uma linha para RFC-025 ainda — Backend/Frontend Engineer não haviam adicionado. Adicionei um parágrafo curto em cada cabeçalho, no mesmo padrão das entradas anteriores: em `citylife.js`, resumindo idade/aposentadoria/relatório/`novaTemporada()`/`freshState()` e a correção de persistência de migração em `getState()`; em `citygame.js`, resumindo `updateAgeHud()` (chamado em `create()` e a cada `citylife:scenario`, sem evento novo) e o listener de `citylife:aposentadoria` que dispara a celebração no mapa (confirmei por leitura do código real — `js/citygame.js:147` registra o listener chamando `onAposentadoria`, que por sua vez chama `updateAgeHud()` e `celebrateRetirement()` nas linhas 651-652 — que os nomes de método citados no comentário existem de fato antes de escrever sobre eles).

**Próximo agente responsável**: nenhum — RFC concluída. (DevOps Engineer não se aplica: esta RFC não envolve deploy, mesmo padrão de todas as RFCs anteriores da Cidade Financeira, projeto 100% estático.)
