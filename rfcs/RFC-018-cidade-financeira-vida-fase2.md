# RFC-018: Cidade Financeira — Fase 2 (emprego, educação e catálogo de investimentos)

- **Status**: concluída
- **Prioridade**: alta (continuação direta do RFC-017, pedida pelo usuário)
- **Agentes envolvidos**: Product Owner, Software Architect, Gamification Designer, Financial Specialist, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
Continuação do simulador de vida da Cidade Financeira (RFC-017). Fase 2 implementa 3 partes do spec original ainda pendentes: **emprego/progressão salarial**, **educação (cursos que custam patrimônio simulado)**, e **expansão do catálogo de investimentos com "Sistema de Conhecimento"** (algumas opções só ficam disponíveis depois de estudar — seja um curso simulado, seja a trilha real do Aprender).

## Objetivo
- 5 empregos com salários crescentes, cada um exigindo um requisito (curso simulado ou nível real da trilha) pra ser promovido.
- 5 cursos comprá­veis com patrimônio simulado, cada um desbloqueando um emprego ou uma opção de investimento.
- 4 opções de investimento novas na decisão semanal (FIIs, ETFs, Criptomoedas, Ouro), além das 4 já existentes — 2 delas bloqueadas até o jogador estudar (curso simulado OU trilha real), com o requisito exato visível na interface.

## Motivação
Pedido do usuário, continuando o mesmo spec do RFC-017. O ponto central do "Sistema de Conhecimento" do spec original ("o jogador não pode investir em um produto que ainda não estudou") só faz sentido com mais de 4 opções — com só 4, quase tudo já estava liberado desde a Fase 1.

## Benefícios
Conecta de verdade "Aprender" e "Cidade" (uma opção de investimento aceita a trilha real como atalho pro requisito, honrando a visão original: "Aprender desbloqueia recursos na Cidade"); dá profundidade e motivo para voltar à Cidade sem exigir mais uma fase inteira de conteúdo novo.

## Impacto
- **`js/data.js`**: `WEEKLY_ECONOMIC_SCENARIOS` ganha 4 campos novos por cenário (`fiiPct`, `etfPct`, `criptoPct`, `ouroPct` — faixas validadas pelo Financial Specialist, incluindo 2 correções importantes: FIIs **caem** (não sobem menos) em Inflação Alta, por efeito de marcação a mercado competindo com juro alto; Cripto tem viés levemente negativo em Inflação Alta, não neutro). `CITY_LIFE_JOBS` (5 empregos) e `CITY_LIFE_COURSES` (5 cursos) novos. `CITY_LIFE_DECISION_OPTIONS` ganha 4 entradas (`fii`, `etf`, `cripto`, `ouro`), 2 com `requisitoOu` (múltiplos caminhos possíveis, mesmo padrão de "OU" já usado em `Progression.CHECKERS`). 1 conquista nova (`primeiro_curso_cidade`).
- **`js/citylife.js`**: `requisitoSatisfeito()` (aceita `{tipo:"curso"}` contra `cursosComprados` OU `{tipo:"trilha"}` contra `Learn.getProgress()` real — mesmo padrão de checker do `js/progression.js`), `comprarCurso()`, `promocaoDisponivel()`/`aceitarPromocao()` (achado, não bloqueante — aparece como banner acima do ciclo normal, o jogador decide quando aceitar), `efeitoOpcao()` estendido pros 4 novos `categoria`. Opções de investimento bloqueadas aparecem visíveis mas desabilitadas, com o requisito exato escrito (🔒), nunca escondidas.
- **Migração de estado**: `state.emprego` (objeto fixo da Fase 1) dá lugar a `state.empregoId` (referência a `CITY_LIFE_JOBS`) — `getState()` migra automaticamente saves antigos (`empregoId` ausente → `"auxiliar"`, exatamente o emprego que a Fase 1 já usava, sem nenhuma perda).

## Dependências
RFC-017 (Fase 1).

## Critérios de aceite
- Emprego `auxiliar` sempre disponível; os outros 4 exigem o requisito certo, e uma promoção disponível aparece como banner (não bloqueia o ciclo semanal).
- Cursos consomem patrimônio simulado (não `COINS` reais), nunca compráveis 2x, nunca com patrimônio insuficiente.
- As 4 opções de investimento novas só aparecem clicáveis quando o requisito (curso OU trilha real) é satisfeito; bloqueadas mostram o requisito exato.
- Saves da Fase 1 (sem `empregoId`) continuam funcionando sem erro, migrados automaticamente.
- Teste real (Node + Playwright): comprar curso, ficar elegível a emprego, aceitar promoção, investir numa opção recém-desbloqueada, save antigo sem quebrar.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: mesmo motivo do RFC-017 — só `localStorage`, sem esquema novo, sem deploy.

## Registro por etapa

### 1. Product Owner
Evitei renomear isso de "Carreira" na interface — já existe `js/career.js` ("Modo Carreira", RFC-007, sobre currículo personalizado por objetivo de vida), um conceito totalmente diferente. Na Cidade, o texto usa "Emprego"/"Profissão", sem colisão de nome.

### 2. Software Architect
`requisitoSatisfeito()` generaliza exatamente o padrão de "múltiplos caminhos pro mesmo gate" que `Progression.CHECKERS.acoesfiis` já usava (perfil avançado OU trilha completa) — agora abstraído numa função reutilizável em vez de reimplementado a cada checker. Migração de `emprego` (objeto) → `empregoId` (referência) feita de forma retrocompatível, sem exigir reset de save.

### 3. Gamification Designer
Promoção é **achado, não bloqueante** — vira um banner que o jogador aceita quando quiser, nunca interrompe ou trava o ciclo semanal (mesma filosofia "sem penalidade dura" do RFC-017). Aceitar uma promoção aplica uma queda pequena e única de felicidade/saúde ("mais responsabilidade, mais estresse", do próprio spec do usuário) — não é punição, é a trade-off real que o próprio pedido descreveu, e o jogador recupera esses atributos normalmente escolhendo "lazer" depois.

### 4. Financial Specialist
Validou a direção de FIIs/ETFs/Cripto/Ouro nos 4 cenários e corrigiu 2 pontos: FIIs **caem** (marcação a mercado por juro alto pesa mais que o dividendo) em Inflação Alta, não "sobem menos"; Cripto tem viés levemente negativo em Inflação Alta (ativo especulativo de "duration longa" sofre com juro subindo, mesmo com a narrativa de reserva de valor). Forneceu as faixas usadas em `WEEKLY_ECONOMIC_SCENARIOS` e a frase do PolvIn sobre por que o ouro sobe em crise/inflação.

### 5. Frontend Engineer
Implementado: dados novos em `js/data.js`, lógica de emprego/curso/promoção/gating em `js/citylife.js`, UI de educação e opções bloqueadas em `index.html`.

### 6. QA Engineer
Testado via Node (harness real) + Playwright: comprar cada um dos 5 cursos, ficar elegível e aceitar cada uma das 4 promoções em sequência, investir nas 4 opções novas só depois de satisfazer o requisito (e confirmar que ficam bloqueadas antes disso), simular um save antigo (sem `empregoId`) e confirmar migração sem erro, zero erro de console.

### 7. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados, com as fases ainda pendentes (imóveis, empresas, luxo/status, isométrico, linha do tempo, relatório de temporada) continuando registradas.
