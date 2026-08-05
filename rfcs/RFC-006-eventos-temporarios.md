# RFC-006: Eventos temporários

- **Status**: concluída
- **Prioridade**: alta (segundo item da Etapa 3 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
Cinco janelas fixas no calendário, recorrentes todo ano (Semana do Bitcoin, Temporada de IR, Férias Fin+, Black Friday Fin+, Natal Fin+). Enquanto uma está ativa: aparece um card na Início com 2 missões especiais temáticas (+15 XP cada), todas as lições da trilha (financeira + Empreender) dão XP em dobro, e uma moldura exclusiva daquele evento fica disponível na Loja.

## Objetivo
Dar um motivo recorrente para o usuário voltar em datas específicas do ano, sem inventar um sistema paralelo de missões — reaproveitando os mesmos logs/checkers já usados pelas missões diárias e pelas conquistas.

## Motivação
Item pedido explicitamente pelo usuário na lista de 13 ideias de engajamento — segundo item da Etapa 3, escolhido depois da Cidade Financeira (RFC-005) por ordem de complexidade crescente dentro da própria Etapa 3.

## Benefícios
Cria estacionalidade real (o app "sabe que dia é hoje") sem exigir nenhuma infraestrutura nova. O multiplicador de XP vive num único ponto de decisão (`Events.applyMultiplier`), evitando duplicar lógica de recompensa em vários módulos.

## Impacto
Aditivo, com um ponto de atenção documentado abaixo (não é breaking, mas altera visualmente o valor de XP mostrado durante um evento):
- `SEASONAL_EVENTS` novo em `js/data.js` (5 eventos) e 5 novas molduras em `SHOP_ITEMS` com `eventoExclusivo`.
- `js/events.js` novo — módulo `Events` (`getActiveEvent`, `xpMultiplier`, `applyMultiplier`, `checkAwards`, `render`, `init`).
- `js/trail.js` e `js/business.js`: os 3 pontos onde o XP de uma lição é mostrado ou concedido (badge do nó da trilha, texto de conclusão, botão "Continuar" da Início) agora passam por `Events.applyMultiplier()` — **os três, juntos, sempre concordam entre si e com o que é de fato somado a `Learn.addXp()`**, para não repetir o bug de "XP mostrado ≠ XP salvo" já corrigido nesta sessão para o replay de lições.
- `js/profile.js` (`renderShop`): itens com `eventoExclusivo` só aparecem se o evento correspondente estiver ativo OU o item já tiver sido comprado antes.
- `App.init()`/`App.renderHome()` ganharam `Events.init()`/`Events.render()`.
- Nova chave `STORAGE_KEYS.SEASONAL_STATE`.

## Dependências
Nenhuma — não depende do RFC-005 nem de nenhuma outra Etapa.

## Critérios de aceite
- As 5 janelas de `SEASONAL_EVENTS` ativam corretamente na borda de início/fim e retornam `null` fora de todas elas (verificado nas 5, não só numa amostra).
- O XP mostrado ao usuário (badge do nó, texto de conclusão, botão "Continuar") é **sempre** o mesmo valor realmente somado por `Learn.addXp()` — nunca um número diferente do outro, com ou sem evento ativo.
- Fora de qualquer evento, `Events.xpMultiplier()` é `1` (nenhuma inflação silenciosa de XP quando não há evento).
- Cada missão especial é premiada **uma única vez por ocorrência anual** do evento (não repete ao rechecar, mas volta a ficar disponível na ocorrência do ano seguinte).
- Molduras exclusivas de evento só aparecem na Loja durante a janela do evento correspondente, ou se já compradas (nunca desaparecem depois de adquiridas).
- `node --check` limpo em todos os arquivos tocados.

## Etapas puladas e por quê
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo deliberadamente contido em 2 decisões, documentadas aqui para não virar débito técnico silencioso:
1. **Ranking semanal**: o pedido original menciona um "ranking semanal" durante eventos. Sem backend (mesma limitação já registrada na Etapa 0 do `ROADMAP.md` para IA financeira e push notifications), um ranking sincronizado entre usuários diferentes não é possível. Decisão: não construir uma segunda funcionalidade de liga só para eventos — quem quiser comparar XP ganho durante um evento com amigos já pode usar as Ligas locais/manuais existentes na aba Desafios (mesmo padrão que essas Ligas já resolvem para o placar geral). Registrado aqui, não implementado.
2. **XP em dobro**: aplicado só às lições da trilha (COURSE + BUSINESS_COURSE via `trail.js`/`business.js`), não a toda fonte de XP do app (desafios diários, missão semanal, metas, livros). Lições são a fonte de XP de maior volume e mais visível; dobrar todas as fontes exigiria tocar em mais 4 arquivos (`engagement.js`, `goals.js`, `books.js`) só para manter os textos de preview honestos, para um ganho de percepção pequeno perto do risco de regressão.
Próximo: Software Architect.

### 2. Software Architect
Decisão: módulo novo (`js/events.js`), não uma extensão de `js/engagement.js` — apesar de ambos lidarem com "missões", eventos sazonais têm um eixo de tempo diferente (janela de dias/semanas fixa no calendário, recorrente por ano) do eixo diário/semanal que `Engagement` já gerencia, e misturar os dois deixaria `ensureFreshState()` do Engagement mais difícil de raciocinar. Ponto de decisão central: `Events.applyMultiplier(baseXp)` é a ÚNICA função que decide o valor final de XP de uma lição — os call sites em `trail.js`/`business.js` chamam essa função uma vez por conclusão e reusam o mesmo resultado tanto para `Learn.addXp()` quanto para o texto exibido (variável `xpGanho`), em vez de cada um recalcular o multiplicador separadamente (o que arriscaria os dois lados divergirem se a lógica do multiplicador mudar no futuro). Estado de missões especiais usa uma "occurrence key" (`${eventId}-${ano}`) em vez de datas de expiração explícitas — mais simples e a virada de ano já reseta tudo de graça. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Card do evento na Início reaproveita `.card`/`.mission-row`/`.mission-title`/`.mission-xp` já existentes (mesmo padrão visual das missões diárias), com só uma borda dourada nova (`.seasonal-event-card`) para diferenciar visualmente um card sazonal de um card comum. Nenhum componente novo de UI. Próximo: Gamification Designer.

### 4. Gamification Designer
Confirmado: XP em dobro só nas lições (ver decisão do Product Owner acima) mantém o evento como um "bônus perceptível mas contido" — dobrar tudo inflaria a curva de progressão de forma difícil de reverter depois. As missões especiais dão XP fixo (+15, não dobrado — são recompensas diretas do evento, não "lições" no sentido do multiplicador) para manter previsibilidade. 5 eventos cobrem ~2 meses e meio do calendário no total (9+61+31+11+11 dias) sem se sobrepor entre si. Próximo: Financial Specialist.

### 5. Financial Specialist
Temas escolhidos por relevância financeira real: Semana do Bitcoin reforça Renda Variável/risco (missão exige lição do Nível 3 + 1 simulação); Temporada de IR (mar-abr, mesma época da declaração real no Brasil) incentiva organizar transações e metas; Férias reforça continuidade de estudo sem uma missão financeira "de época" específica; Black Friday mira consumo consciente (simular antes de gastar, perguntar ao POLVIn antes de compra grande); Natal reforça poupança/metas no fim do ano. Próximo: Database Engineer.

### 6. Database Engineer
Uma chave nova (`STORAGE_KEYS.SEASONAL_STATE`), formato `{ occurrenceKey, missionsAwarded: [] }` — mesmo padrão chave-valor simples já usado por `CHALLENGES_STATE`. Nenhuma tabela nova necessária. Próximo: Backend Engineer.

### 7. Backend Engineer
Implementado `js/events.js` completo: detecção de janela ativa por comparação de strings "MM-DD" (nenhum dos 5 intervalos cruza a virada do ano, então não precisa tratar wraparound), detecção de missão especial reaproveitando os mesmos logs já usados pelas missões diárias (`LESSON_LOG`, `SIMULATOR_LOG`, `POLVIN_LOG`, `Wallet.getTransactions()`, `Goals.totalContributedSince()`, `BOOKS_COMPLETED`), e o guard de "uma vez por ocorrência anual". Próximo: Frontend Engineer.

### 8. Frontend Engineer
Implementado: card `#homeSeasonalEvent` na Início (`Events.render()`, chamado a partir de `App.renderHome()`); os 3 pontos de exibição/concessão de XP em `trail.js`/`business.js` passando por `Events.applyMultiplier()`; filtro de itens exclusivos em `profile.js` (`renderShop`). Próximo: Cyber Security Specialist.

### 9. Cyber Security Specialist
Sem superfície de risco nova. Todo o conteúdo interpolado em `innerHTML` (nome/descrição do evento e das missões) é estático, vindo de `data.js` — nenhuma entrada de usuário. Nenhum achado.

### 10. QA Engineer
Testado via execução real do código (Node + `vm.runInContext`, carregando `data.js`/`storage.js`/`events.js`/`trail.js` de verdade, com um relógio determinístico para simular datas diferentes sem depender do dia real):
- Confirmado: todas as 5 janelas de `SEASONAL_EVENTS` ativam corretamente nas bordas de início/fim, e retornam `null` no dia imediatamente antes/depois de cada uma.
- Confirmado: com um evento ativo (Semana do Bitcoin), `Events.applyMultiplier(30)` retorna `60`, e chamar `Learn.addXp()` com esse valor resulta exatamente em `60` no estado — sem evento ativo, o multiplicador é `1` e nada é inflado.
- Confirmado, na integração real com `Trail.finishLesson()` (não uma reimplementação — o teste chama o método de produção de verdade): com o evento ativo, o XP de uma lição do Nível 1 (base 20) é dobrado para 40, e o HTML da tela de conclusão mostra exatamente `"+40 XP"` — nunca `"+20 XP"` — batendo 100% com o que foi de fato somado a `Learn._xp`. Isso evita reintroduzir, numa forma nova, o mesmo tipo de bug de "XP mostrado ≠ XP salvo" já corrigido nesta sessão para o caso de replay de lição.
- Confirmado: a missão especial `btc_licao` é concedida ao detectar uma lição real do Nível 3 no `LESSON_LOG` (usando o id real da primeira lição de `COURSE.find(l => l.id === "nivel3")`, não um id inventado), soma +15 XP, e uma segunda chamada a `checkAwards()` não soma XP de novo (guard de ocorrência única funcionando).
- Confirmado: a moldura `frame_bitcoin` aparece na vitrine filtrada da Loja durante a Semana do Bitcoin, desaparece fora de qualquer evento, e continua aparecendo se já tiver sido comprada — mesmo fora da janela.
- Confirmado: `Events.render()` preenche o card com o nome do evento e "XP em dobro" quando há evento ativo, e limpa o container (`innerHTML = ""`) quando não há.
- `node --check` limpo em `js/events.js`, `js/data.js`, `js/storage.js`, `js/trail.js`, `js/business.js`, `js/profile.js`, `js/app.js`.

### 11. Documentation Specialist
`ROADMAP.md` e `CHANGELOG.md` atualizados marcando Eventos Temporários como concluído (v1.24.0) dentro da Etapa 3, com a decisão de escopo do ranking semanal (local/manual via Ligas, não sincronizado) registrada explicitamente.
