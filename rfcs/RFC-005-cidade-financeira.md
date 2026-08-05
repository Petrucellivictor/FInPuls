# RFC-005: Cidade Financeira

- **Status**: concluída
- **Prioridade**: alta (primeiro item da Etapa 3 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
Nova aba "🏙️ Cidade" mostra uma grade de terrenos. Cada terreno representa um marco de progresso real do jogador (primeira lição, primeira meta, primeiro investimento, 7/30/100 dias de streak, Renda Fixa/Renda Variável completas, primeiro certificado de livro, primeiro passo empreendedor, primeiro conto de História, nível 1 completo, trilha unificada completa) — quando o marco é atingido, o terreno "constrói" (casa, parque, garagem, banco, biblioteca, escritório, museu, escola, empresa, cofre, bolsa de valores, prefeitura, monumento). Terrenos não atingidos aparecem como "???" com um lote vazio (🔲).

## Objetivo
Dar um meta-jogo visual e cumulativo ao progresso do jogador — um jeito de "ver" a jornada inteira num só lugar, sem inventar um novo tipo de recompensa ou estado a manter.

## Motivação
Item pedido explicitamente pelo usuário na lista de 13 ideias de engajamento — primeiro item da Etapa 3 do roadmap, escolhido pelo Orchestrator (chapéu de Product Owner) como o próximo a implementar por ter a menor complexidade de estado dentro da Etapa 3 (não exige nenhuma chave de storage nova, diferente de eventos temporários e modo carreira).

## Benefícios
Reaproveita 100% do sistema de conquistas já existente e testado (`Achievements.getUnlocked()`/`CHECKERS`) — zero estado novo, zero risco de dessincronia entre "conquista desbloqueada" e "construção na cidade". Dá uma razão visual para voltar e revisitar a aba depois de cada marco.

## Impacto
Aditivo, sem alterar nenhum comportamento existente:
- `CITY_BUILDINGS` novo em `js/data.js` (13 entradas, cada uma mapeando 1:1 para um `id` já existente em `ACHIEVEMENTS`/`Achievements.CHECKERS`).
- `js/city.js` novo — módulo `City` com `render()`/`init()`, sem estado próprio.
- `#tab-cidade` novo em `index.html` (botão de aba + painel com grid + label/barra de progresso).
- `App.init()` ganhou `City.init()`.
- `Achievements.checkAll()` ganhou uma chamada a `City.render()` dentro do `if (changed)`, para a cidade atualizar em tempo real quando uma conquista nova é desbloqueada (sem precisar reabrir a aba).

## Dependências
Nenhuma — depende apenas do sistema de conquistas já existente (não de nenhuma outra RFC desta Etapa 3).

## Critérios de aceite
- Todas as 13 entradas de `CITY_BUILDINGS` têm um `id` correspondente em `ACHIEVEMENTS` e uma função real em `Achievements.CHECKERS` (verificado por execução, não só leitura).
- Terreno bloqueado mostra 🔲 + "???"; terreno construído mostra o emoji e nome reais da construção.
- Label e barra de progresso refletem `construções desbloqueadas / total` corretamente.
- Desbloquear uma conquista nova via `Achievements.checkAll()` (fluxo real do app, não uma chamada direta a `City.render()`) atualiza a grade da cidade automaticamente.
- `node --check` limpo em todos os arquivos tocados.

## Etapas puladas e por quê
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo confirmado: cidade é 100% derivada de conquistas já existentes, sem gamificação nova (sem XP/moeda por construção) — o valor é a visualização acumulada. Próximo: Software Architect.

### 2. Software Architect
Decisão: módulo novo e pequeno (`js/city.js`), não uma extensão de `achievements.js`, porque a Cidade tem sua própria superfície visual (aba/grid) e pode crescer independente (decoração, terrenos extras) sem inchar o módulo de conquistas. Nenhuma chave de storage nova — `CITY_BUILDINGS` é dados estáticos em `data.js`, e o estado "construído ou não" é sempre derivado de `Achievements.getUnlocked()` no momento do render, nunca duplicado. Acoplamento de atualização em tempo real feito via uma chamada direta (`City.render()` dentro do `if (changed)` de `checkAll()`), não via evento customizado — consistente com o padrão já usado por `Achievements.render()` no mesmo bloco. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Grid reaproveita o padrão visual de `.achievements-grid`/`.achievement-badge` (cards com emoji + título, estado "locked" com opacidade reduzida), mas com classes próprias (`.city-grid`/`.city-plot`) para não acoplar a Cidade ao CSS de Conquistas caso um dos dois precise evoluir separadamente depois. Barra de progresso reaproveita `.budget-bar-bg`/`.budget-bar-fill` já existentes (usadas no orçamento), em vez de criar uma terceira variante de barra de progresso no projeto. Próximo: Gamification Designer.

### 4. Gamification Designer
Confirmado: nenhuma recompensa numérica pela construção em si — a conquista já deu XP/moedas quando foi desbloqueada; a cidade é a "vitrine" do progresso, não uma segunda camada de recompensa (evita inflar a economia de XP sem necessidade). Ordem dos 13 terrenos no array segue a ordem natural de progressão de um jogador novo (primeira lição → primeira meta → primeiro investimento → streaks → trilhas completas → conquista final), para que a grade "conte uma história" visualmente da esquerda para a direita. Próximo: Financial Specialist.

### 5. Financial Specialist
Sem conteúdo financeiro novo nesta RFC — os 13 marcos já eram conceitos validados em conquistas anteriores (Renda Fixa completa, Renda Variável completa, reserva formada, primeiro investimento, etc.). Próximo: Database Engineer.

### 6. Database Engineer
Nenhuma tabela/chave nova necessária. Confirmado por leitura de `STORAGE_KEYS` (`js/storage.js`) e teste comportamental: `City.render()` lê apenas `Achievements.getUnlocked()` (que já usa `STORAGE_KEYS.ACHIEVEMENTS_UNLOCKED`) e as constantes estáticas `CITY_BUILDINGS`/`ACHIEVEMENTS`. Próximo: Backend Engineer.

### 7. Backend Engineer
Implementado `CITY_BUILDINGS` (13 entradas) em `js/data.js`, cada uma com `{ id, emoji, nome, descricaoConstruida }`, `id` sempre igual a um `id` já existente em `ACHIEVEMENTS`. Próximo: Frontend Engineer.

### 8. Frontend Engineer
Implementado `js/city.js` (`City.render()`/`init()`), `#tab-cidade` em `index.html` (botão + painel com `#cityGrid`/`#cityProgressLabel`/`#cityProgressBar`), CSS `.city-grid`/`.city-plot(.built/.locked)` em `css/style.css`, hook em `App.init()` e em `Achievements.checkAll()`. Nenhuma mudança em `js/tabs.js` foi necessária — a navegação por abas já é 100% genérica via `data-tab`/`.tab-panel`. Próximo: Cyber Security Specialist.

### 9. Cyber Security Specialist
Sem superfície de risco nova. `title`/`innerHTML` do grid interpolam apenas `descricaoConstruida`/`descricao`/`emoji`/`nome`, todos strings estáticas de `data.js` (mesmo padrão já usado, sem escaping, por `Achievements.render()`) — nenhum dado de usuário é interpolado. Nenhum achado.

### 10. QA Engineer
Testado via execução real do código (Node + `vm.runInContext`, mesmo harness usado nas RFCs anteriores), carregando `data.js`/`storage.js`/`achievements.js`/`city.js` de fato:
- Confirmado: as 13 entradas de `CITY_BUILDINGS` têm `id` correspondente em `ACHIEVEMENTS` e uma função real em `Achievements.CHECKERS` (nenhuma faltando dos dois lados).
- Confirmado: com nenhuma conquista desbloqueada, a grade mostra "???"/🔲 em todos os terrenos e a barra/label mostram `0/13`.
- Confirmado: desbloqueando 3 conquistas manualmente (`primeira_licao`, `streak_7`, `primeiro_certificado`), a grade mostra corretamente "Casa"/"Banco"/"Biblioteca" e o label/barra atualizam para `3/13` (23%).
- Confirmado: chamando `Achievements.checkAll()` pelo fluxo real (sem tocar `City.render()` diretamente) — com `LESSON_LOG` populado para satisfazer o checker real de `primeira_licao` — a conquista é desbloqueada pelo checker de verdade E a grade da cidade se re-renderiza automaticamente (mostra "Casa" sem nenhuma chamada manual), confirmando o hook em `checkAll()`.
- `node --check` limpo em `js/city.js`, `js/achievements.js`, `js/app.js`, `js/data.js`.

### 11. Documentation Specialist
`ROADMAP.md` e `CHANGELOG.md` atualizados marcando Cidade Financeira como concluída (v1.23.0) dentro da Etapa 3.
