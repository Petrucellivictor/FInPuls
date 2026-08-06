# RFC-016: Cotações de ações/FIIs e taxa de rendimento padrão em tempo real

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário)
- **Agentes envolvidos**: Product Owner, Software Architect, Financial Specialist, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
Pedido do usuário: "Utilize API's gratuitas disponíveis para mostrar em tempo real as cotações do mercado, taxas de rendimento, com opção de simular outro valor, mas como padrão sempre a atual." O pedido original também incluía uma migração de armazenamento para Supabase e um redesenho completo da aba Cidade — **essas duas partes ficaram fora desta RFC por decisão do usuário** (perguntado explicitamente: "por onde começar" → resposta: "dados de mercado em tempo real primeiro"), registradas no `ROADMAP.md` como próximas RFCs.

## Objetivo
1. Trazer cotação em tempo real para ações/FIIs individuais (hoje só cripto tinha isso).
2. Fazer a taxa de rendimento assumida no Simulador (juros compostos e comparador) usar a Selic **atual, buscada de verdade**, como padrão — mantendo sempre a opção de digitar outro valor para simular um cenário diferente.

## Motivação
Auditoria do código (não suposição) encontrou 2 lacunas concretas:
- `js/stocks.js` tem, desde a origem, uma decisão documentada no próprio cabeçalho do arquivo: "a maioria das cotações de ações/FIIs exige chave paga em APIs públicas, então optamos por 100% de controle manual." Isso era verdade quando foi escrito, mas a **brapi.dev** oferece hoje um plano gratuito real (15 mil requisições/mês, 4 tickers testáveis sem nenhum cadastro — PETR4, MGLU3, VALE3, ITUB4 — e mais tickers com um token gratuito) — o pressuposto que justificava a decisão mudou, e o pedido do usuário é a oportunidade de revisitá-la.
- `js/simulator.js` já sabia ler a Selic ao vivo (`currentSelic()`, lendo `Market.data.bcb`) para o comparador — mas o campo de "Rentabilidade estimada" do simulador de juros compostos (`#simTaxa`, `index.html`) tem um valor **estático de 12% embutido no HTML**, nunca atualizado pela Selic real. Pior: como `Simulator.init()` roda (`js/app.js:18`) **antes** de `Market.init()` (`js/app.js:35`), até o comparador mostra o valor de fallback (10,5%) na primeira renderização, e nada re-renderiza quando a cotação real chega — um bug de ordenação de inicialização que já existia, exposto agora ao tentar cumprir o pedido de "padrão sempre a atual".

## Benefícios
Ações/FIIs deixam de exigir atualização 100% manual da cotação (embora a opção manual continue existindo como fallback); o simulador para de mostrar um número assumido e desatualizado como se fosse realista, sem perder a flexibilidade de simular qualquer cenário.

## Impacto
- **`js/brapi-config.js` (novo)**: `BRAPI_TOKEN = ""` — mesmo padrão já usado em `js/supabase-config.js`: opcional, vazio por padrão, funciona sem ele (só com os 4 tickers de teste), funciona melhor com ele (token gratuito da própria brapi.dev).
- **`js/stocks.js`**: `fetchStockPrice(ticker)` novo (mesmo padrão de `fetchCryptoPrice`), chamando `brapi.dev/api/quote/{ticker}` (+ `?token=` se configurado). `refreshStockPrices()` novo, chamado em `init()` e após cada nova compra de ação/FII, alimentando o mesmo mapa `STOCK_PRICES` que já existia (`setPriceSilent`) — os componentes que já liam esse mapa (`positions()`) não mudam. Botão manual "🔄 Atualizar cotações" adicionado como reforço (rede lenta, ticker fora do plano gratuito, etc.).
- **`js/market.js`**: `refresh()` passa a disparar `document.dispatchEvent(new CustomEvent("market:updated"))` ao final — mesmo padrão de eventos já usado no app (`profile:updated`, `wallet:updated`, etc.).
- **`js/simulator.js`**: escuta `market:updated`; no primeiro disparo, se o usuário ainda não editou `#simTaxa` manualmente, preenche com a Selic atual (arredondada a 1 casa decimal) — e sempre reexecuta `compare()` (que já lia a Selic ao vivo, mas nunca era re-chamado quando ela chegava). Um botão "🔄 usar Selic atual" ao lado do campo permite voltar ao valor sugerido depois de simular outro cenário.
- **`index.html`**: remove o `value="12"` fixo de `#simTaxa` (passa a ser preenchido por JS); adiciona o botão de "usar Selic atual" e o hint de sugestão; adiciona script tag de `js/brapi-config.js`.
- **`README.md`**: nova seção curta explicando como obter um token gratuito da brapi.dev (mesmo padrão da seção já existente sobre o Google Client ID).

