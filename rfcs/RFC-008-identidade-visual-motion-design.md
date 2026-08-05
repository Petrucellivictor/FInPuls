# RFC-008: Identidade visual e motion design (Fase 1 — biblioteca de animações + celebração de lição + Início)

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário, aplicando a filosofia de design de [[ux-ui-design-lead]])
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
Primeira aplicação prática da filosofia de design registrada em `.claude/agents/ux-ui-design-lead.md` (identidade própria, nunca genérico, "Wow Moment" por tela, motion design real, biblioteca de animações reutilizável). Fase 1: (a) biblioteca de animações reutilizável em `js/fx.js`/`css/style.css`, (b) reconstrução da celebração de conclusão de lição (o exemplo canônico da própria filosofia), (c) botões "elásticos" em todo o app, (d) redesign do card de boas-vindas da Início com um "Wow Moment" do POLVIn.

## Objetivo
Provar a filosofia de design em superfícies concretas e de alto impacto antes de expandir para o resto do app, evitando tentar redesenhar as ~20 abas de uma vez só.

## Motivação
Pedido direto do usuário: "Utilize essa nova filosofia de design e refaça as animações e design pa página... utilize mecânicas mais atuais de animação."

## Benefícios
Reaproveita ativos já fortes do projeto (avatar 3D do POLVIn já existente, `Fx.confetti`/`Fx.countUp` já existentes) em vez de descartá-los; usa mecânicas nativas modernas (Web Animations API para o `coinBurst`, cubic-bezier overshoot para botões elásticos, órbita CSS para loading) sem adicionar nenhuma dependência externa — mantém a arquitetura 100% estática do projeto.

## Impacto
- `css/style.css`: nova seção "BIBLIOTECA DE ANIMAÇÕES REUTILIZÁVEL" (`.fx-coin`, `.fx-xp-pop`, `.fx-success-glow`, `.fx-badge-unlock`, `.fx-screen-enter`, `.fx-loading-orbit`); `.btn`/`.btn:active` reescritos para o efeito elástico; nova reação `.polvin-3d.celebrating`.
- `js/fx.js`: novas funções `coinBurst`, `xpPop`, `successGlow`, `badgeUnlock`, `screenEnter`, `loadingOrbitHtml`, `mascotCelebrate`.
- `js/trail.js`/`js/business.js`: `finishLesson()` reescrito — na primeira conclusão real (`celebrar = passed && !alreadyDone`), mostra o avatar do POLVIn comemorando em vez do emoji genérico, e dispara confete + brilho + "+X XP" flutuante + moedas voando até o header. Em replay/reprovação, comportamento simplificado (sem fogos de artifício por algo que não gerou recompensa nova — pequena correção de honestidade: antes o confete disparava até em replay).
- Início (`index.html`/`js/app.js`): usuário escolheu o **Conceito B (gamer)**. `App.pickWowMessage()` (cascata de prioridade: patrimônio virtual investido > ofensiva ativa ≥3 dias > perto de subir de nível > boas-vindas genérica, sempre a partir de dados reais), `App.playHeroEntrance()` (mergulho do POLVIn tocado uma única vez por sessão, não a cada `renderHome()`). Removidos `#homeGreeting`/`#homeSubtitle` (textos estáticos), substituídos por `#homeMascotWrap`/`#homeWowMessage`.

## Dependências
Nenhuma. Não depende de nenhum RFC anterior.

## Critérios de aceite
- Toda a biblioteca de animações roda sem exceção mesmo com elementos-alvo ausentes (defensivo).
- A celebração de lição só dispara na primeira conclusão real — replay e reprovação continuam sem XP/moedas/fogos de artifício (mesma garantia já testada nas RFCs anteriores para XP duplicado).
- `prefers-reduced-motion: reduce` continua neutralizando toda animação nova automaticamente (via a regra global já existente `* { animation-duration: 0.01ms !important }`), sem precisar de exceções por classe.
- `node --check` limpo em todos os arquivos JS tocados.
- Início redesenhada com um "Wow Moment" real, escolhido entre 3 conceitos apresentados ao usuário (não decidido unilateralmente).

## Etapas puladas e por quê
- **Database Engineer**: nenhuma mudança de dados/estado.
- **Financial Specialist**: nenhuma mudança de conteúdo financeiro.
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo desta Fase 1 (redesenho é maior que qualquer feature anterior — recorta-se em fases, mesmo padrão de uma feature grande por RFC já usado nas Etapas 2/3): (1) biblioteca de animações fundacional, (2) a celebração de lição — porque é o próprio exemplo canônico citado na filosofia de design, (3) botões elásticos — porque cobre 100% do app de uma vez com risco mínimo, (4) a tela Início — porque é a mais visitada e a que a filosofia usa como exemplo do "Wow Moment". Um redesenho completo de todas as abas fica para fases futuras (Fase 2+), não tentado de uma vez. Próximo: Software Architect.

