# RFC-035: Reformulação da Trilha de Aprendizado — energia 5, revisão periódica a cada 7 pontos e layout zig-zag horizontal (expansão de perguntas cancelada — 10/lição já é suficiente)

- **Status**: em andamento (escopo revisado 2026-08-08 — ver nota abaixo)

> **Nota de reconciliação (2026-08-08, pós-esclarecimento com o usuário):** o Product Owner confirmou, por leitura direta de `js/trail.js`/`js/data.js`, que cada lição já tem hoje **10 perguntas-base reais** (não 5 base + 5 condicionais como uma leitura inicial sugeriu — os "pontinhos" de progresso do quiz são gerados a partir do array `perguntas`, comprimento 10; a `variante` é reforço extra só ao errar, não conta como pergunta adicional na contagem de progresso). O usuário inicialmente relatou ver "2 questões" por tema, mas confirmou que estava testando por um **link hospedado** (não os arquivos locais) — GitHub Pages não está publicado na URL padrão do projeto (`https://petrucellivictor.github.io/FInPuls/`, testado e retornou 404), então a causa provável é uma versão desatualizada/em cache em algum outro deploy (ex.: Vercel), não um bug no código-fonte atual. **Decisão final do usuário**: 10 perguntas por lição já é suficiente — **a Fase 4 desta RFC (expansão retroativa de perguntas) está CANCELADA**. O escopo real desta RFC passa a ser só as Fases 1, 2 e 3 (energia, layout, sistema de revisão a cada 7 pontos com 10 perguntas cobrindo os últimos 7 temas) — reduzindo a estimativa de ~23-28 RFCs para ~5-6.
- **Prioridade**: alta
- **Agentes envolvidos**: Product Owner (esta etapa). Fases subsequentes: Software Architect, Gamification Designer, UX/UI Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, QA Engineer, Documentation Specialist — cada um só na(s) fase(s) relevante(s), não todos em todas.

## Descrição

O usuário pediu 4 mudanças simultâneas nas 3 trilhas de aprendizado do PolvIn
(`COURSE`, `HISTORY_COURSE`, `BUSINESS_COURSE` — juntas, ~138 lições já
publicadas e testadas em 15 RFCs anteriores, Ondas 1-15):

1. **15 perguntas por lição** (as 10 já existentes + 5 novas — soma, não
   substituição), com explicações claras o suficiente para "qualquer pessoa
   entender". **Retroativo**: aplica-se às ~138 lições já publicadas, não só
   a lições futuras.
2. **Energia máxima de 3 para 5** (`ENERGY_MAX` em `js/energy.js`, hoje `3`).
3. **Revisão a cada 7 pontos da trilha**: uma lição de revisão com 10
   perguntas cobrindo os 7 pontos anteriores (podem repetir perguntas ou ser
   variações/situações-problema), inserida periodicamente na sequência da
   trilha, com ênfase explícita do usuário em clareza/interpretação sem
   ambiguidade.
4. **Layout da trilha muda de vertical sinuoso para "zig-zag horizontal"**:
   5 lições na horizontal → 2 na vertical → 5 na horizontal (sentido
   invertido) → 2 na vertical → repete, ocupando mais a largura da tela.

Confirmado com o código real antes desta RFC:

- `js/energy.js`: `const ENERGY_MAX = 3;` — mudança de configuração
  isolada, sem dependência de outro sistema.
- `js/trail.js`: hoje renderiza um **caminho vertical único por nível**
  (`levelHtml()` empilha `.trail-nodes` em coluna), com zigue-zague
  **lateral leve por nó individual** via CSS (`--zig: -84px/84px` alternando
  ímpar/par em `.trail-nodes .trail-node:nth-child(odd/even)`), não um
  bloco de 5 horizontais + 2 verticais como pedido. `js/business.js`
  reaproveita literalmente as mesmas classes CSS (`.trail-node`,
  `.trail-nodes`) — qualquer mudança de algoritmo de layout em
  `css/style.css`/`js/trail.js` **automaticamente também afeta** a trilha
  Empreender, a menos que se decida deliberadamente divergir.
- `js/data.js`: cada lição tem `perguntas: []`, um array de objetos
  `{ pergunta, opcoes, correta, explicacao, variante? }`. O "10 perguntas"
  hoje padrão (Ondas 1-8) é **5 perguntas-base, cada uma com 1 `variante`**
  (mostrada só se a pessoa errar a base) — ou seja, 5 perguntas garantidas
  + até 5 condicionais, não 10 perguntas-base fixas. Isso significa que
  "adicionar 5 perguntas" para chegar a 15 tem mais de uma interpretação
  técnica válida (5 pares novos de base+variante = 10 perguntas reais
  adicionadas; ou 5 perguntas-base novas sem variante = 5 adicionadas de
  fato) — **decisão que cabe ao Software Architect + Financial Specialist
  na Fase 4A**, não a esta RFC.
- Não existe hoje nenhum conceito de "nó de revisão" no schema de dados
  nem na lógica de `isUnlocked`/`isDone`/`flatLessons` — é uma estrutura
  nova, não um ajuste de conteúdo.

## Objetivo

Entregar as 4 mudanças pedidas sem comprometer a qualidade do conteúdo já
publicado e validado, dividindo o trabalho em fases independentes ordenadas
por risco — do mesmo modo que a Cidade Financeira (RFC-017 a RFC-026) e a
identidade visual (Fases 2A/2B/2C) já foram executadas neste projeto.

## Motivação

As 4 mudanças têm naturezas completamente diferentes e não deveriam ser
tratadas como uma única entrega:

- Energia e layout são mudanças de **código/config contidas e reversíveis**
  — cabem em uma RFC pequena cada, entregam valor rápido, e servem de
  "vitória rápida" enquanto o resto é planejado.
- Revisão a cada 7 pontos é uma mudança de **arquitetura de dados** (novo
  tipo de nó na trilha, com lógica própria de geração/seleção de conteúdo
  a partir do que veio antes) — precisa de decisão do Software Architect
  antes de qualquer conteúdo ser escrito.
- 15 perguntas por lição, retroativo a 138 lições, é um trabalho de
  **conteúdo massivo** (~690 perguntas novas na estimativa mínima, mais se
  cada uma ganhar variante) — na escala de dezenas de "Ondas" já entregues
  neste projeto, não de uma sessão. Tratar isso como uma tarefa monolítica
  é o principal risco à própria exigência do usuário: "questões devem ser
  claras e limpas... para não ter dúvidas". Pressa e volume são inimigos
  diretos de clareza.

## Benefícios

- Energia 5/dia: mais sessões de estudo possíveis por dia, reduzindo
  frustração de "bati no teto" sem abrir mão do gate de energia como
  mecânica de retenção.
- Layout zig-zag horizontal: aproveita melhor telas largas (desktop/tablet),
  visual mais dinâmico, sem exigir rolagem vertical tão longa por nível.
- Revisão periódica: reforço espaçado é uma técnica pedagógica validada
  (retenção de longo prazo) — hoje a trilha só reforça dentro da própria
  lição (variante ao errar), nunca entre lições já concluídas.
- 15 perguntas/lição: quiz mais robusto, menos "decoreba de 5 perguntas",
  mais cobertura do conteúdo de cada aula.

## Impacto

| Fase | Arquivos prováveis (não definitivo — Architect decide) | Tipo de mudança |
| --- | --- | --- |
| 1 — Energia | `js/energy.js` | Configuração/balanceamento |
| 2 — Layout | `js/trail.js`, `js/business.js` (via CSS compartilhado), `css/style.css` | Algoritmo de renderização visual |
| 3 — Revisão | `js/data.js` (schema novo), `js/trail.js`, `js/business.js`, possivelmente novo `STORAGE_KEYS` | Arquitetura de dados + lógica |
| 4 — Conteúdo | `js/data.js` (só conteúdo, sem lógica nova) | Conteúdo, em lote por Onda de Revisão |

Nenhuma fase, isoladamente, deveria exigir mudança de infraestrutura
(continuam 100% client-side, `localStorage`/Supabase inalterados na forma).

## Dependências

- Fase 4 depende da decisão de schema da Fase 4A (Software Architect +
  Financial Specialist) sobre o que "15 perguntas" significa em termos de
  `perguntas`/`variante` — sem isso, qualquer conteúdo escrito antes corre
  risco de ter que ser reestruturado.
- Fase 3 (Revisão) precisa decidir se "7 pontos da trilha" conta lições da
  **trilha unificada** (`Trail.flatLessons()`, financeira+história
  intercaladas) ou de **cada trilha separadamente** (COURSE,
  HISTORY_COURSE, BUSINESS_COURSE cada uma com sua própria contagem) —
  são resultados de produto visivelmente diferentes, e não há como inferir
  isso do pedido original sem uma decisão explícita do Software Architect,
  registrada na RFC daquela fase.
- Fases 1 e 2 não dependem de nada além desta RFC — podem começar em
  qualquer ordem entre si.

## Critérios de aceite (gerais, da iniciativa como um todo)

- [ ] `ENERGY_MAX` efetivamente 5 em qualquer sessão nova ou existente
      (migração de saves antigos sem quebrar), refletido no header e no
      modal de energia esgotada.
- [ ] Layout da trilha (abas Aprender e Empreender) renderiza em zig-zag
      horizontal (5→2→5→2) conforme especificado pelo usuário, com
      comportamento responsivo definido e documentado para mobile (onde
      "ocupar mais a largura da tela" tem menos espaço disponível).
- [ ] Nenhuma regressão em `Trail.isUnlocked()`/`Business.isUnlocked()`
      (destravamento sequencial) causada pela Fase 2 ou pela inserção de
      nós de revisão na Fase 3 — mesmo cuidado já formalizado desde a
      Onda 9 (RFC-028) para qualquer inserção no meio de uma trilha.
- [ ] Sistema de revisão insere nós próprios a cada N pontos definidos pela
      arquitetura, com 10 perguntas cobrindo o conteúdo anterior, sem exigir
      XP/moedas distintos do padrão de lição já existente (a menos que o
      Gamification Designer decida o contrário, de forma explícita).
- [x] ~~100% das ~138 lições publicadas atingem 15 perguntas cada~~ — **item cancelado** (ver nota de reconciliação no topo): confirmado que as lições já têm 10 perguntas-base reais, quantidade que o usuário confirmou ser suficiente. Sem expansão retroativa de conteúdo nesta RFC.
- [ ] Todas as novas explicações passam no critério subjetivo, mas
      verificável em QA, de "uma pessoa sem conhecimento prévio consegue
      entender por que a resposta certa é certa, só lendo a explicação" —
      sinalizado como critério explícito de aceite do usuário, não
      cosmético.
- [ ] Progresso salvo de usuários existentes continua válido após cada
      fase — nenhuma lição concluída "desaparece" ou perde XP já ganho
      por causa de reindexação.
- [ ] Cada fase é registrada em `CHANGELOG.md`/`ROADMAP.md` e fechada como
      "concluída" em sua própria RFC antes de a próxima fase começar —
      mesma disciplina das RFC-017 a RFC-026 e das Fases 2A/2B/2C.

## Etapas puladas e por quê

Nenhuma etapa foi pulada nesta RFC. Esta é uma RFC de planejamento — só a
etapa de Product Owner roda aqui. Cada fase do plano abaixo abre sua(s)
própria(s) RFC(s) e passa pelo Workflow Oficial completo (ou justifica
explicitamente, na própria RFC daquela fase, qualquer etapa pulada).

## Plano de fases proposto

A ordem abaixo minimiza risco: primeiro o que é pequeno/contido/reversível
(fases 1-2), depois o que exige decisão arquitetural antes de qualquer
conteúdo (fase 3), e só por último o trabalho de conteúdo massivo, que é
onde mora o maior risco de qualidade se for apressado (fase 4).

### Fase 1 — Energia máxima 3 → 5
- **Status**: **concluída** (2026-08-08) — `ENERGY_MAX` 3→5 implementado,
  validado ao vivo pelo QA Engineer sem ressalvas de gravidade média/alta/
  crítica (único achado, o clamp defensivo de saldo corrompido, também já
  corrigido), e documentado em `CHANGELOG.md` v1.55.0.
- **Escopo**: alterar `ENERGY_MAX` e qualquer texto/UI que dependa desse
  número (modal de energia esgotada, header). Reavaliar `ENERGY_COMBO`
  (hoje 3 acertos seguidos = +1 energia) só se o Gamification Designer
  julgar que o novo teto de 5 desbalanceia esse bônus — não é dado como
  certo nesta RFC.
- **Ordem**: pode ser a primeira ou executar em paralelo com a Fase 2.
- **Risco**: baixo. Mudança de uma constante + textos derivados, totalmente
  reversível, sem tocar em dados salvos de forma incompatível.
- **RFCs estimadas**: 1.

#### Registro — Gamification Designer (2026-08-08)

**1. Valor confirmado e decidido**
`ENERGY_MAX` hoje é `3` (`js/energy.js:9`). Decisão: **`ENERGY_MAX = 5`**, conforme pedido do usuário. Nenhuma outra constante de energia muda de nome ou de shape — `STORAGE_KEYS.ENERGY` ("if_energy") e o objeto `{ atual, ultimoReset }` continuam idênticos; é puramente uma troca do valor literal `3` por `5` na constante e nos textos que a interpolam (header `${this.get()}/${ENERGY_MAX}` e o modal de energia esgotada).

**2. `ENERGY_COMBO` — manter em 3, sem mudança**
Decisão: **não alterar `ENERGY_COMBO`**. Ele não deve escalar proporcionalmente com `ENERGY_MAX` porque mede uma coisa diferente: não é "quanto do teto diário posso recuperar", é "quantos acertos seguidos dentro de UMA lição provam desempenho bom o suficiente para merecer +1 energia". Essa régua é amarrada ao tamanho fixo do quiz (10 perguntas por lição), não ao teto de energia do dia — uma lição de 10 perguntas sempre permite no máximo 3 gatilhos de combo (streak 3, 6, 9), independente de `ENERGY_MAX` ser 3 ou 5. Reduzir `ENERGY_COMBO` para compensar o teto maior tornaria o bônus artificialmente mais fácil de disparar, empilhando dois afrouxamentos do gate ao mesmo tempo sem necessidade. Efeito colateral positivo de manter `ENERGY_COMBO=3` com `ENERGY_MAX=5`: proporcionalmente, o "auto-resgate" máximo por lição (até 3 energias recuperadas num streak perfeito) passa a cobrir uma fração menor do teto (3/5 = 60%, contra 3/3 = 100% hoje).

**3. Teto 3→5 desbalanceia a retenção diária? Não — opinião decisiva: é ganho líquido**
Energia é um limitador de "quantas lições por dia posso INICIAR", não o motor principal de retorno diário — essa função já pertence ao streak, ao bônus de login diário e aos desafios diários/missão semanal, que dependem de abrir o app naquele dia, não de energia sobrando. Subir para 5 não remove nenhum desses ganchos. Ao mesmo tempo, 3 lições/dia é um teto que gera frustração real cedo. O risco de "energia mais generosa acelera consumo de conteúdo" é real, mas é um problema de OFERTA de conteúdo (quantas Ondas existem), não de balanceamento da mecânica em si — mesmo no cenário mais rápido (5 lições/dia todo dia), as ~138 lições hoje publicadas levam ~28 dias a serem esgotadas. **Decisão: subir para 5 sem nenhuma contrapartida compensatória.**

**4. Reset diário — manter reset binário, não introduzir regeneração por tempo**
Confirmado por leitura do código: hoje não existe regeneração parcial ("1 energia a cada X horas") — é reset completo 1x por dia via `toDateString()`. Decisão: **não introduzir esse conceito nesta mudança** — não foi pedido, mudaria o gancho psicológico do produto (mereceria RFC própria), e exigiria dado novo, contrariando a descrição desta fase como "mudança de configuração isolada, totalmente reversível". Registrado como ideia de roadmap futura.

**5. Conquistas/missões — sem quebra**
Grep confirmado em `js/achievements.js`/`js/engagement.js`/`js/data.js`: zero ocorrências de "energia"/"ENERGY" fora do próprio `js/energy.js`. Nenhuma conquista/missão referencia o valor antigo.

**6. Entrega para Backend/Frontend Engineer**
- Alterar `const ENERGY_MAX = 3;` → `const ENERGY_MAX = 5;` em `js/energy.js:9`. **Não alterar** `ENERGY_COMBO` (permanece `3`).
- Nenhuma migração de dado necessária: `Store.get(STORAGE_KEYS.ENERGY, { atual: ENERGY_MAX, ultimoReset: null })` já usa a constante viva como fallback, e `ensureFresh()` já reseta `atual` para o novo `ENERGY_MAX` na primeira verificação do dia.
- UI: header (`#headerEnergy`) e modal de esgotamento (`showOutOfEnergyModal`) já interpolam `ENERGY_MAX`/`ENERGY_COMBO` via template string — nenhum texto hardcoded precisa ser editado manualmente.
- UX/UI: nenhuma mudança visual nova além do número exibido subir de "/3" para "/5".

**Próximo agente responsável**: Backend/Frontend Engineer.

#### Implementação — Frontend Engineer (2026-08-08)

**1. Mudança aplicada**
`const ENERGY_MAX = 3;` → `const ENERGY_MAX = 5;` em `js/energy.js:9`. `ENERGY_COMBO` permanece `3`, sem alteração, conforme decisão do Gamification Designer. Nenhuma migração de dado: `ensureFresh()` já usa a constante viva tanto no fallback do `Store.get` quanto no reset diário.

**2. Achado fora do previsto: placeholder estático em `index.html`**
A leitura de confirmação por `grep -rn "ENERGY_MAX"` em todo o projeto confirmou um único ponto de definição (`js/energy.js:9`) e que `js/trail.js`, `js/business.js`, `js/app.js`, `js/fx.js` só chamam métodos de `Energy` (`tryStart`, `registerAnswer`, `render`, `init`) — nenhum número repetido. Porém uma busca adicional por `"3/3"` encontrou um valor hardcoded que a RFC não havia listado: `index.html:136`, `<span id="headerEnergy">3/3</span>` — o texto estático inicial do chip de energia no header, mesmo padrão usado em `headerXp`/`headerCoins`/`headerStreak` (placeholder visível antes do primeiro `Energy.render()` rodar, ou se o JS falhar ao carregar). Corrigido para `5/5` para não ficar inconsistente com o novo teto. O atributo `title` do mesmo chip ("acerte 3 seguidas para ganhar +1") não foi tocado — refere-se a `ENERGY_COMBO`, que não mudou.

**3. Verificação de sintaxe**
`node --check js/energy.js` não pôde ser executado — não há `node`/`npm`/`npx` nem WSL com distro instalada disponíveis neste ambiente (confirmado por `command -v` e `wsl -e node --version`). Como alternativa, o arquivo foi exercitado de ponta a ponta em um Chrome headless real (ver item 4), o que cobre sintaxe e comportamento simultaneamente — qualquer erro de parse teria impedido a execução dos scripts e o `document.title` não teria sido definido pelos harnesses de teste.

**4. Teste manual/automatizado executado**
Sem `chromium-cli`/Playwright/Selenium disponíveis (nenhum pacote Python instalado, sem `npm`), o teste foi montado com as ferramentas presentes no ambiente: `python -m http.server` servindo a raiz do projeto em `localhost:8899` + `chrome.exe --headless=new --dump-dom` apontando para três páginas HTML minimalistas e temporárias (carregando só `js/storage.js` + `js/energy.js`, sem o resto do app), cada uma simulando um estado via `localStorage` e expondo o resultado via `document.title` (lido do DOM despejado). As três páginas e o profile do Chrome usado foram removidos do repositório ao final — nenhum artefato de teste foi commitado.

- **Estado limpo (`localStorage.clear()` + `Energy.init()`)**: título capturado `RESULT:5/5:ENERGY_MAX=5` — confirma header renderizando `5/5` e a constante com o novo valor.
- **Consumo ao iniciar lição (`Energy.tryStart()` a partir de energia cheia)**: título capturado `RESULT:before=5/5:startOk=true:after=4/5` — confirma que o gasto de 1 energia por lição iniciada continua funcionando e que o header re-renderiza imediatamente (sem precisar recarregar a página). Nota: energia é debitada no **início da lição** (`Trail.startLesson`/`Business.startLesson` → `Energy.tryStart()`), não a cada resposta errada — `registerAnswer()` só adiciona bônus em acertos de combo, nunca subtrai; comportamento inalterado por esta mudança, só documentado aqui para não sugerir um mecanismo que o código não tem.
- **Energia esgotada simulada (`localStorage` pré-carregado com `{ atual: 0, ultimoReset: hoje }`)**: título capturado `RESULT:header=0/5:startOk=false:modal=true:modalText=Você já usou suas 5 energias iniciando lições hoje. Elas renovam à meia-noite — ou acerte 3 perguntas seguidas dentro de uma lição para ganhar +1 energia na hora.` — confirma `tryStart()` bloqueando corretamente em 0, o modal abrindo, e o texto interpolando `5` (`ENERGY_MAX`) e `3` (`ENERGY_COMBO`) corretamente sem edição manual.
- **`index.html` real servido pelo mesmo Chrome headless** (`--dump-dom` na página completa, sem localStorage prévio): `id="headerEnergy">5/5</span>` — confirma que o placeholder corrigido no item 2 e o `Energy.render()` real do app batem, sem flash de "3/3" residual.

**5. Arquivos alterados**
- `js/energy.js` — `ENERGY_MAX` 3 → 5.
- `index.html` — placeholder estático do chip de energia, `3/3` → `5/5`.

**Próximo agente responsável**: QA Engineer (validação independente) e Documentation Specialist (CHANGELOG).

### Fase 2 — Layout zig-zag horizontal da trilha
- **Status**: **concluída** (2026-08-08) — algoritmo de grid, breakpoint
  responsivo, barra de progresso `sticky` e identidade Conceito B
  implementados em `js/trail.js`/`js/business.js`/`css/style.css`,
  aplicados sem divergência às duas trilhas, validados ao vivo pelo QA
  Engineer (0 sobreposições em 138 nós, 0 erros de console, aprovado sem
  ressalvas) e documentados em `CHANGELOG.md` v1.55.0.
- **Escopo**: redesenhar o algoritmo de posicionamento de
  `.trail-node`/`.trail-nodes` (hoje coluna vertical com leve zigue-zague
  lateral por CSS) para blocos de "5 horizontal → 2 vertical → 5
  horizontal invertido → 2 vertical". Por `js/business.js` compartilhar as
  mesmas classes CSS, o UX/UI Designer precisa decidir explicitamente se a
  trilha Empreender adota o mesmo layout novo (recomendado, para
  consistência visual) ou se essa fase abre uma divergência proposital.
  Inclui decidir o comportamento em telas estreitas (mobile).
- **Ordem**: pode rodar em paralelo com a Fase 1; deve concluir antes da
  Fase 3.
- **Risco**: médio. Puramente visual/CSS (não toca `js/data.js` nem
  progresso salvo), mas é um algoritmo de posicionamento novo que precisa
  de teste real em várias larguras de tela.
- **RFCs estimadas**: 1 (podendo abrir uma 2ª de correção pontual).

#### Especificação do UX/UI Designer para a Fase 2 (2026-08-08)

Leitura prévia confirmada: `js/trail.js` (`render()`/`levelHtml()`), `css/style.css`
(seção "TRILHA ÚNICA (APRENDER)", linhas ~803-921) e `js/business.js`
(`render()`/`levelHtml()`, linhas ~74-133) — `business.js` reaproveita
literalmente as mesmas classes (`.trail`, `.trail-spine`, `.trail-spine-fill`,
`.trail-level`, `.trail-level-banner`, `.trail-level-ring`, `.trail-nodes`,
`.trail-node`, `.trail-node-ring`, `.trail-node-icon`, `.trail-node-label`,
`.trail-node-xp`), confirmado por leitura direta — nenhuma diferença de
markup entre as duas trilhas hoje.

##### Três conceitos

**Conceito A — Minimalista.** Grade simples 5×N com nós circulares neutros
(mesma cor de nível só na borda), conectores finos cinza que só ganham cor
quando concluídos, sem animação de entrada por nó (só o fade do nível
inteiro, como hoje). Rápido de implementar, mas some a fronteira entre "isso
é o PolvIn" e "isso é qualquer trilha de curso online com CSS Grid".

**Conceito B — Gamer** (referências: Clash Royale, Genshin, Duolingo). O
grid 5+2 vira literalmente um "mapa de mundo": conector é uma trilha grossa
com textura (gradiente dourado→roxo já usado em `--gold`/`--primary`, com
glow), nó atual pulsa mais forte e ganha um pequeno "pino de bandeira" (▲)
acima, cada nó novo revelado no scroll entra com stagger (nó a nó, não o
nível inteiro de uma vez) e um leve "pop" de escala, e as duas curvas do
zig-zag (onde a fileira horizontal vira vertical) recebem um pequeno ícone
de seta (↓/↑) sutil indicando o sentido do caminho. Reforça a leitura de
"tabuleiro de fase" em vez de "lista de cursos".

**Conceito C — Premium** (referências: Linear, Apple, Revolut). Grid mais
espaçoso, conectores finíssimos (2px) com gradiente sutil, nós com sombra
suave em vez de contorno grosso, tipografia menor e mais discreta, sem
setas nem pinos — a elegância vem do espaçamento e da curva de easing do
preenchimento, não de ornamento.

**Recomendação: Conceito B (Gamer), com o rigor de espaçamento do Conceito
C.** A filosofia do PolvIn é explícita — "pense como jogo, não como banco"
— e a trilha é a tela mais "cara de jogo" do produto (é literalmente um
mapa de fases). Um grid limpo sem identidade (Conceito A) falha o teste
"remova a logo e as cores, ainda é PolvIn?": qualquer app educacional pode
ter uma grade 5×2. O que torna isso reconhecidamente PolvIn é o conector
como "trilha física" com glow dourado, o stagger de revelação e o nó atual
com pino — combinado com espaçamento generoso e easing cuidadoso do
Conceito C para não parecer poluído. Abaixo, a especificação já incorpora
essa combinação (marcada onde é "essencial" vs. "polish/pode ficar para
uma RFC de correção pontual").

##### Algoritmo de posicionamento (grid 5+2 / 3+2)

Motivo de usar CSS Grid com posição calculada em JS, em vez de flexbox ou
posicionamento absoluto livre: o padrão pedido (5 horizontal → 2 vertical →
5 horizontal invertido → 2 vertical → repete) não é uma progressão
matemática simples de um único eixo (como o `--zig` atual, que só alterna
esquerda/direita por nó); é um caminho em "S" que precisa de duas
coordenadas (coluna, linha) por nó, e o número de lições por nível varia de
2 a 35. Grid com linhas/colunas explícitas — calculadas em JS a partir do
índice da lição dentro do nível — resolve isso sem depender de nenhum
framework novo, e mantém a mesma filosofia já usada no projeto (variáveis
CSS inline por nó, ex.: `style="--i:${i}"` em `renderQuizOverlay`).

**Constantes do bloco:**
- `COLS` = 5 (desktop/tablet, ≥641px) ou 3 (mobile, ≤640px — ver seção de
  responsividade). Vem de `window.matchMedia("(max-width: 640px)").matches`.
- `ROWS_PER_BLOCK` = `COLS + 2` (5 horizontal + 2 vertical = 7 nós por
  bloco no desktop; 3 + 2 = 5 nós por bloco no mobile).
- Cada bloco ocupa **3 "linhas de nó"**: 1 linha horizontal (os `COLS`
  primeiros nós do bloco, lado a lado) + 2 linhas verticais (os 2 últimos
  nós do bloco, empilhados na última coluna usada pela linha horizontal).

**Para cada lição, `i` = índice 0-based dentro do nível (`lessonIdx`):**

```js
const block = Math.floor(i / ROWS_PER_BLOCK);
const pos = i % ROWS_PER_BLOCK;              // posição dentro do bloco
const dir = block % 2 === 0 ? 1 : -1;        // 1 = esquerda→direita, -1 = invertido

let col, nodeRow;                             // nodeRow = índice 0-based da "linha de nó"
if (pos < COLS) {
  // parte horizontal do bloco
  col = dir === 1 ? pos : (COLS - 1 - pos);
  nodeRow = block * 3;
} else {
  // parte vertical do bloco (pos === COLS ou COLS+1) — mesma coluna
  // onde a linha horizontal terminou
  col = dir === 1 ? (COLS - 1) : 0;
  nodeRow = block * 3 + (pos - COLS + 1);     // +1 ou +2
}

// conversão para linhas do CSS Grid (1-based; tracks de nó ficam nos
// índices pares, tracks de conector nos ímpares — ver template abaixo)
const gridColumn = col * 2 + 1;
const gridRow = nodeRow * 2 + 1;
```

Isso vale **igual para qualquer tamanho de nível**: um nível de 2 lições
gera só `block=0`, `pos∈{0,1}`, uma única linha horizontal parcial (2
colunas usadas, sem parte vertical) — sem caso especial no código. Um
nível de 35 lições (desktop, `COLS=5`) fecha exatamente em 5 blocos
completos (35 = 5×7). Um nível de 18 lições (mobile, `COLS=3`,
`ROWS_PER_BLOCK=5`) gera 3 blocos completos + 1 bloco parcial de 3 nós.

**Conectores ("espinha" por nível):** para cada par consecutivo de lições
`(i, i+1)` no nível, existe um conector entre `pos[i]` e `pos[i+1]`.
Como o algoritmo acima nunca produz um salto diagonal (a coluna final da
parte vertical de um bloco é sempre a mesma coluna onde a parte horizontal
do próximo bloco começa), **todo conector é estritamente horizontal (mesma
`nodeRow`) ou estritamente vertical (mesma `col`)** — nunca diagonal. Isso
elimina a necessidade de SVG/`transform: rotate()`: cada conector é uma
`<div>` simples ocupando o track ímpar (de conector) entre os dois nós:

```js
// horizontal: mesma nodeRow, colunas adjacentes → conector no track de
// coluna ímpar entre elas, mesma linha do nó
gridColumn = (Math.min(colA, colB) * 2) + 2;
gridRow = nodeRowA * 2 + 1;

// vertical: mesma col, nodeRows adjacentes → conector no track de linha
// ímpar entre elas, mesma coluna do nó
gridColumn = col * 2 + 1;
gridRow = (Math.min(nodeRowA, nodeRowB) * 2) + 2;
```

##### Estrutura de grid e CSS

O container `.trail-nodes` (dentro de cada `.trail-level`) passa a ser um
CSS Grid com **tracks alternados de nó e de conector**, montados
dinamicamente pelo JS (porque tanto o número de colunas quanto o número de
linhas variam por nível/breakpoint — não dá para usar `repeat()` puro já
que nó e conector têm tamanhos diferentes):

```js
// exemplo para COLS = 5, montado 1x por render() de cada nível
const colTemplate = Array(COLS).fill("var(--tz-node-w)").join(" var(--tz-edge-w) ");
const numNodeRows = Math.max(...positions.map(p => p.nodeRow)) + 1;
const rowTemplate = Array(numNodeRows).fill("var(--tz-node-h)").join(" var(--tz-edge-h) ");
// <div class="trail-nodes" style="grid-template-columns:${colTemplate}; grid-template-rows:${rowTemplate};">
```

Cada nó e cada conector recebem `style="grid-column:${gridColumn} / span 1; grid-row:${gridRow} / span 1;"` inline (mesmo padrão de variáveis CSS
inline já usado no projeto, só que via `grid-column`/`grid-row` em vez de
custom property, porque o valor muda a estrutura do layout, não só uma
variável decorativa).

```css
/* =========================================================================
   TRILHA ÚNICA (APRENDER) — caminho em zig-zag horizontal (RFC-035 Fase 2)
   ========================================================================= */
:root {
  --tz-node-w: clamp(80px, 9vw, 128px);
  --tz-node-h: 150px;
  --tz-edge-w: clamp(32px, 4.4vw, 56px);
  --tz-edge-h: 40px;
}
@media (max-width: 640px) {
  :root {
    --tz-node-w: clamp(64px, 20vw, 84px);
    --tz-node-h: 150px;
    --tz-edge-w: clamp(20px, 6vw, 32px);
    --tz-edge-h: 32px;
  }
}

.trail-nodes {
  display: grid;
  justify-content: center;
  align-content: start;
  position: relative;
}

.trail-node {
  /* mantém ring/ícone/label/xp já existentes — remove só --zig, transform e
     nth-child(odd/even), que são o mecanismo antigo de zigue-zague leve */
  width: 100%;
  align-self: center;
  justify-self: center;
}
/* Nó atual ganha um "pino" além do já existente nodeBreathe — identidade
   Conceito B */
.trail-node.current::before {
  content: "▲";
  position: absolute;
  top: -14px; left: 50%; transform: translateX(-50%);
  color: var(--gold-dark);
  font-size: 13px;
  animation: pinBob 1.4s ease-in-out infinite;
}
@keyframes pinBob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

.trail-edge {
  align-self: center;
  justify-self: center;
  border-radius: 6px;
  background: var(--border);
  transition: background 0.4s ease, box-shadow 0.4s ease;
}
.trail-edge.horizontal { width: 100%; height: 6px; }
.trail-edge.vertical   { width: 6px; height: 100%; }
.trail-edge.done {
  background: linear-gradient(90deg, var(--gold), var(--primary));
  box-shadow: 0 0 10px rgba(232, 163, 61, 0.4);
}
.trail-edge.vertical.done { background: linear-gradient(180deg, var(--gold), var(--primary)); }
.trail-edge.current {
  background: linear-gradient(90deg, var(--border), var(--gold));
  animation: edgeFlow 1.6s ease-in-out infinite;
}
.trail-edge.vertical.current { background: linear-gradient(180deg, var(--border), var(--gold)); }
@keyframes edgeFlow {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

/* Revelação em stagger por nó (Conceito B) — cada .trail-node recebe
   style="--node-i:${lessonIdx}" inline; some no fade de nível já existente
   (.trail-level.visible), só atrasa cada nó individualmente */
.trail-node { opacity: 0; transform: scale(0.85); transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); transition-delay: calc(var(--node-i, 0) * 45ms); }
.trail-level.visible .trail-node { opacity: 1; transform: scale(1); }
```

O CSS antigo a remover: `--zig`, `transform: translateX(var(--zig))` (2
ocorrências: default e hover/active), e as regras
`.trail-nodes .trail-node:nth-child(odd/even)` (default + `@media
max-width:640px`) — todo esse mecanismo é substituído pelo posicionamento
de grid acima. `.trail-node:hover:not(.locked)`/`:active` mantêm o mesmo
espírito (leve `translateY`/`scale`), só sem o `translateX(var(--zig))`
que não existe mais.

##### Barra de progresso geral (substitui `.trail-spine`/`.trail-spine-fill`)

A "espinha" vertical única (`.trail-spine`/`.trail-spine-fill`) assumia um
caminho em coluna única — deixa de fazer sentido geometricamente quando os
nós se espalham em um grid 2D (uma barra reta vertical atravessando um
zig-zag horizontal ficaria visualmente desconectada dos nós). **Decisão
explícita**: remover os dois elementos e substituir por uma barra de
progresso geral horizontal, fixa no topo do container `.trail` (reaproveita
o `overallPct` já calculado em `Trail.render()`/`Business.render()` — não é
lógica nova, só um consumidor visual diferente do mesmo número):

```css
.trail-progress-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 8px;
  border-radius: 6px;
  background: var(--surface-2);
  margin-bottom: 22px;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.trail-progress-fill {
  height: 100%;
  width: 0;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--gold), var(--primary));
  box-shadow: 0 0 14px rgba(232, 163, 61, 0.45);
  animation: progressGrow 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes progressGrow { to { width: var(--target-pct, 0%); } }
```

Markup (troca direta no template de `render()` de `trail.js`/`business.js`,
mesma posição onde `.trail-spine`/`.trail-spine-fill` estão hoje):
`<div class="trail-progress-bar"><div class="trail-progress-fill" style="--target-pct:${overallPct}%"></div></div>`.
O `position: sticky` é o "scroll inteligente com propósito" exigido pela
filosofia de design: o usuário rola a trilha inteira e sempre vê quanto já
progrediu, sem precisar voltar ao topo — e o per-nível já tem seu próprio
indicador (`.trail-level-ring`, mantido sem alteração).

##### Responsividade — decisão explícita

**Breakpoint: 640px** (mesmo valor já usado em todo `style.css` para
`max-width`, incluindo o antigo bloco de `--zig` que está sendo removido —
não introduz um breakpoint novo no design system).

- **≥641px (desktop/tablet)**: `COLS = 5`, conforme pedido literal do
  usuário (5 horizontal → 2 vertical). Grid ocupa até ~880px de largura
  (5 × 128px nó + 4 × 56px conector, no teto do `clamp()`), centralizado —
  bem mais largo que o antigo limite de 480px do `.trail-level-banner`,
  cumprindo o "ocupar mais a largura da tela" pedido.
- **≤640px (mobile)**: `COLS = 3` (padrão adaptado: 3 horizontal → 2
  vertical → 3 horizontal invertido → 2 vertical). **Não** volta ao layout
  vertical antigo — motivo: (1) reverter uma tela para o layout anterior
  criaria dois "PolvIn" visualmente diferentes conforme o tamanho de tela,
  o que pesa contra a identidade única exigida pela filosofia de design;
  (2) o mesmo algoritmo genérico (seção acima) já suporta qualquer `COLS`,
  então a versão mobile não é uma tela nova a manter — é o mesmo código
  com uma constante diferente; (3) com `COLS=3` e os tamanhos de
  `--tz-node-w`/`--tz-edge-w` do breakpoint, a largura total mínima fica em
  torno de 3×64px + 2×20px = 232px, cabendo com folga mesmo em telas de
  320px com padding, mantendo alvo de toque de 68px no anel do nó
  (inalterado — só a largura do track diminui, não o tamanho do círculo
  clicável).
- **Troca de `COLS` em runtime**: `Trail.init()`/`Business.init()`
  registram `window.matchMedia("(max-width: 640px)").addEventListener("change", () => this.render())` uma única vez — cruzar o breakpoint (ex.: girar
  o celular, ou redimensionar uma janela desktop) re-renderiza a trilha com
  a nova estrutura de grid. Evita recalcular em todo evento de `resize`
  (custoso e desnecessário — só a travessia do breakpoint importa).

##### Decisão sobre `js/business.js` (trilha Empreender)

**A trilha Empreender adota o mesmo layout novo, sem divergência.**
Confirmado por leitura direta que `business.js` usa exatamente as mesmas
classes CSS que `trail.js` (`.trail`, `.trail-nodes`, `.trail-node`, etc.)
e o mesmo padrão de `render()`/`levelHtml()` — inclusive já calcula seu
próprio `overallPct` e renderiza `.trail-spine`/`.trail-spine-fill` hoje
(linhas 79-85 de `business.js`), então a troca pela `.trail-progress-bar`
se aplica igualmente. Manter as duas trilhas com a mesma linguagem visual é
o que já vale para todo o resto do design system do PolvIn (mesmos
`.trail-level-ring`, `.trail-node`, cores por `--level-color`); divergir
aqui criaria duas identidades de trilha dentro do mesmo produto sem
nenhum ganho de produto que justifique — a única diferença hoje entre as
duas é de conteúdo/ícone (💼 vs 📈/🇧🇷), não de layout, e deve continuar assim.

##### Acessibilidade / `prefers-reduced-motion`

Adicionar ao bloco `@media (prefers-reduced-motion: reduce)` já existente
(linha ~1872 de `style.css`), na mesma lista de seletores:

```css
.trail-node, .trail-edge.current, .trail-node.current::before, .trail-progress-fill {
  animation: none !important;
  transition-delay: 0s !important;
}
```

Efeito: o stagger de entrada por nó vira aparição imediata (mas o nó ainda
aparece com `opacity:1`/`scale(1)` — a identidade visual final é a mesma,
só sem o atraso escalonado); o pulso do conector "atual" (`edgeFlow`) e o
pino bobando (`pinBob`) ficam estáticos na opacidade/posição final (`0.55`→
mantém visível, não desaparece); a barra de progresso salta direto para o
valor final em vez de crescer. Nenhum desses cortes remove informação —
cor de "concluído" nos conectores, o pino no nó atual, e o valor da barra
continuam idênticos, só sem o movimento contínuo. Consistente com a regra
do projeto: reduzir intensidade, nunca identidade.

##### Checklist de implementação (Frontend Engineer)

- [x] `js/trail.js` e `js/business.js`: `levelHtml()`/`nodesHtml` passam a
      calcular `col`/`nodeRow` por lição (algoritmo acima) e gerar
      `grid-template-columns`/`grid-template-rows` inline em `.trail-nodes`,
      além de um `<div class="trail-edge ...">` por par consecutivo de
      lições. Nenhuma mudança em `isUnlocked`/`isDone`/`flatLessons` — só
      no HTML gerado.
  - [x] `COLS` lido de `matchMedia("(max-width: 640px)")` no início do
        `render()`; listener de `change` registrado 1x em `init()`.
  - [x] Cada `.trail-node` ganha `style="--node-i:${lessonIdx}; grid-column:...; grid-row:...;"`.
  - [x] `.trail-spine`/`.trail-spine-fill` (2 ocorrências, `trail.js` e
        `business.js`) trocados por `.trail-progress-bar`/`.trail-progress-fill`.
- [x] `css/style.css`: remover bloco antigo `--zig`/`nth-child(odd/even)`
      (linhas ~877-897), adicionar as regras novas desta seção (grid,
      `.trail-edge`, `.trail-progress-bar/fill`, `@keyframes pinBob`/`edgeFlow`/`progressGrow`), e as entradas em
      `@media (prefers-reduced-motion: reduce)`.
- [x] Testar visualmente em: nível de 2 lições, nível de 35 lições (maior
      já publicado), e a travessia do breakpoint 640px (redimensionar a
      janela) sem quebrar a estrutura do grid. Ver "Implementação — Frontend
      Engineer" abaixo para o método de teste e os bugs encontrados/corrigidos.
- [ ] QA Engineer valida que `isUnlocked()`/clique em nó ainda funcionam
      idênticos — este é um risco só de apresentação, mas a Fase 2 é
      explicitamente "não deve tocar em `js/data.js` nem progresso salvo"
      (ver Impacto/Riscos desta RFC). Ainda pendente — próxima etapa do
      workflow.

#### Implementação — Frontend Engineer (2026-08-08)

Implementado exatamente conforme a especificação acima — algoritmo de
posicionamento, breakpoint 640px, `COLS=5/3`, conectores estritamente
horizontais/verticais, barra de progresso geral substituindo
`.trail-spine`/`.trail-spine-fill`, `business.js` sem divergência de
layout — em `js/trail.js`, `js/business.js` e `css/style.css`. Nenhuma
mudança em `isUnlocked`/`isDone`/`flatLessons`/`js/data.js`, conforme
exigido. Checklist acima marcado como concluído.

**Validado ao vivo** (não só lido no código): servidor estático (`python -m
http.server`, disponível neste ambiente) + Chrome headless real via CDP
(`--remote-debugging-port`, controlado via WebSocket por um driver Python
próprio, já que Node não está disponível neste ambiente — mesmo
gotcha registrado no ROADMAP para uma sessão anterior de QA). Testado nos
3 cenários pedidos: nível pequeno (`hnivel1`, 2 lições — gera 1 linha
horizontal parcial, sem parte vertical, sem caso especial), nível grande
(`nivel1`, 35 lições — fecha em exatamente 5 blocos completos, "S"
contínuo confirmado por screenshot), e viewport mobile (375px, `COLS=3`)
vs. desktop (1400px, `COLS=5`). Verificação de sobreposição automatizada
via `getBoundingClientRect()` de todos os 120 nós da trilha unificada +
18 nós da trilha Empreender, nos dois breakpoints: **0 sobreposições**
depois dos ajustes abaixo (3 e 46, respectivamente, antes deles — ver
bug 1). Sem erros de console além de um aviso pré-existente e não
relacionado (deprecação do `three.js`, usado em `js/citypolvin3d.js`).

Três ajustes finos feitos durante a implementação, nenhum contradizendo
decisão de design já tomada — todos de "como implementar", não "o que
construir":

1. **Bug real encontrado no teste ao vivo — overflow vertical de título
   longo.** A especificação usava `--tz-node-h: 150px` como altura fixa de
   linha do grid. Com títulos de lição mais longos (`.trail-node-label`
   pode quebrar em 2-3 linhas dentro de um nó de ~124px de largura), a
   altura real do conteúdo passava de 150px, e como CSS Grid não recorta
   conteúdo que excede uma track de tamanho fixo, o texto vazava por cima
   da próxima linha de nós — sobreposição visual real, pior em mobile
   (track mais estreita → mais quebras de linha → 46 sobreposições
   medidas contra 3 em desktop). Corrigido trocando a altura da linha de
   nó de `var(--tz-node-h)` fixo para `minmax(var(--tz-node-h), auto)` em
   `gridHtml()` (`js/trail.js`/`js/business.js`) — mantém 150px como
   padrão (nenhuma mudança visual no caso comum, testado) e só cresce
   quando algum nó daquela linha realmente precisa, sem tocar em nenhuma
   das constantes/algoritmo definidos pelo UX/UI Designer.
2. **Bug real encontrado no teste ao vivo — pino do nó atual invisível.**
   `.trail-node.current::before` (o pino "▲", elemento essencial da
   identidade Conceito B) é posicionado com `top:-14px`, fora da própria
   caixa do nó. Mas `.trail-node` já tinha `overflow:hidden` — necessário
   para conter o efeito de ripple de clique (`Fx.ripple`, contrato
   documentado em `js/fx.js`: "o elemento precisa de position:relative e
   overflow:hidden para conter o efeito"). Overflow:hidden corta qualquer
   conteúdo que ultrapasse a própria caixa, incluindo pseudo-elementos
   posicionados para fora — o pino nunca aparecia (confirmado por
   screenshot antes/depois). Corrigido criando um wrapper interno
   `.trail-node-inner` que herda `overflow:hidden`/`border-radius:22px`/
   padding/flex do antigo `.trail-node` (mantendo o ripple contido do
   jeito que já era), enquanto `.trail-node` (o item de grid, agora com
   `overflow` padrão/visible) guarda só posicionamento, stagger de entrada
   e o pino. `Fx.ripple()` passou a ser chamado em
   `node.querySelector(".trail-node-inner")` em vez do próprio `node`, nos
   dois arquivos. Nenhuma mudança visual no ripple em si — só onde ele fica
   contido — e o pino passou a aparecer corretamente acima do anel
   dourado.
   - De quebra, achado durante o mesmo teste: `.trail-node.current
     .trail-node-ring { border-color: var(--gold); ... }` nunca vencia a
     cor de borda contra `.trail-node:not(.locked):not(.done)
     .trail-node-ring { border-color: var(--level-color); }` — as duas
     regras têm a MESMA especificidade CSS (0,4,0 cada, contando os dois
     `:not()`), e a ordem no arquivo favorecia a segunda para a propriedade
     `border-color` especificamente (o `box-shadow` do glow dourado, que só
     existe na regra do `.current`, sempre aparecia; só a cor da borda
     ficava "presa" na cor do nível). Bug pré-existente, anterior à Fase 2
     (confirmado: a regra é cópia literal do CSS original, não alterada por
     este trabalho) — corrigido com um ajuste mínimo de especificidade
     (`:not(.locked)` redundante adicionado ao seletor do `.current`, já
     que um nó atual nunca é bloqueado) para desempatar a favor do dourado,
     sem mudar nenhum comportamento de correspondência de seletor.
3. **`@keyframes nodeBreathe` referenciava `var(--zig)`.** Definida em
   outro trecho do arquivo (seção "Biblioteca de animações reutilizável"),
   usava `transform: translateX(var(--zig)) scale(...)` — `--zig` deixou
   de existir em `.trail-node` com a remoção do mecanismo antigo de
   zigue-zague. Sem correção, o valor de `transform` ficaria inválido
   nessa keyframe, quebrando a animação de "respirar" do nó atual (efeito
   silencioso, sem erro de console — só pego por busca textual por
   `--zig` em todo o repositório antes de finalizar, não pelo teste visual
   isolado). Corrigido removendo a referência: `transform: scale(...)`.
4. **Base do `.trail-progress-fill` ajustada de `width:0` para
   `width:var(--target-pct, 0%)`**, com `@keyframes progressGrow` ganhando
   um `from { width: 0; }` explícito. Motivo: sob `prefers-reduced-motion`,
   a regra de acessibilidade da especificação aplica `animation: none
   !important` ao preenchimento — sem essa mudança de base, a barra ficaria
   travada em 0% (a "largura sem animação" seria literalmente 0, o valor
   do CSS original) em vez de saltar direto para o valor final, como o
   texto da própria especificação já descrevia como efeito esperado.
   Validado ao vivo emulando `prefers-reduced-motion: reduce` via CDP: com
   34% de progresso simulado, `getComputedStyle(...).width` do
   preenchimento resolveu para exatamente 34% do container, com
   `animationName: "none"` confirmado — bateu com o valor exato simulado
   em todos os testes rodados. Nenhuma mudança visual no caminho normal
   (`prefers-reduced-motion: no-preference`) — o crescimento animado de 0%
   até o valor final continua idêntico, também validado ao vivo forçando
   essa preferência via CDP (Chrome headless neste ambiente casa com
   `prefers-reduced-motion: reduce` por padrão, o que só foi descoberto
   testando — sem essa emulação explícita nos dois sentidos, o caminho
   "normal"/animado nunca teria sido exercitado de verdade).

Também validado ao vivo, sem ajuste necessário: reset de
`transition-delay` no hover/clique (nó de índice alto não herda o atraso
de stagger da entrada — confirmado disparando um evento de mouse real via
CDP sobre o nó e lendo `getComputedStyle(...).transitionDelay` antes/depois,
não só inspecionando a regra CSS), e a travessia do breakpoint 640px via
`matchMedia("...").addEventListener("change", ...)` registrado em
`init()` de ambos os módulos.

### Fase 3 — Arquitetura e piloto do sistema de Revisão a cada 7 pontos
- **3A — Decisão de arquitetura**: definir o que é "7 pontos" (unificado
  vs. por trilha), o formato de dados do nó de revisão, como ele referencia
  as 7 lições anteriores, e como ele se encaixa em
  `isUnlocked`/`isDone`/XP sem repetir o bug histórico de destravamento
  por posição (Onda 9). Nenhum conteúdo é escrito aqui.
- **3B — Piloto em uma trilha pequena**: implementar o mecanismo completo
  numa trilha pequena — `HISTORY_COURSE` ou `BUSINESS_COURSE` (18 lições
  cada) — para validar antes de generalizar.
- **3C — Rollout para as demais trilhas**: aplicar o mecanismo validado.
- **Ordem**: depois da Fase 2 — última fase desta RFC (Fase 4 cancelada). Tecnicamente não depende
  do conteúdo já ter 15 perguntas.
- **Risco**: alto. Única fase que exige arquitetura de dados genuinamente
  nova e mexe na lógica de desbloqueio sequencial.
- **RFCs estimadas**: 3 (3A, 3B, 3C) — podendo virar mais.

### ~~Fase 4 — Ondas de Revisão de Conteúdo: 15 perguntas por lição (retroativo)~~ — CANCELADA
Cancelada em 2026-08-08 (ver nota de reconciliação no topo da RFC). Confirmado que cada lição já tem 10 perguntas-base reais, e o usuário confirmou que isso já é suficiente — não há expansão retroativa de quantidade de perguntas a fazer. O relato original de "2 questões" foi rastreado a um deploy hospedado desatualizado (não os arquivos locais/repositório), fora do escopo de código desta RFC.

### Estimativa total da iniciativa (revisada)
1 (esta RFC) + 1 (Fase 1) + 1-2 (Fase 2) + 3+ (Fase 3)
≈ **5 a 6 RFCs no total** — Fase 4 cancelada. Esta RFC-035 é o
documento-guarda-chuva (mesmo papel que a RFC-010 teve para a Cidade
Financeira), não a RFC de implementação de nenhuma parte.

## Riscos

- **Qualidade sacrificada por volume/pressa**: risco central, já sinalizado
  pelo próprio usuário. Mitigação: Ondas de Revisão pequenas e
  obrigatoriamente validadas pelo QA Engineer antes da próxima começar.
- **Regressão de destravamento sequencial**: inserir nós de revisão no
  meio da trilha repete o padrão de risco já materializado na Onda 9
  (RFC-028). Mitigação: reaproveitar a correção por contagem total já
  existente em `isUnlocked()`, testada especificamente em toda RFC da Fase 3.
- **Ambiguidade de schema não resolvida a tempo**: se a Fase 4 começar
  antes da decisão 4A, conteúdo já escrito pode precisar ser refeito.
- **Duração real da iniciativa mal calibrada com a expectativa do
  usuário**: esta é a maior iniciativa de conteúdo já aberta no projeto
  (mais RFCs estimadas que a Cidade Financeira inteira). Mitigação:
  comunicar esse tamanho agora.
- **Coexistência temporária de dois layouts**: se a Fase 2 não tratar
  `js/trail.js` e `js/business.js` como uma unidade, pode sobrar uma
  trilha com o layout novo e outra com o antigo por acidente.
- **Energia mais generosa acelera consumo de conteúdo**: 5 energias/dia
  permite terminar a trilha mais rápido do que ela cresce hoje.

## Registro por etapa

### 1. Product Owner
- **Resumo da etapa**: traduzido o pedido do usuário (4 mudanças, escopo
  retroativo confirmado, "15 perguntas" = soma confirmada) em um plano de
  4 fases ordenadas por risco, confirmando primeiro o comportamento real
  do código antes de propor qualquer mudança.
- **Decisões tomadas**:
  - Ordem das fases: Energia (1) e Layout (2) primeiro (contidas,
    reversíveis, podem rodar em paralelo) → Arquitetura+piloto de
    Revisão (3) → Ondas de Revisão de Conteúdo (4).
  - Fase 4 não é uma RFC única — é um programa de Ondas de Revisão, uma
    por trilha × nível, com teto de qualidade por Onda.
  - `js/business.js` compartilha CSS com `js/trail.js` — a Fase 2 precisa
    decidir explicitamente se aplica o layout novo às duas trilhas.
- **Pendências** (para as próximas etapas resolverem):
  - 4A: o que exatamente "5 perguntas novas" adiciona ao par
    base+variante existente.
  - 3A: se "7 pontos" conta a trilha unificada ou cada trilha
    separadamente.
  - 2: se a trilha Empreender adota o mesmo layout novo.
- **Riscos**: ver seção "Riscos" acima — destaque para o risco de
  qualidade por volume, a preocupação central expressa pelo usuário.
- **Próximo agente responsável**: depende da fase que o usuário priorizar.
  Recomendação: **Fase 1 (Energia)** primeiro, indo para
  **Gamification Designer** e depois **Frontend/Backend Engineer**;
  **Fase 2** pode rodar em paralelo, indo para **UX/UI Designer**.
  **Software Architect** só entra formalmente na Fase 3.

### 2. UX/UI Designer (Fase 2 — Layout zig-zag horizontal)
- **Resumo da etapa**: especificado o algoritmo completo de posicionamento
  em grid (coordenadas coluna/linha calculadas por lição, blocos de
  `COLS` horizontal + 2 vertical, `COLS`=5 desktop/3 mobile), o CSS de
  grid/conectores/animações, a substituição da `.trail-spine` vertical por
  uma barra de progresso geral horizontal `sticky`, e o comportamento de
  `prefers-reduced-motion` — tudo registrado na subseção "Especificação do
  UX/UI Designer para a Fase 2" dentro da Fase 2 acima, pronto para
  implementação sem ambiguidade.
- **Decisões tomadas**:
  - Três conceitos avaliados (Minimalista/Gamer/Premium) — recomendado e
    especificado o **Conceito B (Gamer)** com rigor de espaçamento do
    Conceito C: conector como "trilha física" com glow dourado, nó atual
    com pino animado, revelação em stagger por nó.
  - Algoritmo de grid único e genérico (mesma fórmula para 2 a 35 lições
    por nível, sem caso especial), com conectores sempre horizontais ou
    verticais (nunca diagonais), evitando SVG.
  - `js/business.js` (Empreender) **adota o mesmo layout novo, sem
    divergência** — resolve a pendência deixada pelo Product Owner.
  - Mobile (≤640px, mesmo breakpoint já usado em `style.css`): mantém o
    zig-zag com `COLS=3` (3 horizontal + 2 vertical) em vez de reverter ao
    layout vertical antigo — mesmo algoritmo, constante diferente.
  - `.trail-spine`/`.trail-spine-fill` (barra vertical única) removidos e
    substituídos por `.trail-progress-bar`/`.trail-progress-fill`
    (horizontal, `position: sticky` no topo) — reaproveita o `overallPct`
    já calculado em `render()`, sem lógica nova.
- **Pendências**: nenhuma em aberto para esta fase — especificação
  completa o suficiente para implementação direta. Fica para o Frontend
  Engineer sinalizar na sua etapa se algum ponto do algoritmo precisar de
  ajuste ao tocar o código real.
- **Riscos**: o principal risco desta fase (segundo o Product Owner) é a
  coexistência temporária de dois layouts entre `trail.js` e
  `business.js` — mitigado nesta especificação ao tratar as duas trilhas
  como uma unidade desde o desenho (mesma decisão, mesmo algoritmo, mesmo
  CSS, nenhuma bifurcação deixada implícita).
- **Próximo agente responsável**: Frontend Engineer (implementação do
  algoritmo/CSS especificado acima), seguido de QA Engineer (validação em
  nível de 2 lições, nível de 35 lições, e travessia do breakpoint 640px).

### 8. Frontend Engineer (Fase 2 — Layout zig-zag horizontal)
- **Resumo da etapa**: implementado o algoritmo de posicionamento, o CSS de
  grid/conectores/animações e a barra de progresso geral exatamente
  conforme a especificação do UX/UI Designer, em `js/trail.js`,
  `js/business.js` e `css/style.css` — detalhe completo em "Implementação —
  Frontend Engineer" dentro da Fase 2 acima. Validado ao vivo com servidor
  estático + Chrome headless real via CDP (Node indisponível neste
  ambiente; Python disponível, diferente de uma sessão anterior registrada
  no ROADMAP) nos 3 cenários pedidos, incluindo verificação automatizada de
  sobreposição de todos os nós renderizados nos dois breakpoints.
- **Decisões tomadas** (implementação, nenhuma de design):
  - Algoritmo de grid e geração de conectores extraídos para um método
    `gridHtml()` reaproveitado por `levelHtml()` em ambos os arquivos —
    duplicado entre `trail.js`/`business.js` (não um módulo compartilhado
    novo) seguindo o padrão de duplicação já estabelecido no projeto entre
    essas duas trilhas.
  - Altura de linha do grid trocada de `var(--tz-node-h)` fixo para
    `minmax(var(--tz-node-h), auto)` — corrige overflow real de títulos
    longos sem alterar nenhuma constante/algoritmo da especificação.
  - Novo wrapper `.trail-node-inner` (concentra o `overflow:hidden`
    exigido pelo ripple de clique) para o pino do nó atual parar de ser
    cortado por esse mesmo `overflow:hidden` — `.trail-node` em si passou a
    ter overflow padrão (visible).
  - Base do `.trail-progress-fill` ajustada para refletir o valor final
    diretamente (`width: var(--target-pct, 0%)` em vez de `0`), evitando
    que a barra ficasse travada em 0% sob `prefers-reduced-motion`.
  - Um bug de especificidade CSS pré-existente (não introduzido por esta
    fase) na cor de borda do anel do nó atual foi corrigido de passagem,
    por afetar diretamente a identidade visual central desta fase (nó
    atual em dourado).
- **Pendências**: nenhuma para esta fase. Os 4 ajustes acima estão
  documentados em detalhe (motivo, evidência, correção) na subseção
  "Implementação — Frontend Engineer".
- **Riscos**: mitigado o risco "coexistência temporária de dois layouts"
  (Product Owner/UX/UI Designer) — `trail.js` e `business.js` alterados
  juntos, no mesmo commit, mesma lógica.
- **Próximo agente responsável**: QA Engineer (validação independente do
  fluxo de clique/desbloqueio de lição sobre o novo layout, conforme já
  sinalizado pelo checklist da especificação).

### 9. QA Engineer (validação independente — Fase 1 Energia e Fase 2 Layout zig-zag)

**Metodologia.** Node/npm não estão disponíveis neste ambiente (confirmado por `command -v`); Python 3.14 e Chrome 151 estão. Montado o mesmo tipo de harness já usado pelo Frontend Engineer nesta RFC, com um driver CDP próprio em Python (`websocket-client`, já presente no ambiente) em vez do driver ad-hoc anterior — servidor estático (`python -m http.server` na raiz do projeto, porta 8899) + Chrome headless real (`--headless=new --remote-debugging-port=9333 --remote-allow-origins=*`) controlado via WebSocket/CDP (`Page.navigate`, `Runtime.evaluate`, `Emulation.*`, `Page.captureScreenshot`). Como o app real exige a cadeia de gates de autenticação Supabase (RFC-027) antes de renderizar qualquer tela — sem isso não dá para chegar na trilha só navegando o `index.html` de verdade — a validação usou um harness dedicado, temporário e **removido ao final** (`qa-trail-harness.html`, nunca commitado — confirmado por `git status` antes/depois), carregando os arquivos-fonte reais sem modificação (`data.js`, `storage.js`, `vault.js`, `supabase-config.js`, `cloud.js`, `fx.js`, `polvin.js`, `learn.js`, `energy.js`, `trail.js`, `business.js`, `achievements.js`, `city.js`, `citylife.js` etc., mesma ordem do `index.html`, excluindo só CDNs externos — Google/Supabase/Phaser/Three — e os módulos que dependem deles, irrelevantes para energia/trilha) com um HTML mínimo contendo os elementos reais (`#headerEnergy`, `#trailContainer`, `#businessTrailContainer`, `#academiaSubnav`) e um bootstrap manual (`Energy.init(); Trail.init(); Business.init();`) no lugar da cadeia de gates do `App.init()`. É teste do código real, não uma reimplementação — mesmo espírito do harness que o Frontend Engineer já tinha usado para a Fase 1. `js/supabase-config.js` foi conferido por leitura direta: contém só `SUPABASE_URL`/`SUPABASE_ANON_KEY` (chave `sb_publishable_...`, pública por design), **nenhuma chave secreta/`service_role`** — item de Segurança do checklist, sem achado.

Cada bloco de teste rodou em uma aba nova (estado limpo, `localStorage.clear()` quando aplicável), com `Runtime.enable`/`Page.enable` capturando `Runtime.exceptionThrown` e `Runtime.consoleAPICalled` do zero em cada aba, para contagem de erro real por cenário (não só uma checagem manual pontual).

#### Fase 1 — Energia

| # | Item do pedido | Resultado | Evidência |
| - | --- | --- | --- |
| 1 | `ENERGY_MAX = 5` em `js/energy.js`, `ENERGY_COMBO` continua `3` | **PASSOU** | `tab.eval("ENERGY_MAX")` → `5`; `tab.eval("ENERGY_COMBO")` → `3` |
| 2 | Sem "/3" residual em nenhum lugar | **PASSOU** | `grep -rn "3/3\|ENERGY_MAX"` em todo `.html`/`.js`/`.css` do repo: único ponto de definição é `js/energy.js:9`, nenhum literal `3/3` sobrou em `index.html` (já corrigido pelo Frontend Engineer para `5/5`) |
| 3a | `tryStart()` debita corretamente | **PASSOU** | 5 chamadas consecutivas a partir de energia cheia: `5→4→3→2→1→0`, todas com `ok:true`; 6ª chamada com energia 0 retorna `ok:false`, energia permanece `0` |
| 3b | Energia zerada bloqueia início e mostra o modal certo | **PASSOU** | Clique real no nó (não chamada direta a `Energy`) com energia 0 pré-carregada no `localStorage`: nenhum overlay de quiz é criado (`overlayCreated:false`), modal `.modal-overlay` aparece com o texto exato interpolando `5`/`3` (`ENERGY_MAX`/`ENERGY_COMBO`) |
| 3c | Combo (`ENERGY_COMBO=3`) ainda concede +1 energia | **PASSOU** | `registerAnswer(true,1)`, `registerAnswer(true,2)` sem efeito; `registerAnswer(true,3)` (múltiplo de 3) leva energia de `2→3` |
| 3d | Teto nunca excede `ENERGY_MAX` | **PASSOU** | `Energy.bonus(100)` a partir de energia cheia satura em `5`, não `105` |
| 3e | Reset por data | **PASSOU** | `ultimoReset` = ontem + `atual:0` → `Energy.get()` retorna `5` (reset completo, não parcial) |
| 4 | Nenhuma conquista/desafio/missão quebrada | **PASSOU** | `grep -rni "energ" js/achievements.js js/engagement.js` confirma zero referência à mecânica de energia (só menções de conteúdo, ex. "energia elétrica" em perguntas de `data.js`, sem relação); fluxo completo de lição (ver Fase 2 abaixo) dispara `Achievements.checkAll()` de ponta a ponta sem erro |

**Achado durante o teste, fora do escopo de Fase 1/2 (ver "Bugs encontrados" abaixo):** `Energy` nunca normaliza um saldo corrompido para fora do intervalo `[0, ENERGY_MAX]` — só a Fase 1 pediu explicitamente "nunca deixar o saldo negativo ou acima do máximo", então está registrado como bug, não como regressão desta RFC.

#### Fase 2 — Layout zig-zag horizontal

| # | Item do pedido | Resultado | Evidência |
| - | --- | --- | --- |
| 5 | Zig-zag horizontal visível em Aprender e Empreender (não mais vertical sinuoso) | **PASSOU** | Screenshots reais (viewport, não full-page — ver nota sobre artefato abaixo) em desktop e mobile confirmam o padrão "S": bloco de `COLS` nós horizontais, descida vertical de 2, bloco seguinte invertido, nas duas trilhas |
| 6a | Nível pequeno (2-3 lições) sem caso especial quebrado | **PASSOU** | `hnivel1`/`hnivel2`/`hnivel3` (2 lições cada, o menor de todo o conteúdo — confirmado por leitura de `COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE` via `tab.eval`) renderizam 1 linha horizontal parcial, sem parte vertical, 0 sobreposição |
| 6b | Nível grande (30+ lições) sem sobreposição | **PASSOU** | `nivel1` (**35** lições, o maior nível publicado, confirmado) renderiza o "S" completo (5 blocos completos em desktop) sem sobreposição |
| 6c | Verificação de sobreposição em todos os nós | **PASSOU** | `getBoundingClientRect()` de todos os nós de `#trailContainer` (**120** nós) e `#businessTrailContainer` (**18** nós), checando interseção de retângulos par a par: **0 sobreposições** em desktop e **0 em mobile** — mesmas contagens (120/18) reportadas pelo Frontend Engineer, batendo |
| 7 | `COLS=5` desktop / `COLS=3` mobile, breakpoint 640px, sem quebra visual | **PASSOU** | `Trail.cols()`/`Business.cols()` retornam `5` em 1400px e `3` em 375px; `document.documentElement.scrollWidth === window.innerWidth` em mobile (sem overflow horizontal/scroll lateral) |
| 8 | Clique em nó real abre o quiz corretamente | **PASSOU** | Clique real (`node.click()`, disparando o listener de produção, não uma chamada direta a `startLesson`) no nó atual abre a tela de introdução (`storyContinueBtn`/`businessContinueBtn`); "Continuar" abre o quiz com as opções corretas (`data-idx` mapeado certo); respondendo a pergunta 1 errada de propósito confirma o caminho de variante (`onVariant:true`, pergunta trocada pela `variante` real da lição); completando a lição com respostas corretas dispara a tela de conclusão, grava progresso, concede XP (+20, bate com `lesson.xp`) e +5 moedas — testado nas duas trilhas (Aprender e Empreender) |
| 9a | `isUnlocked()` sem regressão — nó 0 destravado, nó 1 bloqueado | **PASSOU** | Estado limpo: nó `data-lesson="0"` sem `.locked` e com `.current`; nó `data-lesson="1"` com `.locked` |
| 9b | Clique em nó bloqueado não faz nada | **PASSOU** | `node.locked.click()` não cria overlay de quiz nenhum (o listener só é vinculado a `.trail-node:not(.locked)` em `render()`, nó bloqueado não tem listener) — confirmado sem erro de console |
| 9c | Destravamento em cascata após concluir uma lição | **PASSOU** | Depois de concluir a lição 0 com sucesso, o nó 1 perde `.locked` e ganha `.current` — testado nas duas trilhas |
| 10a | Overflow de título longo corrigido | **PASSOU** | Títulos de 2-4 linhas (ex. "Ativo x passivo: o que realmente aumenta seu patrimônio", "Custo de oportunidade: o que você abre mão ao escolher algo") renderizam por completo dentro do nó sem vazar sobre a linha seguinte, em desktop e mobile — confirmado por screenshot |
| 10b | Pino do nó atual visível (não cortado) | **PASSOU** | `getComputedStyle(current, "::before")` confirma `content:"▲"`, `top:-14px`, renderizado fora da caixa antiga sem ser cortado — visível em todos os screenshots do nó atual |
| 10c | Anel dourado do nó atual vence a cor do nível | **PASSOU** | `getComputedStyle(ring).borderColor` do nó atual resolve para `rgb(232, 163, 61)` (`--gold`), não a cor do nível |
| 10d | `nodeBreathe` não referencia mais `--zig` | **PASSOU** | `grep -n "nodeBreathe" -A4 css/style.css`: `transform: scale(...)` puro; `grep -n "\-\-zig" css/style.css`: só sobra em 2 comentários explicativos, nenhum uso ativo |
| 11 | Zero erro de console em todos os cenários | **PASSOU** (após 1 falso positivo do próprio harness, corrigido — ver abaixo) | `Runtime.exceptionThrown`/console `error` monitorados do zero em cada aba: 0 exceções em todos os fluxos de energia, todos os cenários de layout/overlap, e nos fluxos completos de lição (Aprender e Empreender) na versão final do harness |

**Falso positivo descartado (não é bug do produto — registrado por transparência do processo).** Ao completar uma lição em `js/business.js`, `Achievements.checkAll()` lançou `ReferenceError: CityLife is not defined`. Investigado e confirmado como lacuna do harness de QA, não do app: a primeira versão do harness não carregava `js/city.js`/`js/citylife.js` (excluídos por engano junto com os módulos que dependem de Phaser/Three, quando na verdade só `citygame.js`/`citypolvin3d.js` precisam desses). Adicionados os dois arquivos ao harness (confirmado por `grep` que nenhum dos dois referencia `Phaser`/`THREE`) e o erro desapareceu — mas persistiu uma vez a mais mesmo depois de adicionar os scripts, rastreado a cache HTTP do Chrome servindo a versão antiga do harness (`Network.setCacheDisabled` resolveu). Com `js/city.js`/`js/citylife.js` carregados e cache desabilitado, 0 exceções. Não é um bug de `trail.js`/`business.js`/`energy.js` nem uma regressão desta RFC — é mencionado aqui só para deixar claro que o item 11 foi investigado a fundo, não apenas marcado como "passou" sem checar o primeiro sinal de erro que apareceu.

**Nota sobre método de screenshot.** `Page.captureScreenshot` com `captureBeyondViewport:true` (full-page) em páginas muito altas (a trilha unificada renderizada por completo passa de 12500px) produziu capturas com trechos em branco onde o DOM comprovadamente tinha conteúdo visível e opacidade 1 (confirmado por `getBoundingClientRect`/`getComputedStyle` no mesmo estado) — um artefato conhecido de captura full-page do Chrome headless em documentos muito longos combinados com elemento `position:sticky` (`.trail-progress-bar`), não um bug de renderização real. Descartado ao comparar contra screenshots de viewport único com `scrollIntoView`/`scrollTo`, que mostraram o conteúdo completo e correto no mesmo estado de DOM. Toda validação visual final deste relatório usa screenshots de viewport (não full-page).

#### Bugs encontrados

**Bug 1 — Energia não normaliza saldo fora do intervalo `[0, ENERGY_MAX]`.**
- **Gravidade**: baixa. Não é uma regressão desta RFC (o comportamento já era assim com `ENERGY_MAX=3`) nem é alcançável pelo fluxo normal do app — `spend()` já tem guarda (`if (e.atual <= 0) return false`) e `bonus()` já usa `Math.min(ENERGY_MAX, ...)`, então nenhum caminho de código hoje consegue produzir um valor fora do intervalo. Só é alcançável por corrupção externa do dado salvo (edição manual de `localStorage`/DevTools, ou um payload malformado vindo de sincronização com a nuvem).
- **Como reproduzir**: `Store.set(STORAGE_KEYS.ENERGY, {atual: -3, ultimoReset: new Date().toDateString()})` seguido de `Energy.get()` → retorna `-3` (não `0`); `Energy.tryStart()` corretamente recusa iniciar (`ok:false`), mas o saldo negativo nunca é corrigido para `0` — fica "preso" negativo até o próximo reset de data.
- **Sugestão**: em `Energy.ensureFresh()` (`js/energy.js`), depois de ler `e` do `Store`, adicionar um clamp defensivo (`e.atual = Math.max(0, Math.min(ENERGY_MAX, e.atual))`) antes de decidir se reseta por data — sozinho já cobre os dois lados do intervalo pedido no critério de aceite ("nunca deixar o saldo ficar negativo ou acima do máximo"), sem mudar nenhum outro comportamento. Encaminhar para **Frontend/Backend Engineer**; não bloqueia o fechamento desta RFC (baixa gravidade, sem caminho de reprodução dentro do app real), mas vale registrar como item de dívida técnica pequena, já que o critério foi citado explicitamente.

Nenhum outro bug encontrado nas Fases 1 e 2. Cobertura desta rodada: os 11 itens pedidos nesta validação (energia — consumo/bloqueio/combo/teto/reset/conquistas; layout — visual em duas trilhas, nível pequeno e grande, dois breakpoints, clique real, `isUnlocked`, os 4 ajustes já relatados pelo Frontend Engineer, zero erro de console), mais os itens de Segurança (chave do Supabase) e Regressão (grep de `--zig`/`3/3`/`ENERGY_MAX` residual) do checklist padrão do QA Engineer. **Não testado nesta rodada** (fora do escopo desta validação, não pedido): Fase 3 (sistema de revisão a cada 7 pontos) — ainda não implementada nesta RFC; testes de acessibilidade além do `prefers-reduced-motion` já verificado (leitor de tela, navegação por teclado); performance de carregamento do `index.html` completo (não foi possível medir contra o app real por causa do gate de autenticação — só o harness isolado, que não é representativo do peso real de todos os módulos).

#### Veredito final

**Fase 1 (Energia): aprovada, sem ressalvas de gravidade média/alta/crítica.** Todos os itens pedidos passaram. Único achado (Bug 1) é pré-existente, de gravidade baixa, sem caminho de exploração dentro do app real, e não é uma regressão introduzida por esta fase — registrado por completude, já que o critério de aceite da RFC menciona explicitamente "nunca... negativo ou acima do máximo".

**Fase 2 (Layout zig-zag horizontal): aprovada, sem ressalvas.** Os 4 bugs que o próprio Frontend Engineer relatou ter corrigido durante a implementação foram todos re-verificados de forma independente (não apenas relidos) e confirmados corrigidos de fato: overflow de título longo, pino do nó atual, anel dourado do nó atual, e a keyframe `nodeBreathe`. Algoritmo de posicionamento validado nos dois extremos de tamanho de nível (2 e 35 lições), nos dois breakpoints (`COLS=3`/`COLS=5`), nas duas trilhas (Aprender/Empreender), com clique real e `isUnlocked()`/desbloqueio em cascata funcionando sem regressão, e zero erro de console genuíno do produto (o único erro observado foi rastreado a uma lacuna do próprio harness de teste, não do código do app).

**Próximo agente responsável**: Documentation Specialist (`CHANGELOG.md`), para fechar as Fases 1 e 2 desta RFC como "concluídas"; Frontend/Backend Engineer, opcionalmente, para o clamp defensivo do Bug 1 (baixa prioridade, pode entrar em qualquer momento futuro, inclusive fora desta RFC).

### 11. Documentation Specialist (fechamento de Fases 1 e 2)

- **Resumo da etapa**: consolidada em `CHANGELOG.md` uma nova entrada
  **v1.55.0** cobrindo a Fase 1 (energia 3→5, incluindo a decisão de
  manter `ENERGY_COMBO=3` e o reset diário binário) e a Fase 2 (layout
  zig-zag horizontal, algoritmo de grid, breakpoint 640px, barra de
  progresso `sticky`, identidade Conceito B, e os 3 ajustes finos do
  Frontend Engineer), em `### Adicionado`, mais uma entrada em
  `### Corrigido` para o clamp defensivo de saldo de energia corrompido
  (Bug 1 do QA Engineer, já resolvido pelo usuário antes desta etapa).
  `README.md` revisado e corrigido em dois pontos que descreviam o
  estado antigo: o comentário de `energy.js` na árvore de arquivos
  (`3/dia` → `5/dia`, com nota de que veio da RFC-035 Fase 1) e o
  comentário de `trail.js`/`business.js` na mesma árvore, além do bullet
  "Caminho sinuoso e animado" na seção "Gamificação" — reescrito como
  "Zig-zag horizontal e animado", descrevendo o grid em "S"
  (`COLS=5`/`3`), a barra de progresso `sticky` no lugar da antiga
  "espinha" vertical, o pino do nó atual e a aplicação idêntica às
  trilhas Aprender e Empreender. `ROADMAP.md` conferido por busca textual
  (`RFC-035`, `ENERGY_MAX`, `zig-zag`, `zigue-zague`, "reformulação"/
  "trilha de aprendizado"): **nenhuma ocorrência** — as Fases 1/2 desta
  RFC nunca chegaram a ser listadas lá como pendência, então não há nada
  a marcar como concluído nesse arquivo (o `ROADMAP.md` já tratava a
  identidade visual/layout como uma trilha separada de RFCs numeradas,
  e RFC-035 não havia sido inserida nessa lista antes de ser concluída).
- **Decisões tomadas**:
  - Entrada única de CHANGELOG (v1.55.0) para as duas fases, já que foram
    entregues e aprovadas juntas na mesma rodada de QA — consistente com
    o padrão do projeto de uma versão por rodada de entrega coesa, não
    necessariamente uma versão por fase isolada.
  - O clamp defensivo (Bug 1 do QA) registrado em `### Corrigido`, não em
    `### Adicionado`, por ser uma correção de robustez sobre um
    comportamento já existente (`ensureFresh()`), não uma capacidade nova
    visível ao usuário.
  - Adicionado um campo **Status** por fase (Fase 1 e Fase 2, acima nesta
    RFC) marcando cada uma como "concluída" com data e referência cruzada
    ao veredito do QA e à versão do CHANGELOG — o documento não tinha
    esse campo por fase antes, só o `Status` geral da RFC no topo.
  - Status geral da RFC **mantido como "em andamento"** (não alterado
    para "concluída") porque a Fase 3 (arquitetura e piloto do sistema de
    revisão a cada 7 pontos) ainda não começou — só quando a Fase 3
    (3A/3B/3C) fechar é que esta RFC-guarda-chuva deve virar "concluída"
    por completo.
- **Pendências**: nenhuma para o escopo desta etapa (Fases 1 e 2). Fica
  para quando a Fase 3 for concluída: adicionar sua própria entrada de
  CHANGELOG, revisar `README.md`/`ROADMAP.md` quanto ao sistema de
  revisão periódica, e então sim atualizar o `Status` geral desta RFC
  para "concluída".
- **Riscos**: nenhum novo introduzido por esta etapa — só documentação.
- **Próximo agente responsável**: nenhum imediatamente — commit e tag
  SemVer (v1.55.0) ficam a cargo do usuário/DevOps Engineer fora desta
  etapa. Quando a Fase 3 desta RFC começar, o Software Architect é o
  próximo agente do workflow (ver "Fase 3 — Arquitetura e piloto do
  sistema de Revisão a cada 7 pontos" acima).

### 12. Software Architect (Fase 3A — Decisão de arquitetura da Revisão a cada 7 pontos)

Leitura prévia confirmada por leitura direta do código real (não só desta RFC):
`js/data.js` (estrutura de `COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE`, shape de
nível e de lição), `js/trail.js` (`levels()`, `flatLessons()`, `isDone()`,
`isUnlocked()`, `levelHtml()`, `gridHtml()`, `startLesson()` →
`renderQuizOverlay()`/`answerQuestion()`/`finishLesson()`), `js/business.js`
(mesmo conjunto de métodos, duplicado sem módulo compartilhado — padrão já
estabelecido desde a Fase 2), `index.html` (ordem de `<script>`), e um grep de
`COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE` em todo `js/*.js` para mapear quem
mais lê esses arrays além de `trail.js`/`business.js`.

#### 1. "7 pontos": unificado para Aprender, separado para Empreender

**Decisão: para a aba Aprender (Financeira + História), "7 pontos" conta na
sequência UNIFICADA de `Trail.flatLessons()` — não separadamente por fonte.
Para a aba Empreender, conta separadamente, na própria sequência de
`Business.flatLessons()` (`BUSINESS_COURSE`), como a RFC já antecipava.**

Motivo: `Trail.isUnlocked(flatIdx)` já trata a trilha inteira (Financeira +
História intercaladas por `levels()`) como UM caminho sequencial só — o
destravamento hoje compara `doneCount` (contagem total de lições concluídas,
das duas fontes somadas) contra `flatIdx` (posição na sequência unificada),
não duas contagens paralelas por fonte. Contar "7 pontos" separadamente por
fonte exigiria introduzir uma segunda noção de posição/contagem que não
existe hoje em lugar nenhum do sistema de destravamento, só para a Revisão —
uma divergência estrutural nova sem necessidade. Além disso, desde a Fase 2
(zig-zag horizontal) o usuário vê literalmente UM caminho contínuo na tela
(grid único por nível, barra de progresso geral única no topo) — "os últimos
7 pontos da trilha", na percepção de quem usa o produto, são os últimos 7
nós que a pessoa clicou, não "os últimos 7 nós de financeira E também os
últimos 7 de história, separadamente". Contagem unificada é a leitura mais
fiel ao pedido original do usuário e a que exige menos código novo.

Empreender permanece separado porque já é uma trilha à parte hoje — nunca
passa por `Trail.flatLessons()`, tem seu próprio `Business.flatLessons()`/
`isUnlocked()`/progresso (`STORAGE_KEYS.BUSINESS_PROGRESS`) — misturá-la à
contagem unificada de Aprender exigiria uma refatoração muito maior (unificar
as duas trilhas em uma trilha única de verdade), fora do escopo desta fase e
não pedida pelo usuário.

#### 2. Formato de dados do nó de revisão

**Decisão: o nó de revisão é uma entrada com o MESMO shape de uma lição
normal, marcada por um campo `tipo: "revisao"`, inserida dentro do array
`licoes` de um nível** — não uma estrutura paralela. Isso não é só
conveniência: é o que faz `isUnlocked`/`isDone`/XP/o fluxo de quiz inteiro
funcionarem SEM NENHUMA mudança de código, porque `flatLessons()`,
`levelHtml()`, `gridHtml()`, `startLesson()`, `renderQuizOverlay()`,
`answerQuestion()` e `finishLesson()` já tratam todo elemento de
`level.licoes` genericamente como "uma lição com `id`/`titulo`/`xp`/
`perguntas`" — nenhum desses métodos hoje distingue lições por conteúdo, só
por posição/estado (`done`/`unlocked`/`isCurrent`). Uma estrutura paralela
(ex.: um array `REVIEWS` renderizado por um caminho de código separado)
duplicaria toda essa lógica sem necessidade e criaria uma segunda forma de
"iniciar uma lição" para manter sincronizada com a primeira para sempre.

Exemplo de objeto (Aprender, unificado — note que as 7 lições referenciadas
podem vir de fontes diferentes, já que a contagem é unificada):

```js
// Novo array em js/data.js, ao lado de COURSE/HISTORY_COURSE/BUSINESS_COURSE.
// Cada entrada é UMA revisão, na ordem em que devem aparecer na trilha.
const COURSE_REVIEWS = [
  {
    id: "revU_01",              // convenção: revU_<contador 2 dígitos> (unificada);
                                 // revE_<contador> para Empreender (ver COURSE_REVIEWS
                                 // vs BUSINESS_REVIEWS abaixo)
    tipo: "revisao",
    titulo: "Revisão: seus últimos 7 pontos",
    xp: 20,                     // valor a confirmar com o Gamification Designer
    // aula (opcional): mesmo campo usado por lições normais para mostrar uma
    // tela de intro antes do quiz (startLesson() já checa `lesson.conto ||
    // lesson.aula` — se omitido, vai direto pro quiz, sem mudança de código)
    aula: [
      "Vamos revisar o que você aprendeu nos últimos 7 pontos da trilha..."
    ],
    // as 7 lições cobertas, por ID EXPLÍCITO — nunca por posição numérica.
    // é o "anchor" usado para calcular ONDE este nó é inserido (ver seção 3)
    refLessonIds: ["f1_01", "f1_02", "f1_03", "f1_04", "l1_1", "f1_05", "f1_06"],
    // MESMO shape de lesson.perguntas — array fixo, autoral, não computado
    // em tempo de execução (ver seção 6 sobre a recomendação de conteúdo)
    perguntas: [
      { pergunta: "...", opcoes: ["...", "...", "...", "..."], correta: 1, explicacao: "...", variante: { /* opcional, mesmo shape */ } },
      // ... até 10 perguntas
    ],
  },
  // revU_02 referenciando as próximas 7, etc.
];

const BUSINESS_REVIEWS = [
  { id: "revE_01", tipo: "revisao", titulo: "Revisão: Empreender", xp: 20, refLessonIds: ["e1_1", "e1_2", /* ...7 ids de BUSINESS_COURSE */], perguntas: [ /* ... */ ] },
];
```

Por que `refLessonIds` explícito em vez de calculado (ex.: "os 7 antes desta
posição")? Porque a POSIÇÃO na trilha muda toda vez que uma Onda nova é
publicada (conteúdo é anexado, às vezes no meio de um nível existente — ver
histórico de `HISTORY_COURSE`/`COURSE` intercaladas por nível desde o início).
Ancorar por ID, não por posição, é exatamente a mesma lição já aprendida na
Onda 9/RFC-028 para `isUnlocked()`: nunca confiar em "a N-ésima posição",
sempre confiar em identidade de conteúdo. Um efeito colateral desejado:
`refLessonIds` também documenta, de forma legível por qualquer agente futuro
(inclusive o Financial Specialist escrevendo as perguntas), exatamente quais
7 lições aquela revisão cobre, sem precisar recalcular nada.

#### 3. Como o nó de revisão referencia e se insere na sequência

**Mecanismo de inserção: ancorado por ID, computado em `Trail.levels()`/
`Business` (equivalente), NUNCA hardcoded como índice numérico.** Ao montar a
lista de lições de um nível, para cada lição processada, verifica-se se
existe uma entrada em `COURSE_REVIEWS`/`BUSINESS_REVIEWS` cujo
`refLessonIds[6]` (a última das 7 referenciadas) é igual ao `id` dessa lição
— se sim, o nó de revisão é inserido imediatamente depois dela no array de
`licoes` daquele nível (mesmo array que alimenta `gridHtml()`, logo o
algoritmo de grid da Fase 2 não precisa de NENHUMA mudança — ele já trata
qualquer elemento de `licoes` uniformemente).

Consequências importantes desse mecanismo:
- **Não depende de limites de nível.** Como a contagem é sobre a sequência
  FLAT (todas as lições de todos os níveis, na ordem), um bloco de 7 pode
  terminar no meio de um nível — o nó de revisão simplesmente é inserido
  como "mais um elemento" do array `licoes` daquele nível, no meio dele. O
  algoritmo de grid (`gridHtml()`) já lida com qualquer tamanho de nível sem
  caso especial (validado na Fase 2 para níveis de 2 a 35 lições) — um nível
  que ganha +1 nó (a revisão) continua sendo só "um nível com N+1 lições",
  sem mudança de algoritmo.
- **Uma revisão só aparece quando as 7 lições que ela cobre já existem** —
  se `refLessonIds[6]` ainda não foi publicado (Onda futura), a busca não
  encontra o anchor e a revisão simplesmente não é inserida ainda. Isso é
  uma trava de segurança automática: nunca é possível uma revisão aparecer
  "antes da hora".
- **Reviews nunca contam para o próximo bloco de 7.** A contagem/anchoring é
  sempre sobre o conteúdo ORIGINAL de `COURSE`/`HISTORY_COURSE`/
  `BUSINESS_COURSE` (arrays que a Fase 3 não deve alterar em conteúdo, só
  ler) — `COURSE_REVIEWS`/`BUSINESS_REVIEWS` referenciam ids de lições reais
  por construção, nunca ids de outra revisão. Evita qualquer risco de cadeia
  de revisões se auto-referenciando.
- **Risco explícito de mutação compartilhada — atenção do Backend/Frontend
  Engineer na Fase 3B.** `Trail.levels()` hoje faz `{ ...lvl, fonte }` para
  cada nível — um shallow clone do OBJETO nível, mas `lvl.licoes` continua
  sendo a MESMA referência de array que está dentro do `COURSE`/
  `HISTORY_COURSE` originais (spread raso não clona arrays aninhados). Ao
  implementar a inserção (`splice`/similar), é **obrigatório clonar o array
  também** (`licoes: [...lvl.licoes]`) antes de inserir a revisão — caso
  contrário a inserção muta os arrays canônicos `COURSE`/`HISTORY_COURSE`/
  `BUSINESS_COURSE` de `js/data.js` em tempo de execução, e isso vaza para
  todo módulo que lê esses globais diretamente (ver próxima seção).

#### 4. `isUnlocked()`/`isDone()`/`doneCount`/XP — zero mudança de lógica

Por o nó de revisão ser shape-idêntico a uma lição normal e viver dentro do
mesmo array `licoes` que `flatLessons()` já itera, **nenhuma linha de
`isDone()`, `isUnlocked()` ou `nextEntry()` precisa mudar** — eles continuam
tratando cada entrada do `flatLessons()` genericamente, revisão incluída:
- `isDone(entry)`: `!!progress[entry.lesson.id]` — o `id` da revisão (ex.
  `"revU_01"`) vira só mais uma chave no MESMO objeto de progresso
  (`COURSE_PROGRESS`/`HISTORY_PROGRESS`, dependendo de qual nível a revisão
  foi inserida; `BUSINESS_PROGRESS` para Empreender). **Nenhuma
  `STORAGE_KEYS` nova é necessária.**
- `isUnlocked(flatIdx)`: continua comparando `doneCount` total (agora
  incluindo revisões já concluídas) contra `flatIdx` — exatamente o mesmo
  mecanismo pós-Onda-9 que já generaliza para qualquer inserção no meio da
  trilha. **Este é o motivo mais forte para desenhar a revisão como "mais
  uma entrada no array" em vez de qualquer outra estrutura**: o bug histórico
  da Onda 9 era destravar por POSIÇÃO relativa; a correção já em produção
  destrava por CONTAGEM total; inserir a revisão como entrada regular do
  array é o caso exato que essa correção foi feita para suportar.
- XP/moedas/`LESSON_LOG`: `finishLesson()` não distingue tipos de lição —
  concluir uma revisão concede `lesson.xp`, +5 moedas, e grava uma entrada em
  `STORAGE_KEYS.LESSON_LOG`, exatamente como qualquer lição. **Efeito
  colateral a confirmar explicitamente com o Gamification Designer na Fase
  3B, não assumido aqui como certo**: isso significa que concluir uma
  revisão automaticamente conta para a missão semanal "complete N lições"
  (que lê `LESSON_LOG`) e para o gatilho de história interativa a cada 3
  lições financeiras concluídas (`maybePickStory()`, que conta
  `Object.keys(progress).length` sobre `COURSE_PROGRESS` — revisões
  inseridas em níveis `fonte:"financeira"` entram nessa contagem também).
  Nenhuma dessas é uma regressão — é um comportamento novo decorrente de
  reaproveitar o código, que precisa de uma decisão explícita de "sim,
  queremos isso" em vez de acontecer sem ninguém ter decidido.

#### 5. Risco cross-módulo: quem mais lê `COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE` diretamente

Grep confirma que, além de `trail.js`/`business.js`, mais **5 arquivos** leem
esses três globais diretamente: `achievements.js` (ex.: linha 24,
`COURSE.every((lvl) => lvl.licoes.every((l) => !!progress[l.id]))` para a
conquista "completou toda a trilha financeira"), `progression.js`,
`events.js`, `career.js`, `citylife.js`.

**Decisão explícita desta fase: a inserção de revisões (seção 3) NÃO deve
mutar os arrays canônicos `COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE`** —
por isso o clone obrigatório de `licoes` citado acima. Consequência
aceita e deliberada: enquanto isso não for revisto, **revisões NÃO contam**
para conquistas/progressão/eventos/carreira/CityLife que leem esses arrays
diretamente (ex.: "completou toda a trilha financeira" continua exigindo só
as lições reais, não as revisões) — só contam para o próprio sistema de
desbloqueio sequencial e XP/moedas/missão semanal de `trail.js`/`business.js`
(seção 4). Justificativa: manter o raio de impacto desta fase contido a
`js/data.js` (só arrays novos) + `js/trail.js` + `js/business.js`, sem
alterar silenciosamente o comportamento de 5 outros módulos como efeito
colateral de uma mudança que, no papel, é "só a trilha". Se o Gamification
Designer/Product Owner decidir que revisões DEVEM contar para essas
conquistas também, isso é uma decisão explícita e uma mudança adicional e
rastreável nesses 5 arquivos na Fase 3B — não algo implícito na Fase 3A.

#### 6. Conteúdo das 10 perguntas: recomendação de caminho (decisão final é do Financial Specialist)

Estruturalmente, `perguntas` da revisão é um array fixo, autoral, do MESMO
shape de `lesson.perguntas` — isso não muda seja qual for a origem do
conteúdo. A escolha entre "reaproveitar" e "escrever perguntas novas" é uma
decisão de CONTEÚDO (Financial Specialist), não de arquitetura, mas a
recomendação estrutural é clara: **array autoral fixo, nunca selecionado/
sorteado em tempo de execução a partir das 7 lições referenciadas.** Motivo:
uma seleção em runtime (ex.: "sorteia 10 das ~14 perguntas base+variante
disponíveis nas 7 lições") introduziria um novo mecanismo de geração de quiz
que não existe hoje em lugar nenhum do código, quebraria a previsibilidade
que o QA Engineer depende para validar ("a revisão X mostra sempre as
mesmas perguntas Y" é testável; "a revisão X mostra 10 de um pool
variável" não é, sem reescrever o harness de teste), e o próprio usuário
pediu explicitamente clareza/ausência de ambiguidade — conteúdo fixo e
revisado é mais fácil de garantir que conteúdo dinâmico. Recomendo ao
Financial Specialist **variações/situações-problema NOVAS inspiradas nas
7 lições referenciadas** (não cópia literal das perguntas originais) — o
próprio usuário já sugeriu esse caminho ("podem ser repetidas ou com
variações de situações-problema"), e variações genuínas testam
compreensão do conceito, não memorização da pergunta exata.

#### 7. Módulo(s)/arquivo(s) tocados nesta fase

Nenhum módulo novo em `js/*.js` — extensão de módulos existentes, mesmo
padrão de duplicação já estabelecido entre `trail.js`/`business.js` desde a
Fase 2:
- `js/data.js`: dois novos arrays no nível superior, `COURSE_REVIEWS` e
  `BUSINESS_REVIEWS` (shape na seção 2). Continuam carregados antes de
  `trail.js`/`business.js` na ordem de `<script>` de `index.html` (`data.js`
  é a primeira linha, `trail.js`/`business.js` são as linhas 826-827,
  bem depois) — nenhuma mudança na ordem dos `<script>` é necessária.
- `js/trail.js`: `levels()` ganha a etapa de inserção de revisão (clone de
  `licoes` + splice ancorado por id, seção 3). `levelHtml()` ganha um branch
  de ícone/rótulo para `lesson.tipo === "revisao"` (estrutura só — o ícone
  exato/rótulo visual fica para UX/UI Designer + Gamification Designer, não
  decidido aqui). Nenhuma mudança em `isDone`/`isUnlocked`/`gridHtml`/
  `startLesson`/`renderQuizOverlay`/`answerQuestion`/`finishLesson`.
- `js/business.js`: mesma extensão, duplicada (mesmo padrão de não
  compartilhar módulo entre as duas trilhas, já estabelecido).
- **Nenhuma `STORAGE_KEYS` nova.** Progresso de revisão reaproveita
  `COURSE_PROGRESS`/`HISTORY_PROGRESS`/`BUSINESS_PROGRESS` existentes.
- **Nenhum `CustomEvent` novo necessário** para o mecanismo em si —
  `course:updated`/`lesson:passed` já disparam ao concluir qualquer lição,
  revisão incluída, sem mudança.

#### 8. Riscos identificados (resumo)

1. **Mutação acidental dos arrays canônicos** (`COURSE`/`HISTORY_COURSE`/
   `BUSINESS_COURSE`) se o clone de `licoes` for esquecido na implementação
   — risco de maior gravidade desta fase, mitigação já especificada na
   seção 3 (clone obrigatório) e deve ser item explícito do checklist de QA
   da Fase 3B (confirmar, por leitura de `COURSE`/`HISTORY_COURSE` após
   `Trail.init()` rodar, que os arrays originais não ganharam entradas
   `tipo:"revisao"`).
2. **Cross-módulo (seção 5)**: 5 arquivos fora de `trail.js`/`business.js`
   leem esses globais direto — decisão desta fase é que eles NÃO veem
   revisões por padrão; qualquer mudança disso é decisão futura explícita,
   não desta RFC.
3. **`refLessonIds` mal formado/sobreposto**: nada no mecanismo de runtime
   impede que duas revisões referenciem a mesma lição como âncora, ou que
   um `refLessonIds` tenha menos/mais de 7 ids — o sistema falha de forma
   segura (revisão simplesmente não aparece ou aparece na posição errada),
   mas não é validado automaticamente. Recomendo ao QA Engineer da Fase 3B
   um script de verificação (grep/leitura de `COURSE_REVIEWS`/
   `BUSINESS_REVIEWS`) confirmando: exatamente 7 ids por entrada, todos
   existentes em `COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE`, sem
   sobreposição entre revisões consecutivas.
4. **Efeito colateral em missão semanal/gatilho de história interativa**
   (seção 4) — não é regressão, mas precisa de confirmação explícita do
   Gamification Designer antes do piloto (Fase 3B) para não ser uma
   surpresa em QA.
5. **XP/energia da revisão ainda não definidos** — esta fase reaproveita o
   campo `xp` e o gate de energia (`Energy.tryStart()` em `startLesson()`)
   sem alterar nenhum dos dois; o Gamification Designer decide os valores
   concretos (ou se energia deveria ser cobrada de forma diferente para
   revisão) na próxima etapa.

#### Registro da etapa

- **Resumo da etapa**: decidido que "7 pontos" conta na sequência unificada
  de `Trail.flatLessons()` para Aprender e separadamente em
  `Business.flatLessons()` para Empreender; definido o formato de dados do
  nó de revisão (lição-shaped, `tipo:"revisao"`, `refLessonIds` explícito,
  inserida por ancoragem de id — nunca por posição numérica — dentro do
  array `licoes` do nível correspondente); confirmado que
  `isUnlocked`/`isDone`/XP funcionam sem nenhuma mudança de lógica por
  reaproveitar a correção pós-Onda-9 já em produção; mapeado e contido o
  risco de mutação/cross-módulo com 5 outros arquivos que leem `COURSE`/
  `HISTORY_COURSE`/`BUSINESS_COURSE` diretamente; recomendado conteúdo
  autoral fixo (não sorteado em runtime) para as 10 perguntas, com
  variações novas em vez de cópia literal.
- **Decisões tomadas**: seções 1-7 acima. Nenhum módulo novo, nenhuma
  `STORAGE_KEYS` nova, nenhum `CustomEvent` novo.
- **Pendências para os próximos agentes**:
  - **Gamification Designer**: valor de XP da revisão, se o custo de
    energia para iniciar uma revisão deve ser igual ao de uma lição normal,
    ícone/identidade visual do nó de revisão (junto com UX/UI Designer), e
    confirmar/decidir explicitamente se revisões devem contar para a
    missão semanal de lições e para o gatilho de história interativa
    (efeito colateral já descrito na seção 4, não decidido aqui).
  - **Financial Specialist**: escrever as 10 perguntas de cada revisão
    piloto (Fase 3B), no formato `perguntas` definido na seção 2,
    recomendado como variações/situações-problema novas (seção 6), com o
    mesmo padrão de clareza já usado no restante do conteúdo.
  - **UX/UI Designer**: identidade visual do nó de revisão dentro do grid
    já existente (ícone, cor, possível badge "🔁 Revisão" distinguindo de
    lição normal) — só o hook estrutural (`lesson.tipo === "revisao"`) foi
    definido aqui, não a aparência.
  - **Backend/Frontend Engineer (Fase 3B)**: implementar exatamente o
    mecanismo desta seção na trilha piloto (recomendado: `HISTORY_COURSE`
    ou `BUSINESS_COURSE`, 18 lições cada, conforme já proposto pela Fase
    3B) — com atenção especial ao clone de `licoes` (risco 1) e ao teste
    de que `COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE` originais permanecem
    intocados.
- **Riscos**: ver seção 8 acima, em ordem de gravidade.
- **Próximo agente responsável**: **Gamification Designer** (XP/energia/
  efeitos colaterais em missões, pendência acima) — em paralelo ou logo
  antes do **Financial Specialist** (conteúdo das 10 perguntas da trilha
  piloto), ambos alimentando a Fase 3B (piloto), cujo Backend/Frontend
  Engineer implementa o mecanismo definido nesta seção.

### 13. Gamification Designer (Fase 3B — XP, energia e efeitos colaterais da Revisão)

Leitura prévia confirmada por código real: `js/energy.js` (`ENERGY_MAX=5`,
`ENERGY_COMBO=3`, `tryStart()`/`spend()`), `js/data.js` (XP de cada lição em
`COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE`, `ACHIEVEMENTS`,
`WEEKLY_MISSIONS`), `js/trail.js` (`finishLesson()`, `maybePickStory()`) e
`js/business.js` (`finishLesson()` — confirmado que a trilha Empreender não
tem hook de história interativa, esse mecanismo é exclusivo de `trail.js`).

#### 1. XP da revisão: igual ao "preço vigente" da trilha naquele ponto — não um número fixo isolado

**Decisão: `revisao.xp` = o mesmo XP da lição-âncora (`refLessonIds[6]`, a
última das 7 lições cobertas)** — não um valor fixo hardcoded (como o `20`
usado de placeholder pelo Software Architect) e não um desconto por ser
"conteúdo já visto".

Motivo, em ordem de peso:

1. **Mesmo esforço, mesmo custo, mesma recompensa.** A revisão é um nó
   *obrigatório* no caminho sequencial (destrava o próximo nó via
   `doneCount`/`isUnlocked`, seção 4 da decisão do Architect) — não é uma
   prática opcional que o jogador escolhe fazer. Ela também consome 1
   energia para iniciar (decisão do item 2 abaixo) e exige as mesmas 10
   perguntas de qualquer lição normal. Pagar menos XP por exatamente o
   mesmo custo de entrada quebraria o contrato implícito já estabelecido em
   todo o resto da trilha ("mesmo formato de quiz = mesma recompensa"), e
   sinalizaria ao jogador que a revisão é uma "lição de segunda categoria"
   — o oposto do que se quer reforçar (reforço espaçado é uma prática
   valiosa, não uma obrigação chata).
2. **"Conteúdo já visto" não é motivo para valer menos.** O valor
   pedagógico da revisão não está em ensinar algo novo, está em testar
   retenção — e reter é mais difícil (e mais valioso a longo prazo) do que
   reconhecer algo pela primeira vez. Penalizar XP por isso remaria contra
   o próprio objetivo da mecânica.
3. **Não abre brecha de abuso.** `finishLesson()` já bloqueia XP repetido
   (`alreadyDone` → sem XP numa segunda tentativa) — o mesmo guard vale
   para a revisão sem nenhuma mudança de código, então não existe "farm" de
   XP replayando a revisão.
4. **Ancorar no XP da lição-âncora, em vez de um número fixo, evita
   ficar desatualizado.** O XP típico por lição já subiu ao longo das
   Ondas (Financeira: 20→50; Empreender: 30→40) — um valor fixo escrito
   hoje (ex. 20) ficaria "barato" perto do conteúdo publicado daqui a 10
   Ondas. Amarrar ao XP da 7ª lição referenciada resolve isso automaticamente,
   sem exigir que o Gamification Designer revise esse número a cada nova
   Onda de `COURSE_REVIEWS`/`BUSINESS_REVIEWS`.

**Valor concreto para o piloto (BUSINESS_COURSE):** os 7 primeiros nós da
trilha Empreender, na ordem flat, são `e1_1, e1_2, e1_3, emod_1, emod_2,
emod_3, e2_1` (todos confirmados por leitura direta de `js/data.js`), com
XP `30, 30, 30, 30, 30, 30, 35`. A lição-âncora (`e2_1`, a 7ª) tem
`xp: 35` → **`revisao.xp = 35`** para a revisão-piloto.

#### 2. Energia: revisão consome 1 energia, igual a qualquer lição — sem isenção

**Decisão: `startLesson()` da revisão chama `Energy.tryStart()` normalmente
— sem branch de exceção para `tipo === "revisao"`.**

Avaliando os dois objetivos em tensão, como pedido:

- **Objetivo pedagógico (reforço espaçado)**: quer que o jogador realmente
  faça a revisão, sem fricção artificial que a torne "cara demais" para ser
  feita.
- **Objetivo do gate de energia (ritmo de consumo de conteúdo novo)**:
  limitar quantas lições podem ser *iniciadas* por dia — não é sobre
  "conteúdo novo" especificamente, é sobre número de sessões de quiz
  iniciadas, ponto.

Isso não é uma colisão real, porque a revisão **não é opcional** — ela está
no caminho sequencial obrigatório (destrava o próximo nó, seção 3/4 da
decisão do Architect). Isentá-la de energia não "libera mais reforço
espaçado" (o jogador vai fazê-la de qualquer forma, mais cedo ou mais
tarde, para poder avançar) — só cria um "início de lição grátis" cada vez
que a trilha insere um nó de revisão, silenciosamente furando o teto diário
de 5 (Fase 1) sem nenhuma decisão explícita de subir esse teto. Isso
repetiria, na prática, o mesmo erro que o enunciado desta tarefa pede para
evitar: criar um segundo limitador/exceção paralelo ao sistema de energia
já existente, sem justificar por que ele não serve. Cobrar energia
normalmente é, na verdade, a opção que **menos** modifica o sistema
existente: zero branch novo, zero exceção, `Trail.startLesson()`/
`Business.startLesson()` continuam chamando `Energy.tryStart()`
exatamente como já fazem para qualquer lição — nenhuma mudança de código
além do que o Architect já previu ("reaproveita o gate de energia... sem
alterar nenhum dos dois").

Efeito colateral aceito e desejado: como a revisão é obrigatória, ela
consome 1 dos 5 slots diários — se o jogador não tiver energia sobrando, a
revisão fica bloqueada como qualquer outro nó (mesmo modal de "sem
energia"), e ele simplesmente a faz no dia seguinte. Isso é o comportamento
correto, não um bug: o sistema de energia já foi desenhado (Fase 1) para
não ser o motor de retorno diário (isso é papel do streak/desafios/missão
semanal) — a revisão não muda essa divisão de responsabilidades.

#### 3. Efeitos colaterais deixados em aberto pelo Architect

**3a. Missão semanal "Complete 3 lições esta semana" (`week_lessons_3`,
`js/data.js:11469`) — revisão CONTA, sem filtro.**

Confirmado em `js/engagement.js:164-165`: a missão conta
`STORAGE_KEYS.LESSON_LOG` filtrado só por data (`>= since`), sem nenhum
filtro por fonte/tipo de lição. Decisão: **deixar contar, sem adicionar
filtro nenhum.** Justificativa:
- Do ponto de vista do jogador, completar uma revisão *é* completar uma
  lição — mesmo quiz, mesmo XP (item 1), mesma energia (item 2). Excluí-la
  exigiria código novo (uma flag `tipo !== "revisao"` no filtro da missão)
  só para criar uma distinção que o jogador não percebe e que não protege
  contra nada (a revisão não pode ser repetida para inflar a contagem —
  mesmo guard de `alreadyDone` já usado em toda lição).
- Contar a favor da missão semanal é, na verdade, um reforço positivo:
  incentiva completar a revisão *dentro* da semana em vez de adiá-la (a
  revisão empurra o jogador de volta pro loop de missão semanal → XP →
  retorno ao app), que é exatamente o tipo de sinergia entre mecânicas que
  se busca, não uma a evitar.
- Nenhum risco de abuso: LESSON_LOG só ganha 1 entrada por lição/revisão na
  primeira conclusão (guard já existente em `trail.js`/`business.js`).

**3b. Gatilho de história interativa a cada 3 lições financeiras
(`Trail.maybePickStory()`, `js/trail.js:497-499`) — revisão CONTA quando
inserida em nível `fonte:"financeira"`, sem filtro.**

Decisão: **mesmo raciocínio de 3a — deixar contar, sem filtro.** Duas
observações práticas:
- **Não afeta o piloto desta fase.** `maybePickStory()` só é chamado a
  partir de `trail.js` (`if (level.fonte === "financeira")`), e
  `business.js` não tem esse hook — logo, para o piloto em
  `BUSINESS_COURSE` (recomendado no item 6), esta decisão fica registrada
  para a Fase 3C (rollout na trilha unificada Aprender), mas não tem efeito
  concreto agora.
- **Justificativa para quando a Fase 3C chegar**: excluir a revisão
  exigiria filtrar `Object.keys(progress).length` por `tipo !== "revisao"`
  ao contar `COURSE_PROGRESS` — código novo, e sem ganho de produto claro.
  Ao contrário: não há nada narrativamente estranho em o POLVIn abrir um
  capítulo de história logo depois de uma revisão bem-sucedida — se
  qualquer coisa, reforça a mensagem "você realmente reteve isso" antes de
  avançar para uma recompensa narrativa, o que é um bom momento emocional
  para colocar uma história. Não decidir isso agora (deixar "implícito por
  reaproveitamento de código") seria pior do que decidir explicitamente
  "sim, conta" — que é o que este registro faz.

Resumo: **nenhum filtro novo em nenhum dos dois efeitos colaterais.** Ambos
tratam a revisão exatamente como qualquer lição, por decisão explícita, não
por omissão.

#### 4. Celebração ao concluir uma revisão: reaproveita a tela padrão, com 1 variação de texto — sem badge/animação nova

**Decisão: reaproveitar 100% do fluxo visual de conclusão já existente
(confete, `Fx.successGlow`, `Fx.xpPop`, `Fx.mascotCelebrate`, `Fx.coinBurst`
— nenhum desses muda), alterando só o título (`<h2>`) e, opcionalmente, 1
linha de subtexto, condicionados a `lesson.tipo === "revisao"`.**

Ambos `trail.js:457` e `business.js:392` já usam um ternário simples para o
título (`level.fonte === "historia" ? "Capítulo concluído!" : "Lição
concluída!"` em `trail.js`; fixo em `business.js`) — é o mesmo padrão de
implementação (baixo custo, 1 branch a mais na mesma expressão) que já
existe, não uma estrutura nova.

**Título sugerido**: `"Revisão dominada!"` (em vez de "Lição concluída!" /
"Capítulo concluído!").

**Subtexto sugerido** (adicional, logo abaixo do `<p>` de acertos, só
quando `passed && !alreadyDone`): `"Você reforçou o que já tinha aprendido
— é isso que faz o conhecimento ficar de verdade."` — reforça, na voz do
POLVIn, por que aquele nó era diferente dos outros, sem inventar um
mecanismo novo de narrativa (o mascote já aparece na mesma tela via
`Polvin.avatarHtml("md")`, decisão de personalidade/tom cabe ao AI Prompt
Engineer se quiser refinar a frase exata).

**Por que não um badge/animação nova:** o esforço de implementação
(desenhar um novo elemento visual, animação, possivelmente um asset novo)
não se justifica pelo ganho — o objetivo de "deixar claro que isso foi uma
revisão, não conteúdo novo" já é cumprido pelo título diferente + (mais
importante) pelo texto de introdução da própria revisão (`aula`, que já
existe no schema definido pelo Architect: *"Vamos revisar o que você
aprendeu nos últimos 7 pontos da trilha..."*) e pelo ícone/rótulo do nó na
trilha em si (decisão do UX/UI Designer, ainda pendente, já sinalizada pelo
Architect). Reforçar a mesma mensagem 3 vezes (nó → intro → conclusão) com
uma 4ª camada visual nova é diminuindo retorno, não retorno adicional. Uma
frase de conclusão diferente já resolve o risco real citado na tarefa
("o jogador ficar confuso, achando que é conteúdo novo que ele já viu por
engano") sem exigir nenhum trabalho de Frontend/UX além do já previsto.

#### 5. Trilha-piloto da Fase 3B: recomendo trocar para `BUSINESS_COURSE`, isolado — não `HISTORY_COURSE`, nem "qualquer uma das duas"

**Confirmo a preocupação levantada na tarefa e recomendo formalmente:
pilotar SÓ em `BUSINESS_COURSE` (Empreender), não em `HISTORY_COURSE`.**

A sugestão original da RFC (linha ~741, "`HISTORY_COURSE` ou
`BUSINESS_COURSE`, 18 lições cada") foi escrita **antes** da decisão do
Architect (seção 1 da sua etapa) de que, na aba Aprender, "7 pontos" conta
na sequência **unificada** de `Trail.flatLessons()` (Financeira + História
intercaladas), não separadamente por fonte. Isso muda o cálculo de risco
do piloto:

- **Pilotar em "só História" testaria um mecanismo que não existe em
  produção.** Se o piloto contasse "7 pontos" isolando só `HISTORY_COURSE`,
  estaria validando uma contagem separada por fonte — exatamente o modelo
  que o Architect *rejeitou* para a aba Aprender. Qualquer aprendizado do
  piloto sobre "como o `doneCount` se comporta", "como o `refLessonIds`
  ancora corretamente", "se o clone de `licoes` evita mutar o array
  canônico" seria válido *estruturalmente*, mas o cenário de teste em si
  (uma trilha isolada de 18 lições) não reproduziria a complexidade real da
  Fase 3C (duas fontes de dados diferentes, intercaladas por nível, ambas
  escrevendo em `COURSE_PROGRESS`/`HISTORY_PROGRESS` separados enquanto
  `doneCount` é somado). Ou seja: testar História isolada dá falsa
  confiança sobre o caso fácil, sem tocar no caso difícil.
- **`BUSINESS_COURSE` bate 100% com o mecanismo real que vai rodar em
  produção para essa aba** — Empreender já é, hoje, uma trilha
  genuinamente separada e isolada em todo o código (`Business.flatLessons()`,
  `Business.isUnlocked()`, `STORAGE_KEYS.BUSINESS_PROGRESS` próprio, sem
  hook de história interativa). Pilotar ali significa que **o piloto testa
  exatamente o que vai para produção** nessa aba — zero divergência entre
  "o que foi validado" e "o que os usuários vão usar".
- **Tamanho adequado, confirmado por leitura**: `BUSINESS_COURSE` tem
  exatamente **18 lições** (confirmado por grep — `e1_1..3`, `emod_1..3`,
  `e2_1..3`, `e3_1..3`, `e4_1..3`, `e5_1..3`), suficiente para **2**
  inserções de revisão (âncoras na 7ª lição, `e2_1`, e na 14ª, `e4_2`),
  cobrindo tanto o caso "revisão dentro do meio de um nível" (o bloco de 7
  cruza `enivel1`+`enivel_modelo`+início de `enivel2`) quanto validando a
  trava de segurança "revisão não aparece antes da âncora existir" sem
  precisar esperar uma 3ª (que exigiria 21 lições, ainda não publicadas).
- **A trilha mais complexa (unificada, cross-fonte) fica para a Fase 3C,
  de propósito** — exatamente como o enunciado da tarefa já apontava: só
  depois de validar o mecanismo isolado (menor superfície de risco) é que
  faz sentido enfrentar o caso com 2 arrays de conteúdo + 2 chaves de
  progresso + o gatilho de história interativa (item 3b acima) + a
  interação com `ACHIEVEMENTS`/outros 5 módulos que leem `COURSE`/
  `HISTORY_COURSE` direto (risco 2 já mapeado pelo Architect). Empilhar
  toda essa complexidade no primeiro piloto seria repetir o padrão de
  risco que a própria RFC-035 foi desenhada para evitar (fases pequenas e
  validadas antes da próxima).

**Recomendação final: Fase 3B = piloto único em `BUSINESS_COURSE`, cobrindo
a primeira revisão (`refLessonIds: ["e1_1", "e1_2", "e1_3", "emod_1",
"emod_2", "emod_3", "e2_1"]`, `xp: 35`, id sugerido `revE_01`).** A segunda
revisão possível dentro dessa mesma trilha (âncora `e4_2`) pode ficar para
uma rodada seguinte da própria Fase 3B ou já entrar junto, a critério do
Financial Specialist/QA — não muda a recomendação de trilha.

#### Registro da etapa

- **Resumo da etapa**: decidido que `revisao.xp` é igual ao XP da
  lição-âncora (não um valor fixo) — `35` para a revisão-piloto de
  `BUSINESS_COURSE`; que a revisão consome 1 energia via `Energy.tryStart()`
  normalmente, sem isenção; que ela conta tanto para a missão semanal
  "complete 3 lições" quanto para o gatilho de história interativa a cada 3
  lições financeiras (sem nenhum filtro novo em nenhum dos dois); que a
  celebração de conclusão reaproveita 100% do fluxo visual padrão, só
  trocando o título (`"Revisão dominada!"`) e adicionando 1 linha de
  subtexto — sem badge/animação nova; e recomendado formalmente
  `BUSINESS_COURSE` (não `HISTORY_COURSE`) como a única trilha-piloto da
  Fase 3B, por ser a que reflete fielmente, sem divergência, o mecanismo de
  contagem separada já decidido pelo Architect para a aba Empreender.
- **Decisões tomadas**: itens 1-5 acima.
- **Pendências para os próximos agentes**:
  - **Financial Specialist**: escrever as 10 perguntas da revisão-piloto
    (`revE_01`, `BUSINESS_COURSE`, `refLessonIds` acima), no formato já
    definido pelo Architect, com variações/situações-problema novas
    (recomendação da seção 6 do Architect), cobrindo o conteúdo das 7
    lições `e1_1, e1_2, e1_3, emod_1, emod_2, emod_3, e2_1`.
  - **UX/UI Designer**: identidade visual do nó de revisão no grid (ícone,
    cor, badge "🔁 Revisão" no nó em si) — ainda não decidida por ninguém,
    complementa a variação de texto de conclusão desta etapa (item 4) sem
    conflitar com ela.
  - **Backend/Frontend Engineer (Fase 3B)**: implementar `revisao.xp = 35`
    (não um placeholder de `20`), `startLesson()` sem branch de isenção de
    energia, sem filtro novo em `week_lessons_3`/`maybePickStory()`, e o
    branch de título condicional (`lesson.tipo === "revisao" ?
    "Revisão dominada!" : ...`) em `trail.js`/`business.js` (a variação de
    subtexto só se aplica ao caminho `passed && !alreadyDone`).
- **Riscos**: nenhum risco novo introduzido por esta etapa — as decisões
  reaproveitam mecanismos existentes (XP, energia, `LESSON_LOG`, fluxo de
  conclusão) exatamente como o Architect antecipou que seria possível, sem
  abrir nenhuma exceção/mecanismo paralelo.
- **Próximo agente responsável**: Financial Specialist (conteúdo das 10
  perguntas da revisão-piloto em `BUSINESS_COURSE`, `refLessonIds` e `xp`
  definidos acima).

### 15. UX/UI Designer (Fase 3B — Identidade visual do nó de revisão)

Leitura prévia confirmada por código real (não só desta RFC): a especificação
da Fase 2 nesta mesma RFC (seção 2, acima — sistema de grid, `--tz-node-*`,
`.trail-node`/`.trail-node-inner`/`.trail-node-ring`/`.trail-node-icon`/
`.trail-node-label`/`.trail-node-xp`, o pino `::before` do nó atual, o
mecanismo de conectores) e a implementação real em `css/style.css` (linhas
895-985) e `js/trail.js` (linhas ~230-240, geração do `icon`/markup do nó —
confirmado que `business.js` usa o mesmo padrão, sem divergência, conforme já
estabelecido pela Fase 2). Também lidas as pendências deixadas para mim pelo
Software Architect (seção 12, item 7/pendências) e pelo Gamification Designer
(seção 13, item 4 e pendências) — ambos confirmam que só o hook estrutural
(`lesson.tipo === "revisao"`) existe hoje; nenhuma aparência foi decidida.

Restrição de entrada, já resolvida pelo Architect e que não questiono aqui: o
nó de revisão é uma entrada shape-idêntica a uma lição normal dentro do mesmo
array `licoes`, renderizada pelo mesmo `gridHtml()`/algoritmo de posição em
"S" da Fase 2 — logo esta seção **não toca em `col`/`nodeRow`/
`grid-column`/`grid-row`**, só na aparência interna do card do nó, exatamente
como a tarefa pede.

#### Três conceitos

**Conceito A — Minimalista.** Só o texto "Revisão" em fonte pequena, sem
pill/fundo, logo abaixo do XP; nenhuma troca de ícone; nenhum acento de cor
na borda do anel. Mais barato de implementar, mas falha o próprio teste da
Fase 2: ao lado dos outros nós (ícone trocado, glow dourado no atual, pino
animado), um texto solto sem nenhum reforço visual seria o elemento mais
"sem vida" da tela — quase invisível num grid já denso de estímulos.

**Conceito B — Gamer** (mesma linha do Conceito B já escolhido e implementado
na Fase 2 para a trilha inteira). Ícone do anel troca para 🔁 nos estados
desbloqueado/atual (mesmo branch que já decide `📘`/`📜`/`✅`/`🔒`); uma tag
pill "🔁 Revisão" abaixo do XP, visível nos 3 estados; um acento de cor roxo
(`--primary`) adicional na borda do anel, em camada sobre a cor de estado já
existente (nunca a substituindo). O emoji 🔁 comunica literalmente "ciclo/
repetição" — o conceito central de reforço espaçado — sem inventar um ícone
novo fora do vocabulário de emoji já usado no produto.

**Conceito C — Premium.** Sem troca de ícone, borda tracejada finíssima
(1px) em vez de pill, tipografia do rótulo ainda mais discreta, sem cor de
acento — a diferenciação viria só da forma da borda. Mais elegante
isoladamente, mas destoa do resto da trilha: todo o resto do grid (pino ▲,
glow dourado, conectores com textura) já fala a língua "gamer" decidida e
aprovada na Fase 2; um único tipo de nó de repente "sussurrando" nessa mesma
tela quebraria a consistência que a própria Fase 2 exigiu de `business.js`
("duas identidades de trilha dentro do mesmo produto sem nenhum ganho de
produto que justifique").

**Recomendação: Conceito B**, pelo mesmo motivo que já levou a Fase 2 a
escolher Gamer para a trilha inteira — consistência de linguagem visual
dentro da mesma tela é mais importante aqui do que a elegância isolada do
Conceito C. A especificação abaixo é o Conceito B.

#### Decisão 1 — Ícone

**Ícone do anel troca para 🔁 apenas nos estados em que o ícone normal já
varia por conteúdo (desbloqueado/atual)** — mesmo branch condicional que hoje
decide `📘` vs `📜`, só que testando `tipo === "revisao"` primeiro:

```js
// js/trail.js e js/business.js (mesmo branch, duplicado — padrão já
// estabelecido desde a Fase 2), dentro de levelHtml()/gridHtml():
const isRevisao = lesson.tipo === "revisao";
const icon = done
  ? "✅"
  : unlocked
    ? (isRevisao ? "🔁" : (isHistoria ? "📜" : "📘"))
    : "🔒";
```

**Locked continua `🔒`, sem exceção — decisão deliberada, não esquecimento.**
Hoje um nó bloqueado já esconde a distinção `📘`/`📜` (o jogador não sabe se a
próxima lição é Financeira ou História até desbloquear); manter `🔒` para uma
revisão bloqueada é consistente com esse comportamento já existente, não uma
lacuna nova. **Done continua `✅`, sem exceção** — a Decisão 2 (rótulo texto)
abaixo já garante que o nó continua identificável como revisão depois de
concluído, sem precisar sacrificar o `✅` (que carrega seu próprio
significado importante: "isso eu já fiz").

#### Decisão 2 — Rótulo textual (o sinal que carrega a informação sozinho, ver Acessibilidade)

Uma tag pill abaixo de `.trail-node-xp`, **visível nos 3 estados** (bloqueado,
atual, concluído) — diferente do ícone (que só muda em 1 dos 3 estados), este
é o sinal que nunca falta:

```html
<!-- dentro de .trail-node-inner, só quando lesson.tipo === "revisao" -->
<div class="trail-node-tag">🔁 Revisão</div>
```

```css
.trail-node-tag {
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(108, 79, 207, 0.12); /* --primary a 12% */
  color: var(--primary);
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.trail-node.locked .trail-node-tag { opacity: 0.6; } /* acompanha o dimming
  já aplicado a .trail-node.locked .trail-node-ring (opacity:0.5) — valor
  levemente mais alto (0.6) de propósito, para o texto continuar legível
  mesmo apagado, já que ele é o sinal de acessibilidade mais importante
  desta especificação (ver seção de Acessibilidade abaixo). */
```

Por que abaixo do XP, e não acima do anel (onde o pino `▲` do nó atual já
fica)? Para nunca colidir com o pino — um nó de revisão pode perfeitamente
estar no estado `current` (é o próximo nó do caminho sequencial, como
qualquer outro) e as duas marcações (pino `::before` do `.current`, tag deste
nó) precisam coexistir sem se sobrepor. Colocar a tag no fluxo normal do
flexbox, abaixo de `.trail-node-xp`, resolve isso sem nenhum cálculo de
posição extra — e o track de linha do grid já cresce para acomodar conteúdo
mais alto (`minmax(var(--tz-node-h), auto)`, ajuste feito pelo Frontend
Engineer na Fase 2 exatamente para o caso de um nó precisar de mais altura
que o padrão de 150px), então uma linha de texto a mais não é risco de
sobreposição — é o mesmo mecanismo que já absorve títulos longos.

#### Decisão 3 — Acento de cor no anel (camada sobre os 3 estados, nunca substituindo)

```css
.trail-node.revisao .trail-node-ring {
  box-shadow: 0 0 0 3px rgba(108, 79, 207, 0.28), 0 4px 0 rgba(45, 27, 78, 0.08);
}
.trail-node.revisao.done .trail-node-ring {
  box-shadow: 0 0 0 3px rgba(108, 79, 207, 0.28), 0 4px 0 rgba(47, 138, 43, 0.18);
}
.trail-node.revisao.current:not(.locked) .trail-node-ring {
  box-shadow: 0 0 0 3px rgba(108, 79, 207, 0.28), 0 0 0 6px rgba(232, 163, 61, 0.2), 0 4px 0 rgba(45, 27, 78, 0.08);
}
```

`--primary` (roxo, `#6c4fcf`) foi escolhido porque é a única cor do design
system que não colide com nenhuma das cores de estado já usadas no nó
(`--level-color` no desbloqueado, `--gold` no atual, `--green` no concluído)
— o acento roxo lê como um sinal ortogonal ("tipo de nó"), nunca competindo
com o sinal de estado já estabelecido pela Fase 2. Cada regra acima só
adiciona um anel extra de `box-shadow` de 3px à declaração de sombra que
aquele estado já tem — não troca `border-color` (que continua 100% governado
pelas regras de estado já existentes, sem nenhuma mudança). Isto é o
"polish": funciona sozinho como reforço, mas a legibilidade da revisão nunca
depende dele (ver Acessibilidade).

**Risco de recorte a testar ao vivo (mesma classe de bug já encontrada na
Fase 2 com o pino do nó atual):** `.trail-node-ring` fica dentro de
`.trail-node-inner`, que tem `overflow: hidden` (necessário para conter o
ripple de clique). O anel (68px) já ocupa quase toda a largura mínima do nó
no breakpoint mobile mais estreito (`--tz-node-w` chega a 64px) — um
`box-shadow` de 3px pode ficar parcialmente cortado nesse caso extremo. Isso
é aceitável (um glow decorativo parcialmente cortado não quebra leitura nem
some informação, ao contrário de um elemento com texto/ícone sendo cortado),
mas **peço ao Frontend Engineer confirmar visualmente em 375px de largura**
antes de fechar a Fase 3B, junto com o resto do checklist de teste ao vivo já
praticado na Fase 2.

#### Decisão 4 — Tamanho/forma no grid: idêntico a qualquer nó, sem exceção

Confirmando a recomendação já sinalizada na tarefa: **o nó de revisão ocupa
exatamente 1 célula do grid, mesmo `--tz-node-w`/`--tz-node-h`, mesmo
algoritmo de posição `(col, nodeRow)` da Fase 2, sem nenhum caso especial.**
Motivo, além do já dito na tarefa: o algoritmo de grid da Fase 2 foi
desenhado e validado (0 sobreposições em 138 nós) sob a premissa de que todo
elemento de `licoes` é posicionado uniformemente — abrir uma exceção de
tamanho para um tipo de nó reintroduziria exatamente a classe de bug que a
Fase 2 eliminou (cálculo de posição por caso especial). Nenhuma mudança em
`js/trail.js`/`js/business.js` além dos dois trechos das Decisões 1 e 2
acima (branch de ícone, `<div class="trail-node-tag">` condicional) e da
classe `revisao` adicionada ao nó (Decisão 5).

#### Decisão 5 — Markup completo (diff sobre o template já existente)

```js
// js/trail.js (~linha 230) e js/business.js (equivalente) — único ponto
// tocado nesta especificação, além do CSS acima
const isRevisao = lesson.tipo === "revisao";
const icon = done ? "✅" : unlocked ? (isRevisao ? "🔁" : (isHistoria ? "📜" : "📘")) : "🔒";
return `
  <div class="trail-node ${stateClass} ${isCurrent ? "current" : ""} ${isRevisao ? "revisao" : ""}" data-level="${levelIdx}" data-lesson="${lessonIdx}" title="${lesson.titulo}" style="--node-i:${lessonIdx}; grid-column:${gridColumn} / span 1; grid-row:${gridRow} / span 1;">
    <div class="trail-node-inner">
      <div class="trail-node-ring">
        <div class="trail-node-icon">${icon}</div>
      </div>
      <div class="trail-node-label">${lesson.titulo}</div>
      <div class="trail-node-xp">+${Events.applyMultiplier(lesson.xp)} XP</div>
      ${isRevisao ? `<div class="trail-node-tag">🔁 Revisão</div>` : ""}
    </div>
  </div>`;
```

`title="${lesson.titulo}"` já existe e não precisa de mudança — o tooltip
nativo do navegador já vai mostrar `"Revisão: Empreender"` (o `titulo`
definido pelo Architect em `BUSINESS_REVIEWS`) para quem passa o mouse, mais
um sinal gratuito, sem nenhum código novo.

#### Acessibilidade

O requisito da tarefa é explícito: a informação "isso é uma revisão" não
pode depender só de cor. Verificação, sinal por sinal:

- **Cor** (acento roxo, Decisão 3): decorativo/reforço, nunca a única fonte
  de informação — confirmado, é uma camada adicional de `box-shadow` sobre
  estados que já existem, nunca a única diferença entre um nó de revisão e
  um nó normal.
- **Ícone** (🔁, Decisão 1): forma distinta, não depende de percepção de
  cor — mas só cobre 2 dos 3 estados (desbloqueado/atual), não bloqueado nem
  concluído (decisão deliberada, seção acima).
- **Texto** (tag "🔁 Revisão", Decisão 2): é o sinal que **sozinho, sem
  nenhum dos outros dois, já resolve o requisito de acessibilidade por
  completo** — presente nos 3 estados, lido por leitor de tela como texto
  (não como imagem), não depende de daltonismo nem de reconhecer o
  pictograma 🔁. É por isso que a Decisão 2 é chamada explicitamente de "o
  sinal que carrega a informação sozinho" no título da seção — as outras
  duas decisões são reforço, esta é a garantia.
- **Contraste**: `color: var(--primary)` sobre `background:
  rgba(108,79,207,0.12)` (fundo muito claro, quase branco com leve tingimento
  roxo) — mesmo padrão de contraste já usado em `.badge-variavel` (`color:
  var(--gold-dark)` sobre fundo claro `#fbeadd`, style.css linha 441),
  reaproveitando uma combinação de contraste já validada visualmente no
  design system, não uma combinação nova a testar do zero.
- **Alvo de toque**: a tag é informativa, não clicável — o alvo de toque do
  nó inteiro (68px do anel + área do `.trail-node`) não muda, mantendo o
  padrão de 68px já validado na Fase 2.
- **`prefers-reduced-motion`**: **nenhuma entrada nova necessária.** Decisão
  deliberada desta especificação — nenhum dos 3 elementos (ícone, tag,
  box-shadow) introduz animação nova. Isso não é uma omissão; é a escolha de
  design: a identidade do nó de revisão vem de forma/texto/cor estáticos,
  não de movimento, então não há "intensidade" nenhuma para reduzir sob essa
  preferência — simplifica a superfície de acessibilidade em vez de
  aumentá-la.

#### Checklist de implementação (Backend/Frontend Engineer)

- [ ] `js/trail.js` e `js/business.js`: branch de `icon` ganha o caso
      `isRevisao` (Decisão 1); classe `revisao` adicionada à `div.trail-node`
      quando `lesson.tipo === "revisao"`; `<div class="trail-node-tag">🔁
      Revisão</div>` inserido condicionalmente dentro de `.trail-node-inner`,
      depois de `.trail-node-xp` (Decisão 2/5). Nenhuma mudança em
      `col`/`nodeRow`/`grid-column`/`grid-row`/`isUnlocked`/`isDone` (Decisão
      4).
- [ ] `css/style.css`: adicionar `.trail-node-tag` (+ variante `.locked`) e
      as 3 regras de `box-shadow` de `.trail-node.revisao .trail-node-ring`
      (Decisões 2 e 3), na seção "TRILHA ÚNICA (APRENDER)" já existente, logo
      após as regras de `.trail-node-ring`/`.trail-node.current` da Fase 2 —
      não numa seção nova, para manter todo o sistema visual do nó junto
      (mesmo critério de organização já usado no projeto).
- [ ] Nenhuma entrada nova em `@media (prefers-reduced-motion: reduce)` —
      confirmado acima, nenhuma animação nova introduzida.
- [ ] Testar visualmente ao vivo em 375px de largura (viewport mobile já
      usado como referência na Fase 2) se o `box-shadow` de 3px do acento
      roxo (Decisão 3) sofre recorte visível pelo `overflow: hidden` de
      `.trail-node-inner` no anel de 68px — recorte parcial é aceitável
      (decorativo), recorte que esconda o ícone ou a tag não é (reportar como
      bug se acontecer, mesmo padrão do bug do pino na Fase 2).
- [ ] Confirmar visualmente o nó `revE_01` (piloto, `BUSINESS_COURSE`) nos 3
      estados (bloqueado → atual → concluído), incluindo o caso em que ele é
      simultaneamente `current` e `revisao` (pino ▲ acima do anel + tag "🔁
      Revisão" abaixo do XP, sem sobreposição entre os dois — Decisão 2 já
      prevê isso, mas precisa de confirmação visual real, não só leitura do
      CSS).

#### Registro da etapa

- **Resumo da etapa**: decidida a identidade visual do nó de revisão dentro
  do grid já existente da Fase 2, sem nenhuma mudança de algoritmo de
  posição/tamanho — ícone do anel troca para 🔁 nos estados
  desbloqueado/atual; uma tag textual "🔁 Revisão" fica visível nos 3
  estados (bloqueado/atual/concluído) e é, por design, o único sinal que
  sozinho já satisfaz o requisito de acessibilidade "não só por cor"; um
  acento de cor roxo (`--primary`) em camada de `box-shadow` reforça a
  distinção sem substituir nenhuma cor de estado existente. Três conceitos
  apresentados (A minimalista, B gamer, C premium), com recomendação do
  Conceito B pela mesma razão que já levou a Fase 2 a escolher Gamer
  para a trilha inteira — consistência de linguagem visual dentro da mesma
  tela.
- **Decisões tomadas**: Decisões 1-5 acima (ícone, rótulo textual, acento de
  cor, tamanho/forma inalterados, markup/diff completo).
- **Pendências para os próximos agentes**:
  - **Backend/Frontend Engineer (Fase 3B)**: aplicar o diff de markup
    (Decisão 5) e o CSS (Decisões 2/3) em `js/trail.js`, `js/business.js` e
    `css/style.css`, junto com o mecanismo de inserção do Architect (seção
    12) e o XP/energia do Gamification Designer (seção 13); validar ao vivo
    os dois itens do checklist marcados para teste visual (recorte do
    box-shadow em mobile, coexistência `current`+`revisao`).
- **Riscos**: nenhum risco de arquitetura/lógica novo (esta etapa não altera
  `isUnlocked`/`isDone`/XP/algoritmo de grid); único risco é visual/CSS —
  recorte parcial do acento de cor em telas muito estreitas (mitigação e
  teste explícitos acima), aceitável por ser puramente decorativo.
- **Próximo agente responsável**: Backend/Frontend Engineer (Fase 3B) —
  implementa em paralelo o mecanismo de inserção (Architect, seção 12), o
  XP/energia/efeitos colaterais (Gamification Designer, seção 13), esta
  identidade visual (seção 15), e o conteúdo das 10 perguntas que o
  Financial Specialist está escrevendo.

### 14. Financial Specialist (Fase 3B — Conteúdo da revisão-piloto)

Leitura prévia confirmada por leitura direta de `js/data.js`: o texto completo
de `aula` e o array `perguntas` (base + `variante`) das 7 lições referenciadas
por `revE_01` — `e1_1` ("Empreender não é o mesmo que ser empresário"),
`e1_2` ("Do CPF ao CNPJ: por que formalizar"), `e1_3` ("Antes de abrir: um
plano de negócio simples"), `emod_1` ("Modelo de negócio: por que 'ter uma
boa ideia' não é o suficiente"), `emod_2` ("Validando antes de escalar: MVP
e os primeiros clientes de verdade"), `emod_3` ("Precificação e os primeiros
canais para conseguir clientes") e `e2_1` ("MEI: a porta de entrada da
formalização").

#### 1. Cobertura das 10 perguntas por lição

Distribuição adotada — nenhuma das 7 lições fica sem cobertura, com peso
maior nas três lições mais densas em conceitos numéricos/distintivos
(`e1_1`, `e1_2`, `e1_3`, 2 perguntas cada) e 1 pergunta para cada uma das
4 lições restantes (`emod_1`, `emod_2`, `emod_3`, `e2_1`):

| # | Lição coberta | Conceito testado |
| - | --- | --- |
| 1 | `e1_1` | Empreender (atitude) x ser empresário (condição jurídica formal) |
| 2 | `e1_1` | Empreendedorismo por oportunidade x por necessidade (GEM) |
| 3 | `e1_2` | Vantagens práticas de formalizar (nota fiscal, crédito PJ, contratos) |
| 4 | `e1_2` | Separação patrimonial entre sócio e empresa |
| 5 | `e1_3` | Ponto de equilíbrio via margem de contribuição (cálculo) |
| 6 | `e1_3` | Capital de giro |
| 7 | `emod_1` | Blocos do modelo de negócio (segmento de cliente / proposta de valor) |
| 8 | `emod_2` | MVP, validação com clientes reais e "pivotar" (Lean Startup) |
| 9 | `emod_3` | Precificação por valor percebido x cost-plus / canais de aquisição |
| 10 | `e2_1` | Regra de ultrapassagem do teto do MEI (até 20% x acima de 20%) |

Nenhuma pergunta é cópia literal de uma pergunta já existente nas 7 lições —
todas são situações-problema novas (nomes, negócios e números diferentes dos
originais), testando o mesmo conceito por um ângulo diferente, conforme
recomendado pelo Software Architect (seção 6 da etapa 12) e pedido
explicitamente pelo usuário. Nenhum número novo foi inventado: todos os
valores numéricos usados (teto do MEI ~R$ 81 mil/ano, teto proporcional
~R$ 6.750/mês, faixa de 20% de tolerância de ultrapassagem) são os mesmos já
validados e sinalizados como aproximados/sujeitos a confirmação em `e2_1` —
esta revisão não introduz nenhuma alíquota, teto ou regra nova.

#### 2. `titulo` e `aula` finais

```js
titulo: "Revisão: seus últimos 7 pontos",
aula: [
  "Antes de seguir em frente, vale parar e conferir o que realmente ficou dos últimos 7 pontos da trilha Empreender — de 'o que é empreender' até o MEI, a porta de entrada da formalização.",
  "As perguntas aqui não são idênticas às que você já viu: são situações novas, com nomes e números diferentes, testando se você entendeu o conceito por trás — não se decorou a pergunta original.",
  "Errou alguma? Sem problema — a explicação logo abaixo de cada resposta mostra exatamente o porquê da resposta certa. É repetindo e entendendo de novo que o conhecimento realmente fica.",
],
```

#### 3. Objeto completo do nó de revisão (`revE_01`)

Pronto para ser colado em `js/data.js` (novo array `BUSINESS_REVIEWS`,
conforme shape definido pelo Software Architect na seção 2 da etapa 12) pelo
Backend/Frontend Engineer da Fase 3B:

```js
const BUSINESS_REVIEWS = [
  {
    id: "revE_01",
    tipo: "revisao",
    titulo: "Revisão: seus últimos 7 pontos",
    xp: 35,
    aula: [
      "Antes de seguir em frente, vale parar e conferir o que realmente ficou dos últimos 7 pontos da trilha Empreender — de 'o que é empreender' até o MEI, a porta de entrada da formalização.",
      "As perguntas aqui não são idênticas às que você já viu: são situações novas, com nomes e números diferentes, testando se você entendeu o conceito por trás — não se decorou a pergunta original.",
      "Errou alguma? Sem problema — a explicação logo abaixo de cada resposta mostra exatamente o porquê da resposta certa. É repetindo e entendendo de novo que o conhecimento realmente fica.",
    ],
    refLessonIds: ["e1_1", "e1_2", "e1_3", "emod_1", "emod_2", "emod_3", "e2_1"],
    perguntas: [
      {
        pergunta: "Rafael começa a consertar bicicletas de vizinhos nos fins de semana, cobrando por cada serviço, mas nunca abriu CNPJ. De acordo com a diferença entre empreender e ser empresário, o que se pode dizer sobre Rafael?",
        opcoes: [
          "Ele não empreendeu, pois só empreende quem tem CNPJ",
          "Ele empreendeu, mesmo sem ser empresário, já que empreender é uma atitude que não depende de ter CNPJ",
          "Ele só passará a empreender quando formalizar a empresa",
          "É impossível prestar qualquer serviço sem CNPJ",
        ],
        correta: 1,
        explicacao: "Empreender é a atitude de identificar e resolver um problema; ser empresário é ter a condição jurídica formal (CNPJ). Rafael empreendeu ao criar uma solução e cobrar por ela, mesmo sem essa formalização.",
        variante: {
          pergunta: "Sandra assume a farmácia da família, já formalizada com CNPJ, e continua operando exatamente como antes, sem criar nada novo. O que se pode dizer sobre ela, considerando a diferença entre empreender e ser empresária?",
          opcoes: [
            "Ela é empresária, pois tem a condição jurídica formal, mesmo sem necessariamente ter empreendido algo novo",
            "Ela não pode ser chamada de empresária, pois nunca empreendeu",
            "Ela empreendeu e é empresária automaticamente, pela mesma razão",
            "Assumir um negócio de família é sempre ilegal sem inovar",
          ],
          correta: 0,
          explicacao: "Ser empresária é uma condição jurídica (ter CNPJ) que pode existir mesmo sem o componente de ter identificado um problema e criado algo novo — como no caso de administrar um negócio herdado sem mudanças.",
        },
      },
      {
        pergunta: "André perde o emprego e passa a fazer fretes com o próprio carro para não ficar sem renda, enquanto Bianca, com um emprego estável, identifica uma lacuna no mercado de brechós online e decide investir por escolha própria. Segundo a classificação usada por pesquisas como o GEM, como esses dois casos seriam descritos?",
        opcoes: [
          "André empreende por necessidade e Bianca por oportunidade — e nenhuma das duas motivações é mais válida que a outra",
          "Os dois empreendem por oportunidade, pois qualquer negócio novo é uma oportunidade",
          "André não pode ser considerado empreendedor, pois agiu sob pressão financeira",
          "Bianca empreende por necessidade, pois já tinha emprego estável",
        ],
        correta: 0,
        explicacao: "O GEM classifica pela motivação de partida: necessidade (falta de alternativa de renda) ou oportunidade (escolha deliberada) — nenhuma das duas é 'melhor', são só pontos de partida diferentes.",
        variante: {
          pergunta: "Diante da perda do único emprego da família, Marcos passa a fazer bicos de pintura residencial para garantir renda. Já Renata, com salário estável, identifica uma lacuna no mercado de doces sem açúcar do bairro e decide investir por escolha própria. Segundo a classificação usada por pesquisas como o GEM, como esses dois casos seriam descritos?",
          opcoes: [
            "Marcos empreende por necessidade e Renata por oportunidade — nenhuma das duas motivações é mais válida que a outra",
            "Os dois empreendem por necessidade, pois qualquer negócio novo surge de uma necessidade de mercado",
            "Marcos não pode ser considerado empreendedor, pois agiu sob pressão financeira",
            "Renata empreende por necessidade, pois já tinha um salário estável",
          ],
          correta: 0,
          explicacao: "Empreender por necessidade (falta de alternativa de renda) e por oportunidade (escolha deliberada) são apenas motivações de partida diferentes — a classificação do GEM não atribui mais valor a uma do que à outra.",
        },
      },
      {
        pergunta: "Um contador autônomo, atuando apenas no CPF, perde um contrato importante porque a empresa contratante exige nota fiscal, algo que ele não consegue emitir como pessoa física sem CNPJ. Qual vantagem prática ele ganharia ao se formalizar como PJ?",
        opcoes: [
          "Passaria a poder emitir nota fiscal, além de ter acesso a crédito PJ e contratos mais robustos com empresas",
          "Ficaria isento de qualquer imposto",
          "Perderia o direito de atender clientes pessoa física",
          "Ficaria proibido de emitir qualquer tipo de documento",
        ],
        correta: 0,
        explicacao: "Formalizar como PJ costuma abrir portas comerciais que a informalidade no CPF não oferece — como emitir nota fiscal, ter acesso a crédito PJ e fechar contratos mais robustos com outras empresas.",
        variante: {
          pergunta: "Uma fotógrafa autônoma sem CNPJ perde um contrato com uma agência de eventos porque a agência exige emissão de nota fiscal para fechar negócio. Que vantagem prática ela passaria a ter ao se formalizar como PJ?",
          opcoes: [
            "Passaria a poder emitir nota fiscal, além de ter acesso a crédito PJ e contratos mais robustos com empresas",
            "Ficaria isenta de declarar qualquer imposto",
            "Perderia o direito de atender clientes pessoa física",
            "Ficaria proibida de emitir qualquer tipo de documento fiscal",
          ],
          correta: 0,
          explicacao: "Assim como no caso do contador, formalizar como PJ costuma abrir acesso a nota fiscal, crédito PJ e contratos mais robustos — vantagens que a atuação informal no CPF não oferece.",
        },
      },
      {
        pergunta: "Um sócio de uma Sociedade Unipessoal vê a empresa não conseguir pagar um fornecedor por dificuldades de caixa, sem qualquer fraude ou irregularidade envolvida. O que a separação patrimonial busca garantir, nesse caso, em relação aos bens pessoais dele?",
        opcoes: [
          "Que seus bens pessoais fiquem, em geral, protegidos dessa dívida específica da empresa",
          "Que o fornecedor pode tomar automaticamente qualquer bem pessoal dele",
          "Que ele nunca mais poderá ser sócio de outra empresa",
          "Que a dívida da empresa seja automaticamente cancelada",
        ],
        correta: 0,
        explicacao: "Em tipos societários como a Sociedade Unipessoal, o patrimônio pessoal do sócio costuma ficar protegido das dívidas da empresa, respeitadas as exceções previstas em lei (como fraude ou confusão patrimonial).",
        variante: {
          pergunta: "Um sócio de uma LTDA vê a empresa não conseguir pagar um empréstimo bancário por dificuldades no fluxo de caixa, sem qualquer fraude ou irregularidade na condução do negócio. O que a separação patrimonial busca garantir em relação à casa dele, registrada em seu nome pessoal?",
          opcoes: [
            "Que a casa fique, em geral, protegida dessa dívida específica da empresa",
            "Que o banco pode tomar a casa automaticamente para quitar a dívida",
            "Que ele nunca mais poderá abrir outra empresa",
            "Que a dívida da empresa seja automaticamente cancelada",
          ],
          correta: 0,
          explicacao: "A separação patrimonial busca manter o patrimônio pessoal do sócio protegido das dívidas da empresa, respeitadas as exceções legais para casos de fraude ou irregularidade.",
        },
      },
      {
        pergunta: "Uma barbearia tem R$ 3.000 de custos fixos por mês, e cada corte de cabelo gera uma margem de contribuição de R$ 25 depois de descontar o custo variável (produtos usados). Quantos cortes por mês a barbearia precisa fazer para atingir o ponto de equilíbrio?",
        opcoes: [
          "120 cortes, o suficiente para cobrir os R$ 3.000 de custos fixos com a margem de R$ 25 por corte",
          "25 cortes",
          "3.000 cortes",
          "É impossível calcular sem saber o número de funcionários",
        ],
        correta: 0,
        explicacao: "O ponto de equilíbrio é o volume de vendas em que a margem de contribuição acumulada cobre exatamente os custos fixos: R$ 3.000 ÷ R$ 25 = 120 cortes.",
        variante: {
          pergunta: "Uma oficina mecânica tem R$ 7.200 de custos fixos por mês, e cada serviço de revisão gera uma margem de contribuição de R$ 90, depois de descontar peças e materiais usados. Quantas revisões por mês são necessárias para atingir o ponto de equilíbrio?",
          opcoes: [
            "80 revisões, o suficiente para cobrir os R$ 7.200 de custos fixos com a margem de R$ 90 por revisão",
            "90 revisões",
            "7.200 revisões",
            "É impossível calcular sem saber o número de funcionários",
          ],
          correta: 0,
          explicacao: "R$ 7.200 ÷ R$ 90 = 80 revisões — volume necessário para que a margem de contribuição acumulada cubra exatamente os custos fixos do mês.",
        },
      },
      {
        pergunta: "Uma loja de roupas recém-aberta calculou que precisa faturar R$ 15.000 por mês para atingir o ponto de equilíbrio, mas fatura apenas R$ 9.000 nos dois primeiros meses. O que costuma sustentar esse tipo de negócio durante esse período inicial, evitando que ele feche as portas antes de estabilizar as vendas?",
        opcoes: [
          "A existência de um capital de giro reservado previamente para cobrir esse período abaixo do ponto de equilíbrio",
          "O fato de os custos fixos deixarem de existir nos primeiros meses",
          "A margem de contribuição, que aumenta automaticamente nos primeiros meses",
          "Nada sustenta o negócio; ele necessariamente fecha se não bater o ponto de equilíbrio de imediato",
        ],
        correta: 0,
        explicacao: "É justamente para cobrir esse período inicial, quando o faturamento ainda está abaixo do ponto de equilíbrio, que o capital de giro existe — uma reserva à parte do investimento inicial.",
        variante: {
          pergunta: "Uma hamburgueria recém-aberta calculou que precisa faturar R$ 20.000 por mês para atingir o ponto de equilíbrio, mas fatura apenas R$ 11.000 nos dois primeiros meses. O que costuma sustentar esse tipo de negócio durante esse período inicial, evitando que ele feche antes de estabilizar as vendas?",
          opcoes: [
            "A existência de um capital de giro reservado previamente para cobrir esse período abaixo do ponto de equilíbrio",
            "O fato de os custos fixos deixarem de existir nos primeiros meses",
            "A margem de contribuição, que aumenta automaticamente nos primeiros meses",
            "Nada sustenta o negócio; ele necessariamente fecha se não bater o ponto de equilíbrio de imediato",
          ],
          correta: 0,
          explicacao: "O capital de giro reservado com antecedência é o que permite ao negócio sobreviver ao período inicial, quando o faturamento ainda está abaixo do ponto de equilíbrio.",
        },
      },
      {
        pergunta: "Um aplicativo de aulas de idiomas define claramente para quem vende — profissionais que precisam de inglês para o trabalho, e não 'qualquer pessoa que queira aprender inglês'. No mapeamento simplificado de modelo de negócio, essa definição corresponde a qual bloco?",
        opcoes: [
          "Segmento de cliente — quem, exatamente, o negócio pretende atender",
          "Estrutura de custo",
          "Canais",
          "Fontes de receita",
        ],
        correta: 0,
        explicacao: "Definir o segmento de cliente é dizer, de forma específica, para quem o negócio existe — quanto mais vago ('qualquer pessoa'), mais difícil acertar a proposta de valor e os canais.",
        variante: {
          pergunta: "Uma consultoria financeira anuncia 'reduzimos em até 30% seus gastos mensais em 90 dias, com acompanhamento semanal', em vez de apenas dizer 'fazemos consultoria financeira'. No mapeamento simplificado de modelo de negócio, essa comunicação mais específica corresponde principalmente a qual bloco?",
          opcoes: [
            "Proposta de valor — o benefício concreto que justifica a escolha do cliente",
            "Estrutura de custo",
            "Segmento de cliente",
            "Canais",
          ],
          correta: 0,
          explicacao: "A proposta de valor é o motivo concreto pelo qual o cliente escolheria essa solução — descrever o benefício real ('reduzimos gastos em 30%'), e não apenas a atividade genérica ('fazemos consultoria'), é o que caracteriza esse bloco.",
        },
      },
      {
        pergunta: "Uma empreendedora testou um MVP de doces veganos vendendo diretamente para academias, mas percebeu, no contato real com o mercado, que quem mais comprava eram cafés vegetarianos. Ela decide então redirecionar as vendas para esse novo público, mantendo o mesmo produto. Como se chama esse tipo de ajuste, no ciclo 'construir-medir-aprender' da abordagem Lean Startup?",
        opcoes: [
          "Falência técnica",
          "Pivotar — ajustar um aspecto do modelo de negócio com base em aprendizado real obtido com o mercado",
          "Sonegação fiscal",
          "Cost-plus",
        ],
        correta: 1,
        explicacao: "Pivotar é redirecionar algum aspecto do modelo de negócio (aqui, o segmento de cliente) a partir de evidências reais colhidas com o mercado, sem abandonar o negócio inteiro — é o núcleo do ciclo 'construir-medir-aprender' da Lean Startup.",
        variante: {
          pergunta: "Um empreendedor testa um MVP de refeições congeladas voltado para atletas, mas percebe, no contato real com clientes, que quem mais compra são famílias com rotina corrida que não têm tempo de cozinhar. Ele decide redirecionar o foco comercial para esse novo público, mantendo o mesmo produto. Como se chama esse tipo de ajuste?",
          opcoes: [
            "Falência técnica",
            "Pivotar — ajustar um aspecto do modelo de negócio com base em aprendizado real obtido com o mercado",
            "Sonegação fiscal",
            "Cost-plus",
          ],
          correta: 1,
          explicacao: "Redirecionar o foco comercial com base no que o mercado realmente mostrou, sem abandonar o negócio inteiro, é o que se chama de pivotar.",
        },
      },
      {
        pergunta: "Uma designer de interiores cobra um valor mais alto de um cliente cuja reforma está atrasando a entrega de um imóvel alugado (gerando prejuízo diário) do que cobraria pelo mesmo projeto numa situação sem urgência — porque o valor que ela entrega, nesse caso, é resolver um prejuízo real e imediato. Que lógica de precificação é essa?",
        opcoes: [
          "Precificação por valor percebido — o preço reflete o benefício real entregue ao cliente, não só o custo do serviço",
          "Cost-plus",
          "Freemium",
          "Comissão",
        ],
        correta: 0,
        explicacao: "Cobrar com base no benefício real entregue ao cliente naquele contexto específico (resolver um prejuízo imediato), e não só no custo do serviço, é a lógica da precificação por valor percebido.",
        variante: {
          pergunta: "Um encanador cobra mais para consertar, ainda hoje, o vazamento que está impedindo uma loja de abrir ao público, do que cobraria pelo mesmo conserto numa casa sem nenhuma pressa — porque o valor que ele entrega, nesse caso, é evitar um prejuízo comercial imediato. Que lógica de precificação é essa?",
          opcoes: [
            "Precificação por valor percebido — o preço reflete o benefício real entregue ao cliente, não só o custo do serviço",
            "Cost-plus",
            "Freemium",
            "Comissão",
          ],
          correta: 0,
          explicacao: "Assim como no caso da designer de interiores, cobrar com base no benefício real entregue ao cliente naquele contexto (evitar um prejuízo comercial imediato), e não só no custo do serviço, é a lógica da precificação por valor percebido.",
        },
      },
      {
        pergunta: "Um MEI de artesanato faturou 25% acima do teto anual permitido em um determinado ano. Segundo a regra de ultrapassagem do MEI, o que tende a acontecer com o enquadramento tributário dele?",
        opcoes: [
          "Ele paga apenas o DAS complementar e continua MEI até o fim do ano",
          "Ele é desenquadrado automaticamente e retroativamente desde janeiro daquele ano, sendo tributado pelo Simples Nacional sobre todo o período",
          "Nada acontece, pois o teto é apenas uma sugestão",
          "Ele fica automaticamente isento de qualquer imposto adicional",
        ],
        correta: 1,
        explicacao: "Passar do teto do MEI em mais de 20% provoca desenquadramento retroativo a janeiro do próprio ano, com tributação pelo Simples Nacional sobre todo o período — não apenas a partir do mês em que passou do limite.",
        variante: {
          pergunta: "Um MEI de doces faturou 12% acima do teto anual permitido em um determinado ano. Segundo a regra de ultrapassagem do MEI, o que tende a acontecer?",
          opcoes: [
            "Ele é desenquadrado retroativamente desde janeiro daquele ano",
            "Ele paga o DAS complementar sobre a diferença de imposto referente ao excesso, migrando para o Simples Nacional apenas a partir do ano seguinte",
            "Nada acontece, pois passou pouco do teto",
            "Ele perde o direito de ser MEI para sempre, mesmo no ano seguinte",
          ],
          correta: 1,
          explicacao: "Como o excesso (12%) está dentro da faixa de até 20% acima do teto, ele paga apenas o DAS complementar sobre a diferença de imposto, e a migração para o Simples Nacional só ocorre a partir do ano-calendário seguinte.",
        },
      },
    ],
  },
];
```

#### 4. Precisão factual/financeira — checklist de validação

- Nenhum número novo foi introduzido nas 10 perguntas: o teto anual do MEI
  (~R$ 81 mil), o teto mensal proporcional (~R$ 6.750) e a faixa de
  tolerância de 20% na regra de ultrapassagem são exatamente os mesmos já
  publicados e sinalizados como aproximados em `e2_1` — nenhum valor novo
  foi inventado, e o texto de introdução da revisão não repete esses
  números (evita duplicar um dado que pode ficar desatualizado em dois
  lugares diferentes de `js/data.js`).
- Todos os valores usados nos cálculos de ponto de equilíbrio/margem de
  contribuição (perguntas 5 e 6, base + variante) foram checados à mão:
  R$ 3.000 ÷ R$ 25 = 120; R$ 7.200 ÷ R$ 90 = 80 — nenhuma pergunta pede
  ao aluno um cálculo cujo resultado não bata com a opção marcada como
  `correta`.
- Nenhuma pergunta ou explicação soa como recomendação personalizada de
  investimento, tributação ou abertura de empresa — todas descrevem
  conceitos genéricos e situações fictícias, mesma postura editorial já
  usada no restante da trilha Empreender.
- Cada `explicacao` (base e variante) foi escrita para ser compreensível
  por alguém sem conhecimento prévio, respondendo diretamente "por que a
  opção marcada como certa está certa" — mesmo critério de aceite já usado
  no resto do projeto e citado explicitamente na tarefa desta etapa.
- Nenhuma das 10 perguntas-base é texto idêntico a nenhuma pergunta ou
  variante já existente em `e1_1`, `e1_2`, `e1_3`, `emod_1`, `emod_2`,
  `emod_3` ou `e2_1` — todas usam personagens, negócios e números
  diferentes dos originais, mudando a situação-problema mas preservando o
  conceito testado, conforme pedido explícito do usuário.

#### Registro da etapa

- **Resumo da etapa**: escritas as 10 perguntas (base + variante cada) da
  revisão-piloto `revE_01` da trilha `BUSINESS_COURSE`, cobrindo as 7 lições
  `e1_1, e1_2, e1_3, emod_1, emod_2, emod_3, e2_1` com distribuição 2-2-2-
  1-1-1-1 (nenhuma lição sem cobertura), todas como situações-problema novas
  (não cópias literais das perguntas originais), com `titulo` e `aula`
  finais definidos. Objeto completo pronto para colagem em `js/data.js`
  registrado na seção 3 acima.
- **Decisões tomadas**: distribuição de cobertura por lição (seção 1),
  texto final de `titulo`/`aula` (seção 2), as 10 perguntas com suas
  variantes (seção 3), validação factual/numérica (seção 4). Nenhum valor
  numérico novo introduzido — todos reaproveitam os já publicados e
  sinalizados como aproximados em `e2_1`.
- **Pendências para os próximos agentes**:
  - **Backend/Frontend Engineer (Fase 3B)**: colar o objeto da seção 3 em
    `js/data.js` como o array `BUSINESS_REVIEWS` (ou adicionar `revE_01` a
    esse array, caso já exista outro conteúdo), seguindo exatamente o
    mecanismo de inserção por ancoragem de `refLessonIds` definido pelo
    Software Architect (seção 3 da etapa 12) — inclusive o clone obrigatório
    de `licoes` para não mutar `BUSINESS_COURSE`. Depois de colado, rodar
    `node --check js/data.js` e o script de validação de ids
    duplicados/`opcoes.length===4`/`correta` válido/`variante` presente
    (mesmo procedimento já usado para qualquer edição de `js/data.js`),
    incluindo checar que `revE_01` não colide com nenhum `id` já existente
    em `BUSINESS_COURSE`.
  - **UX/UI Designer**: aplicar a identidade visual do nó de revisão
    (pendência já registrada na etapa 13) — sem relação com o conteúdo
    entregue aqui.
  - **QA Engineer**: validar, além do checklist estrutural já recomendado
    pelo Software Architect (seção 8, risco 3, etapa 12), que as 10
    perguntas realmente aparecem na trilha depois de `e2_1` ser concluída,
    e não antes (trava de segurança por ancoragem de id).
- **Riscos**: nenhum risco de conteúdo identificado — todas as perguntas
  reaproveitam conceitos e números já validados nas 7 lições originais,
  sem alíquota/teto/definição nova sendo introduzida por esta revisão.
- **Próximo agente responsável**: Backend/Frontend Engineer (Fase 3B —
  implementar o mecanismo de inserção definido pelo Software Architect e
  colar o conteúdo desta seção em `js/data.js`).

### 16. Frontend Engineer (Fase 3B — Implementação do piloto de revisão em Empreender)

Confirmado por `git status`/`git diff --stat` no início desta etapa: nenhuma
mudança pendente em código (só a própria RFC estava modificada, de sessões
anteriores) — esta implementação partiu do zero, sem nenhum progresso
prévio herdado. Implementado exatamente o que as seções 12 (Software
Architect), 13 (Gamification Designer), 14 (Financial Specialist) e 15
(UX/UI Designer) especificaram, em `js/data.js`, `js/business.js` e
`css/style.css`. Escopo confirmado: só a trilha Empreender (`js/trail.js`/
trilha unificada Aprender não foi tocado, conforme instruído — fica para a
Fase 3C).

#### 1. `js/data.js` — array `BUSINESS_REVIEWS`

Colado imediatamente após o fechamento de `BUSINESS_COURSE` (linha 21118 do
arquivo original), com um comentário de cabeçalho explicando o mecanismo de
ancoragem. Conteúdo copiado literalmente da seção 14 (Financial Specialist)
— `revE_01`, `xp: 35`, `refLessonIds: ["e1_1", "e1_2", "e1_3", "emod_1",
"emod_2", "emod_3", "e2_1"]`, as 10 perguntas (base + variante cada). Nenhum
texto/número alterado em relação ao que o Financial Specialist entregou.

#### 2. `js/business.js` — mecanismo de inserção (seção 12 do Software Architect)

`Business` não tinha um método `levels()` (só `flatLessons()` iterando
`BUSINESS_COURSE` direto) — diferente de `Trail`, que já tinha essa camada
intermediária desde a Fase 2. Adicionado `Business.levels()`, no mesmo
espírito de `Trail.levels()`:

```js
levels() {
  if (this._levels) return this._levels;
  const withReviews = BUSINESS_COURSE.map((lvl) => {
    const licoes = [];
    lvl.licoes.forEach((lesson) => {
      licoes.push(lesson);
      const review = BUSINESS_REVIEWS.find((r) => r.refLessonIds[6] === lesson.id);
      if (review) licoes.push(review);
    });
    return { ...lvl, licoes };
  });
  this._levels = withReviews;
  return withReviews;
},
```

`licoes` é montado num array **novo** via `push` (nunca reaproveita a
referência de `lvl.licoes`), e o nível é espalhado num objeto novo (`{
...lvl, licoes }`) — os dois clones que a seção 12 exigia como obrigatórios
(risco 1: um shallow clone só do nível não basta, porque `licoes` continua
apontando pro array original se não for reconstruído). `flatLessons()`,
`render()` e `startLesson()` — que antes liam `BUSINESS_COURSE` diretamente
— passaram a ler `this.levels()`:

- `flatLessons()`: `BUSINESS_COURSE.forEach(...)` → `this.levels().forEach(...)`.
- `render()`: `${BUSINESS_COURSE.map(...)}` → `${this.levels().map(...)}`.
- `startLesson(levelIdx, lessonIdx)`: `BUSINESS_COURSE[levelIdx]` →
  `this.levels()[levelIdx]`.

`levelHtml()`, `isDone()`, `isUnlocked()`, `nextEntry()`, `answerQuestion()`,
`nextQuestion()` **não precisaram de nenhuma mudança de lógica** — todos já
operavam sobre `level.licoes`/`lesson` genericamente, exatamente como a
seção 12 previu. `_levels: null` foi adicionado ao objeto `Business` (ao
lado do `_flat: null` já existente) só por consistência de estilo com
`Trail._levels`, não por necessidade funcional (`this._levels` já seria
`undefined` sem essa declaração, com o mesmo efeito no `if (this._levels)`).

#### 3. `js/business.js` — título/subtexto da tela de conclusão (seção 13 do Gamification Designer)

Em `finishLesson()`, adicionado `const isRevisao = lesson.tipo === "revisao";`
e dois pontos condicionados a ele:

- Título: `${passed ? (isRevisao ? "Revisão dominada!" : "Lição concluída!") : "Quase lá!"}`.
- Subtexto extra, só quando `celebrar` (= `passed && !alreadyDone`, variável
  já existente) **e** `isRevisao`: `"Você reforçou o que já tinha
  aprendido — é isso que faz o conhecimento ficar de verdade."`, inserido
  logo abaixo do `<p>` de "Você acertou X de Y perguntas", antes do bloco de
  XP/moedas — exatamente a posição pedida na seção 13.

Nenhuma outra linha do fluxo de conclusão mudou: confete (`Fx.confetti`),
glow (`Fx.successGlow`), pop de XP (`Fx.xpPop`), mascote
(`Fx.mascotCelebrate`), moedas (`Fx.coinBurst`), o guard `alreadyDone`, o
`LESSON_LOG`, `Learn.addXp`/`Learn.addCoins` — tudo reaproveitado sem
nenhuma condicional nova, conforme a decisão explícita de "reaproveitar 100%
do fluxo visual padrão".

#### 4. `js/business.js` + `css/style.css` — identidade visual (seção 15 do UX/UI Designer)

Em `levelHtml()`, dentro do callback de `gridHtml()`:

- `const isRevisao = lesson.tipo === "revisao";` e
  `const icon = done ? "✅" : unlocked ? (isRevisao ? "🔁" : "💼") : "🔒";`
  (adaptado do diff da seção 15, que usava `isHistoria` — não existe em
  `business.js`, então o branch ficou só `isRevisao` vs. o ícone fixo 💼 já
  usado por toda a trilha Empreender).
- Classe `revisao` adicionada à `div.trail-node` quando `isRevisao`.
- `<div class="trail-node-tag">🔁 Revisão</div>` inserido dentro de
  `.trail-node-inner`, depois de `.trail-node-xp`, condicionado a `isRevisao`.

Em `css/style.css`, logo após `.trail-node-xp` (antes do comentário de
"Conectores entre nós"): `.trail-node-tag` (+ variante `.locked`, opacidade
0.6) e as 3 regras de `box-shadow` de `.trail-node.revisao .trail-node-ring`
(padrão, `.done`, `.current:not(.locked)`) — copiadas literalmente da seção
15, sem nenhum ajuste. Nenhuma entrada nova em
`@media (prefers-reduced-motion: reduce)`, conforme a decisão explícita do
UX/UI Designer de que esta identidade não introduz animação nova.

Nenhum ajuste foi necessário em relação ao diff original da seção 15 além da
adaptação `isHistoria` → `isRevisao` já descrita acima (justificada por
`business.js` nunca ter tido esse branch, já que é uma trilha só, sem
intercalação financeira/história).

#### 5. Validação de sintaxe

`node --check` não está disponível neste ambiente (confirmado por
`command -v node`, mesma limitação já registrada nas Fases 1 e 2 desta RFC).
Como alternativa, os três arquivos (`js/data.js`, `js/business.js`,
`css/style.css`) foram exercitados de ponta a ponta em Chrome real via CDP
(seção 6 abaixo) — qualquer erro de sintaxe em `js/data.js`/`js/business.js`
teria impedido `Business.levels()`/`Business.render()` de rodar sem exceção,
e um CSS malformado teria sido visível nos screenshots. Nenhuma exceção JS
foi lançada em nenhum dos testes (confirmado via `Runtime.exceptionThrown`
do CDP, coletado em toda sessão de teste).

#### 6. Teste manual real (Chrome headless via CDP)

Harness montado a partir do padrão já documentado nas Fases 1/2 desta RFC
(Node/Python "puro" indisponíveis para bibliotecas prontas de automação, mas
`python3` 3.14 e um `chrome.exe` reais estão disponíveis neste ambiente):
`python3 -m http.server 8899` servindo a raiz do projeto +
`chrome.exe --headless=new --remote-debugging-port=9333
--remote-allow-origins=*` (a flag `--remote-allow-origins` foi necessária
nesta versão do Chrome — 151.0.7922.76 — sem ela o handshake do WebSocket é
rejeitado com 403; não estava documentada nas fases anteriores, possivelmente
por causa de uma versão de Chrome mais nova neste ambiente) + um driver
Python reaproveitado do scratchpad da sessão (`cdp.py`, já existente de
fases anteriores, com uma classe `Tab`/`new_tab`/`list_tabs` sobre
`websocket-client`, biblioteca já instalada no ambiente). Como o app exige
conta (RFC-027, gate `App.ensureAuthenticated()`), foi feito um cadastro
real via Supabase (mesmo caminho já usado por sessões de QA anteriores
registradas no scratchpad, ex. `qa032_3_signup.ps1`) com um e-mail de teste
em `mailinator.com` — login confirmado imediato (`Cloud.isLoggedIn() ===
true` logo após o cadastro, sem exigir confirmação de e-mail neste ambiente).

Testes executados e resultados:

- **Inserção correta, âncora por id**: `Business.flatLessons()` retornou
  `revE_01` na posição 7 (0-based), imediatamente depois de `e2_1` (posição
  6) — `["e1_1","e1_2","e1_3","emod_1","emod_2","emod_3","e2_1","revE_01","e2_2",...]`,
  19 lições no total (18 reais + 1 revisão). Confirmado que a inserção
  funciona tanto para `flatLessons()` (usado por `isUnlocked`/`nextEntry`)
  quanto para a renderização real do grid (`document.querySelectorAll(
  '#businessTrailContainer .trail-node').length === 19`), sem nenhuma
  mudança em `gridHtml()`, exatamente como a seção 12 previu.
- **Trava de segurança da âncora**: com progresso simulado cobrindo as 6
  primeiras lições (`e1_1`...`emod_3`) mas **não** `e2_1`, `revE_01` ficou
  com classe `"trail-node locked  revisao"` (bloqueada) e `nextEntry()`
  apontou para `e2_1`, não para a revisão — confirmando que a revisão não
  aparece desbloqueada antes da hora. Ao marcar `e2_1` como concluído,
  `revE_01` passou a `"trail-node  current revisao"` (desbloqueada e
  atual) na mesma chamada de `Business.render()`, sem recarregar a página.
- **Mutação do array canônico — teste mais crítico**: `BUSINESS_COURSE.map(l
  => l.licoes.length)` foi lido **antes** de qualquer chamada a
  `Business.levels()`/`render()` (`[3,3,3,3,3,3]`) e **depois** de navegar
  pela trilha inteira, completar a revisão e recarregar a página do zero
  (`[3,3,3,3,3,3]` de novo, em todas as verificações) — nenhuma entrada
  `tipo:"revisao"` jamais apareceu dentro de `BUSINESS_COURSE`. O clone
  funcionou como especificado.
- **Fluxo completo do quiz da revisão**: clique no nó → `Energy.tryStart()`
  consumiu 1 energia (5→4) → aula (`lesson.aula`) renderizada → quiz com
  exatamente 10 perguntas (`Business.activeQuiz.lesson.perguntas.length ===
  10`) → as 10 respondidas corretamente → tela de conclusão com título
  **"Revisão dominada!"**, subtexto **"Você reforçou o que já tinha
  aprendido — é isso que faz o conhecimento ficar de verdade."**, e
  **"+35 XP e +5 moedas adicionadas à sua conta."** — XP subiu exatamente
  +35 (`Learn.getXp()` 5→40) e moedas exatamente +5 (`Learn.getCoins()`
  5→10), batendo com `revisao.xp = 35` definido pelo Gamification Designer.
  Energia voltou de 4 para 5 ao final, não por isenção alguma, mas pelo
  bônus de combo já existente (`ENERGY_COMBO=3`, disparado 3x num streak de
  10 acertos seguidos) — comportamento herdado do sistema de energia
  padrão, não um caso especial de revisão. `STORAGE_KEYS.LESSON_LOG` ganhou
  exatamente 1 entrada nova (`{ lessonId: "revE_01", fonte: "empreender",
  ... }`), confirmando que conta para a missão semanal sem filtro algum,
  como decidido na seção 13. Ao fechar a tela,
  `Store.get(STORAGE_KEYS.BUSINESS_PROGRESS, {})["revE_01"] === true`.
- **Nenhuma regressão nas outras 18 lições**: depois de concluir a revisão,
  `nextEntry()` avançou corretamente para `e2_2` (a próxima lição real na
  sequência); marcando manualmente todas as 18 lições reais + a revisão como
  concluídas, `Business.flatLessons().filter(isDone).length === 19 ===
  flat.length` (100%), sem nenhum nó preso ou destravamento fora de ordem.
- **Identidade visual nos 3 estados, validada por captura de tela real**
  (não só leitura de classes CSS): screenshots em 1400×1000 (desktop,
  `COLS=5`) e 375×900 com `mobile:true` (viewport mínimo de referência da
  Fase 2) confirmaram — nó atual: pino ▲ visível acima do anel (sem o corte
  do bug já corrigido na Fase 2), ícone 🔁 dentro do anel com glow
  roxo+dourado sobreposto (accent de revisão + accent de "atual"
  coexistindo, como a seção 15 previu), tag "🔁 REVISÃO" abaixo do XP sem
  sobrepor o pino; nó bloqueado: ícone 🔒, tag com opacidade reduzida
  (0.6); nó concluído (verificado via classe, `"trail-node done  revisao"`):
  ícone ✅. Em 375px, o acento de cor roxo do anel não cortou nem o ícone
  nem a tag — só o glow decorativo nas bordas mais extremas, exatamente o
  "recorte aceitável" que a seção 15 já havia antecipado como risco
  controlado, não um bug.
- **Console/exceções**: zero `Runtime.exceptionThrown` em toda a sessão de
  teste (cadastro, navegação, 3 renderizações de progresso diferentes, quiz
  completo de 10 perguntas, reload completo da página). Nenhum novo aviso de
  console além do já conhecido e não relacionado (deprecação do
  `three.js`, mesmo achado registrado na Fase 2).

#### 7. Ajustes em relação à especificação original (com justificativa)

Só um ajuste, puramente de adaptação de nome de variável, sem mudança de
comportamento: o diff de markup da seção 15 (UX/UI Designer) foi escrito
contra `js/trail.js`, que tem uma variável `isHistoria` (financeira vs.
história) que não existe em `business.js` (a trilha Empreender é uma fonte
só, sempre ícone 💼 quando não é revisão). O branch foi adaptado de
`isRevisao ? "🔁" : (isHistoria ? "📜" : "📘")` para `isRevisao ? "🔁" :
"💼"` — mesma estrutura condicional, só com o ramo irrelevante removido.
Nenhuma outra divergência: `refLessonIds`, `xp`, título/subtexto de
conclusão, CSS e o mecanismo de inserção foram implementados exatamente como
especificado pelas 4 seções anteriores.

#### 8. Arquivos alterados

- `js/data.js` — novo array `BUSINESS_REVIEWS` (1 entrada, `revE_01`),
  adicionado após `BUSINESS_COURSE`. `BUSINESS_COURSE` em si não foi
  alterado (confirmado em runtime, seção 6 acima).
- `js/business.js` — novo método `levels()` (+ `_levels: null` no estado do
  módulo); `flatLessons()`, `render()` e `startLesson()` passaram a usar
  `this.levels()` em vez de `BUSINESS_COURSE` diretamente; `levelHtml()`
  ganhou o branch de ícone/classe `revisao`/tag; `finishLesson()` ganhou o
  branch de título/subtexto condicionado a `lesson.tipo === "revisao"`.
- `css/style.css` — `.trail-node-tag` (+ `.trail-node.locked
  .trail-node-tag`) e as 3 regras de `.trail-node.revisao .trail-node-ring`
  (padrão/`.done`/`.current`), inseridas logo após `.trail-node-xp`.

Nenhum arquivo fora desses três foi tocado — `js/trail.js` (trilha
unificada Aprender) permanece como estava antes desta fase, conforme
escopo definido.

#### Registro da etapa

- **Resumo da etapa**: implementado o piloto de revisão periódica na
  trilha Empreender — `BUSINESS_REVIEWS`/`revE_01` em `js/data.js`,
  mecanismo de inserção ancorado por id via novo `Business.levels()` (com
  clone de nível e de `licoes`, confirmado em runtime que `BUSINESS_COURSE`
  nunca é mutado), identidade visual do nó (ícone 🔁, classe `revisao`, tag
  "🔁 Revisão", accent roxo no anel) e o branch de título/subtexto
  "Revisão dominada!" na tela de conclusão — tudo validado ao vivo em
  Chrome real via CDP, incluindo o teste de mutação (o mais crítico),
  trava de segurança da âncora, fluxo completo do quiz, ausência de
  regressão nas 18 lições reais, e conferência visual em 2 viewports.
- **Decisões tomadas**: nenhuma decisão de produto/arquitetura/conteúdo/
  design nova — esta etapa só implementou o que as seções 12-15 já haviam
  decidido. Única escolha de implementação: adaptação `isHistoria` →
  `isRevisao` no branch de ícone (seção 7 acima), sem impacto de
  comportamento.
- **Pendências para os próximos agentes**:
  - **QA Engineer**: validação independente dos mesmos cenários (inserção,
    trava de segurança, mutação do array canônico, fluxo de XP/energia/
    moedas, regressão nas lições normais, estados visuais), idealmente com
    um script de verificação estrutural de `BUSINESS_REVIEWS` (7 ids únicos
    em `refLessonIds`, todos existentes em `BUSINESS_COURSE`, sem
    sobreposição entre revisões futuras) conforme recomendado pelo Software
    Architect na seção 12, risco 3 — hoje só há 1 revisão, então esse
    script ainda não tem colisão para detectar, mas vale existir antes da
    2ª revisão (âncora `e4_2`, mencionada como possível próxima rodada
    pelo Gamification Designer na seção 13).
  - **Documentation Specialist**: registrar esta fase no `CHANGELOG.md`
    (nova entrada de versão) e, se aplicável, no `ROADMAP.md` (marcar a
    Fase 3B como concluída, Fase 3C — rollout na trilha unificada Aprender —
    como próxima).
- **Riscos**: nenhum risco novo em aberto. O risco mais crítico apontado
  pelo Software Architect (mutação acidental de `BUSINESS_COURSE`) foi
  mitigado pelo clone duplo em `Business.levels()` e confirmado por teste
  de runtime antes/depois, não só por inspeção de código.
- **Próximo agente responsável**: QA Engineer.

### 17. QA Engineer (validação independente — Fase 3B, piloto de revisão em Empreender)

Validação feita de forma independente do autorrelato do Frontend Engineer —
nenhum resultado da seção 16 foi aceito sem reprodução própria. Ambiente:
`git diff --stat`/`git status` confirmados antes de testar (só `css/style.css`,
`js/business.js`, `js/data.js` e esta RFC modificados; `js/trail.js`
confirmado intocado por `git diff --stat -- js/trail.js` vazio); `python -m
http.server 8899` servindo a raiz do projeto; Chrome real
(`151.0.7922.76`) headless via CDP (`--remote-debugging-port=9333
--remote-allow-origins=*`), controlado por um driver Python próprio
(`cdp.py`, escrito nesta sessão, `websocket-client` já disponível no
ambiente) — mesmo padrão já usado nas Fases 1/2 desta RFC. `node --check`
segue indisponível neste ambiente (confirmado de novo); a leitura de
`js/data.js` inteiro (sintaxe válida, sem `SyntaxError`) foi confirmada
indiretamente pelo fato de `BUSINESS_REVIEWS` ter sido lido e usado em
runtime sem exceção em nenhum dos testes abaixo.

Conta de teste real criada via `Cloud.signUp()` com e-mail descartável
`@mailinator.com` (mesmo caminho já usado pelo Frontend Engineer, gate
RFC-027 exige conta). **Achado metodológico, não é bug do app**: os
primeiros testes desta sessão deram falso-negativo (nó de revisão
aparentando nunca desbloquear, cliques não iniciando o quiz) por dois
problemas do PRÓPRIO harness de teste, não do código do produto — registrados
aqui por transparência: (1) reaproveitar o mesmo perfil de Chrome entre
execuções deixava `localStorage` sujo entre contas de teste, e como
`Cloud.signUp()` + o gate de boot fazem push do estado local "sujo" para a
conta nova (comportamento já documentado da RFC-027), a energia/XP de testes
anteriores vazava para a conta seguinte — corrigido com `localStorage.clear()`
antes de cada `signUp()`; (2) o seletor usado para localizar nós por
`data-level`/`data-lesson` não estava escopado a `#businessTrailContainer`,
então `document.querySelector` por vezes casava com um nó de mesma
`data-level`/`data-lesson` da trilha unificada Aprender (`js/trail.js` usa a
mesma convenção de atributos) — corrigido prefixando o seletor. Registrando
isso explicitamente porque a tarefa exige transparência sobre o que não
pôde ser testado ou precisou de ajuste, não só os resultados finais.

#### Resultado por item pedido

**1. `git diff --stat`/`git status`** — confirmado: `css/style.css`
(+35/-0), `js/business.js` (+49/-6 conforme diff), `js/data.js` (+242/-0,
só o novo array `BUSINESS_REVIEWS` colado após `BUSINESS_COURSE`, que
permanece com as mesmas 21118 linhas anteriores a ele). Nenhum arquivo fora
do escopo anunciado pela seção 16 foi tocado.

**2. Navegação end-to-end com clique real** — conta nova, clique real em
`[data-tab=aprender]` → `[data-academia=empreender]` → clique real
(`node.click()`, disparando o listener de fato registrado por
`Business.render()`, não uma chamada direta a `startLesson()`) em cada um
dos 7 nós `e1_1, e1_2, e1_3, emod_1, emod_2, emod_3, e2_1`, resolvendo o
quiz completo de cada um (aula → 10 perguntas → tela de conclusão → fechar)
antes de avançar ao próximo. Confirmado por leitura de classe CSS em tempo
real: **antes** de `e2_1` ser concluído, o nó `revE_01` está presente no
grid (19 nós renderizados desde o início) mas com classe
`"trail-node locked  revisao"` — bloqueado, ícone 🔒, `node.click()` nele
retorna `"LOCKED"` no meu harness (a inserção não chama `startLesson`, pois
o próprio nó tem a classe `.locked`, que exclui o listener de clique —
`container.querySelectorAll(".trail-node:not(.locked)")` em
`js/business.js:184`). **Imediatamente depois** de `e2_1` concluído, na
mesma passada de `Business.render()` (sem reload), `revE_01` passa a
`"trail-node  current revisao"`, ícone 🔁, tag `"🔁 Revisão"` visível —
confirmando a trava de âncora exatamente como especificado pelo Software
Architect (seção 12) e reportado pelo Frontend Engineer.

**3. As 10 perguntas de `revE_01`** — confirmado em runtime,
`Business.activeQuiz.lesson.perguntas.length === 10`; percorridas as 10 via
clique real nas opções (`#businessQuizOptions .quiz-option`), cada uma com
exatamente 4 `opcoes` (validado também estruturalmente, ver script abaixo).
Forcei erro deliberado na 1ª pergunta (cliquei numa opção diferente de
`correta`) especificamente para exercitar o caminho de `variante`: o app
mostrou o aviso "🔁 Vamos reforçar esse mesmo conceito com outro exemplo:"
e a pergunta-variante substituiu a original: `answerQuestion()` foi
disparado 11 vezes no total (10 perguntas + 1 variante), confirmando que o
mecanismo de reforço funciona igual a qualquer lição normal, sem código
novo. Resultado final: "Você acertou 10 de 10 perguntas (100%)" — a
resposta certa na variante contou normalmente para `correctCount`, sem
duplicar nem faltar.

Validação estrutural adicional (script de verificação, recomendado pelo
Software Architect seção 12/risco 3, ainda não existente antes desta
sessão — escrito e executado aqui): `refLessonIds` tem exatamente 7 ids
únicos, todos existentes em `BUSINESS_COURSE`; nenhuma sobreposição entre
revisões (só há 1 hoje); as 10 perguntas-base e as 10 variantes têm todas
exatamente 4 `opcoes`, `correta` no intervalo `[0,3]`, `explicacao`
presente, e `variante` presente em toda pergunta-base — **zero problemas
estruturais**. Também confirmado por grep em todo `js/data.js` (incluindo
`COURSE`/`HISTORY_COURSE`/`BUSINESS_COURSE`) que `revE_01` não colide com
nenhum outro `id` publicado no app (139 ids totais, 139 únicos).

Releitura das 10 perguntas em busca de ambiguidade — **1 problema de
clareza/consistência de conteúdo encontrado**, ver "Bugs encontrados"
abaixo (Q9). As outras 9 perguntas (base + variante) estão claras, sem
opção "quase certa demais", com `explicacao` compreensível sem
conhecimento prévio, conforme o critério de aceite do usuário.

**4. Energia/XP/moedas/celebração** — confirmado por leitura de estado
antes/depois: energia `5 → 4` ao clicar no nó `revE_01` (`Energy.tryStart()`
sem isenção, como decidido pelo Gamification Designer); tela de conclusão
com `<h2>Revisão dominada!</h2>` e o subtexto exato
`"Você reforçou o que já tinha aprendido — é isso que faz o conhecimento
ficar de verdade."`; `"<b>+35 XP</b> e <b>+5 moedas</b> adicionadas à sua
conta."`; `Learn.getXp()` delta exato `+35`, `Learn.getCoins()` delta exato
`+5`; `STORAGE_KEYS.LESSON_LOG` ganhou 1 entrada
`{lessonId:"revE_01", fonte:"empreender", ...}`, confirmando que conta para
a missão semanal sem filtro, como decidido na seção 13.
`STORAGE_KEYS.BUSINESS_PROGRESS["revE_01"] === true` após concluir.

**5. Teste crítico de não-mutação** — `BUSINESS_COURSE.map(l =>
l.licoes.map(x => x.id))` lido em 4 momentos: (a) antes de qualquer
navegação à trilha, (b) depois das 7 lições normais concluídas, (c) depois
de concluir a revisão, (d) depois de completar as 18 lições reais + a
revisão (trilha 100%) **e um reload real da página (nova navegação HTTP,
não só re-render em JS)**. Nos 4 momentos o resultado foi idêntico — 6
níveis de 3 lições cada, exatamente como o array original — nenhuma
entrada `tipo:"revisao"` jamais apareceu dentro do array canônico. Depois
do reload, `revE_01` reapareceu corretamente como `"trail-node done
revisao"` (progresso persistido via `BUSINESS_PROGRESS`, sem depender do
array canônico). Confirma que o clone duplo em `Business.levels()`
funciona e é estável através de reload real, não só dentro da mesma sessão
de JS.

**6. Regressão nas outras 18 lições reais** — completada a trilha inteira
em ordem (`Business.flatLessons()`, 19 entradas, clique real em cada uma),
sem nenhum resultado `"LOCKED"` inesperado — todas destravaram em sequência
normalmente. `doneCount === 19 === flatLessons().length` ao final. Também
confirmado, por leitura de `isUnlocked(flatIdx) = doneCount >= flatIdx`
(`js/business.js:156-159`, não alterado por esta fase), que a revisão
funciona como um **gate obrigatório de fato**: como `doneCount` soma TODAS
as entradas concluídas (revisão incluída), não é possível destravar `e2_2`
(posição 8) sem primeiro concluir `revE_01` (posição 7) — consistente com a
decisão explícita do Gamification Designer (seção 13, item 2: "a revisão
não é opcional"), não uma descoberta de bug.

**7. Responsividade (375px vs desktop)** — capturado via
`Page.captureScreenshot` real (não simulação), com
`Emulation.setDeviceMetricsOverride` (375×900, `mobile:true` vs 1400×1000
desktop), nos 3 estados do nó `revE_01`: **locked** (conta nova, ícone 🔒,
tag "🔁 Revisão" com opacidade reduzida, anel com o acento roxo sutil),
**current** (pino ▲ visível acima do anel, ícone 🔁 dentro do anel com glow
roxo+dourado sobrepostos, tag abaixo do XP sem colidir com o pino) e
**done** (confirmado via classe `"trail-node done  revisao"` após reload,
não recapturado em screenshot por já estar coberto pelo teste de
não-mutação). Em nenhum dos dois breakpoints o ícone ou a tag textual
ficaram cortados — o risco de recorte sinalizado pelo UX/UI Designer
(seção 15) se limitou, como antecipado, ao glow decorativo do
`box-shadow` nas bordas mais extremas do anel, nunca a conteúdo com
informação. Não houve necessidade de correção.

**8. `js/trail.js`/trilha Aprender** — `git diff --stat -- js/trail.js`
vazio (confirmado 2x, no início e no fim da sessão). Grep por
`COURSE_REVIEWS`/`BUSINESS_REVIEWS` em `js/trail.js` retornou vazio — nenhum
código novo tentando ler um array que não existe. Testado ao vivo: aba
Aprender carrega normalmente (120 lições em `Trail.flatLessons()`, valor
inalterado desde antes desta fase), zero exceções de console, e
`Trail.flatLessons().some(f => f.lesson.tipo === "revisao")` retorna
`false` — nenhuma revisão vazou para a trilha unificada, confirmando o
isolamento do piloto à trilha Empreender.

**9. Conquista "completou toda a trilha Empreender" (`mestre_empreendedor`)**
— confirmado por leitura de `js/achievements.js:42-45`: a condição itera
`BUSINESS_COURSE` (o array canônico, 18 lições), não `Business.levels()`
(19 entradas) — por isso não exige a revisão para disparar, por desenho
(seção 12, risco 2/seção 5 do Software Architect). Testado ao vivo: com as
18 lições reais + a revisão marcadas como concluídas,
`Achievements.checkAll()` desbloqueou `mestre_empreendedor`
corretamente (`unlocked.includes("mestre_empreendedor") === true`) — e a
condição, avaliada isoladamente, depende só das 18 lições reais
(`BUSINESS_COURSE.every(...)`), nunca da revisão. Nenhuma regressão.

#### Segurança e performance (cobertura adicional, não pedida linha a linha mas parte do escopo padrão de QA)

- **Segurança**: `js/supabase-config.js` inspecionado — chave usada é
  `sb_publishable_-iqp9-...` (publishable/anon, segura para o navegador
  por design), não uma `sb_secret_...`/`service_role`. Nenhum segredo novo
  introduzido por esta fase (nenhum arquivo de config tocado).
- **Performance**: `js/data.js` ganhou +242 linhas (1 revisão, 10
  perguntas com variante) — impacto desprezível no tamanho do bundle
  carregado; `Business.levels()` roda uma vez por sessão (cache em
  `this._levels`, mesmo padrão de `this._flat`) e itera só 18 lições +
  busca 1 revisão por `refLessonIds[6]` — O(n) trivial, sem laço aninhado
  custoso. `container.innerHTML` do grid Empreender cresceu de 18 para 19
  nós — sem impacto perceptível.

#### Bugs encontrados

**Bug 1 — Pergunta 9 da revisão (`revE_01`) troca de conceito entre a
pergunta-base e a `variante`, contradizendo o próprio texto da UI.**
- **Gravidade**: média (não quebra funcionalidade, mas viola diretamente o
  critério de aceite explícito do usuário — "perguntas devem ser claras e
  limpas... para não ter dúvidas" — e a própria promessa da interface).
- **Como reproduzir**: em `js/data.js`, dentro de `BUSINESS_REVIEWS[0].perguntas[8]`
  (a 9ª pergunta, base sobre "Uma designer de interiores cobra um valor
  mais alto..." — precificação por valor percebido), ler o campo
  `variante` dessa mesma pergunta: o texto é sobre "Uma personal trainer
  combina com uma loja de suplementos vizinha..." — um conceito
  completamente diferente (canal de aquisição por parceria local/indicação
  mútua), não uma variação de situação-problema sobre precificação por
  valor percebido. Ao vivo: errar a pergunta-base 9 dispara o aviso da UI
  "🔁 Vamos reforçar esse mesmo conceito com outro exemplo:" (texto fixo em
  `js/business.js:319`, não author-editável por pergunta) e em seguida
  mostra uma pergunta sobre canais de aquisição — quebrando a promessa
  literal do próprio texto ("esse MESMO conceito"). Nas outras 9 perguntas
  da revisão, base e variante realmente testam o mesmo conceito por um
  ângulo diferente (confirmado por leitura de todas as 10), então este é
  um caso isolado, não um padrão sistêmico.
- **Sugestão**: encaminhar ao **Financial Specialist** para reescrever a
  `variante` da pergunta 9 como uma situação-problema nova sobre
  precificação por valor percebido (mesmo conceito da base), movendo o
  conteúdo de "canal de aquisição/parceria local" para outra pergunta (ou
  descartando-o, já que "canais" já tem alguma cobertura indireta na
  própria pergunta-base 9 ao mencionar "os primeiros canais para conseguir
  clientes" no título da lição `emod_3`). Não corrigido nesta sessão — QA
  não corrige conteúdo, só reporta.

Nenhum outro bug funcional, de segurança, de performance ou de regressão
foi encontrado. Um caso limítrofe semelhante, porém mais brando, foi notado
e registrado por transparência sem ser tratado como bug: na pergunta 7
(`emod_1`), a `variante` testa "proposta de valor" enquanto a base testa
"segmento de cliente" — dois blocos diferentes do mapeamento de modelo de
negócio, mas ambos dentro do mesmo "tipo de tarefa" (reconhecer blocos do
modelo de negócio a partir de uma situação), o que é uma diferença bem mais
sutil que o Bug 1 e não chega a contradizer a UI da mesma forma explícita —
registrado como observação, não como bug, para o Financial Specialist
avaliar se quer alinhar por consistência numa próxima rodada de conteúdo.

#### Veredito final: **aprovado com ressalvas**

A implementação da Fase 3B está funcionalmente correta e é seguro publicar:
mecanismo de inserção por âncora de id, clone duplo (nível + `licoes`),
XP/energia/moedas/`LESSON_LOG`, título/subtexto de conclusão, identidade
visual nos 3 estados, isolamento da trilha Aprender, e a conquista
`mestre_empreendedor` — tudo validado de forma independente e ao vivo,
todos os autorrelatos do Frontend Engineer da seção 16 se confirmaram por
reprodução própria. A única ressalva é de **conteúdo**, não de código: a
pergunta 9 da revisão-piloto (Bug 1 acima) deveria ser corrigida antes ou
logo depois do lançamento — é uma inconsistência de clareza pedagógica, não
um problema que quebre o produto, então não bloqueia o piloto, mas não deve
ser esquecida.

- **Resumo da etapa**: validação independente da Fase 3B via Chrome real
  controlado por CDP, com conta de teste real e cliques reais em toda a
  jornada (navegação até `e2_1`, trava de âncora, quiz completo de
  `revE_01` incluindo o caminho de `variante`, XP/energia/moedas/
  celebração, teste de não-mutação com reload real, regressão nas 18 lições
  reais e na trilha Aprender, conquista `mestre_empreendedor`,
  responsividade em 2 breakpoints). 1 bug de conteúdo encontrado (gravidade
  média); zero bugs de funcionalidade, segurança, performance ou regressão.
- **Decisões tomadas**: nenhuma — QA reporta, não decide nem corrige.
- **Pendências para os próximos agentes**:
  - **Financial Specialist**: corrigir a `variante` da pergunta 9 de
    `revE_01` (Bug 1) para testar o mesmo conceito da base
    (precificação por valor percebido), e avaliar por consistência a
    observação sobre a pergunta 7.
  - **Documentation Specialist**: registrar a Fase 3B como concluída (com
    a ressalva do Bug 1 anotada) em `CHANGELOG.md`/`ROADMAP.md`.
- **Riscos**: nenhum risco técnico novo. Risco de produto/conteúdo: se o
  Bug 1 não for corrigido, uma fração pequena de usuários que errar a
  pergunta 9 pode ficar confusa ao ver um conceito diferente do esperado
  no reforço — impacto limitado (1 de 10 perguntas de 1 revisão), mas real.
- **Próximo agente responsável**: Financial Specialist (correção do Bug 1),
  em paralelo com Documentation Specialist (fechamento da fase).

#### Correção do Bug 1 (aplicada em 2026-08-09, vestindo o chapéu de Financial Specialist)

A `variante` da pergunta 9 de `revE_01` foi reescrita em `js/data.js` (e
sincronizada no array documentado na seção 14 acima) para testar o mesmo
conceito da base — precificação por valor percebido — em vez de canal de
aquisição/parceria local: novo cenário (encanador cobrando mais para
resolver com urgência um vazamento que impede uma loja de abrir, vs. o
mesmo conserto sem pressa), mesma estrutura de 4 opções, `correta: 0`.
Conteúdo de "parceria local" removido desta revisão sem substituto — não
há lição-fonte dedicada a canais de aquisição entre as 7 referenciadas
(`emod_3` cobre "primeiros canais para conseguir clientes" apenas de
passagem, no título), então não é uma perda de cobertura da revisão.

Observação da pergunta 7 (`emod_1`, variante testa "proposta de valor"
enquanto a base testa "segmento de cliente") **avaliada e mantida como
está, sem alteração** — ambas pertencem à mesma habilidade sendo testada
("reconhecer um bloco do modelo de negócio a partir de uma situação
descrita"), só aplicada a um bloco diferente do framework; isso é uma
variação de ângulo dentro do mesmo conceito mais amplo, não uma quebra da
promessa da UI como no Bug 1 — o próprio QA já havia classificado como
observação, não bug, exatamente por essa diferença de gravidade.

- **Status da Fase 3B**: **concluída** (2026-08-09) — piloto de revisão
  periódica implementado e validado em `BUSINESS_COURSE`, Bug 1 do QA
  corrigido. Segue para Documentation Specialist.

### 18. Documentation Specialist (fechamento da Fase 3B)

Leitura prévia: `CHANGELOG.md` (últimas 2-3 entradas, v1.53.0-v1.55.0, para
seguir o mesmo tom/formato), `README.md` inteiro (para localizar toda menção
existente à trilha Empreender e ao conceito de "lições" que ficaria
desatualizada) e `ROADMAP.md` inteiro (para confirmar que nenhuma entrada
prévia já mencionava a RFC-035 — confirmado, nenhuma seção citava RFC-035,
Fase 1, Fase 2 ou o sistema de revisão antes desta etapa, mesmo a Fase 1 e a
Fase 2 já concluídas na v1.55.0).

- **`CHANGELOG.md`**: nova entrada **v1.56.0** (seguinte à v1.55.0 já
  publicada), com uma seção `### Adicionado` detalhando o piloto (formato de
  dado, mecanismo de ancoragem por id, clone de `licoes` para não mutar
  `BUSINESS_COURSE`, XP=35/energia normal/sem isenção, efeito em missão
  semanal, identidade visual, e o escopo explícito "só Empreender nesta
  fase, `js/trail.js` intocado, Fase 3C pendente") e uma seção
  `### Corrigido` só para o Bug 1 (variante da pergunta 9) já resolvido.
- **`README.md`**: dois pontos desatualizados encontrados e corrigidos —
  (1) a descrição da trilha "Empreender" (seção "Gamificação ('Academia
  PolvIn')") não mencionava o novo tipo de nó, ganhou um bullet novo
  explicando o piloto, deixando claro que a aba Aprender unificada ainda
  não tem o mecanismo (Fase 3C pendente); (2) a linha de `js/business.js`
  na árvore de arquivos ("Estrutura do projeto") ganhou uma menção ao
  piloto do nó de revisão. Nenhuma outra seção do README (ex.: "Fora do
  escopo", "Roadmap sugerido") precisava de mudança — o piloto não torna
  nada anteriormente "fora do escopo" possível, nem estava listado ali.
- **`ROADMAP.md`**: nenhuma entrada prévia mencionava a RFC-035 em nenhuma
  fase (confirmado por busca no arquivo inteiro) — um gap real de
  documentação, já que toda outra RFC (001-034) tem registro próprio ali.
  Adicionada uma seção nova, "Reformulação da trilha de aprendizado
  (RFC-035) — em andamento", posicionada cronologicamente entre "Expansão
  das trilhas de conteúdo" e "Cidade Financeira", registrando as Fases 1 e
  2 (já concluídas na v1.55.0, retroativamente) como ✅, a Fase 3B como ✅
  (piloto Empreender, v1.56.0, com a nota do Bug 1 corrigido) e a Fase 3C
  explicitamente como pendente, não iniciada — sem marcar a RFC como 100%
  concluída no roadmap, consistente com o status "em andamento" desta RFC.
- **Esta RFC**: nesta seção. **Status geral da RFC permanece "em
  andamento"** — a Fase 3C (rollout do mecanismo de revisão para a trilha
  unificada Aprender) ainda não começou; só quando ela for concluída (ou
  formalmente descartada) esta RFC deve virar "concluída".

- **Resumo da etapa**: `CHANGELOG.md` (v1.56.0), `README.md` (bullet novo na
  trilha Empreender + árvore de arquivos) e `ROADMAP.md` (nova seção
  RFC-035, Fases 1/2/3B como ✅, Fase 3C como pendente) atualizados para
  refletir o piloto concluído da Fase 3B, sem sobrescrever nem antecipar a
  Fase 3C.
- **Decisões tomadas**: nenhuma decisão de produto/arquitetura/conteúdo —
  só registro. Nenhum arquivo de código (`js/*.js`, `css/*.css`, `*.html`)
  foi tocado nesta etapa.
- **Pendências para os próximos agentes**: nenhuma pendência de
  documentação para a Fase 3B. Quando a Fase 3C (rollout na trilha
  Aprender) for escopada e implementada, este mesmo agente deve repetir o
  processo — nova entrada de `CHANGELOG.md`, atualização do bullet do
  README para remover a ressalva "por enquanto exclusivo da trilha
  Empreender", atualização da entrada da Fase 3C no `ROADMAP.md` de
  pendente para ✅, e só então (se não houver mais fases planejadas) avaliar
  se o status geral da RFC-035 pode virar "concluída".
- **Riscos**: nenhum.
- **Próximo agente responsável**: nenhum — RFC permanece "em andamento" até
  a Fase 3C ser escopada, momento em que o Orchestrator deve reabrir o
  workflow a partir do Product Owner/Software Architect para essa fase
  específica.

### 19. Software Architect (Fase 3C — Planejamento do rollout na trilha unificada Aprender)

Leitura prévia confirmada por leitura direta do código real, não só desta
RFC: `js/data.js` (`COURSE`, `HISTORY_COURSE` inteiros, estrutura de nível e
lição) e `js/trail.js` (`levels()`, `flatLessons()`, `isUnlocked()`,
`isDone()`, `maybePickStory()`, `startLesson()`, `finishLesson()`). Como o
arquivo `js/data.js` tem ~850KB só no array `COURSE`, a extração de
estrutura (níveis, ids de lição em ordem de documento, XP) foi feita por um
parser Python escrito para esta etapa (tokenizer consciente de string/
comentário JS + contagem de profundidade de `[`/`{`/`(`, sem dependência de
`node`, indisponível neste ambiente desde as fases anteriores desta RFC) —
não por leitura manual linha a linha, que seria inviável e propensa a erro
num arquivo desse tamanho. O script e sua saída bruta ficam no scratchpad
desta sessão; os números abaixo foram conferidos cruzando contagem de
lições por nível contra o resultado do parser.

#### 1. Sequência flat unificada hoje — números confirmados

- `COURSE`: **6 níveis, 102 lições** (Nível 1 "Fundamentos e Comportamento
  Financeiro": 35 lições; Nível 2 "Renda Fixa": 20; Nível 3 "Renda
  Variável": 22; Nível 4 "Diversificação e Risco": 8; Nível 5 "Avançado": 8;
  Nível 6 "Mercado Avançado (Pro)": 9).
- `HISTORY_COURSE`: **6 níveis, 18 lições** (Colônia: 2; Independência/Corte/
  Império: 6; Café/Vargas: 2; Redemocratização/JK: 3; Ditadura/moedas: 2;
  Plano Real/desigualdade: 3).
- `Trail.levels()` intercala por ÍNDICE de nível (`financeira[i]` depois
  `historia[i]`, para `i` de 0 a 5) — hoje os dois arrays têm exatamente 6
  níveis cada, então o pareamento é 1:1 sem sobra em nenhum lado
  (coincidência atual, não uma garantia estrutural — ver risco 6.4).
- `Trail.flatLessons()` resultante hoje: **120 lições** (102+18), na ordem:
  todas as lições do Nível 1 financeira, depois todas as do Nível 1
  história, depois Nível 2 financeira, Nível 2 história, ..., até Nível 6
  história.
- **17 blocos completos de 7** (119 lições cobertas) + **1 lição avulsa**
  (`h4_3`, a última publicada) que ainda não fecha um 18º bloco — bate
  exatamente com a estimativa "~120 lições ⇒ ~17 blocos" do enunciado desta
  tarefa.

#### 2. Os 17 blocos — âncora, fontes, array de inserção e XP herdado

Cada linha é um bloco (`refLessonIds` na ordem em que aparecem na sequência
flat; a âncora é sempre o 7º/último). "Array de inserção" segue a decisão
já registrada na Fase 3A (seção 12, item 3): a revisão é inserida no MESMO
array/nível físico da lição-âncora — nunca um array separado, nunca decidido
por votação das 7 fontes. XP herdado segue a decisão já registrada na Fase
3B (seção 13, item 1): igual ao XP da lição-âncora, lido diretamente de
`COURSE`/`HISTORY_COURSE`.

| Bloco | `refLessonIds` (últimas 7 lições cobertas) | Âncora | Fonte/nível da âncora | Array de inserção | XP herdado | Mistura de fontes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `f1_01, f1_02, f1_03, f1_04, l1_1, f1_05, f1_06` | `f1_06` | financeira, nível 0 | `COURSE[0]` | 20 | uniforme |
| 2 | `l5_1, f1_07, f1_08, l1_2, f1_09, f1_10, l1_3` | `l1_3` | financeira, nível 0 | `COURSE[0]` | 20 | uniforme |
| 3 | `f1_11 .. f1_17` | `f1_17` | financeira, nível 0 | `COURSE[0]` | 20 | uniforme |
| 4 | `f1_18 .. f1_24` | `f1_24` | financeira, nível 0 | `COURSE[0]` | 20 | uniforme |
| 5 | `f1_25, f1_26, f1_27, f1_28, f1_29, f1_30, l4_1` | `l4_1` | financeira, nível 0 | `COURSE[0]` | 35 | uniforme |
| 6 | `h1_1, h1_2, l2_1, l2_2, rf_16, rf_05, l2_3` | `l2_3` | financeira, nível 1 | `COURSE[1]` | 25 | **mista** (2 história + 5 financeira) |
| 7 | `rf_17, rf_08, rf_09, rf_06, rf_07, rf_10, rf_11` | `rf_11` | financeira, nível 1 | `COURSE[1]` | 25 | uniforme |
| 8 | `rf_01, rf_02, rf_04, rf_03, rf_12, rf_13, rf_14` | `rf_14` | financeira, nível 1 | `COURSE[1]` | 25 | uniforme |
| 9 | `rf_15, himp_1, himp_2, himp_3, himp_4, himp_5, himp_6` | `himp_6` | **história, nível 1** | `HISTORY_COURSE[1]` | 25 | **mista** (1 financeira + 6 história) |
| 10 | `l3_1, l3_2, rv_01, rv_02, rv_03, rv_04, rv_05` | `rv_05` | financeira, nível 2 | `COURSE[2]` | 30 | uniforme |
| 11 | `rv_06 .. rv_12` | `rv_12` | financeira, nível 2 | `COURSE[2]` | 30 | uniforme |
| 12 | `rv_13 .. rv_19` | `rv_19` | financeira, nível 2 | `COURSE[2]` | 30 | uniforme |
| 13 | `rv_20, h2_1, h2_2, l4_2, l4_3, dr_01, dr_02` | `dr_02` | financeira, nível 3 | `COURSE[3]` | 35 | **mista** (2 história + 5 financeira) |
| 14 | `dr_03, dr_04, dr_05, dr_06, hjk_1, hjk_2, hjk_3` | `hjk_3` | **história, nível 3** | `HISTORY_COURSE[3]` | 25 | **mista** (4 financeira + 3 história) |
| 15 | `l5_2, l5_3, av_01, av_02, av_03, av_04, av_05` | `av_05` | financeira, nível 4 | `COURSE[4]` | 40 | uniforme |
| 16 | `av_06, h3_1, h3_2, l6_1, l6_2, l6_3, l6_4` | `l6_4` | financeira, nível 5 | `COURSE[5]` | 50 | **mista** (1 história + 6 financeira) |
| 17 | `l6_5, l6_6, l6_7, l6_8, l6_9, h4_1, h4_2` | `h4_2` | **história, nível 5** | `HISTORY_COURSE[5]` | 35 | **mista** (5 financeira + 2 história) |

Leftover sem âncora ainda: `h4_3` (última lição publicada de História) —
não fecha bloco, nenhuma revisão nova aparece até uma próxima Onda de
conteúdo publicar mais uma lição depois dela.

Dois achados concretos que confirmam, com conteúdo real (não mais só em
tese), decisões já tomadas nas Fases 3A/3B:

- **3 dos 17 blocos (9, 14, 17) ancoram em `HISTORY_COURSE`**, não em
  `COURSE` — é a primeira vez que o mecanismo de inserção "no array da
  âncora" (Fase 3A, seção 12, item 3) precisa rotear para o array de
  História de verdade. O piloto da Fase 3B (`Business.levels()`) só provou
  o caminho de inserção contra UM único array canônico
  (`BUSINESS_COURSE`) — o caminho de inserção em `HISTORY_COURSE` nunca
  rodou em produção até hoje. Ver risco 6.1.
- **Bloco 17 é um exemplo real (não hipotético) de âncora no MEIO de um
  nível**: `h4_2` é a 2ª das 3 lições do nível "Plano Real, desigualdade e o
  papel do Estado" — a revisão `revU_17` entra entre `h4_2` e `h4_3`, não no
  fim do nível. Confirma ao vivo, com conteúdo real, a garantia que a Fase
  3A já dava por construção ("não depende de limites de nível") — não
  precisa de nenhum tratamento especial, mas é o primeiro caso real onde
  isso é observável, então vale como item de teste dirigido, não só
  confiança na lógica.

#### 3. Decisão de faseamento do conteúdo — 4 Ondas de Revisão, não uma RFC monolítica

**Decisão: 170 perguntas novas (17 blocos × 10) NÃO são escritas de uma vez.
Fatiar em 4 "Ondas de Revisão", cada uma cobrindo 4-5 blocos consecutivos da
tabela acima, na MESMA ordem em que aparecem na sequência flat (ordem
cronológica/pedagógica — as duas coincidem aqui, já que o conteúdo foi
publicado nível a nível ao longo das Ondas 1-15).**

| Onda de Revisão | Blocos | IDs sugeridos (`COURSE_REVIEWS`) | Conteúdo coberto | Observação estrutural |
| --- | --- | --- | --- | --- |
| **1** | 1-4 | `revU_01`..`revU_04` | Nível 1 completo (Fundamentos) | 100% uniforme-financeira, todas ancoram em `COURSE[0]` — menor risco possível, valida o mecanismo generalizado em escala antes de qualquer caso misto |
| **2** | 5-8 | `revU_05`..`revU_08` | Fim do Nível 1 + Nível 2 (Renda Fixa) até `rf_14` | Primeiro bloco misto (6, história+financeira) — ainda ancorando em `COURSE`, então não exercita o caminho de inserção em `HISTORY_COURSE` |
| **3** | 9-12 | `revU_09`..`revU_12` | Fim do Nível 2 + Nível 3 (Renda Variável) até `rv_19` | **Contém o bloco 9 — primeira âncora real em `HISTORY_COURSE`.** Onda mais sensível do ponto de vista técnico, não de conteúdo |
| **4** | 13-17 | `revU_13`..`revU_17` | Nível 4, 5, 6 (Diversificação/Avançado/Pro) + fim de História | Fecha a cobertura de tudo publicado hoje; contém mais 2 âncoras em `HISTORY_COURSE` (14, 17) e o caso de inserção no meio de nível (17) |

Por que 4 Ondas de ~4-5 blocos em vez de outras divisões possíveis:

- **Por que não uma RFC/rodada só com as 17**: é exatamente a mesma ordem
  de grandeza (170 perguntas) que levou ao cancelamento da Fase 4 original
  desta RFC (~690 perguntas, mas o motivo do cancelamento não foi só o
  volume absoluto — foi "pressa e volume são inimigos diretos de clareza",
  citado literalmente na Motivação desta RFC). Escrever, implementar e
  validar 170 perguntas novas numa única passada reintroduziria o mesmo
  risco, numa escala menor mas ainda real.
- **Por que não 1 bloco por rodada (17 rodadas)**: overhead de processo
  (QA, changelog, registro de RFC) por rodada não se paga para um único
  bloco de 10 perguntas — o próprio padrão de "Ondas" já usado neste
  projeto para conteúdo normal (Ondas 1-15, `CHANGELOG.md`) sempre agrupou
  várias lições por Onda, nunca uma por vez.
- **Por que 4-5, não um número fixo maior**: replica o tamanho já validado
  do padrão de "Onda" de conteúdo deste projeto (ordem de grandeza de
  3-6 lições por Onda nas Ondas 13-15, últimas 3 antes desta RFC) — cada
  Onda de Revisão end-to-end (Financial Specialist escreve, Frontend
  Engineer insere no array, QA valida) fica no mesmo porte de esforço já
  comprovado sustentável.
- **Por que a Onda 3 não foi redesenhada para adiar o primeiro anchor em
  `HISTORY_COURSE`**: seria possível reordenar os blocos para que o
  primeiro anchor em História caísse mais tarde, mas isso quebraria a
  ordem cronológica/pedagógica sem ganho real — o código que insere em
  `HISTORY_COURSE` (item 4 abaixo) tem que ser validado de qualquer forma
  antes de qualquer bloco real depender dele, e adiar isso só adiaria
  quando o bug (se existir) seria descoberto. A mitigação correta não é
  reordenar conteúdo, é testar os dois caminhos de inserção ANTES de
  qualquer Onda de conteúdo real ir ao ar — ver item 4 e risco 6.1.
- **QA obrigatório entre Ondas, sem exceção**: cada Onda de Revisão só
  libera a próxima depois de um ciclo de QA independente (mesmo padrão já
  seguido pela Fase 3B, seção 17) — não em paralelo, para que um problema
  estrutural encontrado numa Onda não se propague para as 3 seguintes antes
  de ser corrigido.

**IDs**: contador único e contínuo em `COURSE_REVIEWS` (`revU_01` a
`revU_17`, na ordem da tabela acima), não reiniciado a cada Onda — mesmo
padrão de numeração contínua já usado em `BUSINESS_REVIEWS`/`revE_01`.

#### 4. Ajuste técnico em `Trail.levels()` — generalização de `Business.levels()` para DOIS arrays canônicos

`Business.levels()` (Fase 3B, seção 16) clona `licoes` e insere a revisão
ancorada por id contra UM único array (`BUSINESS_COURSE`). `Trail.levels()`
precisa do mesmo mecanismo aplicado **independentemente a `COURSE` e a
`HISTORY_COURSE`, ambos os passes consultando o MESMO array
`COURSE_REVIEWS`**, antes de intercalar por índice de nível (lógica de
intercalação já existente, inalterada):

```js
levels() {
  if (this._levels) return this._levels;

  // Mesmo mecanismo de Business.levels() (Fase 3B) — clona licoes, insere a
  // revisão ancorada por id — mas aplicado como uma função genérica, uma vez
  // para cada array canônico. Os dois passes leem o MESMO COURSE_REVIEWS;
  // cada um só "acha" (e insere) as revisões cuja âncora (refLessonIds[6])
  // é, de fato, uma lição daquele array — nunca as duas passes acham a
  // mesma revisão, porque um id de lição só existe em um dos dois arrays.
  // É isso que resolve "em qual array a revisão entra" sem nenhum branch
  // explícito de "se a âncora é história, insere aqui; se é financeira,
  // insere ali" — o roteamento é automático, decorrente de `.find()` só
  // casar contra as lições que realmente estão no array sendo processado.
  const withReviews = (courseArr, fonte) =>
    courseArr.map((lvl) => {
      const licoes = [];
      lvl.licoes.forEach((lesson) => {
        licoes.push(lesson);
        const review = COURSE_REVIEWS.find((r) => r.refLessonIds[6] === lesson.id);
        if (review) licoes.push(review);
      });
      return { ...lvl, licoes, fonte };
    });

  const financeira = withReviews(COURSE, "financeira");
  const historia = withReviews(HISTORY_COURSE, "historia");
  const unificado = [];
  const max = Math.max(financeira.length, historia.length);
  for (let i = 0; i < max; i++) {
    if (financeira[i]) unificado.push(financeira[i]);
    if (historia[i]) unificado.push(historia[i]);
  }
  this._levels = unificado;
  return unificado;
},
```

Consequências e pontos de atenção para o Frontend Engineer:

- **`fonte` passa a ser atribuída DENTRO de `withReviews`**, não mais num
  `.map()` separado depois — comportamento idêntico ao atual (cada nível
  ainda ganha `fonte: "financeira"`/`"historia"`), só reorganizado para
  poder clonar `licoes` e atribuir `fonte` no mesmo passe. Nenhuma mudança
  de shape do objeto nível resultante.
- **Clone obrigatório dos DOIS arrays, não só um.** O risco 1 já registrado
  na Fase 3A (seção 12) — esquecer de clonar `licoes` muta o array
  canônico — agora se aplica em dobro: é preciso confirmar, por teste em
  runtime (não só leitura de código), que **nem `COURSE` nem
  `HISTORY_COURSE`** ganham entradas `tipo:"revisao"` depois de
  `Trail.levels()`/`Trail.render()` rodar. O script de verificação que a
  Fase 3B deixou pendente para o QA Engineer (seção 12, risco 1) precisa
  ser estendido para checar os dois arrays, não só repetir o que já foi
  feito para `BUSINESS_COURSE`.
- **`levelHtml()` ganha o mesmo branch `isRevisao` que `business.js` já
  tem** (seção 16, item 4), adaptado para preservar o branch `isHistoria`
  que já existe em `trail.js` (ao contrário de `business.js`, que não
  tinha essa variável): `icon = done ? "✅" : unlocked ? (isRevisao ? "🔁" :
  isHistoria ? "📜" : "📘") : "🔒"`. Mesmo raciocínio para a classe CSS
  `revisao` e a tag `.trail-node-tag`, reaproveitando 100% do CSS já
  escrito na Fase 3B (seção 15/16) — nenhuma regra nova de CSS necessária,
  só o HTML de `trail.js` passando a gerar as mesmas classes que
  `business.js` já gera.
- **`finishLesson()` em `trail.js` ganha o mesmo branch de título/subtexto**
  que `business.js` já tem (seção 13, item 4), mas como `trail.js` já
  tinha um ternário de 2 vias (`isHistoria ? "Capítulo concluído!" : "Lição
  concluída!"`), vira um condicional de 3 vias:
  `isRevisao ? "Revisão dominada!" : isHistoria ? "Capítulo concluído!" :
  "Lição concluída!"`. Mesma posição/condição (`passed && !alreadyDone`)
  para o subtexto extra já definido na Fase 3B.
- **Nenhuma mudança em `flatLessons()`, `isDone()`, `isUnlocked()`,
  `nextEntry()`, `gridHtml()`, `startLesson()`, `answerQuestion()`,
  `nextQuestion()`, `maybePickStory()`** — todos já operam genericamente
  sobre `level.licoes`/`this.levels()`, exatamente como a Fase 3A previu
  para o caso de um único array e como a Fase 3B confirmou em produção
  para `BUSINESS_COURSE`. A generalização para dois arrays não exige
  reabrir nenhum desses métodos.
- **Nenhuma `STORAGE_KEYS` nova, nenhum `CustomEvent` novo** — mesma
  conclusão da Fase 3A, agora confirmada para os dois arrays: progresso de
  revisão continua gravado em `COURSE_PROGRESS` (se inserida em `COURSE`)
  ou `HISTORY_PROGRESS` (se inserida em `HISTORY_COURSE`), via
  `progressKey(level.fonte)`, já existente e já correto para qualquer
  entrada de `licoes`, revisão incluída.

#### 5. Confirmação: decisões da Fase 3A/3B se sustentam sem exceção com 2 arrays

Revisitando explicitamente cada ponto que o enunciado desta tarefa pediu
para confirmar:

- **`maybePickStory()` conta a revisão quando o nível é
  `fonte:"financeira"` (Fase 3B, seção 13, item 3b)** — decisão já tomada
  antes de ter efeito prático (o piloto era só Empreender, sem esse hook).
  Agora, com 14 dos 17 blocos ancorando em `COURSE` (financeira), essa
  decisão passa a ter efeito real pela primeira vez: `maybePickStory()` lê
  `Object.keys(this.getProgress("financeira")).length` — como revisões
  inseridas em `COURSE` gravam em `COURSE_PROGRESS` pela mesma chave
  `progressKey`, elas somam nessa contagem sem nenhuma mudança de código.
  **Confirmado: nenhuma exceção necessária.** Efeito concreto esperado: a
  cada 3 lições financeiras concluídas (revisão incluída na contagem), uma
  história interativa é oferecida — em algumas Ondas de Revisão isso vai
  disparar exatamente NA conclusão de uma revisão, o que a Fase 3B (seção
  13) já havia argumentado ser um bom momento emocional, não um bug.
- **Missão semanal "complete N lições" conta a revisão sem filtro** (Fase
  3B, seção 13, item 3a) — `LESSON_LOG` não distingue fonte nem tipo, então
  isso já vale automaticamente para revisões inseridas em qualquer um dos
  dois arrays, sem exceção. **Confirmado.**
- **Cross-módulo — `achievements.js`/`progression.js`/`events.js`/
  `career.js`/`citylife.js` não veem revisões** (Fase 3A, seção 12, item
  5) — a garantia depende inteiramente do clone de `licoes` nunca vazar
  para os arrays canônicos. Com 2 arrays sendo clonados agora em vez de 1,
  a superfície onde esse clone pode ser esquecido dobra (ver risco 6.2) —
  a DECISÃO em si (revisões não contam para essas conquistas) não muda,
  mas a validação em runtime precisa cobrir os dois arrays explicitamente,
  não só repetir o teste que a Fase 3B já fez para `BUSINESS_COURSE`.
  **Confirmado, com a ressalva de que a verificação de QA precisa dobrar
  de escopo, não só de confiança.**
- **XP da revisão = XP da lição-âncora** (Fase 3B, seção 13, item 1) — regra
  já é agnóstica a qual array a âncora pertence (a tabela da seção 2 acima
  já aplica essa regra diretamente aos 17 blocos, lendo o XP real de
  `COURSE`/`HISTORY_COURSE`). **Confirmado, sem ajuste.**
- **Energia cobrada normalmente, sem isenção** (Fase 3B, seção 13, item 2)
  — não depende de array, já que `Energy.tryStart()` é chamado por
  `startLesson()` de forma genérica. **Confirmado, sem ajuste.**

#### 6. Riscos identificados nesta fase (além dos já mapeados nas Fases 3A/3B)

1. **Caminho de inserção em `HISTORY_COURSE` nunca rodou em produção.** O
   piloto da Fase 3B só provou o mecanismo contra um único array
   (`BUSINESS_COURSE`). Recomendação explícita ao Frontend Engineer: antes
   de considerar a Onda de Revisão 1 "pronta" (que só usa `COURSE`),
   validar também — com uma entrada de teste temporária em
   `COURSE_REVIEWS`, não commitada como conteúdo real, ou usando
   diretamente o bloco 9/`revU_09` adiantado — que a inserção em
   `HISTORY_COURSE[1]` funciona e que `HISTORY_COURSE` permanece intocado
   depois. Não adiar essa validação até a Onda 3 (quando o bloco 9 é
   publicado de fato): um bug nesse caminho ficaria dormente em produção
   por 2 Ondas antes de ser descoberto, exatamente o tipo de risco que o
   faseamento em Ondas pequenas deveria evitar, não introduzir.
2. **Risco de mutação dobra de superfície.** Ver item 5 acima — o script de
   verificação estrutural já recomendado pela Fase 3A (risco 3 da seção 12)
   e pendente desde a Fase 3B precisa, nesta fase, checar **os dois**
   arrays canônicos (`COURSE` e `HISTORY_COURSE`) antes/depois de
   `Trail.render()`, e validar que `COURSE_REVIEWS` tem exatamente 17
   entradas (ao final da Fase 3C), cada uma com exatamente 7
   `refLessonIds`, todos existentes em `COURSE` OU `HISTORY_COURSE` (nunca
   nos dois, nunca em nenhum), sem sobreposição entre blocos consecutivos —
   confirmado por construção nesta etapa (a tabela da seção 2 não tem
   nenhum id repetido entre blocos), mas deve ser validado
   automaticamente, não só por esta análise manual.
3. **Pareamento de nível por índice (`financeira[i]`/`historia[i]`) é uma
   coincidência atual (6=6), não uma garantia.** Se uma Onda de conteúdo
   futura adicionar um 7º nível só a `COURSE` (sem equivalente em
   `HISTORY_COURSE`), a intercalação de `Trail.levels()` já lida com isso
   hoje (`if (financeira[i])`/`if (historia[i])`, checagem independente) —
   não é um risco NOVO desta fase, é um comportamento pré-existente que
   `Trail.levels()` generalizado (item 4) preserva sem alteração. Registrado
   aqui só para não ser confundido com um risco introduzido pelas revisões.
4. **`refLessonIds` de blocos futuros (18º em diante) ainda não existem.**
   A trava de segurança já garantida pela Fase 3A (a revisão só aparece
   quando a âncora existe) cobre isso automaticamlmente — quando `h4_3` for
   seguido de mais 6 lições publicadas em Onda de conteúdo futura, um 18º
   bloco passa a existir e precisa da mesma disciplina (nova entrada em
   `COURSE_REVIEWS`, nova Onda de Revisão) — não é uma ação pendente desta
   fase, é o processo se repetindo à medida que a trilha cresce.
5. **Volume de conteúdo (170 perguntas) — risco já mitigado pelo
   faseamento da seção 3**, registrado aqui só por completude: se qualquer
   Onda de Revisão individual (4-5 blocos) ainda parecer grande demais
   durante a execução real, subdividir ainda mais (ex.: 2 blocos por rodada)
   é uma opção sempre disponível e não exige nova decisão de arquitetura —
   só ajusta o tamanho do lote, não o mecanismo.

#### Registro da etapa

- **Resumo da etapa**: confirmada a estrutura real de `COURSE` (102 lições,
  6 níveis) e `HISTORY_COURSE` (18 lições, 6 níveis) — 120 lições na
  sequência flat unificada, 17 blocos de revisão completos possíveis hoje
  (mais 1 lição avulsa sem bloco ainda). Tabela completa dos 17 blocos
  produzida (âncora, `refLessonIds`, array de inserção, XP herdado,
  mistura de fontes) — 3 blocos (9, 14, 17) ancoram em `HISTORY_COURSE`,
  14 em `COURSE`. Decidido fatiar o conteúdo em 4 Ondas de Revisão de 4-5
  blocos cada, na ordem cronológica/pedagógica da trilha (1-4, 5-8, 9-12,
  13-17), com QA obrigatório entre Ondas. Especificado o ajuste técnico em
  `Trail.levels()` — generalização de `Business.levels()` aplicando o
  mesmo mecanismo de clone+inserção por âncora independentemente a
  `COURSE` e `HISTORY_COURSE`, ambos consultando o mesmo array
  `COURSE_REVIEWS`, com roteamento automático (sem branch explícito) para
  o array correto. Confirmado, ponto a ponto, que as decisões de
  cross-módulo/`maybePickStory()`/missão semanal/XP/energia da Fase 3A/3B
  se sustentam sem exceção com dois arrays.
- **Decisões tomadas**: seções 1-4 acima (estrutura real, faseamento em 4
  Ondas, ajuste técnico de `Trail.levels()`). Nenhum módulo novo, nenhuma
  `STORAGE_KEYS` nova, nenhum `CustomEvent` novo — mesma conclusão da Fase
  3A, agora confirmada para dois arrays.
- **Pendências para os próximos agentes**:
  - **Financial Specialist**: escrever as 10 perguntas de cada um dos 4
    blocos da **Onda de Revisão 1** (`revU_01`..`revU_04`, `refLessonIds`
    e XP na tabela da seção 2), cobrindo o Nível 1 completo da trilha
    financeira — mesmo formato/recomendação já usada na Fase 3B (variações/
    situações-problema novas, não cópia literal das perguntas originais).
  - **Frontend Engineer**: implementar o ajuste em `Trail.levels()`
    especificado na seção 4, incluindo os branches de `levelHtml()` e
    `finishLesson()` adaptados de `business.js`, e — antes de considerar a
    Onda 1 pronta — validar explicitamente o caminho de inserção em
    `HISTORY_COURSE` com um teste dirigido (risco 6.1), não só o caminho em
    `COURSE` que a Onda 1 de fato exercita.
  - **QA Engineer**: estender o script de verificação estrutural (7 ids
    únicos por `refLessonIds`, existentes em `COURSE` OU `HISTORY_COURSE`,
    sem sobreposição) e o teste de não-mutação para cobrir os DOIS arrays
    canônicos, não repetir o escopo de checagem de `BUSINESS_COURSE` da
    Fase 3B.
  - **Ondas de Revisão 2, 3 e 4**: repetem o mesmo ciclo (Financial
    Specialist → Frontend Engineer insere no array `COURSE_REVIEWS`,
    sem mudança de mecanismo → QA), uma de cada vez, cada uma só começando
    depois da anterior fechar QA sem ressalvas graves. A Onda 3 merece
    atenção redobrada de QA por conter a primeira âncora real em
    `HISTORY_COURSE` publicada como conteúdo (bloco 9) — ainda que o
    caminho de código já deva ter sido validado antes, na Onda 1 (risco
    6.1).
- **Riscos**: ver seção 6 acima, em ordem de gravidade. O mais crítico
  (6.1, caminho de `HISTORY_COURSE` nunca testado em produção) tem
  mitigação explícita: validar com teste dirigido antes da Onda 1 fechar,
  não esperar a Onda 3.
- **Próximo agente responsável**: **Financial Specialist** (conteúdo dos 4
  blocos da Onda de Revisão 1, `revU_01`..`revU_04`) — em paralelo ou logo
  antes do **Frontend Engineer** (ajuste em `Trail.levels()` + validação
  dirigida do caminho `HISTORY_COURSE`), mesmo padrão de sequenciamento já
  usado na Fase 3B (seção 13 → 14 → 16).

### 20. Financial Specialist (Fase 3C — Conteúdo da Onda de Revisão 1, blocos 1-4)

Leitura prévia confirmada por leitura direta de `js/data.js`, Nível 1 de
`COURSE` (`nivel1`, "Fundamentos e Comportamento Financeiro"): o texto
completo de `aula` e o array `perguntas` (base + `variante`) das 28 lições
referenciadas pelos 4 blocos desta Onda — `f1_01` a `f1_24`, `l1_1`, `l1_2`,
`l1_3`, `l5_1` — sem sobreposição de conteúdo entre os 4 blocos, conforme já
confirmado pelo Software Architect na seção 19 (blocos 1-4, todos ancorando
em `COURSE[0]`, "uniforme", nenhuma mistura de fonte).

XP de cada bloco confirmado por leitura direta em `js/data.js`, igual ao XP
da lição-âncora (decisão já registrada na Fase 3B, seção 13, item 1):
`f1_06.xp = 20`, `l1_3.xp = 20`, `f1_17.xp = 20`, `f1_24.xp = 20` — os 4
blocos desta Onda usam `xp: 20`, batendo exatamente com a tabela da seção 19
do Software Architect.

#### 1. Cobertura das 10 perguntas por bloco

Mesmo critério já usado em `revE_01` (Fase 3B, seção 14): nenhuma das 7
lições de um bloco fica sem pelo menos 1 pergunta, com peso extra nas
lições mais densas em cálculo/distinção de conceitos.

**`revU_01`** (`f1_01, f1_02, f1_03, f1_04, l1_1, f1_05, f1_06`):

| # | Lição coberta | Conceito testado |
| - | --- | --- |
| 1 | `f1_01` | Receita menos despesa = resultado do mês (interpretar falta) |
| 2 | `f1_02` | Ativo x passivo (identificar qual é qual num par de exemplos) |
| 3-4 | `f1_03` | Cálculo de patrimônio líquido; por que renda alta não garante PL alto |
| 5-6 | `f1_04` | Custo de oportunidade (cálculo do valor deixado de ganhar; nomear o conceito) |
| 7 | `l1_1` | Cálculo/identificação de inflação a partir de variação de preço |
| 8 | `f1_05` | Inflação percebida x IPCA oficial (peso da cesta pessoal) |
| 9-10 | `f1_06` | Poder de compra caindo com o tempo (efeito e cálculo) |

**`revU_02`** (`l5_1, f1_07, f1_08, l1_2, f1_09, f1_10, l1_3`):

| # | Lição coberta | Conceito testado |
| - | --- | --- |
| 1-2 | `l5_1` | Juros compostos incidem sobre principal + juros acumulados; começar mais tarde exige aportes maiores |
| 3-4 | `f1_07` | Juro simples x composto (o que muda no cálculo; por que dívida de cartão cresce rápido) |
| 5 | `f1_08` | Regra dos 72 (nos dois sentidos: anos → taxa e taxa → anos) |
| 6 | `l1_2` | Para que serve a reserva de emergência |
| 7 | `f1_09` | Liquidez (comparar bem líquido x iliquido) |
| 8 | `f1_10` | Seguro: quando compensa (prejuízo grande x pequeno) |
| 9-10 | `l1_3` | Regra 50-30-20 (cálculo); registrar gastos revela padrões |

**`revU_03`** (`f1_11, f1_12, f1_13, f1_14, f1_15, f1_16, f1_17`):

| # | Lição coberta | Conceito testado |
| - | --- | --- |
| 1-2 | `f1_11` | Regra 50-30-20 aplicada a salários reais; dificuldade de seguir a regra com renda baixa |
| 3 | `f1_12` | Reconhecer uma meta no formato SMART |
| 4 | `f1_13` | Divisão proporcional das contas da casa |
| 5 | `f1_14` | Separar o salário em compartimentos desde o primeiro emprego |
| 6-7 | `f1_15` | Prazo muda a estratégia (curto x longo); risco de usar estratégia de longo prazo numa meta de curto prazo |
| 8 | `f1_16` | Contabilidade mental (reconhecer e superar o viés) |
| 9-10 | `f1_17` | Gatilhos de consumo: urgência/escassez; prova social |

**`revU_04`** (`f1_18, f1_19, f1_20, f1_21, f1_22, f1_23, f1_24`):

| # | Lição coberta | Conceito testado |
| - | --- | --- |
| 1 | `f1_18` | Reconhecer o padrão de compra por impulso (gatilho emocional + decisão rápida) |
| 2-3 | `f1_19` | Ancoragem de preço (papel do valor riscado; pergunta protetora antes de comprar) |
| 4 | `f1_20` | Score de crédito e seu efeito nas condições de crédito |
| 5-6 | `f1_21` | Rotativo do cartão (o que acontece com o valor não pago; alternativa mais barata) |
| 7 | `f1_22` | Cheque especial como dívida cara que cresce rápido |
| 8 | `f1_23` | Por que o consignado costuma ter juros menores que o pessoal |
| 9-10 | `f1_24` | Por que credores negociam desconto em dívida atrasada; priorizar dívidas de juros mais altos |

Nenhuma pergunta-base é cópia literal de nenhuma pergunta ou variante já
publicada nas 28 lições referenciadas — todas usam personagens, valores e
situações novas, preservando o conceito original, conforme exigido pelo
usuário. Em alguns pontos onde uma primeira redação ficou próxima demais da
frase original da lição-fonte (ex.: o padrão "Entre segurar um X de RY... e
comprar garantia estendida para um Z de RW..." de `f1_10`, e o padrão "No
exemplo de uma etiqueta com 'de RX por RY', qual é o papel do valor 'RX'?"
de `f1_19`), a pergunta foi reescrita com uma estrutura de frase diferente
antes de entrar na versão final abaixo — não só números trocados.

#### 2. Precisão factual/financeira — checklist de validação

- Todos os cálculos foram checados à mão antes de fixar a opção `correta`:
  patrimônio líquido (`f1_03`, `revU_01` Q3/Q4: 21.000-4.500=16.500;
  8.000-2.800=5.200), custo de oportunidade (`f1_04`, `revU_01` Q5:
  450 e 560), inflação (`revU_01` Q7: 28/350=8%; 50/500=10%; Q10:
  8.000×1,25=10.000; 5.000×1,60=8.000), juros compostos (`revU_02` Q3
  variante: 3.000×1,08×1,08≈3.499; Q4: 800×1,12³≈1.124 vs 800+3×12%×800=1.088),
  Regra dos 72 (`revU_02` Q5: 72÷12=6; 72÷6=12), regra 50-30-20 (`revU_02`
  Q9: 5.500×0,20=1.100; 3.600×0,50=1.800; `revU_03` Q1: 6.000×0,20=1.200;
  2.800×0,50=1.400), percentual de renda comprometida (`revU_03` Q2:
  1.270÷1.500≈85%). Nenhum resultado diverge da opção marcada como `correta`.
- Nenhum número novo de lei/regra foi introduzido — todos os 4 blocos desta
  Onda tratam de conceitos comportamentais e matemáticos genéricos (receita/
  despesa, ativo/passivo, patrimônio líquido, custo de oportunidade,
  inflação/IPCA, juros simples/compostos, Regra dos 72, reserva de
  emergência, liquidez, seguro, orçamento 50-30-20, metas SMART, vieses de
  consumo, score de crédito, rotativo, cheque especial, consignado x
  pessoal, negociação de dívida) — nenhum deles depende de uma alíquota,
  teto ou lei que mude com frequência e precise de ressalva adicional além
  da já existente nas lições originais (ex.: `f1_20`/`f1_21`/`f1_23` já
  tratam score/juros/margem consignável como aproximados nas lições-fonte;
  esta revisão não fixa nenhum número de taxa real, usando sempre taxas
  fictícias de exemplo, como as próprias lições-fonte já fazem).
- Nenhuma pergunta ou explicação soa como recomendação personalizada de
  investimento, crédito ou negociação de dívida — todas descrevem conceitos
  genéricos e situações fictícias, mesma postura editorial já usada no
  resto da trilha Financeira.
- Cada `explicacao` (base e variante) foi escrita para ser compreensível por
  alguém sem conhecimento prévio, respondendo diretamente "por que a opção
  marcada como certa está certa" — mesmo critério de aceite já usado no
  resto do projeto.

#### 3. Checklist do bug da Fase 3B (Q9 de `revE_01`) — revisão par a par

Releitura de todas as 40 perguntas-base (10 por bloco × 4 blocos) contra a
`variante` correspondente, confirmando que cada par testa o MESMO conceito
central, só com cenário/nomes/números diferentes — nunca um conceito
diferente (exatamente o defeito encontrado pelo QA na pergunta 9 de
`revE_01`):

- **`revU_01`**: todos os 10 pares confirmados mesmo conceito (receita/
  despesa → resultado do mês em ambos; ativo/passivo → identificar o par em
  ambos; PL → mesmo cálculo em ambos / mesma comparação renda-alta-x-PL-baixo
  em ambos; custo de oportunidade → mesmo cálculo em ambos / mesmo
  nome-o-conceito em ambos; inflação → mesmo cálculo de variação de preço em
  ambos, ambos QUESTIONs 7 base e variante recalculados de propósito para
  usar o mesmo tipo de pergunta, evitando o padrão do Bug 1 de misturar
  "calcular" com "efeito"; inflação percebida x oficial → mesma comparação de
  cesta pessoal x IPCA em ambos; poder de compra → mesmo efeito/mesmo cálculo
  em cada par, respectivamente).
- **`revU_02`**: todos os 10 pares confirmados. Atenção especial na pergunta
  6 (`l1_2`, reserva de emergência): a primeira redação tinha base sobre
  "quantos meses guardar" (cálculo) e cogitava variante sobre "para que serve
  a reserva" (propósito) — dois conceitos da mesma lição, mas diferentes
  entre si; corrigido para os dois lados do par tratarem do mesmo conceito
  (propósito da reserva diante de um imprevisto), com dois imprevistos
  diferentes (perda de emprego x emergência odontológica). Mesmo cuidado na
  pergunta 8 (`f1_10`, seguro): a primeira redação misturava "seguro grande x
  pequeno risco" (base) com "garantia estendida redundante com garantia de
  fábrica" (variante) — são dois argumentos diferentes da mesma lição;
  corrigido para os dois lados tratarem do mesmo argumento (prejuízo grande e
  difícil de absorver x prejuízo pequeno e fácil de repor).
- **`revU_03`**: todos os 10 pares confirmados. Atenção especial nas
  perguntas 3, 4 e 5 (`f1_12`, `f1_13`, `f1_14`): as primeiras redações
  misturavam, em cada uma, dois sub-conceitos distintos da mesma lição-fonte
  (ex.: "reconhecer meta SMART" com "por que o critério Atingível importa";
  "divisão proporcional" com "revisão periódica do combinado"; "separar o
  salário em compartimentos" com "hábito formado cedo se mantém") — cada par
  foi reescrito para os dois lados testarem o mesmo sub-conceito, movendo o
  sub-conceito descartado para fora do par (sem perder cobertura da lição
  como um todo, já que cada lição tem no mínimo 1 pergunta dedicada nesta
  Onda). A pergunta 8 (`f1_16`, contabilidade mental) foi mantida com base
  testando "reconhecer o viés acontecendo" e variante testando "reconhecer o
  viés sendo superado" — **isso não é o mesmo defeito do Bug 1**: é o mesmo
  padrão já usado pela própria lição original `f1_16` (sua pergunta 2 já
  tinha exatamente essa estrutura de base/variante, um lado mostrando o viés
  agindo e o outro mostrando a pessoa contornando o mesmo viés), preservado
  aqui de propósito por já ser um padrão validado no conteúdo publicado.
- **`revU_04`**: todos os 10 pares confirmados. Atenção especial na pergunta
  4 (`f1_20`, score de crédito): a primeira redação tinha base sobre "score
  alto x baixo muda as condições de financiamento" e variante sobre "uso do
  limite e atraso reduzem o score" — dois sub-conceitos diferentes da mesma
  lição (efeito do score x causas da queda do score); corrigido para os dois
  lados tratarem do mesmo sub-conceito (score influenciando as condições de
  crédito oferecidas, um caso com financiamento, outro com cartão). Mesmo
  cuidado nas perguntas 7 (`f1_22`, cheque especial: base e variante
  unificadas em "a dívida cresce rápido por juros altos", não misturadas com
  "uso recorrente indica problema de orçamento") e 8 (`f1_23`, consignado x
  pessoal: base e variante unificadas em "por que o consignado tem juros
  menores", não misturadas com "risco da margem consignável").

**Conclusão da checklist**: nenhum par restante mistura dois conceitos
diferentes entre pergunta-base e `variante` — os 4 casos em que uma primeira
redação teria reproduzido o padrão do Bug 1 foram identificados nesta própria
revisão (antes de entrar na versão final abaixo, não depois) e corrigidos,
movendo o sub-conceito descartado para outra pergunta do mesmo bloco quando
fazia sentido, sem perder cobertura de nenhuma das 28 lições.

#### 4. `revU_01` — objeto completo

```js
{
  id: "revU_01",
  tipo: "revisao",
  titulo: "Revisão: dinheiro, patrimônio e inflação no dia a dia",
  xp: 20,
  aula: [
    "Esses últimos 7 pontos da trilha te deram as bases de qualquer decisão financeira: o que é receita e despesa, a diferença entre ativo e passivo, como calcular seu patrimônio líquido, o que você abre mão ao escolher algo (custo de oportunidade) e como a inflação corrói o poder de compra do dinheiro parado.",
    "As perguntas aqui não são as mesmas que você já viu — são situações novas, com pessoas e números diferentes, testando se o conceito realmente ficou, e não se você decorou a pergunta original.",
    "Se errar alguma, não tem problema: a explicação logo abaixo mostra exatamente o porquê da resposta certa. Essa é a parte que faz o conhecimento grudar de verdade.",
  ],
  refLessonIds: ["f1_01", "f1_02", "f1_03", "f1_04", "l1_1", "f1_05", "f1_06"],
  perguntas: [
    {
      pergunta: "Fernanda recebeu R$ 4.500 de salário em um mês e gastou R$ 4.900 entre aluguel, contas e lazer. Qual foi o resultado financeiro do mês dela?",
      opcoes: ["Sobra de R$400", "Falta de R$400 — ela gastou mais do que recebeu", "Resultado exatamente zero", "Não é possível calcular isso"],
      correta: 1,
      explicacao: "Receita (R$4.500) menos despesa (R$4.900) dá um resultado negativo de R$400 — ela gastou R$400 a mais do que ganhou nesse mês.",
      variante: {
        pergunta: "Gustavo recebeu R$ 3.100 em bicos no mês e gastou R$ 3.450 entre contas e lazer. Qual foi o resultado financeiro do mês dele?",
        opcoes: ["Sobra de R$350", "Falta de R$350 — ele gastou mais do que recebeu", "Resultado exatamente zero", "Não é possível calcular isso"],
        correta: 1,
        explicacao: "Receita (R$3.100) menos despesa (R$3.450) dá um resultado negativo de R$350 — ele gastou R$350 a mais do que recebeu nesse mês.",
      },
    },
    {
      pergunta: "Camila tem um imóvel alugado que gera R$1.500 de aluguel por mês e um empréstimo pessoal cuja parcela é de R$600 por mês. Qual dos dois é o passivo dela?",
      opcoes: ["O imóvel alugado", "O empréstimo pessoal, porque a parcela tira dinheiro do bolso dela todo mês", "Os dois são ativos", "Os dois são passivos"],
      correta: 1,
      explicacao: "Passivo é o que tira dinheiro do bolso com o tempo — a parcela do empréstimo. O imóvel alugado é o ativo, pois gera renda.",
      variante: {
        pergunta: "Bruno tem uma aplicação financeira que rende R$300 por mês e uma dívida de financiamento de moto cuja parcela é R$450 por mês. Qual dos dois é o ativo dele?",
        opcoes: ["A aplicação financeira, porque coloca dinheiro no bolso dele todo mês", "O financiamento da moto", "Os dois são passivos", "Os dois são ativos"],
        correta: 0,
        explicacao: "Ativo é o que gera renda ou pode virar dinheiro — a aplicação financeira. O financiamento da moto é passivo, pois tira dinheiro todo mês via parcela.",
      },
    },
    {
      pergunta: "Diego tem R$12.000 guardados e uma moto avaliada em R$9.000. Ele deve R$4.000 de um empréstimo pessoal e R$500 no cartão. Qual é o patrimônio líquido de Diego?",
      opcoes: ["R$16.500", "R$21.000", "R$4.500", "R$25.500"],
      correta: 0,
      explicacao: "Bens (12.000+9.000=21.000) menos dívidas (4.000+500=4.500) = R$16.500 de patrimônio líquido.",
      variante: {
        pergunta: "Patrícia tem R$5.000 guardados e um notebook avaliado em R$3.000. Ela deve R$2.000 no financiamento de um curso e R$800 no cartão. Qual é o patrimônio líquido de Patrícia?",
        opcoes: ["R$5.200", "R$8.000", "R$2.800", "R$10.800"],
        correta: 0,
        explicacao: "Bens (5.000+3.000=8.000) menos dívidas (2.000+800=2.800) = R$5.200 de patrimônio líquido.",
      },
    },
    {
      pergunta: "Camila ganha R$18.000 por mês, mas tem R$120.000 em dívidas e apenas R$30.000 em bens. Thiago ganha R$3.500 por mês, não deve nada e tem R$25.000 guardados. Quem tem o patrimônio líquido mais alto?",
      opcoes: ["Camila, porque ganha mais", "Thiago, porque seu patrimônio líquido (R$25.000) é maior que o de Camila (-R$90.000)", "Os dois têm o mesmo patrimônio líquido", "Não é possível comparar patrimônio líquido entre pessoas diferentes"],
      correta: 1,
      explicacao: "O patrimônio líquido de Camila é negativo (30.000-120.000=-90.000); o de Thiago é positivo (25.000-0=25.000) — renda alta não garante patrimônio líquido alto.",
      variante: {
        pergunta: "Rogério ganha R$10.000/mês mas tem R$60.000 em dívidas e R$15.000 em bens. Vanessa ganha R$2.800/mês, não deve nada e tem R$12.000 guardados. Quem tem o maior patrimônio líquido?",
        opcoes: ["Rogério, porque ganha mais", "Vanessa, porque seu patrimônio líquido (R$12.000) é maior que o de Rogério (-R$45.000)", "Os dois têm o mesmo patrimônio líquido", "É impossível saber sem mais dados"],
        correta: 1,
        explicacao: "O patrimônio líquido de Rogério é negativo (15.000-60.000=-45.000); o de Vanessa é positivo (12.000-0=12.000). Renda alta não significa patrimônio alto.",
      },
    },
    {
      pergunta: "Simone tinha R$5.000 e podia escolher entre guardar numa conta que não rende nada ou investir num CDB que renderia R$450 no ano. Ela escolheu deixar parado, sem render nada. Qual foi o custo de oportunidade dessa escolha?",
      opcoes: ["R$5.000", "R$0", "R$450 — o quanto ela deixou de ganhar ao não escolher o CDB", "R$5.450"],
      correta: 2,
      explicacao: "O custo de oportunidade é o quanto ela deixou de ganhar ao não escolher a melhor alternativa disponível: os R$450 que o CDB renderia.",
      variante: {
        pergunta: "Otávio tinha R$8.000 e podia investir num CDB que renderia R$560 no ano, mas preferiu deixar o dinheiro parado numa conta que não rende nada. Qual foi o custo de oportunidade dessa escolha?",
        opcoes: ["R$8.000", "R$0", "R$560 — o quanto ele deixou de ganhar ao não escolher o CDB", "R$8.560"],
        correta: 2,
        explicacao: "Custo de oportunidade é o valor que ele deixou de ganhar ao escolher a pior opção disponível: os R$560 que o CDB renderia.",
      },
    },
    {
      pergunta: "Renata fez um bico de fim de semana que pagou R$500, recusando outro bico que pagaria R$700 no mesmo período. Qual conceito explica o valor que ela deixou de ganhar?",
      opcoes: ["Inflação", "Custo de oportunidade", "Patrimônio líquido", "Taxa de juros"],
      correta: 1,
      explicacao: "O custo de oportunidade é justamente o valor da melhor alternativa não escolhida — nesse caso, os R$200 a menos que ela recebeu.",
      variante: {
        pergunta: "Leandro usou R$2.000 guardados para comprar um smartphone em vez de investir. Um ano depois, se tivesse investido, o dinheiro teria rendido R$220 de juros que ele não recebeu. Qual conceito explica esse valor perdido?",
        opcoes: ["Inflação", "Custo de oportunidade", "Patrimônio líquido", "Score de crédito"],
        correta: 1,
        explicacao: "O custo de oportunidade é justamente esse valor deixado de ganhar (R$220) por escolher gastar em vez de investir.",
      },
    },
    {
      pergunta: "Uma cesta básica custava R$350 em janeiro e passou a custar R$378 em dezembro do mesmo ano, sem mudança nos produtos. O que isso representa?",
      opcoes: ["Os produtos ficaram melhores", "Houve inflação de 8% no período", "O dinheiro rendeu 8%", "Nada, é só uma promoção ao contrário"],
      correta: 1,
      explicacao: "Um aumento de preço sem mudança no produto é inflação — nesse caso, de 8% (R$28/R$350).",
      variante: {
        pergunta: "Uma prestação de serviço custava R$500 em um mês e passou a custar R$550 três meses depois, sem nenhuma mudança na qualidade do serviço. O que isso representa?",
        opcoes: ["O serviço melhorou de qualidade", "Houve inflação de 10% nesse serviço, no período", "O dinheiro do cliente rendeu 10%", "Isso é apenas uma coincidência sem nome"],
        correta: 1,
        explicacao: "Um aumento de preço sem mudança no produto/serviço é inflação — nesse caso, de 10% (R$50/R$500).",
      },
    },
    {
      pergunta: "O IPCA de um mês veio em 0,4%. Mas Roberto gasta a maior parte da renda com aluguel e transporte, itens que subiram 2,5% nesse mês, bem mais que a média nacional. O que é mais provável de acontecer com a inflação percebida por Roberto?",
      opcoes: ["Ele vai perceber uma inflação menor que 0,4%", "Ele vai perceber uma inflação maior que 0,4%, porque os itens que mais pesam no seu orçamento subiram mais que a média", "A inflação percebida por ele será exatamente 0,4%", "Isso não tem relação com o que ele consome"],
      correta: 1,
      explicacao: "Como os itens que pesam mais no orçamento de Roberto (aluguel, transporte) subiram bem mais que a média (2,5% vs 0,4%), ele vai perceber uma inflação bem maior que o IPCA oficial.",
      variante: {
        pergunta: "Luana gasta 65% da renda com aluguel e comida (que subiram 9% no ano) e Felipe gasta apenas 15% com esses itens, preferindo lazer e viagens (que subiram 1%). Se o IPCA oficial do ano foi 4%, quem provavelmente vai sentir uma inflação bem mais alta que os 4% oficiais?",
        opcoes: ["Felipe, porque ele viaja mais", "Luana, porque a maior parte do seu orçamento está em itens que subiram bem mais que a média (9%)", "Os dois vão sentir exatamente 4%, igual ao IPCA", "Isso depende só da renda de cada um, não da composição dos gastos"],
        correta: 1,
        explicacao: "Luana concentra o orçamento em itens que subiram 9% (bem acima do IPCA de 4%), então sua inflação pessoal percebida tende a ser maior que a oficial.",
      },
    },
    {
      pergunta: "Um produto custava R$40 há 8 anos e hoje custa R$80 (o preço dobrou). Uma pessoa guardou R$40 'no colchão' sem investir nesse período. O que aconteceu com o poder de compra desses R$40?",
      opcoes: ["Continua o mesmo, R$40 ainda compra o mesmo produto", "Caiu à metade — os R$40 agora só compram a metade do produto que comprava antes", "Aumentou, porque dinheiro guardado sempre valoriza", "Não é possível saber sem outras informações"],
      correta: 1,
      explicacao: "Como o preço do produto dobrou e o dinheiro guardado não foi corrigido, os mesmos R$40 hoje compram só a metade do que compravam há 8 anos.",
      variante: {
        pergunta: "Um serviço custava R$60 há 5 anos e hoje custa R$90 (aumento de 50%). Uma pessoa guardou R$60 sem investir nesse período. O que aconteceu com o poder de compra desses R$60?",
        opcoes: ["Continua o mesmo", "Caiu — os R$60 já não são suficientes para pagar o mesmo serviço, que agora custa R$90", "Aumentou", "Não é possível saber"],
        correta: 1,
        explicacao: "O serviço ficou 50% mais caro, mas o dinheiro guardado não acompanhou esse aumento — por isso os R$60 perderam poder de compra em relação a esse serviço.",
      },
    },
    {
      pergunta: "Se a inflação acumulada de um período foi de 25% e uma pessoa manteve R$8.000 parados numa conta que não rende nada, aproximadamente quanto ela precisaria ter hoje para manter o mesmo poder de compra que os R$8.000 tinham no início do período?",
      opcoes: ["R$8.000", "R$10.000", "R$6.000", "R$12.000"],
      correta: 1,
      explicacao: "Para manter o mesmo poder de compra após 25% de inflação acumulada, seria preciso ter R$10.000 (R$8.000 + 25% de R$8.000).",
      variante: {
        pergunta: "Se a inflação acumulada de um período foi de 60% e uma pessoa manteve R$5.000 parados sem render nada, aproximadamente quanto ela precisaria ter hoje para manter o mesmo poder de compra inicial?",
        opcoes: ["R$5.000", "R$8.000", "R$3.000", "R$11.000"],
        correta: 1,
        explicacao: "Para manter o poder de compra após 60% de inflação acumulada, seria necessário ter R$8.000 (R$5.000 + 60% de R$5.000).",
      },
    },
  ],
},
```

#### 5. `revU_02` — objeto completo

```js
{
  id: "revU_02",
  tipo: "revisao",
  titulo: "Revisão: juros, reserva e as primeiras decisões de proteção",
  xp: 20,
  aula: [
    "Aqui você revisita como o tempo trabalha a seu favor nos juros compostos, o truque de bolso da Regra dos 72, por que toda vida financeira precisa de uma reserva de emergência, o que é liquidez e quando um seguro realmente vale a pena — fechando com a base de qualquer orçamento, a regra 50-30-20.",
    "De novo: as 10 perguntas abaixo usam situações diferentes das que você já respondeu, para testar se você entendeu o porquê por trás de cada conceito, não a decoreba da frase exata.",
    "Errar faz parte do processo — a explicação de cada resposta existe justamente para fechar qualquer dúvida que sobrar.",
  ],
  refLessonIds: ["l5_1", "f1_07", "f1_08", "l1_2", "f1_09", "f1_10", "l1_3"],
  perguntas: [
    {
      pergunta: "João investe R$ 100 e, no primeiro mês, ganha R$ 1 de juros (ficando com R$101). No segundo mês, sobre quanto valor os novos juros serão calculados, nos juros compostos?",
      opcoes: ["Só sobre os R$100 originais", "Sobre os R$101 (o valor original mais o juro já ganho)", "Sobre um valor fixo de R$50", "Os juros não se acumulam"],
      correta: 1,
      explicacao: "Nos juros compostos, cada novo período de juros incide sobre o total acumulado até ali — os R$101, não só os R$100 iniciais.",
      variante: {
        pergunta: "Carla investe R$500 e, no primeiro mês, ganha R$8 de juros (ficando com R$508). No segundo mês, sobre quanto valor os novos juros serão calculados, nos juros compostos?",
        opcoes: ["Só sobre os R$500 originais", "Sobre os R$508 (o valor original mais o juro já ganho)", "Sobre um valor fixo de R$250", "Os juros não se acumulam"],
        correta: 1,
        explicacao: "Nos juros compostos, cada novo período incide sobre o total acumulado até ali — os R$508, não só os R$500 iniciais.",
      },
    },
    {
      pergunta: "Felipe começa a investir R$300/mês aos 22 anos. Vinícius só começa aos 34, querendo chegar ao mesmo patrimônio na aposentadoria. O que Vinícius provavelmente vai precisar fazer?",
      opcoes: ["Investir um valor mensal bem menor que o de Felipe", "Investir um valor mensal bem maior que o de Felipe, para compensar os 12 anos de vantagem que ele teve", "Nada, os dois vão chegar ao mesmo lugar investindo igual", "Esperar mais 12 anos resolve sozinho"],
      correta: 1,
      explicacao: "Como Felipe teve 12 anos extras de juros compostos trabalhando por ele, Vinícius precisa aportar valores maiores para tentar alcançar o mesmo resultado final.",
      variante: {
        pergunta: "Começar a investir 7 anos mais tarde do que se poderia normalmente exige, para chegar ao mesmo resultado final:",
        opcoes: ["O mesmo valor investido por mês", "Um valor investido mensal bem menor", "Um valor investido mensal bem maior, para compensar o tempo perdido", "Não faz diferença nenhuma"],
        correta: 2,
        explicacao: "Como os juros compostos dependem fortemente do tempo, começar mais tarde exige aportes maiores por mês para alcançar o mesmo patrimônio final.",
      },
    },
    {
      pergunta: "R$2.000 são aplicados a 10% ao ano por 2 anos. No juro simples, os juros de cada ano são sempre calculados sobre os R$2.000 originais. No juro composto, o que muda no cálculo do segundo ano?",
      opcoes: ["Nada muda, o cálculo é idêntico ao juro simples", "O juro do segundo ano passa a incidir também sobre o juro já ganho no primeiro ano, não só sobre os R$2.000 originais", "O juro do segundo ano é calculado sobre um valor menor", "Juros compostos não existem para prazos de 2 anos"],
      correta: 1,
      explicacao: "No juro composto, o rendimento de um período passa a integrar a base de cálculo do período seguinte ('juros sobre juros'); no simples, o cálculo é sempre sobre o valor original.",
      variante: {
        pergunta: "Se R$3.000 forem aplicados a 8% ao ano, qual será o valor aproximado ao final de 2 anos, comparando juro simples e juro composto?",
        opcoes: ["R$3.480 no simples e aproximadamente R$3.499 no composto", "R$3.499 no simples e R$3.480 no composto", "Os dois resultam em exatamente R$3.480", "Os dois resultam em exatamente R$3.499"],
        correta: 0,
        explicacao: "No simples, os juros são sempre 8% de R$3.000 (R$240/ano): 3.000+240+240=3.480. No composto, o segundo ano rende 8% sobre R$3.240: 3.000×1,08×1,08≈3.499 — um pouco mais, por causa do 'juro sobre juro'.",
      },
    },
    {
      pergunta: "Uma dívida de R$800 no cartão de crédito, com juros de 12% ao mês (juros compostos), não é paga por 3 meses. Aproximadamente quanto ela estará valendo depois desses 3 meses?",
      opcoes: ["R$800 (os juros não afetam cartão de crédito)", "R$1.088 (800 + 12% x 3 meses, como se fosse juros simples)", "Aproximadamente R$1.124, porque os juros incidem também sobre os juros acumulados dos meses anteriores", "R$896, porque os juros são de apenas 12% no total"],
      correta: 2,
      explicacao: "Com juros compostos de 12% ao mês: 800 × 1,12 × 1,12 × 1,12 ≈ R$1.124 — bem mais que o cálculo simples (R$1.088), porque os juros incidem também sobre os juros dos meses anteriores.",
      variante: {
        pergunta: "Uma dívida de R$1.200 no cartão de crédito, com juros de 10% ao mês, fica sem pagamento por 4 meses. O que explica o fato de o valor final ser bem maior do que simplesmente somar 10% de R$1.200 a cada um dos 4 meses?",
        opcoes: ["O banco arredonda os valores para cima", "Os juros de cada mês passam a incidir também sobre os juros já acumulados dos meses anteriores, não só sobre os R$1.200 originais", "A inflação é responsável pelo aumento", "Isso não acontece, o valor final seria igual à soma simples"],
        correta: 1,
        explicacao: "Como os juros do cartão são compostos, cada mês novo cobra juros sobre a dívida já acrescida dos juros anteriores — por isso o total final é maior do que a soma simples de 10% por mês.",
      },
    },
    {
      pergunta: "Um investimento rende 12% ao ano. Pela Regra dos 72, em quantos anos aproximadamente esse investimento dobra de valor?",
      opcoes: ["4 anos", "6 anos", "12 anos", "24 anos"],
      correta: 1,
      explicacao: "Pela Regra dos 72: 72 ÷ 12 = 6 anos, aproximadamente, para o valor dobrar.",
      variante: {
        pergunta: "Alguém quer que seu dinheiro dobre em aproximadamente 6 anos. Usando a Regra dos 72, a que taxa de juros anual (aproximada) esse investimento precisaria render?",
        opcoes: ["6% ao ano", "9% ao ano", "12% ao ano", "72% ao ano"],
        correta: 2,
        explicacao: "Pela Regra dos 72: 72 ÷ 6 anos = 12% ao ano é a taxa aproximada necessária para dobrar o valor nesse prazo.",
      },
    },
    {
      pergunta: "Vitor perdeu o emprego de repente e precisa pagar as contas do mês enquanto procura uma nova posição. O que deveria cobrir esse período, idealmente?",
      opcoes: ["Um saque no cheque especial", "A reserva de emergência guardada previamente", "A venda urgente de ações na baixa", "Não há nada a fazer nesse caso"],
      correta: 1,
      explicacao: "Esse é exatamente o cenário para o qual a reserva de emergência existe: cobrir imprevistos sem recorrer a dívidas caras.",
      variante: {
        pergunta: "Beatriz teve um problema odontológico urgente e precisou de R$1.800 para o tratamento, um valor que não estava previsto no orçamento do mês. O que deveria cobrir esse tipo de imprevisto, idealmente?",
        opcoes: ["Um novo cartão de crédito com juros altos", "A reserva de emergência guardada previamente", "Um empréstimo consignado de longo prazo", "Não há nada a fazer nesse caso"],
        correta: 1,
        explicacao: "Assim como no caso de perda de emprego, um imprevisto de saúde é exatamente o tipo de situação para a qual a reserva de emergência deveria existir — evitando recorrer a dívidas caras.",
      },
    },
    {
      pergunta: "Mariana possui um terreno avaliado em R$150.000, difícil de vender rapidamente, e R$3.000 guardados numa conta que podem ser sacados hoje mesmo. Comparando os dois, qual dos dois recursos tem maior liquidez, e por quê?",
      opcoes: ["O terreno, porque vale muito mais que os R$3.000", "Os R$3.000 na conta, porque podem virar dinheiro na hora, enquanto o terreno pode levar meses para ser vendido", "Os dois têm liquidez igual, pois qualquer bem pode ser convertido em dinheiro", "Não é possível comparar liquidez entre tipos de bens diferentes"],
      correta: 1,
      explicacao: "Liquidez não depende do valor do bem, e sim da velocidade de conversão em dinheiro — por isso os R$3.000 disponíveis na hora são mais líquidos que o terreno, mesmo valendo muito menos.",
      variante: {
        pergunta: "Mariana perdeu parte da renda e precisa de R$2.500 rápido para uma emergência. Ela só tem o terreno (difícil de vender rapidamente) e nenhuma reserva em dinheiro disponível. O que a falta de liquidez provavelmente vai obrigar Mariana a fazer?",
        opcoes: ["Esperar tranquilamente a venda ideal do terreno", "Vender o terreno rapidamente por um preço abaixo do valor real, ou recorrer a um empréstimo com juros altos", "Não fazer nada, pois patrimônio alto sempre resolve emergências instantaneamente", "Aumentar seu patrimônio líquido imediatamente"],
        correta: 1,
        explicacao: "Sem um bem líquido disponível, Mariana provavelmente terá que vender o terreno com desconto (por pressa) ou pegar um empréstimo caro — o problema não é falta de patrimônio, é falta de liquidez.",
      },
    },
    {
      pergunta: "Felipe está decidindo se contrata um seguro para a casa da família (avaliada em R$400.000, que eles não teriam como reconstruir do próprio bolso num incêndio) e também um seguro para uma cafeteira de R$200 recém-comprada. Em qual dos dois bens o seguro tende a fazer mais sentido financeiro?",
      opcoes: ["Na cafeteira, por ser um eletrodoméstico usado todo dia", "Na casa, porque um prejuízo de R$400.000 desestruturaria as finanças da família, enquanto os R$200 da cafeteira são fáceis de repor sozinho", "Nos dois, com o mesmo grau de importância", "Em nenhum dos dois, seguro nunca compensa"],
      correta: 1,
      explicacao: "Seguro faz mais sentido quando protege contra um prejuízo grande e difícil de absorver sozinho, como a casa; para um bem barato como a cafeteira, o custo de repor do próprio bolso é pequeno, tornando o seguro extra dispensável.",
      variante: {
        pergunta: "Roberta está avaliando se vale a pena contratar um seguro para o carro usado para trabalhar (avaliado em R$45.000, essencial para a renda da família) e também um seguro para um liquidificador de R$180 recém-comprado. Em qual dos dois bens o seguro tende a fazer mais sentido?",
        opcoes: ["No liquidificador, porque ele quebra com mais frequência", "No carro, porque perder um bem de R$45.000, essencial para a renda, seria um prejuízo muito mais difícil de absorver do que repor um liquidificador de R$180", "Nos dois, com a mesma urgência", "Em nenhum dos dois, pois seguro é sempre dispensável"],
        correta: 1,
        explicacao: "Assim como no exemplo da casa e da cafeteira, o seguro compensa mais quando protege contra um prejuízo grande e difícil de absorver sozinho — o carro, nesse caso — e não faz tanto sentido para um bem barato e fácil de substituir, como o liquidificador.",
      },
    },
    {
      pergunta: "Se a renda mensal de Larissa é R$5.500 e ela segue a regra 50-30-20, quanto ela reservaria, em teoria, para investimentos e pagamento de dívidas (os 20%)?",
      opcoes: ["R$2.750", "R$1.650", "R$1.100", "R$550"],
      correta: 2,
      explicacao: "20% de R$5.500 = R$1.100 destinados a investimentos/dívidas, seguindo a regra 50 (necessidades) - 30 (desejos) - 20 (investir/pagar dívidas).",
      variante: {
        pergunta: "Se a renda mensal de Eduardo é R$3.600 e ele segue a regra 50-30-20, quanto ele destinaria, em teoria, para necessidades essenciais (os 50%)?",
        opcoes: ["R$1.080", "R$1.800", "R$720", "R$2.520"],
        correta: 1,
        explicacao: "50% de R$3.600 = R$1.800 é o valor recomendado pela regra 50-30-20 para necessidades essenciais como aluguel, comida e contas.",
      },
    },
    {
      pergunta: "Depois de anotar os gastos por um mês, Henrique descobriu que gastava R$310 por mês em aplicativos de delivery que ele nem lembrava de ter pedido. O que esse exemplo demonstra?",
      opcoes: ["Que anotar gastos não serve para nada", "Que anotar gastos revela padrões de consumo que passam despercebidos no dia a dia", "Que delivery é sempre um mau gasto", "Que ele deveria parar de trabalhar"],
      correta: 1,
      explicacao: "Registrar gastos frequentemente revela padrões invisíveis — como pedidos recorrentes ou pequenas compras que somam bastante ao longo do mês.",
      variante: {
        pergunta: "Patrícia decide anotar cada gasto, por menor que seja, durante 30 dias, e percebe que várias compras de R$15 a R$20 em lanches na rua somaram R$280 no mês — um valor que ela nunca soube que estava gastando. O que essa experiência de Patrícia ilustra sobre o hábito de registrar gastos?",
        opcoes: ["Que anotar gastos é uma perda de tempo", "Que anotar gastos revela padrões de consumo que passam despercebidos no dia a dia, mesmo em compras pequenas", "Que lanches de rua deveriam ser proibidos", "Que só gastos grandes precisam ser registrados"],
        correta: 1,
        explicacao: "Registrar gastos, inclusive os pequenos, costuma revelar padrões de consumo somados que passavam completamente despercebidos até serem colocados no papel — igual aconteceu com Patrícia.",
      },
    },
  ],
},
```

#### 6. `revU_03` — objeto completo

```js
{
  id: "revU_03",
  tipo: "revisao",
  titulo: "Revisão: metas, hábitos e os gatilhos que te fazem gastar",
  xp: 20,
  aula: [
    "Esse bloco reúne como aplicar a regra 50-30-20 na prática, como montar uma meta financeira SMART, como organizar as contas em família, os primeiros hábitos de quem recebe o primeiro salário, por que o prazo de uma meta muda a estratégia, o viés da contabilidade mental e os gatilhos de consumo usados pelo marketing para te fazer comprar mais rápido.",
    "Como sempre: são situações-problema novas, não as mesmas perguntas de antes — o objetivo é testar se o conceito ficou, não a memória da frase exata.",
    "Cada resposta errada vem com uma explicação clara logo abaixo, pensada para qualquer pessoa entender o porquê — é assim que a revisão funciona de verdade.",
  ],
  refLessonIds: ["f1_11", "f1_12", "f1_13", "f1_14", "f1_15", "f1_16", "f1_17"],
  perguntas: [
    {
      pergunta: "Rodrigo ganha R$6.000 por mês. Seguindo a regra 50-30-20, quanto ele deveria reservar por mês para poupança, investimentos ou pagamento de dívidas (os 20%)?",
      opcoes: ["R$600", "R$1.200", "R$1.800", "R$3.000"],
      correta: 1,
      explicacao: "20% de R$6.000 = R$1.200 é a fatia recomendada pela regra para poupança, investimentos ou pagamento de dívidas.",
      variante: {
        pergunta: "Simone ganha R$2.800 por mês. Seguindo a regra 50-30-20, quanto ela deveria destinar para necessidades essenciais (os 50%)?",
        opcoes: ["R$840", "R$1.400", "R$1.960", "R$560"],
        correta: 1,
        explicacao: "50% de R$2.800 = R$1.400 é o valor recomendado pela regra para necessidades essenciais como aluguel, comida e contas.",
      },
    },
    {
      pergunta: "Uma pessoa ganha R$1.500 por mês (perto de um salário mínimo) e gasta R$1.270 só com aluguel, comida e contas essenciais. Que porcentagem da renda já está sendo usada com necessidades — bem mais ou bem menos que os 50% recomendados pela regra?",
      opcoes: ["Cerca de 50%, exatamente como recomenda a regra", "Cerca de 85%, bem mais que os 50% recomendados, sobrando pouco espaço para desejos e poupança", "Cerca de 20%, bem menos que o recomendado", "Não é possível calcular essa porcentagem"],
      correta: 1,
      explicacao: "R$1.270 ÷ R$1.500 ≈ 85% da renda já vai para necessidades — bem acima dos 50% recomendados, deixando pouco espaço para desejos e poupança.",
      variante: {
        pergunta: "Por que a regra 50-30-20 pode ser difícil de seguir 'à risca' para quem tem uma renda baixa e mora numa cidade com aluguel caro?",
        opcoes: ["Porque a regra só se aplica a quem ganha mais de R$10.000", "Porque, muitas vezes, o custo com necessidades básicas já consome bem mais de 50% de uma renda baixa, sobrando pouco ou nada para desejos e poupança", "Porque rendas baixas não têm despesas com necessidades", "Porque a regra é ilegal para quem ganha pouco"],
        correta: 1,
        explicacao: "Com uma renda baixa, itens essenciais como aluguel e comida costumam consumir uma fatia bem maior que 50%, tornando difícil seguir a proporção da regra de forma exata.",
      },
    },
    {
      pergunta: "Aline quer trocar de notebook, que custa R$3.000. Qual versão dessa meta está no formato SMART?",
      opcoes: ["Quero trocar de notebook um dia", "Vou guardar R$250 por mês durante 12 meses para trocar o notebook de R$3.000 em dezembro", "Notebook novo é importante pra mim", "Vou ver se sobra dinheiro pro notebook no fim do mês"],
      correta: 1,
      explicacao: "A meta SMART transforma o desejo 'trocar de notebook' em um plano com valor mensal, prazo e valor final definidos — específico, mensurável e com prazo.",
      variante: {
        pergunta: "Otávio quer fazer uma viagem de R$4.800. Qual versão dessa meta está no formato SMART?",
        opcoes: ["Quero viajar algum dia", "Vou guardar R$400 por mês durante 12 meses para juntar R$4.800 e viajar em dezembro", "Viajar é um sonho antigo meu", "Vou ver se sobra dinheiro pra viagem no fim do ano"],
        correta: 1,
        explicacao: "A meta SMART transforma o desejo 'viajar' em um plano com valor mensal, prazo e valor final definidos — específico, mensurável e com prazo, assim como no caso de Aline.",
      },
    },
    {
      pergunta: "Lucas ganha R$7.000 e Mariana ganha R$3.500 por mês. Se as contas da casa somam R$2.100 e eles dividem proporcionalmente à renda, quem paga mais e por quê?",
      opcoes: ["Mariana paga mais, porque ganha menos", "Lucas paga mais, porque ganha o dobro da renda de Mariana, então assume uma parcela maior das contas", "Os dois pagam exatamente R$1.050 cada", "Isso não pode ser calculado sem saber o aluguel"],
      correta: 1,
      explicacao: "Na divisão proporcional à renda, quem ganha mais contribui com uma parte maior do valor total, mantendo o esforço relativo parecido para os dois.",
      variante: {
        pergunta: "Igor ganha R$4.000 e Paula ganha R$2.000 por mês. Se as contas da casa somam R$1.800 e eles dividem proporcionalmente à renda, qual vantagem essa divisão traz em comparação a dividir 'meio a meio'?",
        opcoes: ["Nenhuma, o resultado final é sempre idêntico", "Paula, que ganha menos, não fica com um peso desproporcional no orçamento, tornando a divisão mais justa", "Divisão proporcional é sempre mais cara no total", "Meio a meio é sempre a única forma correta de dividir contas"],
        correta: 1,
        explicacao: "Quando um dos dois ganha bem menos, como Paula, dividir tudo igualmente sobrecarregaria essa pessoa; dividir proporcionalmente à renda mantém o esforço equilibrado para os dois.",
      },
    },
    {
      pergunta: "Vitor recebeu seu primeiro salário de R$2.100 e, sem separar nada em compartimentos, gastou R$1.800 nos primeiros 10 dias do mês. O que ele deixou de fazer que poderia ter evitado isso?",
      opcoes: ["Ele deveria ter gasto tudo ainda mais rápido", "Separar o salário em compartimentos (contas fixas, reserva, gastos livres) assim que ele caiu na conta", "Pedir um empréstimo antes do salário cair", "Nada poderia ter evitado isso, faz parte do primeiro emprego"],
      correta: 1,
      explicacao: "Sem separar o dinheiro em partes desde o início, é fácil gastar rápido demais nas primeiras semanas do mês; organizar por compartimentos ajuda a distribuir o gasto ao longo do tempo.",
      variante: {
        pergunta: "Sabrina recebeu seu primeiro salário de R$1.900 e, sem separar nada, gastou R$1.600 na primeira semana do mês. O que ela deixou de fazer que poderia ter evitado isso?",
        opcoes: ["Ela deveria ter gasto tudo ainda mais rápido", "Separar o salário em compartimentos (contas fixas, reserva, gastos livres) assim que ele caiu na conta", "Pedir um adiantamento salarial", "Nada poderia ter evitado isso"],
        correta: 1,
        explicacao: "Sem separar o dinheiro em partes desde o início, é fácil gastar rápido demais logo no começo do mês; organizar por compartimentos ajuda a distribuir o gasto ao longo do tempo, como no caso de Vitor.",
      },
    },
    {
      pergunta: "Bruno vai precisar do dinheiro em 4 meses para pagar um curso, enquanto Débora está guardando dinheiro para usar só daqui a 25 anos, na aposentadoria. Por que a estratégia mais adequada para os dois deveria ser diferente?",
      opcoes: ["Não deveria ser diferente, os dois deveriam guardar o dinheiro exatamente da mesma forma", "Bruno precisa de algo seguro e disponível em pouco tempo, enquanto Débora tem tempo suficiente para atravessar oscilações e buscar um retorno maior", "Débora deveria escolher algo tão seguro e líquido quanto Bruno, já que 25 anos é pouco tempo", "Bruno deveria assumir mais risco, já que precisa do dinheiro rápido"],
      correta: 1,
      explicacao: "Quem precisa do dinheiro em pouco tempo, como Bruno, deve priorizar segurança e disponibilidade; quem tem décadas de prazo, como Débora, tem espaço para buscar retornos maiores assumindo mais oscilação no caminho.",
      variante: {
        pergunta: "Yasmin vai usar o dinheiro em 8 meses para dar entrada em um curso técnico, enquanto Marcelo está guardando para usar daqui a 30 anos. Qual estratégia costuma ser mais adequada para cada um?",
        opcoes: ["Os dois deveriam investir exatamente da mesma forma, já que o valor final é o que importa", "Yasmin deveria priorizar segurança e liquidez; Marcelo tem tempo para assumir mais oscilação em busca de retorno maior", "Marcelo deveria priorizar liquidez extrema, como Yasmin, para não correr riscos", "O prazo não influencia a escolha da estratégia"],
        correta: 1,
        explicacao: "Quem tem prazo curto (Yasmin) precisa de segurança e disponibilidade; quem tem décadas de prazo (Marcelo) pode assumir mais oscilação em busca de um retorno maior, pois tem tempo de se recuperar de eventuais quedas.",
      },
    },
    {
      pergunta: "Igor colocou o dinheiro que ia usar em 3 meses, para pagar a entrada de um curso, numa aplicação de alto risco. Duas semanas antes de precisar do valor, a aplicação caiu 12%. O que esse exemplo mostra sobre usar estratégias de alto risco para metas de curto prazo?",
      opcoes: ["Que isso é sempre uma boa ideia, pois toda aplicação de risco sempre sobe no final", "Que usar uma aplicação de alto risco para uma meta de curto prazo pode fazer a pessoa perder dinheiro justamente na hora de usá-lo", "Que o valor perdido sempre volta antes do prazo final", "Que metas de curto prazo não deveriam ter prazo definido"],
      correta: 1,
      explicacao: "Aplicações de alto risco podem cair de valor em pouco tempo, e usar esse tipo de estratégia para dinheiro que será usado em breve pode comprometer a meta, como aconteceu com Igor.",
      variante: {
        pergunta: "Renata investiu o dinheiro que usaria em 2 meses para a mudança de apartamento em uma aplicação de alta oscilação. Dias antes da mudança, o valor da aplicação havia caído 20%, forçando-a a resgatar com prejuízo. O que essa situação ilustra sobre o risco de usar aplicações de alta oscilação para metas de curto prazo?",
        opcoes: ["Que aplicações de alta oscilação são sempre a melhor escolha para qualquer prazo", "Que o valor investido pode cair justamente na hora em que a pessoa precisa usá-lo, comprometendo a meta de curto prazo", "Que o prejuízo sempre se recupera automaticamente antes do prazo final", "Que metas de curto prazo não deveriam ter valor definido"],
        correta: 1,
        explicacao: "Investimentos de alta oscilação podem cair de valor justamente no momento em que o dinheiro precisa ser usado — por isso não são adequados para metas de curto prazo, como mostra o caso de Renata.",
      },
    },
    {
      pergunta: "Diego recebeu R$600 de restituição do imposto de renda e gastou tudo em roupas novas, algo que ele nunca faria com o salário normal. Que padrão isso ilustra?",
      opcoes: ["Planejamento financeiro cuidadoso", "Contabilidade mental — tratar esse dinheiro como 'menos sério' por ter vindo de outra origem", "Diversificação de investimentos", "Análise de custo-benefício"],
      correta: 1,
      explicacao: "Tratar dinheiro 'inesperado' com regras diferentes do salário normal, mesmo valendo o mesmo, é o padrão clássico da contabilidade mental.",
      variante: {
        pergunta: "Se, em vez de gastar o valor de um prêmio recebido no trabalho inteiro em compras, uma pessoa decide investir metade dele visando um objetivo de longo prazo, o que ela está fazendo?",
        opcoes: ["Cometendo um erro financeiro", "Superando a contabilidade mental e tratando esse dinheiro com a mesma intenção do salário normal", "Isso não tem nome específico", "Perdendo dinheiro"],
        correta: 1,
        explicacao: "Decidir com intenção o que fazer com dinheiro 'extra', em vez de gastá-lo automaticamente, é justamente driblar o viés da contabilidade mental.",
      },
    },
    {
      pergunta: "Um aplicativo de compras mostra 'Apenas 2 unidades restantes neste preço!' assim que você abre a página do produto. Que tipo de gatilho de consumo é esse?",
      opcoes: ["Prova social", "Gatilho de urgência/escassez, feito para ativar o medo de perder a oportunidade e apressar a decisão", "Um erro do sistema do site", "Uma garantia de reembolso"],
      correta: 1,
      explicacao: "Avisos de 'restam poucas unidades' ou tempo limitado são gatilhos de urgência/escassez, criados para fazer você decidir rápido, sem pensar demais.",
      variante: {
        pergunta: "Enquanto pesquisava passagens aéreas, Marcelo viu um contador regressivo dizendo 'essa tarifa expira em 5 minutos' e sentiu vontade de comprar na hora, mesmo sem ter decidido a viagem ainda. Qual atitude ajudaria Marcelo a lidar melhor com esse gatilho de urgência?",
        opcoes: ["Comprar imediatamente, para garantir a tarifa antes que ela suma", "Fazer uma pausa e se perguntar se compraria essa passagem mesmo sem o contador regressivo pressionando", "Fechar o site e nunca mais pesquisar passagens", "Pedir aumento de limite no cartão para garantir a compra"],
        correta: 1,
        explicacao: "Assim como no caso do produto com poucas unidades, a pausa para perguntar 'eu compraria isso mesmo sem essa pressa artificial?' ajuda a separar a decisão real de uma reação automática ao gatilho de urgência.",
      },
    },
    {
      pergunta: "Enquanto navega em um site de eletrônicos, Camila vê '87 pessoas compraram este produto nas últimas 24 horas' e sente mais confiança para comprar na hora. Qual gatilho está sendo usado, e qual seria uma reação mais protegida?",
      opcoes: ["É prova social; uma reação mais protegida é lembrar que isso não muda se o produto é útil pra você, e avaliar a compra com calma", "É um erro técnico do aplicativo sem nenhuma intenção", "É uma garantia de qualidade do produto", "É prova social; a reação correta é comprar imediatamente para acompanhar as outras pessoas"],
      correta: 0,
      explicacao: "Mostrar quantas pessoas estão comprando é um gatilho de prova social; ele não indica se o produto é útil pra você, então vale avaliar a compra com calma mesmo assim.",
      variante: {
        pergunta: "Um aplicativo de streaming mostra 'Mais de 500 pessoas assistindo agora' na tela inicial de um filme. Que gatilho de consumo está sendo usado nesse caso?",
        opcoes: ["Gatilho de urgência", "Prova social — mostrar que muita gente está fazendo a mesma coisa para gerar mais confiança na escolha", "Garantia de satisfação", "Um erro de exibição do aplicativo"],
        correta: 1,
        explicacao: "Mostrar quantas pessoas estão fazendo a mesma coisa (assistindo, comprando) é a essência da prova social — um gatilho para aumentar a confiança na decisão, mesmo sem indicar se o conteúdo é realmente bom para você.",
      },
    },
  ],
},
```

#### 7. `revU_04` — objeto completo

```js
{
  id: "revU_04",
  tipo: "revisao",
  titulo: "Revisão: dívidas caras, crédito e como negociar o que já apertou",
  xp: 20,
  aula: [
    "Fechando o Nível 1, esse bloco revisita como identificar uma compra por impulso, o truque da ancoragem de preço nas promoções, o que é e como cuidar do seu score de crédito, como nunca cair no rotativo do cartão, por que o cheque especial é uma das dívidas mais caras do país, a diferença entre consignado e empréstimo pessoal, e como negociar dívidas atrasadas com bancos e credores.",
    "Você já viu esse conteúdo — mas as perguntas aqui trazem situações novas, com pessoas e números diferentes, para confirmar que o entendimento ficou de verdade, não só a lembrança da pergunta exata.",
    "Se alguma resposta pegar você de surpresa, a explicação logo abaixo existe para esclarecer, sem deixar dúvida no ar.",
  ],
  refLessonIds: ["f1_18", "f1_19", "f1_20", "f1_21", "f1_22", "f1_23", "f1_24"],
  perguntas: [
    {
      pergunta: "Depois de um dia estressante no trabalho, Cauã abre um aplicativo de jogos 'só para ver' e compra um item digital em poucos minutos, sem ter planejado gastar nada naquele dia. O que esse comportamento sugere?",
      opcoes: ["Uma compra planejada com antecedência", "Um padrão de compra por impulso, provavelmente ligado a aliviar o estresse do dia", "Uma decisão puramente racional sobre necessidade do item", "Um erro do aplicativo"],
      correta: 1,
      explicacao: "Comprar rápido, sem plano anterior, logo depois de um momento emocional forte, é um padrão clássico de compra por impulso — buscando alívio emocional, não suprir uma necessidade real.",
      variante: {
        pergunta: "Depois de uma notificação de promoção à meia-noite, Tainá compra um par de tênis em poucos minutos, sem ter cogitado comprar calçados antes daquele momento. O que esse comportamento sugere?",
        opcoes: ["Uma compra planejada com antecedência", "Um padrão de compra por impulso, ativado pelo gatilho da notificação e decidido sem reflexão prévia", "Uma decisão puramente racional sobre necessidade do produto", "Um erro do aplicativo de vendas"],
        correta: 1,
        explicacao: "Decidir comprar rápido, sem plano anterior, logo após um gatilho como uma notificação de promoção à meia-noite, é um padrão clássico de compra por impulso.",
      },
    },
    {
      pergunta: "Uma loja de móveis anuncia um sofá 'de R$6.000 por R$3.000', mas o mesmo modelo é vendido por outras lojas, sem promoção, a R$2.600. O que está acontecendo nesse caso?",
      opcoes: ["O sofá realmente vale R$6.000 e está com desconto real de 50%", "O valor de R$6.000 provavelmente foi usado como âncora para fazer R$3.000 parecer uma ótima oferta, mesmo sendo mais caro que o preço normal de mercado (R$2.600)", "É obrigatório por lei vender pelo preço 'de'", "Isso significa que a loja está no prejuízo"],
      correta: 1,
      explicacao: "Quando o preço 'de' é bem mais alto que o valor real de mercado do produto, ele funciona só como âncora para criar a sensação de desconto — mesmo sendo, na prática, mais caro que o preço normal.",
      variante: {
        pergunta: "Bianca vê uma bolsa etiquetada 'de R$900 por R$450' numa vitrine e pensa automaticamente que é uma pechincha imperdível, sem saber quanto a bolsa realmente vale no mercado. Qual é a função do valor 'R$900' nesse tipo de etiqueta?",
        opcoes: ["É sempre o preço de custo real do produto para a loja", "Funciona como âncora: um número alto mostrado primeiro, que faz o preço final parecer mais baixo por comparação, mesmo sem relação direta com o valor real de mercado", "É uma exigência legal em toda promoção no Brasil", "É o valor do imposto embutido no produto"],
        correta: 1,
        explicacao: "O valor riscado ('de R$900') funciona como âncora: ele entra primeiro na percepção de Bianca e faz o R$450 parecer uma ótima oferta, independentemente do valor real de mercado da bolsa — igual acontece no caso do sofá.",
      },
    },
    {
      pergunta: "Antes de comprar um relógio anunciado 'de R$1.200 por R$600', André se pergunta: 'eu pagaria R$600 por esse relógio se ele estivesse etiquetado direto nesse valor, sem nenhum preço riscado ao lado?'. Ele percebe que a resposta é não, e desiste da compra. Que estratégia André usou para se proteger do efeito da ancoragem?",
      opcoes: ["Ele comparou o preço com o de outras lojas concorrentes", "Ele avaliou o preço final isoladamente, ignorando o valor riscado, para julgar pelo valor real do produto", "Ele esperou a promoção acabar para ver se o preço subia", "Ele perguntou a opinião de amigos sobre o relógio"],
      correta: 1,
      explicacao: "Avaliar o preço final sozinho, sem deixar o valor riscado influenciar o julgamento, é a estratégia que ajuda a decidir pelo valor real do produto, e não pela ilusão criada pela âncora — foi exatamente isso que André fez.",
      variante: {
        pergunta: "Larissa vê um vestido 'de R$400 por R$180' e, antes de comprar, se pergunta se pagaria R$180 por aquele vestido caso ele estivesse anunciado direto nesse valor, sem nenhum preço riscado ao lado. O que essa pergunta ajuda Larissa a fazer?",
        opcoes: ["Calcular exatamente a porcentagem de desconto", "Avaliar a compra pelo valor real do produto, em vez de reagir automaticamente ao tamanho do desconto anunciado", "Descobrir se o vestido vai voltar ao preço original depois", "Decidir qual cor do vestido comprar"],
        correta: 1,
        explicacao: "Ignorar o valor riscado e avaliar só o preço final ajuda Larissa a decidir com base no valor real do produto, não na comparação artificial criada pela âncora.",
      },
    },
    {
      pergunta: "Duas pessoas pedem financiamento no mesmo banco. Uma tem score 780, a outra tem score 280. O que provavelmente é diferente entre as duas propostas?",
      opcoes: ["Nada, o score não influencia nada", "A pessoa com score mais alto tende a conseguir juros menores e aprovação mais fácil", "A pessoa com score mais baixo sempre paga menos juros", "O score só importa para cartão de crédito"],
      correta: 1,
      explicacao: "Score mais alto costuma abrir portas para condições melhores — juros menores e aprovação mais rápida — porque indica menor risco para quem está emprestando.",
      variante: {
        pergunta: "Dois clientes pedem o mesmo cartão de crédito em bancos diferentes. Um tem score 900, o outro tem score 150. O que é mais provável de diferenciar as duas aprovações e condições oferecidas?",
        opcoes: ["Nada, o score não é levado em conta para cartão de crédito", "O cliente com score mais alto tende a ter aprovação mais fácil e condições melhores, como limite maior ou juros menores", "O cliente com score mais baixo sempre recebe as melhores condições", "O score só é usado para financiamento de imóveis"],
        correta: 1,
        explicacao: "Assim como no caso do financiamento, um score mais alto costuma significar menor risco percebido pelo credor, o que se traduz em aprovação mais fácil e condições melhores.",
      },
    },
    {
      pergunta: "Se a fatura do cartão de Juliana é R$1.500 e ela paga apenas R$400, o que acontece com os R$1.100 restantes?",
      opcoes: ["Eles ficam sem nenhum juro até o próximo mês", "Eles entram no rotativo do cartão e passam a ser cobrados com juros muito altos até serem pagos", "O banco perdoa automaticamente esse valor", "Eles são convertidos em pontos de milhagem"],
      correta: 1,
      explicacao: "Qualquer valor da fatura que não é pago no vencimento entra no rotativo, sujeito a um dos juros mais altos do mercado, até ser totalmente pago.",
      variante: {
        pergunta: "Se a fatura do cartão de Otávio é R$2.400 e ele paga apenas R$900 no vencimento, o que acontece com os R$1.500 que ficaram em aberto?",
        opcoes: ["Ficam sem nenhum juro até a próxima fatura", "Entram no rotativo do cartão e passam a ser cobrados com um dos juros mais altos do mercado até serem quitados", "São automaticamente cancelados pelo banco", "Viram um desconto na fatura seguinte"],
        correta: 1,
        explicacao: "Qualquer parte da fatura que não é paga no vencimento entra no rotativo, sujeita a um dos juros mais altos do mercado, até ser totalmente quitada — o mesmo aconteceria com os R$1.500 de Otávio.",
      },
    },
    {
      pergunta: "Denise percebe que só vai conseguir pagar R$500 dos R$1.000 da fatura deste mês. Em vez de deixar o restante no rotativo, uma alternativa financeiramente mais barata costuma ser:",
      opcoes: ["Deixar os R$500 restantes no rotativo do cartão mesmo assim", "Buscar outra linha de crédito com juros bem menores (como um empréstimo pessoal) para pagar a fatura inteira e evitar o rotativo", "Pagar só R$100 e deixar o resto acumular por mais tempo", "Cancelar o cartão sem pagar a fatura"],
      correta: 1,
      explicacao: "Como o rotativo costuma ter os juros mais altos do mercado, buscar outra forma de crédito mais barata para cobrir a diferença normalmente sai mais econômico do que deixar a dívida rolar no cartão.",
      variante: {
        pergunta: "Ricardo sabe que só vai conseguir pagar R$800 dos R$2.000 da fatura do cartão neste mês. Em vez de deixar a diferença no rotativo, qual alternativa tende a ser financeiramente mais barata?",
        opcoes: ["Deixar a diferença no rotativo do cartão mesmo assim", "Buscar um empréstimo pessoal ou consignado, com juros bem menores que o rotativo, para cobrir a diferença e pagar a fatura inteira", "Pagar só uma parte simbólica e deixar o resto acumular", "Pedir um cartão adicional para dividir a dívida"],
        correta: 1,
        explicacao: "Como o rotativo tem os juros mais altos do mercado, buscar uma linha de crédito mais barata (empréstimo pessoal ou consignado) para cobrir a diferença costuma sair bem mais barato do que deixar o valor rolar no cartão.",
      },
    },
    {
      pergunta: "Se alguém usa R$1.500 do cheque especial e deixa por vários meses sem pagar, o que tende a acontecer com essa dívida?",
      opcoes: ["Ela permanece exatamente em R$1.500", "Ela cresce rapidamente, por causa dos juros altos cobrados mês a mês", "Ela diminui automaticamente", "O banco perdoa a dívida após 30 dias"],
      correta: 1,
      explicacao: "Como os juros do cheque especial são altíssimos, uma dívida não paga cresce rapidamente mês após mês.",
      variante: {
        pergunta: "Camila usou R$900 do cheque especial num mês de aperto financeiro e não conseguiu pagar nos meses seguintes. O que é mais provável de acontecer com essa dívida com o passar do tempo?",
        opcoes: ["Ela permanece exatamente em R$900, sem nenhuma cobrança adicional", "Ela cresce de forma acelerada, por causa das taxas de juros muito altas cobradas mês a mês", "Ela diminui automaticamente por lei", "O banco perdoa a dívida depois de 60 dias"],
        correta: 1,
        explicacao: "Assim como no caso anterior, os juros do cheque especial são altíssimos, então uma dívida não paga cresce de forma acelerada mês após mês.",
      },
    },
    {
      pergunta: "Cláudio pode pegar um empréstimo pessoal a 7% ao mês ou um consignado a 1,5% ao mês para o mesmo valor. Por que essa diferença tão grande existe?",
      opcoes: ["Porque o consignado é ilegal em alguns estados", "Porque o desconto automático em folha reduz o risco do banco de não receber, permitindo taxa menor", "Porque o empréstimo pessoal sempre tem prazo mais curto", "Porque o consignado exige um fiador"],
      correta: 1,
      explicacao: "A garantia de recebimento automático do consignado reduz o risco do credor, e por isso a taxa de juros pode ser muito menor do que no empréstimo pessoal comum.",
      variante: {
        pergunta: "Camila descobriu que consegue um consignado a 2% ao mês, bem mais barato que o empréstimo pessoal de 9% ao mês oferecido pelo mesmo banco, para o mesmo valor. O que explica essa diferença de taxa?",
        opcoes: ["O consignado é sempre um golpe", "O desconto automático em folha de pagamento reduz o risco do banco de não receber, permitindo cobrar uma taxa menor", "O empréstimo pessoal sempre tem prazo mais longo", "Consignado só existe para quem já é endividado"],
        correta: 1,
        explicacao: "Como a parcela do consignado é descontada automaticamente do salário ou benefício, o risco de o banco não receber é menor — e por isso a taxa de juros tende a ser bem mais baixa que a do empréstimo pessoal.",
      },
    },
    {
      pergunta: "Marcelo deve R$8.000 no cartão, atrasados há 10 meses. O banco oferece pagar R$3.500 à vista para encerrar a dívida. Por que esse tipo de oferta é comum nesses casos?",
      opcoes: ["Porque o banco está proibido de cobrar o valor total", "Porque, para o banco, receber uma parte à vista de uma dívida antiga é melhor do que continuar sem receber nada", "Porque toda dívida vencida vira automaticamente metade do valor", "Porque isso é uma armadilha sem nenhuma vantagem para o banco"],
      correta: 1,
      explicacao: "Dívidas muito atrasadas têm alto risco de nunca serem pagas, então bancos frequentemente preferem negociar um valor menor à vista do que insistir no valor total e não receber nada.",
      variante: {
        pergunta: "Patrícia deve R$4.000 num financiamento pessoal, atrasado há 7 meses, e o credor oferece um acordo de R$1.800 à vista para quitar tudo. Por que credores costumam fazer esse tipo de oferta com dívidas tão atrasadas?",
        opcoes: ["Porque são obrigados por lei a reduzir qualquer dívida atrasada", "Porque, para o credor, uma dívida muito atrasada tem alto risco de nunca ser recebida, então vale mais aceitar uma parte à vista do que arriscar não receber nada", "Porque toda dívida vencida vira automaticamente menos da metade do valor", "Porque isso é uma armadilha sem nenhuma vantagem real para o credor"],
        correta: 1,
        explicacao: "Assim como no caso de Marcelo, uma dívida muito atrasada representa alto risco de nunca ser paga — por isso muitos credores preferem negociar um valor menor à vista a insistir no total e não receber nada.",
      },
    },
    {
      pergunta: "Renata tem uma dívida de cheque especial a 12% ao mês e um financiamento de móveis a 2% ao mês, ambos em atraso. Qual ela deveria priorizar na negociação?",
      opcoes: ["O financiamento dos móveis, porque é mais recente", "A dívida do cheque especial, porque os juros mais altos fazem o valor crescer muito mais rápido", "Nenhum dos dois, pois atraso não importa", "Deve dividir igualmente o dinheiro disponível entre os dois, sem prioridade"],
      correta: 1,
      explicacao: "Como os juros do cheque especial são muito mais altos, essa dívida cresce mais rápido e deve ser priorizada para evitar que o problema fique maior.",
      variante: {
        pergunta: "Bruno tem três dívidas em aberto: cartão de crédito a 13% ao mês, financiamento de celular a 2,5% ao mês e uma mensalidade escolar atrasada sem juros. Qual costuma ser a ordem de prioridade mais eficiente para negociar essas dívidas?",
        opcoes: ["Negociar a mensalidade escolar primeiro, por ser a mais antiga", "Priorizar primeiro o cartão de crédito, por ter os juros mais altos e crescer mais rápido enquanto não for resolvido", "Negociar todas ao mesmo tempo, sem nenhuma ordem de prioridade", "Priorizar o financiamento do celular, por ser uma dívida mais nova"],
        correta: 1,
        explicacao: "Assim como no caso de Renata, dívidas com juros mais altos (aqui, o cartão de crédito) crescem mais rápido e devem ser priorizadas na negociação, para evitar que o problema se agrave ainda mais.",
      },
    },
  ],
},
```

#### Registro da etapa

- **Resumo da etapa**: escritas as 10 perguntas (base + variante cada) dos 4
  blocos da Onda de Revisão 1 (`revU_01`..`revU_04`), cobrindo as 28 lições
  do Nível 1 "Fundamentos e Comportamento Financeiro" sem sobreposição entre
  blocos, todas como situações-problema novas (nunca cópia literal de uma
  pergunta já publicada nas 28 lições-fonte), com `titulo`/`aula` distintos
  entre os 4 blocos. Todos os 40 pares base+`variante` revisados
  explicitamente contra o padrão do Bug 1 da Fase 3B (pergunta 9 de
  `revE_01`) — 4 pares que numa primeira redação misturavam dois
  sub-conceitos diferentes da mesma lição-fonte entre a base e a variante
  foram identificados e corrigidos antes de entrar na versão final (seção 3
  acima detalha cada um). Objetos completos, prontos para colagem em
  `js/data.js` como o array `COURSE_REVIEWS`, registrados nas seções 4-7.
- **Decisões tomadas**: distribuição de cobertura por lição em cada bloco
  (seção 1), texto final de `titulo`/`aula` de cada bloco (dentro de cada
  objeto, seções 4-7), as 40 perguntas com suas variantes, validação
  factual/numérica (seção 2), checklist do Bug 1 (seção 3). Nenhum valor
  numérico de lei/alíquota novo introduzido — todos os 4 blocos tratam de
  conceitos comportamentais e matemáticos genéricos já publicados nas
  28 lições-fonte, sem nenhuma cifra real de imposto/taxa fixada.
- **Pendências para os próximos agentes**:
  - **Frontend Engineer (Fase 3C, Onda de Revisão 1)**: colar os 4 objetos
    das seções 4-7 em `js/data.js` como o array `COURSE_REVIEWS` (ordem
    `revU_01`, `revU_02`, `revU_03`, `revU_04`), implementar o ajuste em
    `Trail.levels()` especificado pelo Software Architect (seção 19, item
    4) — que insere as revisões ancoradas por `refLessonIds[6]` em
    `COURSE`/`HISTORY_COURSE` — e, antes de considerar a Onda 1 pronta,
    validar explicitamente o caminho de inserção em `HISTORY_COURSE` com um
    teste dirigido (risco 6.1 da seção 19), já que nenhum dos 4 blocos desta
    Onda o exercita de verdade (todos ancoram em `COURSE[0]`). Depois de
    colado, rodar `node --check js/data.js` e o script de validação (ids
    duplicados, `opcoes.length===4`, `correta` válido, `variante` presente,
    `refLessonIds` com exatamente 7 ids existentes em `COURSE`, sem
    sobreposição entre `revU_01`..`revU_04`) — mesmo procedimento já usado
    em qualquer edição de `js/data.js` nesta RFC.
  - **QA Engineer**: validar, além do checklist estrutural, que as 4
    revisões aparecem na trilha unificada Aprender exatamente depois de
    `f1_06`, `l1_3`, `f1_17` e `f1_24` respectivamente (nunca antes), que
    `COURSE`/`HISTORY_COURSE` permanecem intocados após `Trail.render()`
    rodar (teste de não-mutação, seção 19/risco 6.2), e reler as 40
    perguntas em busca de qualquer ambiguidade residual não capturada nesta
    revisão — mesmo padrão de QA independente já usado na Fase 3B (seção
    17).
  - **Documentation Specialist**: registrar a Onda de Revisão 1 como
    concluída em `CHANGELOG.md`/`ROADMAP.md` depois do QA, e atualizar o
    status desta RFC (seções 19-20) quando a Fase 3C avançar para as Ondas
    de Revisão 2-4.
- **Riscos**: nenhum risco de conteúdo novo identificado — todas as 40
  perguntas reaproveitam conceitos e números já validados nas 28 lições
  originais do Nível 1, sem nenhuma alíquota/teto/definição nova sendo
  introduzida por esta Onda. O único risco relevante nesta etapa é técnico,
  já mapeado pelo Software Architect na seção 19 (caminho de inserção em
  `HISTORY_COURSE` ainda não exercitado por nenhum bloco desta Onda 1) —
  não é um risco de conteúdo, e já está com mitigação explícita registrada
  para o Frontend Engineer.
- **Próximo agente responsável**: Frontend Engineer (Fase 3C, Onda de
  Revisão 1).

### 21. Frontend Engineer (Fase 3C — Implementação da Onda de Revisão 1 na trilha Aprender)

Confirmado por `git status`/`git diff --stat` no início desta etapa: só a
própria RFC estava modificada (sessões anteriores), nenhum código pendente —
esta implementação partiu do zero. Implementado exatamente o que as seções
19 (Software Architect) e 20 (Financial Specialist) especificaram, em
`js/data.js` e `js/trail.js`. Escopo confirmado ao final: `js/business.js`
(trilha Empreender) permanece byte-a-byte como estava — não tocado, conforme
instruído.

#### 1. `js/data.js` — array `COURSE_REVIEWS`

Colado imediatamente após o fechamento de `HISTORY_COURSE`, antes do
comentário de cabeçalho da trilha Empreender, com um comentário de cabeçalho
explicando o mecanismo de ancoragem para os DOIS arrays (mesmo espírito do
comentário que antecede `BUSINESS_REVIEWS`, adaptado para deixar explícito
que `COURSE_REVIEWS` é consultado tanto por `COURSE` quanto por
`HISTORY_COURSE`). Conteúdo dos 4 objetos (`revU_01`..`revU_04`) copiado
literalmente da seção 20 (Financial Specialist) — nenhum texto/número
alterado. Validado por script Python (bracket-balance tokenizer consciente
de string/comentário, já que `node --check` não está disponível neste
ambiente — mesma limitação das fases anteriores) e por um segundo script que
extraiu e conferiu, via regex sobre o bloco de `COURSE_REVIEWS`: 4 ids
(`revU_01`..`revU_04`), 4 `refLessonIds` com exatamente 7 ids cada
(batendo exatamente com a tabela da seção 20), `xp: 20` nas 4 entradas, e 20
perguntas por bloco (10 base + 10 `variante`, confirmado descontando um
falso positivo do regex causado pela frase "André se pergunta:" dentro do
texto de uma pergunta de `revU_04`, não um erro de estrutura).

#### 2. `js/trail.js` — `Trail.levels()` generalizado

Substituído o corpo de `levels()` pelo código exato da seção 19, item 4: a
função `withReviews(courseArr, fonte)` clona `licoes` num array **novo** via
`push` (nunca reaproveita a referência original) e insere a revisão
ancorada por `refLessonIds[6]`, com `fonte` atribuída no mesmo passe via
`{ ...lvl, licoes, fonte }`. Aplicada duas vezes — uma para `COURSE`, outra
para `HISTORY_COURSE` — ambas lendo o mesmo `COURSE_REVIEWS`; o roteamento
para o array correto é automático (`.find()` só casa contra ids que
realmente existem naquele array), sem nenhum branch explícito. A lógica de
intercalação por índice de nível (`financeira[i]`/`historia[i]`) foi
preservada sem nenhuma alteração. Nenhuma mudança em `flatLessons()`,
`isDone()`, `isUnlocked()`, `nextEntry()`, `gridHtml()`, `startLesson()`,
`answerQuestion()`, `nextQuestion()`, `maybePickStory()` — confirmado que
nenhum precisou de ajuste, exatamente como a seção 19 previu.

#### 3. `js/trail.js` — `levelHtml()` (identidade visual)

Dentro do callback de `gridHtml()`: adicionado
`const isRevisao = lesson.tipo === "revisao";` e o ícone virou um
condicional de 3 vias, preservando o `isHistoria` já existente:
`done ? "✅" : unlocked ? (isRevisao ? "🔁" : isHistoria ? "📜" : "📘") : "🔒"`
— exatamente a expressão especificada na seção 19. Classe `revisao`
adicionada à `div.trail-node` quando `isRevisao`, e
`<div class="trail-node-tag">🔁 Revisão</div>` inserido dentro de
`.trail-node-inner`, depois de `.trail-node-xp`, condicionado a `isRevisao`
— mesma posição relativa já usada em `business.js`.

#### 4. `js/trail.js` — `finishLesson()` (título/subtexto)

Adicionado `const isRevisao = lesson.tipo === "revisao";` e o ternário de
título (que já era de 2 vias, `isHistoria`) virou um condicional de 3 vias:
`passed ? (isRevisao ? "Revisão dominada!" : level.fonte === "historia" ? "Capítulo concluído!" : "Lição concluída!") : "Quase lá!"`.
Subtexto extra — `"Você reforçou o que já tinha aprendido — é isso que faz
o conhecimento ficar de verdade."` — inserido logo abaixo do `<p>` de "Você
acertou X de Y perguntas", condicionado a `celebrar && isRevisao`, na mesma
posição usada em `business.js`. Nenhuma outra linha do fluxo de conclusão
mudou (confete, glow, pop de XP, mascote, moedas, o guard `alreadyDone`,
`LESSON_LOG`, `Learn.addXp`/`Learn.addCoins`) — tudo reaproveitado sem
condicional nova.

#### 5. CSS — confirmado que nenhuma regra nova foi necessária

Verificado por grep em `css/style.css` antes de qualquer edição: as 5
regras escritas na Fase 3B (`.trail-node-tag`, `.trail-node.locked
.trail-node-tag`, e as 3 variantes de `.trail-node.revisao .trail-node-ring`
— padrão/`.done`/`.current`) já cobrem exatamente as classes que
`trail.js` passou a gerar. `css/style.css` não foi tocado nesta etapa — a
suposição da seção 19 ("nenhuma regra nova de CSS necessária") foi
confirmada por leitura, não assumida, e depois confirmada de novo
visualmente (item 7 abaixo).

#### 6. Validação de sintaxe

`node --check` indisponível neste ambiente (confirmado por `command -v
node`). Escrito um verificador de balanceamento de chaves/colchetes/
parênteses em Python (tokenizer consciente de string/comentário JS, sem
dependência de `node`) e rodado contra `js/data.js` e `js/trail.js` — os
dois reportaram `BALANCED OK`. Confirmação definitiva veio da execução real
em Chrome via CDP (item 7): qualquer erro de sintaxe teria impedido
`Trail.levels()`/`Trail.render()` de rodar sem exceção, e nenhuma exceção
foi lançada em nenhum teste.

#### 7. Teste manual real (Chrome headless via CDP)

Harness montado do zero nesta sessão (o `cdp.py` de fases anteriores não
persiste entre sessões — scratchpad é isolado por sessão): `python3 -m
http.server 8899` servindo a raiz do projeto + `chrome.exe --headless=new
--remote-debugging-port=9333 --remote-allow-origins=* --user-data-dir=<perfil
no scratchpad>` (Chrome 151.0.7922.76, mesma versão das fases anteriores,
mesma flag `--remote-allow-origins` necessária) + um driver Python novo
(`cdp.py`, classe `Tab` sobre `websocket-client`, já instalado no ambiente).
Contas de teste reais criadas via `Cloud.signUp()` (e-mails `@mailinator.com`),
login confirmado imediato sem exigir confirmação de e-mail neste ambiente.

Testes executados e resultados:

- **Estado ANTES — arrays canônicos limpos**: `COURSE.length === 6`,
  `COURSE.map(l => l.licoes.length) === [35,20,22,8,8,9]`,
  `HISTORY_COURSE.length === 6`, `[2,6,2,3,2,3]`, nenhum dos dois com
  qualquer entrada `tipo:"revisao"` — confirmado antes de qualquer chamada a
  `Trail.levels()`.
- **Inserção correta, âncora por id, os 4 nós nas posições certas**:
  `Trail.flatLessons()` (124 lições = 120 reais + 4 revisões) tem
  `revU_01` imediatamente depois de `f1_06` e antes de `l5_1`, `revU_02`
  depois de `l1_3` e antes de `f1_11`, `revU_03` depois de `f1_17` e antes
  de `f1_18`, `revU_04` depois de `f1_24` e antes de `f1_25` — exatamente a
  tabela da seção 19, todos dentro do Nível 1 "Fundamentos".
- **Trava de segurança da âncora**: numa conta nova (nada concluído),
  `Trail.isUnlocked(idx de revU_01) === false`. Marcando progresso até
  `f1_06` (inclusive), `revU_01` passa a `unlocked === true` e, ao
  renderizar, o nó ganha `class="trail-node  current revisao"`. Repetido
  para `revU_02`/`revU_03`/`revU_04`: cada um só desbloqueia depois que seu
  próprio `refLessonIds[6]` é concluído (`revU_02` desbloqueado após
  `l1_3`; `revU_03`/`revU_04` continuam `false` até suas respectivas
  âncoras, mesmo com `revU_02` já liberado) — sem destravamento fora de
  ordem.
- **Fluxo completo do quiz, XP/energia/moedas/log**: `revU_01` e `revU_02`
  completados via `Trail.startLesson()` → tela de `aula` → 10 perguntas
  respondidas corretamente → tela de conclusão com título **"Revisão
  dominada!"**, subtexto **"Você reforçou o que já tinha aprendido — é isso
  que faz o conhecimento ficar de verdade."**, `+20 XP e +5 moedas`. Delta
  de XP medido via `Learn.getXp()` antes/depois: exatamente **+20** nos dois
  casos, batendo com `xp: 20` da seção 20. `Energy.tryStart()` consumiu 1
  energia normalmente (sem isenção). `STORAGE_KEYS.LESSON_LOG` ganhou uma
  entrada `{lessonId:"revU_01", fonte:"financeira", ...}` (e depois
  `revU_02`) sem filtro algum. `COURSE_PROGRESS["revU_01"] === true` ao
  fechar a tela.
- **Teste crítico de não-mutação — DOIS arrays, antes/depois de navegar a
  trilha inteira, completar as 4 revisões e recarregar (F5)**: snapshot de
  `COURSE.map(l => l.licoes.map(x => x.id))` e o equivalente para
  `HISTORY_COURSE` tirado antes de qualquer render, comparado byte-a-byte
  contra o mesmo snapshot depois de: renderizar, desbloquear e completar as
  4 revisões (`revU_01`/`revU_02` via quiz completo, `revU_03`/`revU_04` via
  simulação de progresso — o caminho de conclusão já validado duas vezes),
  marcar as 120 lições reais como concluídas, e — o teste mais rigoroso —
  **recarregar a página do zero (F5)**. Em todas as verificações a
  estrutura dos dois arrays bateu exatamente com o snapshot inicial e
  `COURSE.some(l => l.licoes.some(x => x.tipo==="revisao")) === false`,
  idem para `HISTORY_COURSE` — nenhuma entrada de revisão jamais vazou para
  os arrays canônicos, nos dois. Progresso das 4 revisões persistiu
  corretamente após o reload (`COURSE_PROGRESS.revU_01..04 === true`).
- **Teste dirigido do caminho de inserção em `HISTORY_COURSE` (risco 6.1,
  mitigação explícita pedida pelo Software Architect antes de considerar a
  Onda 1 pronta)**: como nenhum dos 4 blocos reais desta Onda ancora em
  `HISTORY_COURSE`, foi injetada em runtime uma entrada de teste temporária
  em `COURSE_REVIEWS` (`id: "__TEST_REV_HIST__"`, **nunca commitada em
  `js/data.js`**, removida do array ao final do teste), ancorada em `h1_1`
  — a 1ª das 2 lições de `HISTORY_COURSE[0]`, ou seja um caso de inserção
  no MEIO de um nível de 2 lições (mesmo padrão do bloco 17 real, que só
  será publicado na Onda 4). Resultado: a revisão de teste foi inserida
  corretamente entre `h1_1` e `h1_2` dentro de `HISTORY_COURSE[0]`
  (`histLevel0.licoes[idx-1].id === "h1_1"` e `[idx+1].id === "h1_2"`),
  `flatEntry.fonte === "historia"`, `Trail.progressKey("historia")` roteou
  para `STORAGE_KEYS.HISTORY_PROGRESS` corretamente, e — o ponto crítico —
  `HISTORY_COURSE` permaneceu estruturalmente idêntico ao snapshot anterior
  (`historyCourseUnchanged === true`, `historyCourseHasTestEntry === false`)
  durante todo o teste. Depois de remover a entrada de teste e invalidar o
  cache (`Trail._levels = null`), `Trail.flatLessons()` voltou a não conter
  `__TEST_REV_HIST__`. **O caminho de inserção em `HISTORY_COURSE` está
  validado e funcionando antes de qualquer bloco real depender dele**,
  conforme a mitigação pedida pelo Software Architect — a Onda 3 (1º bloco
  real ancorado em História) não vai exercitar um caminho de código
  nunca testado.
- **Nenhuma regressão nas 120 lições reais (102 Financeira + 18 História)**:
  marcadas as 120 lições reais + as 4 revisões como concluídas,
  `Trail.flatLessons().length === 124 === doneCount` (100%),
  `Trail.nextEntry() === null`, `document.querySelectorAll(
  '#trailContainer .trail-node').length === 124` (`locked: 0`, `done: 124`,
  `revisao: 4`, `revisao.done: 4`) — nenhum nó preso, nenhum destravamento
  fora de ordem.
- **Empreender (`js/business.js`) sem regressão**: `Business.flatLessons()`
  ainda com 19 lições (18 + `revE_01`, inalterado desde a Fase 3B),
  `revE_01` ainda na posição 7 imediatamente após `e2_1`,
  `BUSINESS_COURSE` estruturalmente inalterado, 19 nós renderizados em
  `#businessTrailContainer` — confirmado ao vivo nesta mesma sessão, não só
  por não ter editado o arquivo.
- **Identidade visual, confirmada por captura de tela real** (não só
  leitura de classes): screenshots em 1400×1200 (desktop) e 375×900
  (`mobile:true`) mostraram o nó `revU_01` com o accent roxo/dourado no anel
  (mesmo CSS da Fase 3B, sem nenhuma regra nova) e a tag "🔁 REVISÃO" abaixo
  do XP, sem corte nem sobreposição em nenhum dos dois viewports — mesmo
  padrão "recorte aceitável" já validado na Fase 3B.
- **Console/exceções**: zero `Runtime.exceptionThrown` em toda a sessão
  (múltiplos cadastros, navegação, quizzes completos, simulação de
  progresso em massa, reload completo, teste dirigido de
  `HISTORY_COURSE`). Único aviso de console: a mesma deprecação conhecida e
  não relacionada do `three.js`, já registrada nas Fases 2 e 3B.

#### 8. Ajustes em relação à especificação original (com justificativa)

Nenhum. O código de `Trail.levels()` foi implementado exatamente como o
Software Architect especificou na seção 19, item 4 (inclusive a assinatura
`withReviews(courseArr, fonte)`, sem alteração de nome ou estrutura); os
branches de `levelHtml()` e `finishLesson()` seguem literalmente o padrão
de `business.js` (Fase 3B), adaptados apenas para o condicional de 3 vias
com `isHistoria` que a própria seção 19 já previu e descreveu com a
expressão exata a usar. Única observação registrada, não uma divergência de
código: ao testar num navegador com perfil Chrome persistente reaproveitado
entre scripts desta sessão, uma conta nova criada via `Cloud.signUp()`
inicialmente exibiu progresso residual de uma conta de teste anterior (o
`localStorage`/`Store` é escopado por origem, não por conta, até o próximo
ciclo de sincronização) — comportamento pré-existente do app, não
introduzido nem afetado por esta mudança, contornado nos testes usando
snapshots explícitos de progresso em vez de assumir estado limpo por
padrão.

#### 9. Arquivos alterados

- `js/data.js` — novo array `COURSE_REVIEWS` (4 entradas, `revU_01`..
  `revU_04`), inserido entre `HISTORY_COURSE` e o comentário de cabeçalho
  da trilha Empreender. `COURSE` e `HISTORY_COURSE` não foram alterados em
  conteúdo (confirmado em runtime, item 7 acima).
- `js/trail.js` — `levels()` reescrito para o mecanismo generalizado de
  dois arrays (`withReviews`); `levelHtml()` ganhou o branch de
  ícone/classe `revisao`/tag de 3 vias; `finishLesson()` ganhou o branch de
  título/subtexto de 3 vias condicionado a `lesson.tipo === "revisao"`.
- Nenhum outro arquivo tocado: `js/business.js`, `css/style.css` e todo o
  restante do projeto permanecem exatamente como estavam antes desta etapa.

#### Registro da etapa

- **Resumo da etapa**: implementada a Onda de Revisão 1 na trilha unificada
  Aprender — `COURSE_REVIEWS`/`revU_01`..`revU_04` em `js/data.js`
  (conteúdo do Financial Specialist, seção 20, colado sem alteração),
  `Trail.levels()` generalizado para clonar e inserir revisões ancoradas
  por id independentemente em `COURSE` e `HISTORY_COURSE` (seção 19, item
  4, do Software Architect, implementado sem nenhum desvio), e os branches
  de identidade visual/título de conclusão adaptados de `business.js`
  preservando o `isHistoria` pré-existente. Validado ao vivo em Chrome real
  via CDP: as 4 posições de inserção, trava de segurança por âncora, fluxo
  completo de XP/energia/moedas/log em 2 das 4 revisões, teste de
  não-mutação nos DOIS arrays canônicos (incluindo reload completo da
  página), teste dirigido do caminho de inserção em `HISTORY_COURSE` nunca
  antes exercitado em produção (risco 6.1, mitigado antes de qualquer
  bloco real depender dele), ausência de regressão nas 120 lições reais e
  na trilha Empreender, e conferência visual em 2 viewports. Zero exceções
  de console em toda a sessão de teste.
- **Decisões tomadas**: nenhuma decisão de produto/arquitetura/conteúdo/
  design nova — esta etapa só implementou o que as seções 19-20 já haviam
  decidido, sem nenhum desvio (item 8 acima).
- **Pendências para os próximos agentes**:
  - **QA Engineer**: validação independente dos mesmos cenários (inserção,
    trava de segurança, fluxo de XP/energia/moedas/log, não-mutação dos
    dois arrays com reload, regressão nas 120 lições reais e no Empreender,
    estados visuais), e o script de verificação estrutural recomendado pelo
    Software Architect na seção 19/risco 6.2 (7 ids únicos por
    `refLessonIds`, existentes em `COURSE` OU `HISTORY_COURSE` — nunca nos
    dois, nunca em nenhum —, sem sobreposição entre `revU_01`..`revU_04`)
    formalizado como verificação repetível, não só a checagem manual feita
    nesta etapa.
  - **Documentation Specialist**: registrar a Onda de Revisão 1 como
    concluída em `CHANGELOG.md`/`ROADMAP.md` depois do QA.
  - **Ondas de Revisão 2, 3 e 4**: repetem o mesmo ciclo (Financial
    Specialist escreve conteúdo → Frontend Engineer só cola em
    `COURSE_REVIEWS`, sem nenhuma mudança de mecanismo, já que
    `Trail.levels()` generalizado suporta qualquer combinação de âncoras em
    `COURSE`/`HISTORY_COURSE` → QA), cada uma só começando depois da
    anterior fechar QA sem ressalvas graves. A Onda 3 (bloco 9, 1ª âncora
    real em `HISTORY_COURSE`) e a Onda 4 (blocos 14/17, mais 2 âncoras em
    `HISTORY_COURSE` e um caso real de inserção no meio de nível) reaproveitam
    um caminho de código já testado nesta etapa, não um caminho novo.
- **Riscos**: nenhum risco novo em aberto. O risco mais crítico apontado
  pelo Software Architect (6.1 — caminho de inserção em `HISTORY_COURSE`
  nunca exercitado em produção) foi mitigado com um teste dirigido nesta
  própria etapa, antes de qualquer bloco real depender dele — não adiado
  até a Onda 3, conforme a recomendação explícita da seção 19.
- **Próximo agente responsável**: QA Engineer.

### 22. QA Engineer (validação independente — Fase 3C, Onda de Revisão 1)

Validação feita de forma independente do autorrelato do Frontend Engineer
(seção 21) — nenhum resultado de lá foi aceito sem reprodução própria.
Ambiente: `python3 -m http.server 8899` servindo a raiz do projeto; Chrome
real (`151.0.7922.76`) headless via CDP (`--remote-debugging-port=9333
--remote-allow-origins=*`), controlado por um driver Python próprio
(`cdp.py`, escrito nesta sessão sobre `websocket-client`, já disponível no
ambiente) — mesmo padrão das Fases 1/2/3B desta RFC. `node` segue
indisponível neste ambiente (`node --version`/`node --check` falham com
"command not found", confirmado antes de tentar); a validação de sintaxe de
`js/data.js`/`js/trail.js` veio da execução real em Chrome (qualquer erro de
sintaxe teria impedido `Trail.levels()`/`Trail.render()` de rodar) e de um
script de verificação estrutural em runtime (item 4 abaixo).

**Cliques reais, não chamadas diretas de função**: toda navegação de trilha,
clique em nó, resposta de pergunta e fechamento de tela usou
`element.click()` sobre o DOM de fato renderizado (disparando os listeners
reais registrados por `Trail.render()`/`Business.render()`), nunca chamando
`Trail.startLesson()`/`answerQuestion()`/`finishLesson()` diretamente. Um
driver JS injetado (`window.__autoplayLesson`/`window.__autoplayBizLesson`)
automatiza a sequência de cliques (clicar o nó, continuar da aula, clicar
a alternativa certa/errada escolhida, clicar "Próxima pergunta"/"Concluir
lição", fechar a tela de resultado), mas cada passo é um clique real sobre
um elemento do DOM, não uma chamada de função — o mesmo princípio já usado
pela Fase 3B (seção 17).

#### Achados metodológicos do próprio harness (não são bugs do produto)

Registrados por transparência, como a tarefa exige:

1. **`Cloud.signIn()`/`Cloud.signUp()` chamados diretamente pelo console
   (contornando o formulário real) deixam o app preso no gate de boot.**
   `App.init()` (`js/app.js`) só chama `Tabs.init()`/`Trail.init()`/etc.
   depois que `ensureAuthenticated()` resolve, e essa Promise só resolve
   através do fluxo real do formulário (`Auth.submitCloudAuth()` seguido de
   `location.reload()`) — chamar `Cloud.signIn()` isolado no console cria
   uma sessão válida no Supabase, mas não desbloqueia o gate já pendente.
   Corrigido usando sempre o formulário real (campos `#authTabSignup`,
   `#authEmail`, `#authPassword`, `#authSubmitBtn`, com eventos `input`
   reais disparados) — o que, como efeito colateral positivo, tornou a
   criação de conta também 100% "clique real", reforçando o rigor pedido.
2. **Reautenticações repetidas no mesmo perfil de Chrome (múltiplas contas
   ou múltiplas navegações em sequência rápida) disparam a tela de
   `syncCollisionScreen` (RFC-027)** — o dispositivo acumula progresso local
   de testes anteriores que diverge do que já foi sincronizado para a conta
   nova, e o app bloqueia pedindo para escolher entre "dados da nuvem" ou
   "dados deste aparelho". Não é um bug desta fase (mecanismo do RFC-027,
   em `js/app.js`, não tocado por este diff) — mitigado limpando o perfil
   do Chrome entre baterias de teste com contas diferentes e resolvendo a
   tela (escolha "local") quando aparecia entre navegações da mesma conta.
3. **`Trail._flat` é um cache separado de `Trail._levels`.** Ao injetar uma
   entrada de teste temporária em `COURSE_REVIEWS` e invalidar só
   `Trail._levels = null`, `Trail.flatLessons()` continuou retornando o
   array antigo (cache `_flat` não invalidado) — corrigido invalidando os
   dois caches juntos. Não é um bug de produto (nenhum caminho real do app
   precisa invalidar `_levels` sem invalidar `_flat` no mesmo passo — os
   dois são sempre limpos juntos por reload de página), só uma armadilha do
   próprio script de teste, registrada por transparência.
4. **`Auth.logout()` usa `confirm()` nativo do navegador**, que o Chrome
   headless cancela silenciosamente sem um handler de diálogo configurado
   via CDP nesta sessão — por isso uma tentativa de deslogar para capturar
   o estado "bloqueado" de um nó de revisão com uma conta 100% nova não
   funcionou dentro do tempo disponível. Sem efeito no restante da
   validação (contornado criando contas novas via cadastro em vez de
   logout+login), mas registrado como limitação de cobertura — ver item 8.

#### Resultado por item pedido

**1. `git status`/`git diff --stat`** — confirmado: só `js/data.js`
(+548/-0), `js/trail.js` (+40/-5) e esta RFC foram modificados.
`js/business.js`, `css/style.css`, `index.html` e todo o resto do projeto
seguem intocados (`git diff --stat` vazio para esses arquivos), batendo
exatamente com o relatado pelo Frontend Engineer na seção 21.

**2. Navegação end-to-end com clique real, posição dos 4 nós** — conta nova
criada via o formulário real de cadastro, clique real em `[data-tab=aprender]`
(124 nós renderizados: 102 Financeira + 18 História + 4 revisões).
Completadas as 28 lições do Nível 1 em ordem exata da sequência flat
(`f1_01, f1_02, f1_03, f1_04, l1_1, f1_05, f1_06, revU_01, l5_1, f1_07,
f1_08, l1_2, f1_09, f1_10, l1_3, revU_02, f1_11 a f1_17, revU_03, f1_18 a
f1_24, revU_04`) via clique real em cada nó: aula, 10 perguntas, tela de
conclusão, fechar. Confirmado por leitura de `Trail.isUnlocked()` e da
classe CSS do nó, antes e imediatamente depois de cada âncora:

| Revisão | Status antes da âncora | Status imediatamente após | Próxima revisão continua travada? |
| --- | --- | --- | --- |
| `revU_01` (após `f1_06`) | `unlocked:false` | `unlocked:true`, classe `current revisao` | `revU_02`/`03`/`04`: `false` |
| `revU_02` (após `l1_3`) | `unlocked:false` | `unlocked:true` | `revU_03`/`04`: `false` |
| `revU_03` (após `f1_17`) | `unlocked:false` | `unlocked:true` | `revU_04`: `false` |
| `revU_04` (após `f1_24`) | `unlocked:false` | `unlocked:true` | (não há próxima nesta Onda) |

Nenhuma revisão destravou fora de ordem, nenhuma destravou antes da hora —
exatamente a tabela de blocos da seção 19 (Software Architect), confirmada
com conteúdo real.

**3. Conclusão das 4 revisões via clique real (não só 2)** — como o Frontend
Engineer relatou ter testado `revU_01`/`revU_02` em detalhe e `revU_03`/
`revU_04` só via simulação de progresso, completei as 4 via clique real
nesta sessão, com atenção redobrada em `revU_02` e `revU_04` (pedido
explícito da tarefa):

- `revU_01`: 10 perguntas, todas certas na primeira tentativa, sem variante. `+20 XP` (delta medido via `Learn.getXp()`), `+5 moedas`, energia `5 -> 4` (consumida normalmente por `Energy.tryStart()`, sem isenção), título "Revisão dominada!", `COURSE_PROGRESS.revU_01 === true`, `LESSON_LOG` ganhou `{lessonId:"revU_01", fonte:"financeira", ...}`.
- `revU_02`: errei deliberadamente a pergunta 0 (cliquei numa alternativa diferente de `correta`) para exercitar o caminho de `variante` — o app mostrou o aviso de reforço e a pergunta-variante substituiu a original; a resposta certa na variante contou para `correctCount`. Resultado final "Você acertou 10 de 10 perguntas (100%)" — a mesma mecânica de qualquer lição normal, sem código novo, confirmando a decisão da Fase 3A (seção 12). `+20 XP`, `+5 moedas`, `COURSE_PROGRESS.revU_02 === true`, `LESSON_LOG` correto.
- `revU_03`: 10 perguntas, todas certas, `+20 XP`, `+5 moedas`, `COURSE_PROGRESS.revU_03 === true`.
- `revU_04`: errei deliberadamente duas perguntas (índices 3 e 7) para confirmar que o caminho de `variante` funciona mais de uma vez dentro da mesma revisão sem efeito colateral — ambas corrigidas via variante, resultado final 10/10. `+20 XP`, `+5 moedas`, `COURSE_PROGRESS.revU_04 === true`, `LESSON_LOG` com a entrada final `{lessonId:"revU_04", fonte:"financeira", ...}`.

Texto exato da tela de conclusão capturado via `MutationObserver` (leitura
do DOM renderizado de fato, não do código) para todas as 4 revisões,
idêntico em todas: "Revisão dominada!" / "Você acertou 10 de 10 perguntas
(100%)." / "Você reforçou o que já tinha aprendido — é isso que faz o
conhecimento ficar de verdade." / "+20 XP e +5 moedas adicionadas à sua
conta." — bate exatamente com a especificação da seção 13 (Gamification
Designer) e a implementação relatada na seção 21.

**4. Releitura das 40 perguntas** — reli as 40 perguntas-base + 40
`variante` (seções 4-7 desta RFC, texto colado literalmente em
`COURSE_REVIEWS`, confirmado por diff) atrás do defeito específico já
encontrado uma vez nesta RFC (Bug 1 da Fase 3B, seção 17: par base/variante
testando conceitos diferentes). Não encontrei nenhuma recorrência desse
padrão — todos os 40 pares testam o mesmo conceito central da lição
referenciada, só com cenário/nomes/números diferentes. A autorrevisão do
Financial Specialist (seção 20, item 3, que relata 4 casos corrigidos antes
da entrega em `revU_02`/`revU_03`/`revU_04`) se confirma: reli
especificamente os 4 pontos que o Financial Specialist relatou ter
corrigido (`l1_2` reserva de emergência, `f1_10` seguro, `f1_12` a `f1_14`
metas/compartimentos/divisão, `f1_20`/`f1_22`/`f1_23` score/cheque
especial/consignado) e todos estão, de fato, com base e variante testando
o mesmo sub-conceito no texto final.

Também conferi manualmente uma amostra dos cálculos numéricos citados no
checklist do Financial Specialist (seção 20, item 2): patrimônio líquido
(`revU_01` Q3/Q4), custo de oportunidade (Q5), inflação (Q7/Q10), juro
composto (`revU_02` Q3/Q4), Regra dos 72 (Q5), regra 50-30-20 (`revU_02`
Q9, `revU_03` Q1/Q2) — todos batem com a opção marcada como `correta`, sem
divergência.

4 observações de estilo, registradas por transparência — nenhuma
classificada como bug, porque, ao contrário do Bug 1 da Fase 3B, em nenhum
caso a `variante` muda de conceito central; o que varia é o ângulo da
pergunta dentro do mesmo conceito (ex.: "calcular X" vs. "explicar por que
X importa"), um padrão que o próprio Financial Specialist já usa
deliberadamente em outros pontos do conteúdo publicado (citado
explicitamente na seção 20, item 3, para a pergunta 8 de `revU_03`) e que
a Fase 3B QA já tratou como aceitável em caso análogo (pergunta 7 de
`emod_1`, seção 17):

- `revU_02` pergunta 7 (`f1_09`, liquidez): base compara diretamente qual de dois bens é mais líquido; variante pergunta o que a falta de liquidez obriga a fazer numa emergência. Mesmo conceito (liquidez, patrimônio diferente de liquidez), ângulo diferente (comparação direta vs. consequência prática).
- `revU_03` pergunta 2 (`f1_11`, regra 50-30-20 com renda baixa): base pede para calcular a porcentagem da renda comprometida; variante pede para explicar por que a regra é difícil de seguir com renda baixa. Mesmo insight, um lado numérico, outro conceitual.
- `revU_03` pergunta 4 (`f1_13`, divisão proporcional das contas): base pede para calcular quem paga mais e por quê; variante pergunta qual vantagem a divisão proporcional traz sobre dividir "meio a meio". Mesmo conceito, mas a variante testa a justificativa/vantagem em vez de repetir o cálculo.
- `revU_03` pergunta 9 (`f1_17`, gatilho de urgência/escassez): base pede para identificar o tipo de gatilho; variante pede uma atitude de proteção contra o mesmo gatilho já identificado no enunciado. Mesmo conceito, mas a pergunta muda de "reconhecer" para "reagir".

Nenhuma dessas quatro chega a contradizer a UI (o aviso fixo de reforço "o
mesmo conceito") como o Bug 1 original contradizia — em todas, quem lê a
`explicacao` da base entende por que a `variante` continua sobre o mesmo
tema. Registro aqui só para o Financial Specialist avaliar, numa eventual
rodada de polimento, se prefere uniformizar o ângulo dentro de cada par —
não bloqueia a Onda 1.

**5. Teste crítico de não-mutação nos dois arrays** — script de verificação
estrutural (recomendado pela seção 19, risco 6.2) escrito e executado via
`Runtime.evaluate`, confirmando: `COURSE_REVIEWS.length === 4` (`revU_01`
a `revU_04`); cada `refLessonIds` com exatamente 7 ids; todos os ids
existem em `COURSE` ou `HISTORY_COURSE`, nunca nos dois, nunca em nenhum;
zero sobreposição de `refLessonIds` entre os 4 blocos; todas as 40
perguntas-base + 40 `variante` com exatamente 4 `opcoes`, `correta` no
intervalo [0,3], `explicacao` presente; 124 ids totais em
`COURSE`+`HISTORY_COURSE`+`COURSE_REVIEWS`, todos únicos — zero problemas
estruturais encontrados.

Snapshot de `COURSE.map(l=>l.licoes.map(x=>x.id))` e o equivalente de
`HISTORY_COURSE` tirado (a) antes de qualquer navegação, (b) depois de
`Trail.levels()`/`Trail.render()` rodarem, (c) depois de completar as 28
lições reais do Nível 1 mais as 4 revisões, e (d) depois de um reload real
da página (nova navegação HTTP, não só re-render em JS) — em todos os 4
momentos os dois arrays bateram exatamente com o snapshot inicial;
`COURSE.some(l=>l.licoes.some(x=>x.tipo==="revisao")) === false`, idem para
`HISTORY_COURSE`, nos 4 momentos. Depois do reload, as 4 revisões
reapareceram corretamente como concluídas (progresso persistido via
`COURSE_PROGRESS`, sem depender do array canônico) e o app não caiu na
tela de colisão de sincronização (aguardei cerca de 3 segundos após a
última ação para o push debounced de `js/cloud.js`, 500ms, terminar antes
de recarregar).

Teste dirigido do caminho de inserção em `HISTORY_COURSE` (risco 6.1),
repetido de forma independente do relato da seção 21 (que usou uma entrada
temporária não commitada): injetei em runtime uma revisão de teste
(`__TEST_REV_HIST__`, nunca escrita em `js/data.js`) ancorada em `h1_1`
(primeira das 2 lições de `HISTORY_COURSE[0]`, mesmo caso de inserção no
meio de um nível pequeno que o bloco 17 real vai exercitar na Onda 4).
Depois de invalidar `Trail._levels` e `Trail._flat` (item 3 dos achados
metodológicos acima), `Trail.flatLessons()` inseriu a entrada corretamente
entre `h1_1` e `h1_2`, com `fonte === "historia"`, e
`Trail.progressKey("historia")` roteando para a chave de progresso de
história — e, o ponto crítico, `HISTORY_COURSE` permaneceu byte-a-byte
idêntico ao snapshot anterior durante todo o teste. Depois de remover a
entrada e invalidar os caches de novo, `COURSE_REVIEWS.length` voltou a 4
e `Trail.flatLessons().length` voltou a 124. O caminho de inserção em
`HISTORY_COURSE` está confirmado, de forma independente, funcionando antes
de qualquer bloco real depender dele (Onda 3, bloco 9).

**6. Regressão na trilha Empreender (`js/business.js`)** — confirmado que
o arquivo está byte-a-byte intocado (`git diff --stat -- js/business.js`
vazio) e, ainda assim, testado ao vivo: clique real nos 7 nós `e1_1, e1_2,
e1_3, emod_1, emod_2, emod_3, e2_1` (escopando corretamente o seletor a
`#businessTrailContainer` desta vez — a mesma armadilha de seletor já
registrada como achado metodológico pela Fase 3B, seção 17, evitada aqui
desde o início), `revE_01` destravou exatamente na posição 7 (imediatamente
após `e2_1`), completei o quiz inteiro com erro deliberado na pergunta 9
(a mesma que teve o Bug 1 corrigido — confirmado que a `variante` agora
testa o mesmo conceito da base, precificação por valor percebido, sem
reincidência do bug). Resultado: título "Revisão dominada!", `+35 XP` (XP
da lição-âncora `e2_1`, como definido na Fase 3B), `+5 moedas`,
`BUSINESS_COURSE.map(l=>l.licoes.length) === [3,3,3,3,3,3]` (inalterado),
`BUSINESS_PROGRESS.revE_01 === true`. Nenhuma regressão.

**7. Destravamento sequencial (`isUnlocked()`) com Financeira e História
intercaladas** — confirmado pelo item 2 acima (nenhum destravamento fora
de ordem em 124 posições) e, adicionalmente, pelo teste de energia zerada
(item 9 abaixo), que usou `Trail.flatLessons().find(e=>!Trail.isDone(e))`
para encontrar a próxima lição elegível (`f1_25`, corretamente a próxima
da sequência unificada logo após `revU_04`) — confirmando que
`nextEntry()` continua escolhendo a posição certa mesmo com 4 nós de
revisão inseridos no meio da sequência Financeira e História.

**8. Responsividade (375px vs desktop)** — capturado via
`Page.captureScreenshot` real com `Emulation.setDeviceMetricsOverride`
(375x900 mobile vs 1400x1400 desktop) do estado concluído de um nó de
revisão (as 4 revisões desta Onda ficaram concluídas ao longo dos testes
anteriores): em ambos os breakpoints o nó exibe corretamente o ícone de
concluído, o anel com destaque roxo/dourado e a tag de revisão abaixo do
XP, sem corte nem sobreposição — grid de 3 colunas no mobile, 5 no
desktop, preservados.

Limitação declarada: não consegui capturar screenshot pixel dos estados
bloqueado e recém-destravado especificamente desta Onda com uma conta
nova, por causa do achado metodológico 4 (`confirm()` nativo cancelado
silenciosamente pelo Chrome headless sem um handler de diálogo configurado
via CDP, impedindo `Auth.logout()` de completar dentro do tempo desta
sessão). Mitigação e cobertura equivalente: (a) a lógica dos 3 estados foi
confirmada ao vivo via `className` do nó em cada transição (locked
revisao, current revisao, done revisao — exatamente os 4 casos do item 2);
(b) `css/style.css` está confirmado intocado por este diff — as regras que
estilizam `.trail-node.revisao` em cada estado são as mesmas já validadas
com captura de tela pixel-a-pixel pela Fase 3B (seção 17, item 7) para
`revE_01`, que usa exatamente as mesmas classes CSS. Não considero isso
uma lacuna de risco (zero CSS novo implica zero risco visual novo), mas
registro a limitação de cobertura explicitamente, como a tarefa exige.

**9. Conquistas relacionadas ao Nível 1 e à trilha financeira** —
`Achievements.CHECKERS.nivel1_completo` (`js/achievements.js:18-21`) e
`trilha_completa` (linha 22-25) leem `COURSE[0]`/`COURSE` diretamente (o
array canônico, não `Trail.levels()`) — confirmado ao vivo:
`Achievements.CHECKERS.nivel1_completo() === false` com 28 das 35 lições
reais do Nível 1 concluídas (as 4 revisões, mesmo concluídas, não entram
nessa contagem porque não existem em `COURSE[0].licoes`, só em
`Trail.levels()[0].licoes`); `trilha_completa() === false` pelo mesmo
motivo; `Achievements.checkAll()` executa sem lançar exceção. Confirma,
com conteúdo real da Onda 1 (antes só confirmado em tese pela seção 19,
item 5), que a decisão da Fase 3A (seção 12, item 5) se sustenta sem
exceção.

#### Cobertura adicional (segurança e performance, padrão do escopo de QA)

- Segurança: `js/supabase-config.js` não foi tocado por este diff e
  continua usando só a chave publishable/anon (`sb_publishable_-iqp9-...`),
  nunca uma `sb_secret_.../service_role`. Nenhum segredo novo introduzido.
- Performance: `js/data.js` cresceu de 1.699.221 para 1.780.197 bytes
  (cerca de +79KB, batendo com as +548 linhas do diff) — impacto
  proporcionalmente pequeno num arquivo que já era maior que 1,6MB antes
  desta fase (questão estrutural pré-existente, fora do escopo desta
  Onda). Medido via `performance.now()` em runtime: `Trail.levels()` e
  `Trail.flatLessons()` levam 0ms (resultado cacheado em `_levels`/`_flat`,
  recalculado só uma vez por sessão/reload); `Trail.render()` completo
  (124 nós, `container.innerHTML` de 91.608 caracteres) leva cerca de
  27ms, bem abaixo de qualquer limiar perceptível de travamento da thread
  principal, mesmo sendo síncrono.
- Energia: confirmado que o gate de energia funciona igual para nós de
  revisão e lições normais, sem isenção (decisão da Fase 3B, seção 13,
  item 2): com energia forçada a 0, clique real num nó destravado-mas-não-
  feito mostra o modal "Sem energia por hoje", não abre o quiz, XP não
  muda, energia permanece em 0 (nunca negativa). Também confirmado que a
  energia nunca ultrapassa o máximo de 5 mesmo com bônus de combo:
  repetindo uma revisão de 10 perguntas todas certas a partir de energia
  igual a 3, o saldo final ficou em 5 — o teto de `Energy.bonus()` está
  confirmado funcionando em runtime, não só por leitura de código.
- Console e exceções: nenhuma das dezenas de chamadas `Runtime.evaluate`
  desta sessão lançou exceção (o driver Python levanta erro imediatamente
  se `exceptionDetails` aparecer, servindo como detector automático de
  exceção síncrona em cada passo). Uma checagem adicional dedicada
  (`Log.enable` mais drenagem de eventos por alguns segundos em estado
  ocioso) não capturou nenhum evento de erro pendente.

#### Bugs encontrados

Nenhum bug de funcionalidade, segurança, performance ou regressão foi
encontrado. As 4 observações de conteúdo do item 4 acima são registradas
por transparência, não como bugs — nenhuma reproduz o padrão do Bug 1 da
Fase 3B (base e variante testando conceitos diferentes); todas testam o
mesmo conceito por ângulos diferentes, um padrão já usado deliberadamente
em outros pontos do conteúdo publicado e já considerado aceitável pela
Fase 3B QA num caso análogo.

#### Veredito final: aprovado

A implementação da Onda de Revisão 1 (Fase 3C) está funcionalmente correta
e é segura para publicar: mecanismo de inserção generalizado para os dois
arrays canônicos (`COURSE`/`HISTORY_COURSE`) validado com conteúdo real
(blocos 1-4, todos ancorados em `COURSE`) e com um teste dirigido
independente do caminho de `HISTORY_COURSE` (ainda não exercitado por
conteúdo real nesta Onda, mas confirmado funcional antes da Onda 3
depender dele); trava de segurança por âncora confirmada nas 4 posições;
fluxo completo de quiz (10 perguntas, caminho de `variante` testado 3
vezes em 2 revisões diferentes) confirmado nas 4 revisões via clique real,
não só 2; XP, energia, moedas, título, subtexto e `LESSON_LOG` batendo
exatamente com a especificação das Fases 3A/3B; teste de não-mutação nos
dois arrays canônicos, incluindo um reload real de página, sem nenhuma
entrada de revisão jamais vazando para `COURSE`/`HISTORY_COURSE`; zero
regressão na trilha Empreender (arquivo intocado, testado ao vivo mesmo
assim); conquistas `nivel1_completo`/`trilha_completa` confirmadas lendo
só os arrays canônicos, sem contar revisões; responsividade do estado
concluído confirmada em 2 breakpoints, com a lógica dos estados bloqueado
e atual confirmada via classe CSS (screenshot pixel desses 2 estados não
obtido nesta sessão por uma limitação do harness de teste, não do produto
— ver item 8). Não encontrei nenhuma recorrência do Bug 1 da Fase 3B nas
40 perguntas novas — a autorrevisão do Financial Specialist (seção 20,
item 3) se confirma efetiva. Nenhuma ressalva bloqueia a publicação desta
Onda.

- Resumo da etapa: validação independente da Onda de Revisão 1 (Fase 3C)
  via Chrome real controlado por CDP, com conta de teste criada pelo
  formulário real e cliques reais em toda a jornada: posição e trava de
  âncora das 4 revisões, conclusão completa das 4 (não só 2) com caminho
  de `variante` exercitado 3 vezes, XP/energia/moedas/log, teste de
  não-mutação nos dois arrays canônicos com reload real, teste dirigido
  independente do caminho de inserção em `HISTORY_COURSE`, regressão zero
  na trilha Empreender, conquistas de Nível 1 e trilha financeira,
  responsividade parcial (concluído confirmado por screenshot; bloqueado
  e atual confirmados por classe CSS, não por screenshot — limitação
  declarada), segurança e performance. Releitura das 40 perguntas novas
  contra o padrão do Bug 1 da Fase 3B: nenhuma recorrência encontrada, 4
  observações de estilo registradas sem gravidade de bug.
- Decisões tomadas: nenhuma — QA reporta, não decide nem corrige.
- Pendências para os próximos agentes:
  - Documentation Specialist: registrar a Onda de Revisão 1 como concluída
    em `CHANGELOG.md`/`ROADMAP.md`, incluindo a confirmação de que o
    caminho de inserção em `HISTORY_COURSE` já está validado (duas vezes,
    de forma independente) antes da Onda 3 precisar dele.
  - Financial Specialist (opcional, não bloqueante): avaliar, numa
    eventual rodada de polimento, se uniformiza o ângulo das 4 perguntas
    citadas no item 4 acima (`revU_02` Q7, `revU_03` Q2/Q4/Q9) para que
    base e variante testem o conceito pelo mesmo ângulo — melhoria de
    consistência, não correção de bug.
  - Ondas de Revisão 2, 3 e 4: podem prosseguir sem nenhum ajuste de
    mecanismo — o caminho de inserção em `HISTORY_COURSE` que a Onda 3 vai
    precisar já está confirmado funcionando (validado de forma
    independente duas vezes: Frontend Engineer seção 21 e este QA).
- Riscos: nenhum risco técnico em aberto. O risco mais crítico da fase
  (6.1, caminho de `HISTORY_COURSE`) está mitigado e confirmado de forma
  independente. Risco residual de cobertura, não de produto: os estados
  visuais bloqueado e atual de um nó de revisão nesta Onda não têm
  screenshot pixel dedicado nesta sessão (limitação do harness, item 8) —
  recomendo que um QA futuro complete esse par de screenshots com uma
  conta nova, configurando `Page.handleJavaScriptDialog` antes de chamar
  `Auth.logout()`, ou simplesmente usando um perfil de Chrome novo por
  teste desde o início.
- Próximo agente responsável: Documentation Specialist (fechamento da
  Onda de Revisão 1 em `CHANGELOG.md`/`ROADMAP.md`).

### 23. Documentation Specialist (fechamento da Fase 3C, Onda de Revisão 1)

Leitura prévia das seções 19-22 (Software Architect, Financial Specialist,
Frontend Engineer, QA Engineer) e conferência cruzada com as 2-3 entradas
mais recentes de `CHANGELOG.md` (v1.55.0, v1.56.0) antes de escrever, para
manter o mesmo nível de detalhe e tom já estabelecido — nenhuma afirmação
desta etapa foi feita sem base direta nas seções acima ou nos próprios
arquivos editados.

Documentado:

- **`CHANGELOG.md`**: nova entrada **v1.57.0** — "RFC-035 Fase 3C, Onda de
  Revisão 1 de 4 — sistema de revisão periódica chega à trilha unificada
  Aprender". Registra os 4 novos nós (`revU_01`-`revU_04`), o array
  `COURSE_REVIEWS`, a generalização de `Trail.levels()` (`withReviews`
  aplicada a `COURSE` e `HISTORY_COURSE`), a validação dirigida do caminho
  de inserção em `HISTORY_COURSE` (risco 6.1 do Software Architect,
  mitigado antes de qualquer bloco real depender dele), o escopo explícito
  (`js/business.js` intocado), o veredito do QA (aprovado sem ressalvas) e
  — de forma explícita, não implícita — que esta é a **primeira de 4 Ondas
  de Revisão planejadas**, com as Ondas 2 (blocos 5-8), 3 (blocos 9-12,
  primeira âncora real em História) e 4 (blocos 13-17) ainda não
  iniciadas.
- **`README.md`**: dois ajustes.
  - A entrada de feature "Revisão periódica a cada 7 pontos da trilha"
    (seção de features da trilha Aprender) foi generalizada — não é mais
    descrita como "piloto, exclusivo da trilha Empreender". Agora registra
    as duas fases (3B/3C), o piloto original em Empreender e a chegada à
    trilha Aprender pela Onda de Revisão 1 de 4, com as Ondas 2-4
    explicitamente marcadas como não iniciadas — para não sugerir cobertura
    completa que ainda não existe.
  - No diagrama de estrutura de arquivos (bloco `js/trail.js`/
    `js/business.js`), a linha de `trail.js` passou a citar os nós de
    revisão (Onda 1 de 4, RFC-035 Fase 3C, v1.57.0) e a linha de
    `business.js` deixou de dizer "exclusivo desta trilha" (não é mais
    verdade), passando a se referir a si mesma como "o piloto original do
    mecanismo".
- **`ROADMAP.md`**: dentro da seção já existente "Reformulação da trilha de
  aprendizado (RFC-035)", o item "Fase 3C" — que antes era uma única linha
  dizendo "ainda não iniciada" — foi expandido para refletir que está **em
  andamento**: resumo do mapeamento dos 17 blocos/4 Ondas feito pelo
  Software Architect (seção 19), um sub-item ✅ para a Onda de Revisão 1
  (blocos 1-4, v1.57.0, com o mesmo nível de detalhe técnico do padrão já
  usado nas entradas de "Onda" de conteúdo deste arquivo) e 3 sub-itens
  para as Ondas 2-4 ainda pendentes, cada um com o que especificamente vai
  cobrir (para quem ler o roadmap sem abrir a RFC inteira saber o que
  esperar de cada uma, inclusive qual delas é a primeira a tocar
  `HISTORY_COURSE` de verdade).
- **Esta RFC**: seção 23 (esta) adicionada ao final do Registro por etapa.
  Status geral da RFC (linha 3, topo do documento) **mantido como "em
  andamento"** — a Fase 3C não está completa, restam 3 Ondas de Revisão
  (2, 3 e 4) antes de considerá-la fechada.

Nenhuma decisão de produto/arquitetura/conteúdo/design nova nesta etapa —
só documentação do que as seções 19-22 já haviam decidido e validado.
Nenhum código tocado.

#### Registro da etapa

- **Resumo da etapa**: `CHANGELOG.md` (v1.57.0), `README.md` (feature de
  revisão generalizada + diagrama de estrutura de arquivos) e `ROADMAP.md`
  (item "Fase 3C" expandido com a Onda 1 concluída e as Ondas 2-4
  detalhadas como pendentes) atualizados para refletir a Onda de Revisão 1
  da Fase 3C. RFC-035 mantida "em andamento".
- **Decisões tomadas**: nenhuma — só registro do que os agentes anteriores
  já decidiram/validaram (seções 19-22).
- **Pendências para os próximos agentes**: quando a Onda de Revisão 2
  (blocos 5-8) fechar QA, repetir este mesmo ciclo de documentação —
  `CHANGELOG.md` com a próxima versão, `ROADMAP.md` marcando a Onda 2 como
  concluída e a Onda 3 como a próxima, e uma nova seção nesta RFC. Quando a
  Onda de Revisão 4 fechar, a Fase 3C inteira pode ser marcada como
  concluída no `ROADMAP.md` e a RFC reavaliada para status "concluída" (se
  não houver mais fase planejada depois dela).
- **Riscos**: nenhum.
- **Próximo agente responsável**: nenhum — aguardando o próximo ciclo
  (Financial Specialist para o conteúdo da Onda de Revisão 2) fora desta
  etapa de fechamento.
