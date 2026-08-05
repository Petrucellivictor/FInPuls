# RFC-013: Consolidação de abas (revisão de usabilidade)

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário — auditoria de usabilidade das 14 abas)
- **Agentes envolvidos**: Product Owner, UX/UI Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
"Algumas abas podem estar sendo inúteis, revise e enxugue para melhor experiência do usuário." Auditoria das 14 abas (conteúdo real de cada uma, não suposição) encontrou 2 candidatas claras a remoção/fusão — não por serem ruins, mas por não terem substância própria hoje — e uma ambiguidade de nome entre duas abas parecidas.

## Objetivo
Reduzir de 14 para 12 abas sem perder nenhum conteúdo real, e desambiguar nomes que uma pessoa nova confundiria.

## Achados da auditoria (evidência, não suposição)
| Aba | Achado |
| --- | --- |
| **Educação** (`tab-educacao`) | Sem módulo JS dedicado — só 2 cards estáticos (tabela investir x não investir, texto sobre consciência de classe) que **o próprio conteúdo já manda o usuário pra outro lugar** ("aprenda na aba Aprender", "acompanhe na aba Mercado"). Zero interatividade própria. |
| **Notícias** (`tab-noticias`) | `js/news.js` é uma curadoria estática de 5 itens fixos, sem busca ao vivo — o próprio código já se descreve como provisório ("Para notícias 100% ao vivo, conecte uma API... `fetchLiveNews()`"). A aba mais "parada" do app. |
| **Investimentos** vs **Ações & FIIs** | Nomes parecidos, propósitos bem diferentes (catálogo educativo de tipos de investimento x controle real da própria carteira) — risco real de confusão só pelo nome, mesmo com conteúdo distinto. |

As outras 11 abas (Início, Simulador, Carteira, Aprender, Desafios, Cidade, Perfil, Mercado, Avançado, Ações & FIIs, Biblioteca) têm módulo JS próprio, dados substanciais e função clara e não-redundante entre si — **nenhuma delas está sendo removida ou alterada** nesta RFC.

## Benefícios
Menos abas competindo por espaço na navegação (reforça o RFC-009, que já lida com a rolagem horizontal de 14 abas em celular) sem perder nenhuma informação — os 2 conteúdos "sem casa própria" ganham uma casa que já existe e faz sentido pra eles.

## Impacto
- `index.html`: remove os botões de aba `educacao`/`noticias` e os painéis `#tab-educacao`/`#tab-noticias`. O card `#newsCard` (com `News.js` intacto) passa a viver dentro do painel `#tab-mercado`, como uma seção nova "📰 Notícias que Impactam sua Economia". Os 2 cards estáticos de Educação passam a viver dentro do painel `#tab-investimentos`, ao final. Nenhuma mudança em `js/news.js` — o módulo continua montando no mesmo `id`, só o `id` mudou de painel-pai.
- Botão "📊 Investimentos" renomeado para "📊 Guia de Investimentos" (mesmo texto já usado no `<h2>` interno), pra desambiguar de "📈 Ações & FIIs".

## Dependências
Nenhuma.

## Critérios de aceite
- 12 abas no total (eram 14).
- Notícias e o conteúdo de Educação continuam 100% acessíveis (só em outro lugar), sem perder nenhum texto.
- `News.init()`/`News.render()` continuam funcionando sem nenhuma mudança de código — só de localização no DOM.
- Nenhuma referência quebrada a `data-tab="educacao"`/`"noticias"` em nenhum lugar do app (JS, links internos).
- Teste visual real confirma as 12 abas funcionando, o card de notícias dentro de Mercado, e os cards de educação dentro de Investimentos.

## Etapas puladas e por quê
- **Software Architect/Backend/Database/Gamification/Financial/Security Specialist**: mudança puramente de organização de UI, sem lógica nova, sem dado novo, sem risco de segurança.
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Decisão: fundir em vez de excluir — o conteúdo de ambas as abas tem valor real (a tabela investir x não investir e o texto de consciência de classe são bons; a curadoria de notícias, mesmo estática, orienta o usuário), só não merecia uma aba própria. `Investimentos`/`Ações & FIIs` mantidos como abas separadas (propósitos realmente diferentes), só com o nome do botão desambiguado.

### 2. UX/UI Designer
Notícias entra em Mercado por afinidade de tema (mercado/indicadores/notícias econômicas já vivem juntos mentalmente pro usuário) — como a ÚLTIMA seção do painel, não a primeira, já que os indicadores em tempo real são o conteúdo principal daquela aba. Educação entra em Investimentos pela mesma lógica de afinidade (conteúdo educativo estático sobre investir).

### 3. Frontend Engineer
Implementado: remoção dos 2 botões/painéis, realocação do `#newsCard` para dentro de `#tab-mercado`, realocação dos 2 cards de educação para dentro de `#tab-investimentos`, renomeação do botão de Investimentos. Nenhuma mudança em `js/*.js`.

### 4. QA Engineer
Testado via Playwright + Chromium real: 12 abas no menu (eram 14), `noticias`/`educacao` confirmados ausentes de `data-tab`; card de notícias confirmado dentro de `#tab-mercado` com conteúdo real renderizado (`News.render()` funcionando sem nenhuma mudança de código); conteúdo de educação confirmado dentro de `#tab-investimentos`; botão renomeado para "📊 Guia de Investimentos". Balanço de tags confirmado (12 `<section>`/12 `</section>`, 12 botões/12 painéis). Regressão: refeito o fluxo de celebração de lição (RFC-008) — zero erros de console, comportamento idêntico. Zero erros de console/página em toda a auditoria.

### 5. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados (v1.32.0).
