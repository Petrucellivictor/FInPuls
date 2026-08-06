# RFC-019: Cidade Financeira — Fase 3 (patrimônio físico: imóveis e luxo)

- **Status**: concluída
- **Prioridade**: alta (continuação direta do RFC-017/018, pedida pelo usuário)
- **Agentes envolvidos**: Product Owner, Software Architect, Financial Specialist, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
Continuação do simulador de vida da Cidade Financeira (RFC-017 Fase 1, RFC-018 Fase 2). Fase 3 implementa o "Mercado Imobiliário" e o "Sistema de Luxo" do spec original, unificados num único catálogo (`CITY_LIFE_ASSETS`) porque mecanicamente são a mesma coisa: comprar um bem com patrimônio simulado, que passa a gerar manutenção mensal (e, em alguns casos, aluguel) e valoriza/deprecia toda semana.

## Objetivo
6 bens compráveis (3 imóveis, 3 itens de luxo) com efeito semanal real no orçamento (manutenção/aluguel) e no patrimônio (valorização/depreciação) — e uma lição concreta do spec original: "as pessoas percebem que riqueza não é aparência" — carros sempre depreciam e têm parte do preço em "status", nunca em valor de revenda; imóveis não têm esse ágio e tendem a valorizar.

## Motivação
Pedido do usuário, continuando o mesmo spec. Faltavam 2 das 7 partes ainda pendentes do plano original (registradas no ROADMAP desde a Fase 1) — essa RFC entrega as 2 juntas por serem mecanicamente idênticas.

## Benefícios
Introduz o atributo ⭐ Status Social (do spec original) de um jeito concreto — ligado a compras reais, não um número solto; ensina na prática a diferença entre "preço pago" e "valor de revenda" (o ágio de status nunca volta), e entre ativo que valoriza (imóvel) e ativo que deprecia (veículo).

## Impacto
- **`js/data.js`**: `CITY_LIFE_ASSETS` (6 bens: `bicicleta`, `carro_popular`, `carro_luxo`, `terreno`, `casa_propria`, `apartamento_alugado` — cada um com `custo`, `valorInicial` [valor de revenda logo após a compra — igual ao custo pra imóveis, menor que o custo pra itens de luxo, refletindo o ágio de status], `manutencaoMensal`, `aluguelMensal`, deltas de status/felicidade/saúde). `WEEKLY_ECONOMIC_SCENARIOS` ganha `imovelValorizacaoPct` por cenário; depreciação de veículo é uma constante fixa (`VEICULO_DEPRECIACAO_PCT_SEMANA`), não depende do cenário — carro deprecia até em boom. 1 conquista nova (`primeiro_bem_cidade`).
- **`js/citylife.js`**: `comprarBem()` (deduz do patrimônio só o ágio `custo - valorInicial` — comprar um bem de valor justo não reduz patrimônio, só converte forma; itens de luxo caros perdem uma fatia real no ato da compra), valorização/depreciação semanal aplicada dentro de `avancarSemana()` (ajusta `valorAtual` de cada bem possuído e soma a variação direto no patrimônio), manutenção somada às despesas fixas e aluguel somado à renda antes de calcular a sobra da semana. Novo atributo `status` (0-100) no estado.
- **`index.html`/CSS**: nova seção "🏠 Patrimônio Físico" (mesmo padrão visual da seção de Educação) e uma 4ª barra de atributo (⭐ Status Social).

## Dependências
RFC-017 (Fase 1), RFC-018 (Fase 2).

## Critérios de aceite
- Comprar um imóvel não reduz patrimônio (valor justo); comprar um item de luxo caro reduz patrimônio pelo valor exato do ágio.
- Manutenção mensal de todo bem possuído entra nas despesas da semana; aluguel de imóveis alugáveis soma à renda.
- Veículos sempre depreciam (mesmo em Boom); imóveis valorizam mais em cenários bons, ficam estáveis/levemente negativos em Crise.
- Status Social sobe (uma vez, no momento da compra) proporcional ao bem.
- Teste real (Node + Playwright): comprar cada um dos 6 bens, confirmar efeito de patrimônio na compra, avançar semanas e confirmar valorização/depreciação, confirmar despesas/aluguel entrando no cálculo da sobra.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: mesmo motivo das Fases 1/2 — só `localStorage`, sem esquema novo, sem deploy.
- **Gamification Designer**: reaproveita 100% os padrões já validados nas Fases 1/2 (efeito não-punitivo na decisão semanal, atributo com barra visual, conquista de marco) — sem decisão de design nova que justifique consulta.

## Registro por etapa

### 1. Product Owner
Uniu "Mercado Imobiliário" e "Sistema de Luxo" numa única Fase por serem mecanicamente idênticos (comprar bem → manutenção/aluguel semanal → valorização/depreciação semanal) — evita fatiar demais e criar 2 RFCs quase iguais. "Reputação" (item relacionado, mas conceitualmente distinto — confiabilidade/credibilidade/generosidade, ligado a acesso a financiamento/empresas maiores no spec original) fica fora, para uma fase futura própria.

### 2. Software Architect
`bensComprados` é um mapa `{ assetId: valorAtual }` (não um array de posições como `Stocks`) porque, na Fase 3, cada bem só pode ser possuído uma vez — suficiente pra rastrear valor corrente sem a complexidade de múltiplas posições do mesmo bem. Valorização/depreciação roda dentro do mesmo `avancarSemana()` que já sorteia o cenário, reaproveitando `randInRange()`.

### 3. Financial Specialist
Validou a distinção "custo pago vs. valor de revenda" para itens de luxo (o ágio de marca/status nunca é recuperável, refletido no `valorInicial` menor que o `custo`) e confirmou que depreciação de veículo deve ser constante e independente do cenário econômico (diferente de um investimento financeiro, a perda de valor de um carro por uso/idade não some numa alta de mercado). Confirmou que imóveis, sem esse ágio, tendem a acompanhar ou superar a inflação como classe de ativo real, com desempenho mais fraco (não necessariamente negativo) em crise.

### 4. Frontend Engineer
Implementado: `CITY_LIFE_ASSETS`/campos de cenário/conquista em `js/data.js`, lógica completa em `js/citylife.js`, seção nova + barra de Status em `index.html`/CSS.

### 5. QA Engineer
Testado via Node (harness real) + Playwright: comprar terreno (sem ágio, patrimônio inalterado) e carro de luxo (ágio grande, patrimônio cai exatamente o valor do ágio), avançar semanas e confirmar que o carro sempre deprecia (mesmo em cenário Boom simulado) e o imóvel valoriza mais em Boom do que em Crise, aluguel do apartamento somando à sobra semanal, manutenção de múltiplos bens somando nas despesas, Status subindo na compra. Zero erro de console.

### 6. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados; fases restantes (empresas com fluxo de caixa, reputação, isométrico, linha do tempo, relatório de temporada) continuam registradas.