## Dependências
Nenhuma.

## Critérios de aceite
- PETR4/MGLU3/VALE3/ITUB4 atualizam cotação automaticamente mesmo sem token configurado.
- Sem token, outros tickers continuam funcionando por entrada manual, sem erro nem quebra.
- `#simTaxa` mostra a Selic real (não "12" fixo) assim que o Market carrega, mas se o usuário digitar outro valor, essa edição não é sobrescrita.
- Teste real (Node + Playwright) confirma o fluxo, não só leitura de código.

## Etapas puladas e por quê
- **UX/UI Designer/Gamification Designer/Database Engineer/DevOps Engineer**: mudança é de dados/lógica sobre telas já existentes, sem novo componente visual estrutural, sem esquema de banco novo, sem deploy.

## Registro por etapa

### 1. Product Owner
Escopo reduzido a "dados de mercado" por decisão explícita do usuário (a migração de armazenamento e o redesenho da Cidade ficam para RFCs futuras, registradas no ROADMAP). Decisão de reabrir a antiga escolha de "sem API de ações" documentada em `js/stocks.js`: era uma decisão correta para o contexto da época (sem free tier viável conhecido), não um erro — registrar isso explicitamente para não parecer que a decisão anterior foi descuidada.

### 2. Software Architect
Padrão de configuração opcional (`js/brapi-config.js`) replica exatamente `js/supabase-config.js` — consistência arquitetural, zero conceito novo para quem já conhece o projeto. Sincronização Market→Simulator via `CustomEvent` (`market:updated`) em vez de acoplamento direto — Simulator não precisa saber COMO o Market busca dados, só que terminou.

### 3. Financial Specialist
Selic é a âncora correta para o valor padrão do simulador de juros compostos: é a referência de "renda fixa sem risco" mais citada no próprio app (já usada no comparador e na poupança). Confirmado que o rótulo do campo ("Rentabilidade estimada, % ao ano") e o texto de ajuda já deixam claro que é uma estimativa editável, não uma promessa — a mudança de "12 fixo" para "Selic atual" só torna a estimativa padrão mais honesta, sem exigir nenhuma mudança de copy além do hint novo.

### 4. Frontend Engineer
Implementado: `js/brapi-config.js`, `fetchStockPrice`/`refreshStockPrices` em `js/stocks.js`, botão de refresh manual, evento `market:updated` em `js/market.js`, listener + auto-fill + botão "usar Selic atual" em `js/simulator.js`, ajustes em `index.html`.

### 5. Cyber Security Specialist
Token da brapi.dev, assim como a `anon key` do Supabase e o Client ID do Google já usados no projeto, fica necessariamente visível no código client-side (app 100% estático, sem servidor para escondê-lo) — risco aceito é de terceiros consumirem a cota gratuita de 15 mil requisições/mês do token, não de exposição de dados sensíveis (a API só devolve cotações públicas). Mitigação: documentado no README como o usuário (dono do projeto) deve monitorar o consumo, e o app já degrada graciosamente para entrada manual se a cota se esgotar ou o token for inválido — sem quebrar nada.

### 6. QA Engineer
Testado via execução real (Node + Playwright): `Stocks.fetchStockPrice("PETR4")` retorna um preço numérico real da API sem token configurado; `refreshStockPrices()` roda sem erro numa posição criada via `addTrade()`; disparar `market:updated` manualmente atualiza `#simTaxa` para a Selic mockada quando o campo não foi editado, e preserva um valor customizado quando foi; `compare()` volta a refletir a Selic ao vivo depois do evento. Zero erro de console/página.

### 7. Documentation Specialist
`README.md` (seção nova de configuração do token), `ROADMAP.md` e `CHANGELOG.md` atualizados; as 2 partes do pedido original ainda não feitas (migração para Supabase, redesenho da Cidade) registradas explicitamente no ROADMAP como próximas RFCs, com a decisão do usuário sobre "conta obrigatória, nuvem como fonte de verdade" já anotada para quando chegar a vez.
