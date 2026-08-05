# RFC-002: Simulador de Decisões (estilo jogo)

- **Status**: concluída
- **Prioridade**: alta (primeiro item da Etapa 2 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
Novo bloco dentro da aba Simulador: o usuário "recebe" um valor de uma vez (bônus, herança, prêmio, 13º turbinado), escolhe o que fazer com ele entre 4 opções (2 de gasto, 1 investir, 1 poupança), e vê uma comparação de resultado "10 anos depois" — sua escolha vs. o que teria sido se tivesse investido vs. guardado na poupança.

## Objetivo
Ensinar, de forma lúdica e concreta, o custo de oportunidade de gastar vs. investir, sem exigir nenhuma tela nova fora da aba Simulador já existente.

## Motivação
Item pedido explicitamente pelo usuário ("Simulador estilo game"), classificado na Etapa 2 do roadmap.

## Benefícios
Reforça de forma visual e repetível (o usuário pode jogar várias vezes, com cenários diferentes) uma das lições centrais do app — o custo de não investir — sem exigir nova infraestrutura.

## Impacto
Aditivo: novo array `SCENARIO_SIMULATIONS` em `js/data.js`, novos métodos em `Simulator` (`js/simulator.js`), novo bloco HTML dentro de `#tab-simulador`. Nenhum dado existente é alterado; `Simulator.compare()` só teve a fórmula da poupança extraída para um método compartilhado (`poupancaTaxaAnual`), sem mudar seu comportamento.

## Dependências
Nenhuma.

## Critérios de aceite
- Pelo menos 4 cenários distintos, cada um com 4 opções (2 gasto, 1 investir, 1 poupança).
- A tela de resultado mostra sempre as 3 projeções (escolha real, poupança, investido), não só a da escolha do usuário — para o aprendizado valer mesmo para quem "gastou".
- Escolher uma opção conta como uma simulação (soma em `SIMULATOR_RUNS`/`SIMULATOR_LOG`, reaproveitando o que a RFC-001 já criou).
- `node --check` limpo; lógica de projeção e fluxo de escolha verificados por execução real.

## Etapas puladas e por quê
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo confirmado: só o cenário de decisão + reveal, sem gamificação extra (XP already comes from the existing daily-challenge "run_simulation", não precisa de recompensa própria). Próximo: Software Architect.

### 2. Software Architect
Decisão: viver dentro do módulo `Simulator` já existente (mesma aba, mesmo arquivo) em vez de criar um módulo novo — a lógica de Selic/poupança já existe ali e deve ser reaproveitada, não duplicada. Extraída `poupancaTaxaAnual()` de dentro de `compare()` para um método compartilhado. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Reaproveita `.quiz-option` (botões de escolha, mesmo estilo do quiz da trilha), `.alert-box.info` (situação do cenário), `.kpi`/`.kpi-row` (comparação de resultados) — nenhum CSS novo necessário. Próximo: Gamification Designer.

### 4. Gamification Designer
Confirmado: sem XP direto por cenário (evita inflar XP artificialmente); o incentivo de jogar de novo é curiosidade/aprendizado + contribuição para a conquista "50 simulações" e o desafio diário já existentes. Próximo: Financial Specialist.

### 5. Financial Specialist
4 cenários escritos com valores/contextos realistas (bônus de trabalho, herança, prêmio de sorteio, 13º turbinado); projeção usa a Selic real (via `Simulator.currentSelic()`) + aproximação educativa de +2 p.p. para "investir" (carteira mista renda fixa/variável) — caveat de "estimativa educativa, não recomendação" incluído no texto de resultado. Próximo: Database Engineer.

### 6. Database Engineer
Nenhuma chave nova de `STORAGE_KEYS` — reaproveita `SIMULATOR_RUNS`/`SIMULATOR_LOG` da RFC-001. Próximo: Backend Engineer.

### 7. Backend Engineer
Implementado: `projectOutcome()`, `pickRandomScenario()`, `chooseScenarioOption()` em `js/simulator.js`. Próximo: Frontend Engineer.

### 8. Frontend Engineer
Implementado: `renderScenario()` e o bloco HTML em `index.html` (`#scenarioContainer`, dentro de `#tab-simulador`). Próximo: Cyber Security Specialist.

### 9. Cyber Security Specialist
Sem superfície de risco — dados 100% locais, nenhuma entrada de usuário livre (só cliques em opções pré-definidas), nenhuma chamada externa nova. Nenhum achado.

### 10. QA Engineer
Testado via Node (execução real do código, não simulação externa): estrutura dos 4 cenários, `projectOutcome` (gasto=0, poupança < investido no cenário de Selic alta), fluxo completo `renderScenario` → `chooseScenarioOption` (reveal mostra as 3 projeções e marca a escolha do usuário), incremento de `SIMULATOR_RUNS`/`SIMULATOR_LOG`, e `pickRandomScenario(excludeId)` nunca repete o cenário atual em 50 sorteios.

### 11. Documentation Specialist
`CHANGELOG.md` e `ROADMAP.md` atualizados.
