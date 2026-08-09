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