### 2. Software Architect
Decisão de arquitetura: nenhuma dependência externa (sem GSAP/Framer Motion/CDN) — o projeto é estático e sem build step, e todo o efeito pedido é alcançável com Web Animations API (`element.animate()`, suportada nativamente, sem polyfill) + CSS moderno (custom properties, cubic-bezier com overshoot). Biblioteca de animações vive em `js/fx.js` (funções nomeadas) + `css/style.css` (seção própria) — mesma decisão já registrada no agente UX/UI. Nenhuma chave de storage nova. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Celebração de lição: substituído o emoji genérico (🎉) pelo avatar 3D do POLVIn já existente (`Polvin.avatarHtml`) reagindo (`.celebrating`, pulinho + giro), só na primeira conclusão real — coerente com "pense como jogo" e reaproveitando um ativo de marca já forte, em vez de inventar uma mascote nova. Botões: trocado `:active { translateY(1px) }` (genérico) por um "spring" real via `cubic-bezier(0.34, 1.56, 0.64, 1)` com overshoot na soltura — aplicado a TODOS os botões do app de uma vez (baixo risco, alta cobertura).

**Início — 3 conceitos apresentados ao usuário via artifact interativo** (não commitado no repo, só a decisão): A) minimalista — só o texto dinâmico do POLVIn substitui "Bem-vindo(a) de volta!", sem mudar o layout do hero-card; B) "gamer" — POLVIn 3D grande mergulhando visualmente no card com uma moeda, fundo com partículas sutis; C) premium — hero-card com gradiente animado lento + vidro (glassmorphism) + POLVIn menor mas com uma fala mais sofisticada. Recomendação do Design Director: B. **Usuário escolheu o Conceito B.** Implementação real: `.hero-card-wow` (radial gold glow + gradiente existente), `.hero-particle`/`heroParticleDrift` (partículas subindo), `.hero-mascot-wrap.diving`/`heroMascotDive` (mergulho via CSS, mesma lógica do mockup), `.hero-wow-message` (balão estilo HQ com borda dourada), `.level-ring-glow` (brilho no anel de nível).

### 4. Gamification Designer
Confirmado: nenhuma recompensa numérica nova nesta fase — a celebração visual reforça recompensas que já existiam (XP/moedas da lição), não cria uma segunda camada. Botões elásticos e loading orbital são identidade, não gamificação de progresso.

### 5. Frontend Engineer
Implementado e testado (execução real via Node/vm): `js/fx.js` (`coinBurst`, `xpPop`, `successGlow`, `badgeUnlock`, `screenEnter`, `loadingOrbitHtml`, `mascotCelebrate`), `css/style.css` (biblioteca de animações + botão elástico + reação `.celebrating` do POLVIn), `js/trail.js`/`js/business.js` (`finishLesson()` reescrito). Início: `App.pickWowMessage()`/`App.playHeroEntrance()` em `js/app.js`, markup novo em `index.html` (`#homeHeroCard`/`#homeMascotWrap`/`#homeWowMessage`), CSS do Conceito B em `css/style.css`. `renderHome()` injeta o avatar do POLVIn só na primeira vez (`if (!mascotWrap.innerHTML)`) — chamadas seguintes (por `xp:updated`/`wallet:updated`/etc.) só atualizam o texto da mensagem, sem recriar o DOM nem repetir o mergulho.

### 6. Cyber Security Specialist
Sem superfície de risco nova. `pickWowMessage()` interpola apenas números formatados (`Learn.getXp()`, `Store.get(STREAK)`, `Portfolio.totalsByClass().total`) — nenhuma entrada de usuário livre. `Fx.xpPop` usa `textContent` (nunca `innerHTML`) para o texto flutuante. Nenhum achado.

### 7. QA Engineer
- Testado via Node/vm (harness real, não reimplementação): as 7 funções de `Fx` são defensivas contra elemento nulo; `coinBurst` cria o número certo de moedas com 3 keyframes cada; `finishLesson()` real mostra o avatar do POLVIn e dispara os 5 efeitos só na primeira conclusão real, nunca em replay/reprovação (XP/moedas confirmados inalterados nesses dois casos); `App.pickWowMessage()` testado nas 4 branches de prioridade; `App.renderHome()` confirmado injetando o avatar do POLVIn uma única vez e atualizando a mensagem a cada chamada; `App.playHeroEntrance()` confirmado adicionando a classe `diving` e agendando o typewrite.
- **Teste visual real no navegador** (Playwright + Chromium, app servido localmente, não uma reimplementação): screenshot da Início confirma o hero-card com glow dourado, avatar do POLVIn com moeda, balão de fala com a mensagem dinâmica real ("Você está numa sequência de 4 dias!") e o anel de nível com o brilho novo. Fluxo completo de uma lição real (abrir trilha → tela de introdução → responder 2 perguntas corretamente → tela de conclusão) executado de ponta a ponta: overlay de conclusão mostra o avatar do POLVIn (não o emoji), confete visível, texto "+20 XP e +5 moedas adicionadas à sua conta", e o toast de conquista desbloqueada aparece corretamente — **zero erros de console/página** capturados durante todo o fluxo.
- `node --check` limpo em `js/fx.js`, `js/trail.js`, `js/business.js`, `js/app.js`.

### 8. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados registrando a Fase 1 da nova identidade visual (v1.27.0). Fases futuras (resto das abas) ficam para RFCs seguintes, não abertas agora.
