# RFC-007: Modo Carreira

- **Status**: concluída
- **Prioridade**: alta (último item da Etapa 3 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
Um card na Início ("Modo Carreira") que personaliza a jornada do usuário pelo objetivo de vida que ele já escolheu no diagnóstico inicial (casa, carro, viajar, investir, dívidas, reserva de emergência, viver de renda, aposentadoria, ou estudos) — mostrando as 4 lições de `COURSE` mais relevantes para esse objetivo, em ordem, com progresso, o cofrinho já vinculado a ele, e uma dica de como usar o Simulador para aquele caso específico. O usuário pode trocar de objetivo a qualquer momento sem refazer o diagnóstico inteiro.

## Objetivo
Dar um sentido de "para que serve tudo isso" ao progresso do usuário — em vez de uma trilha genérica, mostrar explicitamente que 4 lições específicas o aproximam do carro/casa/reserva que ele disse que queria.

## Motivação
Item pedido explicitamente pelo usuário como "modo carreira" (usuário escolhe um objetivo e o app monta uma trilha personalizada) — último e mais complexo item da Etapa 3, adiado para o final da etapa de propósito (Product Owner), depois de investigar que o app já tinha 80% da peça de dados necessária.

## Benefícios
Reaproveita quase tudo: `LIFE_GOALS`/`GOAL_TEMPLATES`/`profile.pessoal.objetivo` (diagnóstico inicial) e `Goals.ensureTemplateGoal` (cofrinho automático) já existiam antes desta RFC — o único dado novo é o mapeamento objetivo → lições, que é 100% estático e não duplica nenhuma lição (referencia por `id`, nunca copia texto de `COURSE`).

## Impacto
Aditivo:
- `CAREER_PATHS` novo em `js/data.js` — 9 entradas (uma por `LIFE_GOALS`), cada uma com 4 ids de lições reais de `COURSE` + uma dica de uso do Simulador.
- `js/career.js` novo — módulo `Career` (`getObjective`, `chooseObjective`, `linkedGoal`, `renderPicker`, `render`, `init`).
- `#homeCareerMode` novo na Início (`index.html`), entre o card "Seu perfil" e o snippet da trilha.
- `App.init()`/`App.renderHome()` ganharam `Career.init()`/`Career.render()`.
- Nenhuma mudança em `js/onboarding.js` ou `js/goals.js` — Modo Carreira só CHAMA `Goals.ensureTemplateGoal()`, já existente, nunca reimplementa a criação do cofrinho.

## Dependências
Nenhuma — não depende do RFC-005 nem do RFC-006. Depende apenas do sistema de onboarding/objetivos já existente (`js/onboarding.js`, anterior a esta sessão).

## Critérios de aceite
- Sem perfil, ou com perfil mas sem objetivo escolhido: mostra o seletor de objetivo (reaproveitando `LIFE_GOALS`), não quebra.
- Ao escolher um objetivo: cria o cofrinho vinculado (via `Goals.ensureTemplateGoal`, sem duplicar se já existir) e mostra as 4 lições curadas daquele objetivo, todas com `id` real em `COURSE`.
- Progresso (X/4, barra, próxima lição pendente) reflete o estado real de `Learn.getProgress()` — inclusive quando o usuário completa lições fora do fluxo do Modo Carreira (ex.: pela Trilha direto).
- Ao completar as 4 lições curadas, mostra uma mensagem de parabéns em vez do botão "Continuar a trilha".
- "Trocar objetivo" sempre volta ao seletor, e escolher um novo objetivo não apaga nem duplica cofrinhos de objetivos anteriores.
- Todas as 9 entradas de `CAREER_PATHS` têm exatamente `LIFE_GOALS`.length entradas, todos os ids de lição são reais, e todas têm uma dica de simulador não vazia (verificado por execução).
- `node --check` limpo em todos os arquivos tocados.

## Etapas puladas e por quê
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Decisão central, documentada aqui porque não é óbvia por fora: o pedido original ("usuário escolhe um objetivo... casa, carro, intercâmbio, aposentadoria, faculdade, independência financeira") **já existe quase por completo** como o diagnóstico inicial (`js/onboarding.js`: `LIFE_GOALS`, 9 objetivos, incluindo equivalentes a todos os 6 citados — intercâmbio ≈ "viajar", faculdade ≈ "educação", independência financeira ≈ "viver de renda"/"aposentadoria") — que já cria até um cofrinho automático (`GOAL_TEMPLATES`/`Goals.ensureTemplateGoal`). Construir uma segunda tela de "escolha seu objetivo" do zero duplicaria esse conceito e fragmentaria o estado (dois objetivos "ativos" ao mesmo tempo, um do onboarding e um do modo carreira). Decisão: Modo Carreira **reaproveita** o objetivo do onboarding como fonte da verdade, e adiciona só a peça que faltava — que lições especificamente ajudam com aquele objetivo — mais a capacidade de trocar de objetivo sem refazer todo o diagnóstico (hoje só existia "Refazer diagnóstico" completo). Próximo: Software Architect.

### 2. Software Architect
Decisão: módulo novo (`js/career.js`), pequeno e sem estado próprio no localStorage — `Career.getObjective()` lê `profile.pessoal.objetivo` (já existente), `Career.chooseObjective()` só grava nesse mesmo campo e delega a `Goals.ensureTemplateGoal()` (já existente), e o progresso vem de `Learn.getProgress()` (já existente). Nenhuma chave nova de `STORAGE_KEYS`. Isso mantém uma única fonte da verdade para "qual é o objetivo do usuário" em vez de duas (onboarding vs. modo carreira) que precisariam ser sincronizadas manualmente. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Seletor de objetivo reaproveita `.life-goals-grid`/`.life-goal-btn` (mesmo CSS já usado no onboarding) — zero CSS novo. Card de progresso reaproveita `.card`/`.budget-bar-bg`/`.budget-bar-fill`/`.mission-list`/`.mission-row` já existentes. Próximo: Gamification Designer.

### 4. Gamification Designer
Confirmado: nenhuma recompensa numérica nova pelo Modo Carreira em si — as lições já dão XP normalmente ao serem concluídas pela Trilha (nenhuma duplicação de XP); o valor do Modo Carreira é a curadoria/direção, não uma segunda camada de pontos. O "próxima lição pendente" com um único CTA ("Continuar a trilha") evita decisão-paralisia de mostrar 4 botões. Próximo: Financial Specialist.

### 5. Financial Specialist
As 4 lições de cada um dos 9 objetivos foram escolhidas por relevância temática real, não aleatoriamente — ex.: "dívidas" prioriza score de crédito → cartão sem rotativo → saindo do rotativo → negociar dívidas (uma sequência de resolução, não uma lista solta); "aposentadoria" vai de INSS → previdência privada → juros compostos → independência financeira/aposentadoria (do básico ao objetivo final); "reserva" foca especificamente em liquidez e onde guardar (Tesouro Direto/CDB), não em renda variável. Próximo: Database Engineer.

### 6. Database Engineer
Nenhuma chave nova de `STORAGE_KEYS` — confirmado por leitura: `Career` só lê/escreve `STORAGE_KEYS.PROFILE` (já existente, só o subcampo `pessoal.objetivo`) e delega tudo de cofrinho para `Goals` (que já usa `STORAGE_KEYS.GOALS`). Próximo: Backend Engineer.

### 7. Backend Engineer
Implementado `CAREER_PATHS` em `js/data.js` (9 entradas) e `js/career.js` completo. Verificado por execução que as 36 referências de lição (9 objetivos × 4 lições) são todas ids reais de `COURSE`. Próximo: Frontend Engineer.

### 8. Frontend Engineer
Implementado: `#homeCareerMode` na Início, hooks em `App.init()`/`App.renderHome()`. Nenhuma mudança em `js/trail.js` foi necessária para o botão "Continuar a trilha" — ele só chama `Tabs.go("aprender")`, mesmo padrão já usado pelo botão "Continuar" do snippet de trilha. Próximo: Cyber Security Specialist.

### 9. Cyber Security Specialist
Sem superfície de risco nova. Todo o conteúdo interpolado em `innerHTML` (nome do objetivo, títulos de lição, dica de simulador, nome/valores do cofrinho) vem de dados estáticos (`data.js`) ou de números formatados (`Goals.fmt`) — nenhuma entrada de texto livre do usuário é interpolada sem escaping. Nenhum achado.

### 10. QA Engineer
Testado via execução real do código (Node + `vm.runInContext`, carregando `data.js`/`storage.js`/`goals.js`/`career.js` de verdade):
- Confirmado: sem perfil, ou com perfil sem objetivo, `Career.render()` mostra o seletor com os 9 objetivos, sem lançar exceção.
- Confirmado: `Career.chooseObjective("reserva")` grava o objetivo no perfil, cria o cofrinho vinculado via `Goals.ensureTemplateGoal` (nome real "Reserva de emergência"), e a tela passa a mostrar as 4 lições curadas com 0/4 concluídas.
- Confirmado: completar 2 das 4 lições reais (via `Learn.getProgress()`, o mesmo estado que a Trilha de verdade usa) atualiza a tela para "2/4" e 50% de barra, e o botão "Continuar a trilha" — quando clicado de fato (listener real capturado e invocado) — chama `Tabs.go("aprender")`.
- Confirmado: completar as 4 lições muda a tela para a mensagem de parabéns e remove o botão de continuar.
- Confirmado: "Trocar objetivo" sempre volta ao seletor.
- Confirmado: as 9 entradas de `CAREER_PATHS` têm exatamente 4 ids de lição reais cada, e todas têm uma dica de simulador não vazia.
- `node --check` limpo em `js/career.js`, `js/data.js`, `js/app.js`.

### 11. Documentation Specialist
`ROADMAP.md` e `CHANGELOG.md` atualizados marcando Modo Carreira como concluído (v1.25.0) — **fecha a Etapa 3 do roadmap por completo**.
