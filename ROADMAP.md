# Roadmap de melhorias — gamificação e engajamento

Backlog priorizado (chapéu de Product Owner) a partir de uma lista de 13 ideias trazida pelo usuário em 2026-08-05. Cada item foi classificado por **status** (o que já existe vs. o que é do zero) e organizado em **etapas** — a ordem reflete risco arquitetural, dependências entre itens e esforço, não a ordem em que foram pedidos.

## Etapa 0 — decisões de arquitetura (antes de codar)

Dois itens do pedido original não podem ser implementados como descrito sem mudar a arquitetura 100% client-side do projeto (ver README, seção "Fora do escopo"). Registrados aqui para decisão consciente, não para bloquear o resto do roadmap.

- **IA financeira conversacional** ("Tenho R$300/mês, onde investir?"): exigiria uma chave de API de LLM guardada em servidor — nunca pode ficar exposta no client. Não implementado agora. Versão intermediária viável na Etapa 1: expandir a base de palavras-chave do POLVIn (`ASSISTANT_FAQ`) para cobrir perguntas desse tipo com respostas educativas genéricas (não personalizadas). IA real fica condicionada a uma futura função serverless (Vercel/Supabase Edge Function), a ser avaliada com o DevOps Engineer.
- **Notificações inteligentes** enquanto o app está fechado: exigem um push server (Web Push). Versão viável sem infraestrutura nova, na Etapa 1: avisos do POLVIn (toast/banner) baseados em eventos reais, mostrados enquanto o app está aberto — "faltam 20 XP para o próximo nível", "sua sequência está em risco hoje". Push de verdade fica registrado aqui como item futuro.

## Etapa 1 — melhorar o que já existe (maior impacto, menor risco) — ✅ concluída (v1.18.0 + v1.20.0, RFC-001)

| Item pedido | Status hoje | O que mudou |
| --- | --- | --- |
| Sistema de níveis | ✅ Feito (v1.18.0) | `PLAYER_LEVEL_TITLES` trocado pela progressão temática de investidor (Iniciante → Poupador → Investidor → Estrategista → Trader → Mestre das Finanças → Lenda Financeira) |
| Conquistas | ✅ Feito (v1.18.0) | 4 conquistas novas: Renda Fixa completa, 50 simulações, 10 livros lidos, Amigo do POLVIn |
| Missões diárias "nunca iguais" | ✅ Feito (v1.20.0, RFC-001) | Pool de 7 → 12 desafios; seleção trocada por embaralhamento determinístico por dia (27 combinações distintas em 30 dias simulados, contra um padrão fixo antes) |
| Mercado em tempo real | ✅ Feito (v1.20.0, RFC-001) | Mais pares de moeda (GBP, ARS) e criptomoedas (BNB, XRP) — cotação de ações individuais continua fora do escopo (ver Etapa 0 do README, exige API paga) |
| Notificações do POLVIn (versão client-side) | ✅ Feito (v1.20.0, RFC-001) | Toast único por dia — "sentiu sua falta" (2+ dias sem atividade) > "streak em risco" (nada feito hoje) > "faltam X XP para o próximo nível" |

## Etapa 2 — novas mecânicas de conteúdo (esforço médio) — ✅ concluída (v1.21.0 + v1.22.0)

- ✅ **Simulador estilo jogo** (v1.21.0, RFC-002): "Simulador de Decisões" na aba Simulador — 4 cenários (bônus, herança, prêmio, 13º turbinado), cada um com 4 opções (2 de gasto, 1 investir, 1 poupança), revelando as 3 projeções "10 anos depois" para comparação, reaproveitando a Selic real já usada no comparador de investimentos.
- ✅ **Estante de livros + certificados** (v1.21.0, RFC-003): `js/books.js` virou uma estante — os 18 livros ganharam resumo (contado pelo POLVIn) + quiz de 2 perguntas; completar gera um certificado numa "parede de certificados" nova. A conquista `leu_10_livros` passou a exigir 10 livros *completados*, não só recomendados.
- ✅ **Histórias interativas dentro das aulas** (v1.22.0, RFC-004): a cada 3ª lição concluída na trilha financeira, uma história curta (5 no pool, cicladas sem repetir) com um personagem e um dilema financeiro — 2 escolhas, desfechos narrativos diferentes, sem XP direto.

## Etapa 3 — novas features maiores (mais esforço, mais risco de escopo) — ✅ concluída (v1.23.0 + v1.24.0 + v1.25.0)

- ✅ **Cidade Financeira** (v1.23.0, RFC-005): nova aba "🏙️ Cidade" com uma grade de 13 terrenos, cada um mapeado 1:1 a uma conquista já existente (primeira lição → Casa, primeira meta → Parque, primeiro investimento → Garagem, streak 7/30/100 → Banco/Empresa/Prefeitura, Renda Fixa/Renda Variável completas → Cofre/Bolsa de Valores, primeiro certificado → Biblioteca, primeiro passo empreendedor → Escritório, primeiro conto → Museu Histórico, nível 1 completo → Escola, trilha unificada completa → Monumento da Lenda Financeira). Zero estado novo — deriva 100% de `Achievements.getUnlocked()`, atualiza em tempo real via hook em `Achievements.checkAll()`.
- ✅ **Eventos temporários** (v1.24.0, RFC-006): 5 janelas fixas no calendário, recorrentes todo ano (Semana do Bitcoin, Temporada de IR, Férias PolvIn, Black Friday PolvIn, Natal PolvIn). Enquanto ativas: card com 2 missões especiais na Início, XP em dobro nas lições da trilha (financeira + Empreender), e uma moldura exclusiva na Loja. Ranking semanal sincronizado entre usuários fica de fora (mesma limitação de backend da Etapa 0) — quem quiser comparar XP ganho durante o evento com amigos já pode usar as Ligas locais/manuais existentes.
- ✅ **Modo carreira** (v1.25.0, RFC-007): reaproveita o objetivo de vida já escolhido no diagnóstico inicial (`LIFE_GOALS`/`profile.pessoal.objetivo`, 9 opções — cobrindo casa, carro, viagem/intercâmbio, investir, dívidas, reserva, renda passiva, aposentadoria e estudos/faculdade) em vez de duplicá-lo. Card novo na Início mostra as 4 lições de `COURSE` mais relevantes para aquele objetivo (`CAREER_PATHS`), o cofrinho já vinculado a ele, e uma dica de uso do Simulador — com opção de trocar de objetivo sem refazer o diagnóstico inteiro.

Com a Etapa 3 concluída, **as 13 ideias originais trazidas pelo usuário em 2026-08-05 estão todas endereçadas** — 11 implementadas de ponta a ponta, e 2 (IA financeira conversacional, notificações push de verdade) com uma versão client-side viável já entregue na Etapa 1 e a versão completa formalmente registrada na Etapa 0 como dependente de backend.

## Identidade visual e motion design (trilha separada, fora do backlog das 13 ideias)

- ✅ **Fase 1 — biblioteca de animações + celebração de lição + Início** (v1.27.0, RFC-008): primeira aplicação da nova filosofia de design (`.claude/agents/ux-ui-design-lead.md`). Biblioteca de animações reutilizável (`js/fx.js`/`css/style.css`), celebração de lição reconstruída (POLVIn comemorando, moedas voando, confete, brilho), botões elásticos em todo o app, e o card da Início virou uma cena com o POLVIn mergulhando trazendo uma moeda e uma fala dinâmica sobre o progresso real do jogador.
- ✅ **Fase 2A — Cidade Financeira: Fundo do Mar** (v1.29.0, RFC-010): a Cidade virou um cenário 2D animado de fundo do mar (bolhas, peixes, coral, areia, guia do POLVIn), com as mesmas 13 construções de sempre (RFC-005, sem regressão) numa fileira em zigue-zague em vez de grade, mais uma Loja do Fundo do Mar nova — 6 decorações cosméticas compráveis com moedas, sem afetar progresso.
- ✅ **Fase 2B — Guarda-roupa do POLVIn estilo POU** (v1.30.0, RFC-011): 6 cores novas (filtro CSS sobre a arte existente, sem asset novo), mesmo sistema de equipar já usado por acessórios/bandeiras/molduras. Loja do Perfil ganhou preview ao vivo + itens agrupados por categoria.
- ✅ **Rebrand: Fin+/FinPlus → PolvIn** (v1.35.0, RFC-015): nome do produto unificado com o do mascote (mais memorável). Novo wordmark no header sem o "+" (`Polv` + `In` em verde), título/README/documentação e todo o conteúdo em runtime atualizados. `CHANGELOG.md`, RFCs antigas e o nome do repositório no GitHub ficaram fora do escopo por decisão consciente (registro histórico e infraestrutura, respectivamente).
- **Fases 2C+ — demais abas** (Investimentos, Simulador, Carteira, Ações & FIIs, Desafios, Mercado, Notícias, Educação, Avançado, Biblioteca): redesenho completo pedido pelo usuário, uma ou poucas abas por vez — ainda não escopado em nenhuma RFC.

## Qualidade — responsividade e acessibilidade

- ✅ **RFC-009** (v1.28.0): revisão orientada a evidências (testada em 320-1440px com Playwright, não só lida no código) — cabeçalho compactado (3→2 linhas em celular, botões de backup movidos pro Perfil), indicador de scroll nas abas, 10 alvos de toque e 8 fontes pequenas corrigidos, 10 campos de formulário sem rótulo corrigidos, toasts com `aria-live`. Navegação por abas com 14 itens continua exigindo scroll horizontal em celulares (mitigado com um indicador visual, não eliminado) — uma reestruturação da navegação (menu "mais", reordenar por uso) ficaria para uma RFC própria se o usuário priorizar.
- ✅ **RFC-013** (v1.32.0): auditoria de usabilidade das 14 abas — "Educação" e "Notícias" não tinham substância própria (a primeira só apontava pra outras abas, a segunda era uma curadoria estática de 5 itens). Conteúdo de ambas preservado, mesclado em Investimentos e Mercado respectivamente. App passa de 14 para 12 abas, ajudando também a rolagem horizontal em celular do RFC-009.
- ✅ **RFC-014** (v1.34.0): gap encontrado depois do RFC-009 — o diagnóstico inicial e o quiz de lição (as 3 trilhas) não tinham rolagem interna em celular, deixando o botão de continuar inalcançável quando o conteúdo era mais alto que a tela. Corrigido nos 2 lugares (`.onboarding-card`, `.quiz-box`), testado em viewport real de celular.

## Desbloqueio progressivo por nível

- ✅ **RFC-012** (v1.31.0): a aba Ações & FIIs (registro de posições/dividendos) fica bloqueada até concluir a trilha de Renda Variável (Nível 3), e a aba Avançado (carteiras-modelo, calculadoras, glossário avançado) até concluir o Nível 1 · Fundamentos — ou já nascem destravadas se o diagnóstico inicial classificou a pessoa como intermediária/avançada. Abas nunca somem do menu, só ficam marcadas (🔒) com uma prévia explicando o requisito; ao desbloquear, um aviso específico da ferramenta aparece na hora ("Parabéns! Você concluiu Renda Variável e desbloqueou o rastreador de Ações & FIIs."). Mais ferramentas/abas podem entrar nessa lista depois, uma leva por vez.

## Dados de mercado e simulador em tempo real

- ✅ **RFC-016** (v1.37.0): cotação automática de ações/FIIs individuais via [brapi.dev](https://brapi.dev/) (4 tickers de teste sem cadastro — PETR4, MGLU3, VALE3, ITUB4 — e qualquer ticker com um token gratuito), revisitando uma decisão antiga documentada no próprio código (`js/stocks.js`) de que isso não era viável sem API paga — o pressuposto mudou. A "Rentabilidade estimada" do simulador de juros compostos (`#simTaxa`) deixa de ser um "12" fixo no HTML e passa a vir preenchida com a Selic real (via `Market`/BCB), sempre editável pra simular outro cenário — e um bug de ordenação de inicialização (o comparador nunca era re-renderizado quando a cotação da Selic chegava) foi corrigido junto.

## Expansão das trilhas de conteúdo (rumo a ~300 lições cada)

Sem um blueprint modular fixo pré-definido (ver README, "Roadmap sugerido", item 0) — cada Onda é investigada e proposta a partir do conteúdo já publicado (lacunas pedagógicas, termos citados sem contexto, níveis proporcionalmente mais fracos). Registro por Onda (detalhe de cada uma em `CHANGELOG.md`):

- ✅ **Ondas 1-8** (v1.13.0 a v1.36.0): expansão por **retrofit** — lições já existentes nas 3 trilhas (financeira, história, Empreender) elevadas ao padrão de 10 perguntas/lição, e onde entrou lição nova (ex.: Onda 3/5), sempre **anexada ao final** de um nível já existente, nunca inserida no meio de uma trilha.
- ✅ **Onda 9 — primeiro nível genuinamente novo, e primeira inserção no MEIO de uma trilha** (v1.47.0, RFC-028): a trilha "Brasil: História & Economia" ganhou `hnivel_imperio` ("Independência, Corte e Império", cobrindo 1808-1888), inserido entre `hnivel1` (Colônia) e o antigo `hnivel2` (Café/Vargas) para preservar a leitura cronológica — de **4→5 níveis, 9→12 lições**. A partir desta Onda, "Onda" deixa de significar só retrofit: passa a incluir conteúdo genuinamente novo, inclusive inserido no meio de um array de trilha já publicado (não só anexado ao final). Essa mudança de padrão expôs um bug real de destravamento sequencial (`Trail.isUnlocked`/`Business.isUnlocked` dependiam de posição relativa, não de contagem de lições concluídas) — encontrado pelo QA Engineer e corrigido na mesma RFC, generalizando o critério para qualquer Onda futura que insira conteúdo no meio de qualquer uma das 3 trilhas (ver `CHANGELOG.md`, entrada "Corrigido" da v1.47.0).
- ✅ **Onda 10 — fecha o vácuo cronológico de 1945 a 1963** (v1.48.0, RFC-029): a trilha "Brasil: História & Economia" ganhou `hnivel_jk` ("Redemocratização, JK e a véspera de uma crise institucional, 1945-1963"), inserido no índice 3 do array, entre `hnivel2` e `hnivel3`, preenchendo o gap que a própria Onda 9 já tinha sinalizado (`h3_1` citava "regime militar (1964–1985)" sem a trilha nunca ter explicado como ele começou) — de **5→6 níveis, 12→15 lições**. Recorte cronológico deliberado: o nível para explicitamente em 1963, antes dos eventos de março-abril de 1964, cujo mérito/legitimidade fica para uma Onda futura própria com processo de revisão mais cuidadoso; a última lição fecha com um gancho neutro em vez de qualificar o desfecho. Testado ao vivo pelo QA Engineer via Chrome DevTools Protocol (Node indisponível no ambiente), fluxo completo de quiz sem erro de console (ver `CHANGELOG.md`, v1.48.0). QA também relatou, fora do escopo desta Onda, um bug crítico pré-existente (herdado da RFC-027): com `SUPABASE_URL` vazio, o app inteiro fica bloqueado atrás da tela `#cloudUnavailableScreen` para qualquer sessão nova — vale uma RFC de correção própria antes do próximo deploy.
- ✅ **Onda 11 — trilha "Empreender" ganha conteúdo genuinamente novo pela primeira vez** (v1.49.0, RFC-030): a trilha citava "modelo de negócio" duas vezes (`e1_1`, `e1_2`) sem nunca ter ensinado o que isso significa, e não tinha nenhum conteúdo comercial/marketing. `enivel_modelo` ("Modelo de negócio: validando a ideia e conquistando os primeiros clientes") foi inserido no índice 1 de `BUSINESS_COURSE`, entre `enivel1` e `enivel2` — de **5→6 níveis, 15→18 lições**. Mesma decisão de nomenclatura já usada nas Ondas 9/10: o nível novo não usa o prefixo "Nível N" no título, para não obrigar renumerar `enivel2`-`enivel5` (conteúdo já publicado). Zero sobreposição com `e1_3` (ponto de equilíbrio/margem/capital de giro apenas referenciados, nunca recalculados) e zero menção a regimes tributários específicos além de uma frase de transição neutra no fechamento da última lição. Testado ao vivo pelo QA Engineer via Chrome DevTools Protocol (Node indisponível no ambiente), incluindo lição reprovada sem recompensa e energia zerada bloqueando início de lição, gap residual de destravamento confirmado do tamanho esperado, zero erro de console (ver `CHANGELOG.md`, v1.49.0).
- ✅ **Onda 12 — trilha financeira "Do Zero ao Avançado" ganha a taxonomia de risco completa** (v1.50.0, RFC-031): a primeira Onda a tocar `COURSE` desde que a série começou (Ondas 9-11 focaram História e Empreender). Diferente das Ondas 9-11, não insere nível novo — expande `nivel4` ("Diversificação e Risco"), o nível proporcionalmente mais fraco da trilha (5 lições contra 20-22 dos vizinhos), com 3 lições apendadas ao final, após `dr_03`: `dr_04` (risco de liquidez, 4ª categoria nomeada da família de risco já ensinada), `dr_05` (Value at Risk, até então definido só no dicionário do mercado, com a ressalva verificada via `WebSearch` de que VaR não é garantia de perda máxima absoluta) e `dr_06` (alocação de ativos por horizonte de tempo). `nivel1`, `nivel2`, `nivel3`, `nivel5`, `nivel6` e as 5 lições pré-existentes de `nivel4` permanecem 100% intactos — `nivel4` passa de **5→8 lições**, e a trilha financeira de **93→96 lições** (6 níveis: 35+20+22+8+5+6). Nesta mesma Onda, corrigida a contagem incorreta "67 lições" que constava no README/`CHANGELOG.md` desde antes desta RFC (o número real já era 93, não 67) e a referência circular vazia ao "blueprint modular" (ver correção acima). Testado ao vivo pelo QA Engineer via Chrome DevTools Protocol (Node indisponível no ambiente), fluxo completo de quiz das 3 lições, gap residual de destravamento confirmado do tamanho esperado, zero erro de console (ver `CHANGELOG.md`, v1.50.0).
- ✅ **Onda 13 — trilha financeira fecha as lacunas de Alfa, Drawdown e os usos de derivativos além do hedge** (v1.52.0, RFC-032): segunda Onda a tocar `COURSE`, depois da Onda 12. Também não insere nível novo — expande `nivel6` ("Mercado Avançado (Pro)") com 3 lições apendadas ao final, após `l6_6`: `l6_7` (Drawdown, métrica retrospectiva irmã do VaR de `dr_05`/Onda 12), `l6_8` (Alfa via CAPM, conectado a Beta já ensinado em `l6_1`, com a ressalva de que alfa histórico não garante repetição futura) e `l6_9` (especulação e arbitragem — os dois usos de derivativos que `l6_5` prometia no título mas nunca ensinava, além do hedge, com aviso explícito de risco de alavancagem). `nivel1`-`nivel5` e as 6 lições pré-existentes de `nivel6` permanecem 100% intactos — `nivel6` passa de **6→9 lições**, e a trilha financeira de **96→99 lições** (6 níveis: 35+20+22+8+5+9). Fórmulas de Alfa de Jensen (CAPM) e Maximum Drawdown verificadas via `WebSearch`. Testado ao vivo pelo QA Engineer via Chrome DevTools Protocol (Node indisponível no ambiente), fluxo completo de quiz das 3 lições, checagem de `Trail.isUnlocked()` na fronteira pós-inserção sem regressão, zero erro de console (ver `CHANGELOG.md`, v1.52.0). **Nota registrada por esta Onda**: com `nivel6` agora em 9 lições, `nivel5` ("Avançado", 5 lições) passa a ser o nível proporcionalmente mais fraco da trilha financeira — candidato prioritário de uma Onda futura.
- ✅ **Onda 14 — trilha financeira ganha análise técnica de indicadores e valuation por fluxo de caixa descontado no Nível 5 "Avançado"** (v1.53.0, RFC-033): terceira Onda a tocar `COURSE`, depois da Onda 12 e da Onda 13. Também não insere nível novo — expande `nivel5` ("Avançado"), o nível apontado como candidato prioritário desde a nota da própria Onda 13, com 3 lições apendadas ao final, após `av_03`: `av_04` (RSI, oscilador de momentum que a trilha já citava como distrator em `l5_2` sem nunca ensinar), `av_05` (candlestick, anatomia da vela, sem padrões de reversão nomeados) e `av_06` (fluxo de caixa descontado/DCF, valor presente de fluxos futuros, contrastado em prosa com os múltiplos comparativos de `l5_2` sem reensiná-los). `nivel1`-`nivel4`, `nivel6` e as 5 lições pré-existentes de `nivel5` permanecem 100% intactos — `nivel5` passa de **5→8 lições**, e a trilha financeira de **99→102 lições** (6 níveis: 35+20+22+8+8+9). 3 novas entradas no `GLOSSARY` (RSI, Candlestick, DCF; 39→42 entradas). Termos técnicos verificados via `WebSearch`. Testado ao vivo pelo QA Engineer via Chrome DevTools Protocol (Node/Python indisponíveis no ambiente), fluxo completo de quiz de `av_04` via DOM real, checagem de `Trail.isUnlocked()` em múltiplos cenários sem regressão, zero erro de console (ver `CHANGELOG.md`, v1.53.0). **Nota registrada por esta Onda**: `nivel4` e `nivel5` ficam **empatados em 8 lições cada** como os níveis proporcionalmente mais enxutos da trilha financeira — ambos candidatos igualmente prioritários de uma Onda futura, já que `nivel6` (9) e os demais (20-35) seguem à frente.
- ✅ **Onda 15 — trilha "Brasil: História & Economia" volta a receber conteúdo, com a Guerra do Paraguai** (v1.54.0, RFC-034): quinta Onda a tocar `HISTORY_COURSE`, depois das Ondas 9 e 10 — a trilha ficou pausada desde então enquanto as Ondas 11-14 avançaram Empreender e Financeira, e havia ficado a mais atrasada das 3 em termos absolutos (15 lições). Rebalanceamento deliberado: em vez de insistir pela 4ª vez seguida na trilha financeira (que teria 3 Ondas consecutivas), o Product Owner voltou a atenção para História, mas **sem reabrir o tema 1964-1985** — mesma pausa reafirmada desde as Ondas 9/10, sem nenhum fato novo que a justifique reabrir. Expande `hnivel_imperio` ("Independência, Corte e Império") com 3 lições apendadas ao final, após `himp_3`: `himp_4` (a Guerra do Paraguai, 1864-1870, causas e Tratado da Tríplice Aliança), `himp_5` (financiamento da guerra via apólices e empréstimos ingleses, e a inflação resultante — conectando em prosa com o mesmo padrão "dívida→inflação" já ensinado em `himp_2`/`hjk_2`/`h3_1`) e `himp_6` (legado institucional — libertação de escravizados que serviram, fortalecimento político do Exército — parando **explicitamente em 1889**, sem qualquer menção direta ou indireta a 1964/regime militar, verificado palavra por palavra pelo QA Engineer). `hnivel1`, `hnivel2`, `hnivel_jk`, `hnivel3`, `hnivel4` e as 3 lições pré-existentes de `hnivel_imperio` permanecem 100% intactos — `hnivel_imperio` passa de **3→6 lições**, e a trilha história de **15→18 lições**. Testado ao vivo pelo QA Engineer via Chrome DevTools Protocol, incluindo fluxo de erro→variante, lição reprovada sem progresso indevido, e checagem de `Trail.isUnlocked()` sem regressão (ver `CHANGELOG.md`, v1.54.0). **Gap alternativo considerado e não escolhido nesta Onda**: `BUSINESS_COURSE` também tem termos citados sem contexto (tipos societários — LTDA/Sociedade Unipessoal/contrato social — citados repetidamente sem nunca ensinados como conteúdo dedicado; zero menção a propriedade intelectual/marca ou fontes de captação como investidor anjo/empréstimo PJ) — registrado aqui como próximo candidato de uma Onda futura em Empreender.

## Reformulação da trilha de aprendizado (RFC-035) — em andamento

Pedido do usuário em 2026-08-08 para reformular a mecânica da trilha (não o
conteúdo em si, que segue o registro por Onda acima), em fases pequenas e
validadas — mesma disciplina já usada nas Fases 2A/2B/2C de identidade
visual e nas Fases 1-6 da Cidade Financeira. Detalhe completo em
`rfcs/RFC-035-reformulacao-trilha-aprendizado.md`.

- ✅ **Fase 1 — energia máxima de 3 para 5** (v1.55.0): `ENERGY_MAX` sobe de
  3 para 5 em `js/energy.js`, decisão do Gamification Designer para reduzir
  a frustração do teto diário sem abandonar o gate de energia como
  mecânica de retenção. `ENERGY_COMBO` (bônus por 3 acertos seguidos numa
  lição) permanece 3, sem escalar junto. Ver `CHANGELOG.md`, v1.55.0.
- ✅ **Fase 2 — layout da trilha em zig-zag horizontal** (v1.55.0): troca do
  antigo caminho vertical sinuoso por um mapa de fases em "S" (blocos de
  `COLS` nós na horizontal + 2 na vertical, `COLS=5` desktop/`COLS=3`
  mobile), aplicada igualmente às duas trilhas (Aprender e Empreender),
  identidade "Conceito B" do UX/UI Designer. Ver `CHANGELOG.md`, v1.55.0.
- ✅ **Fase 3B — piloto do sistema de revisão periódica a cada 7 pontos,
  exclusivo da trilha Empreender** (v1.56.0): novo tipo de nó
  (`tipo: "revisao"`), ancorado por ID (nunca por posição) na 7ª lição que
  cobre, testado isoladamente em `BUSINESS_COURSE` (`revE_01`, 10 perguntas
  autorais) antes de generalizar — decisão do Gamification Designer de
  pilotar só em Empreender, por ser a trilha cujo mecanismo de contagem
  "7 pontos" (separado por fonte) já reflete fielmente o que vai para
  produção, ao contrário da aba Aprender (contagem unificada
  Financeira+História). `js/trail.js` (trilha unificada Aprender) **não
  foi tocado nesta fase**. QA encontrou 1 bug de conteúdo (variante da
  pergunta 9 testando um conceito diferente da base) — já corrigido antes
  do fechamento da fase. Ver `CHANGELOG.md`, v1.56.0.
- **Fase 3C — rollout do sistema de revisão para a trilha unificada
  Aprender (Financeira + História), em andamento (Onda de Revisão 1 de 4
  concluída, Ondas 2-4 pendentes).** Mais complexa que o piloto: lida com
  duas fontes de conteúdo intercaladas por nível (`COURSE`/`HISTORY_COURSE`,
  contagem "7 pontos" unificada já decidida pelo Software Architect na
  Fase 3A) e com o efeito colateral já registrado na RFC de que a revisão
  também conta para o gatilho de história interativa a cada 3 lições
  financeiras, sem filtro novo. O Software Architect mapeou as ~120 lições
  já publicadas na trilha unificada em **17 blocos de revisão possíveis**
  (`revU_01`-`revU_17`), fatiados em 4 Ondas de Revisão de 4-5 blocos cada,
  na mesma ordem cronológica/pedagógica em que o conteúdo foi publicado —
  cada Onda só começa depois que a anterior fecha QA sem ressalvas graves.
  - ✅ **Onda de Revisão 1 — blocos 1-4** (v1.57.0): `COURSE_REVIEWS` em
    `js/data.js` (`revU_01`-`revU_04`), cobrindo o Nível 1 "Fundamentos e
    Comportamento Financeiro" por completo (28 lições-fonte), todas
    ancoradas em `COURSE` (uniforme, sem mistura de fonte). `Trail.levels()`
    generalizado (`js/trail.js`) para clonar e inserir revisões
    independentemente em `COURSE` e `HISTORY_COURSE`, ambos consultando o
    mesmo `COURSE_REVIEWS`, sem nunca mutar os arrays canônicos — o caminho
    de inserção em `HISTORY_COURSE`, nunca exercitado em produção até aqui
    (o piloto da Fase 3B só provou `BUSINESS_COURSE`), foi validado com um
    teste dirigido antes desta Onda fechar, então a Onda 3 (1º bloco real
    ancorado em História) reaproveita um caminho já testado, não um caminho
    novo. QA aprovou sem ressalvas. Ver `CHANGELOG.md`, v1.57.0.
  - ✅ **Onda de Revisão 2 — blocos 5-8** (v1.58.0): 4 novas entradas em
    `COURSE_REVIEWS` (`revU_05`-`revU_08`), fechando o Nível 1 "Fundamentos e
    Comportamento Financeiro" (`revU_05`) e cobrindo boa parte do Nível 2
    "Renda Fixa" até `rf_14` (`revU_06`-`revU_08`) — 8 revisões publicadas no
    total. `revU_06` é o **primeiro bloco misto Financeira+História desta
    RFC** (2 lições de `HISTORY_COURSE` — `h1_1`/`h1_2`, economia colonial —
    misturadas com 5 de `COURSE`), ancorado e inserido em `COURSE`, com
    progresso roteado para `COURSE_PROGRESS` pela `fonte` do nível de
    inserção (não pela fonte de cada pergunta). **Nenhuma mudança em
    `js/trail.js` foi necessária** — o mecanismo genérico da Onda 1
    (`withReviews`) absorveu as 4 entradas automaticamente, confirmando que
    a generalização da Onda 1 estava correta desde o início. QA aprovou sem
    ressalvas, nenhum bug encontrado, incluindo teste dirigido em produção
    real do bloco misto. Ver `CHANGELOG.md`, v1.58.0.
  - **Onda de Revisão 3 — blocos 9-12, ainda não iniciada.** Fim do Nível 2
    + Nível 3 (Renda Variável) até `rv_19`; contém o bloco 9, a **primeira
    âncora real em `HISTORY_COURSE`** publicada como conteúdo.
  - **Onda de Revisão 4 — blocos 13-17, ainda não iniciada.** Níveis 4, 5, 6
    (Diversificação/Avançado/Pro) + fim de História; fecha a cobertura de
    tudo publicado hoje, incluindo mais 2 âncoras em `HISTORY_COURSE` e um
    caso real de inserção no meio de um nível.

## Cidade Financeira — jogo de simulação de vida

- ✅ **RFC-025 — aposentadoria, HUD de idade e Relatório de Fim de
  Temporada** (v1.46.0): fecha o loop infinito do ciclo semanal
  (RFC-017 a RFC-024) com um objetivo e um momento de celebração,
  reaproveitando 100% o contador de semanas já existente — sem sistema
  paralelo novo. Idade visível o tempo todo no mapa (HUD em anel
  dourado, `#cityGameAgeHud`), aposentadoria aos **45 anos** (18 anos
  iniciais + 1 ano a cada 12 semanas). O número final passou por uma
  reconciliação em duas etapas: o default original de 65 anos
  implicava 564 cliques em "Avançar semana" até o fim de jogo — o
  Gamification Designer propôs 40 (framing de aposentadoria
  antecipada/FIRE) pra cortar isso a um ritmo alcançável numa sessão
  casual, e o Financial Specialist ajustou pra 45 por 40 soar como
  promessa fácil demais mesmo dentro do próprio conceito FIRE (a
  maioria dos casos reais documentados fica entre 40 e 50, não nos 30-
  40 citados como extremo). Ao atingir a aposentadoria, o ciclo semanal
  para e o painel do Banco vira o Relatório de Fim de Temporada
  ("Legado da Sua Vida Financeira") — patrimônio final com contagem
  animada, bens/negócio/cursos, fala do POLVIn adaptada ao resultado
  (matriz patrimônio × bem-estar), confete e celebração no mapa (brilho
  dourado + "punch" de câmera, com fallback para `prefers-reduced-
  motion`). Nova conquista `aposentadoria_alcancada` (⚓ "Porto Seguro",
  badge + monumento "Farol do Porto Seguro") — sem XP/moeda, mesmo
  padrão das outras 2 pontes de conquista de Cidade, pra não abrir
  brecha de XP fácil num loop sem gate de energia. Botão "Nova
  Temporada" reseta só `STORAGE_KEYS.CITY_LIFE` (zero bônus de New
  Game+ — decisão didática deliberada). Corrige também, na mesma
  passada, o bug de migração de estado já registrado em "Bugs
  conhecidos" abaixo (`Achievements.CHECKERS` de Cidade lançando
  `TypeError` no boot para saves antigos).
- ✅ **RFC-024 — clima por cenário econômico e ciclo dia/noite** (v1.45.0):
  fecha um loop de um dado que já existia desde a Fase 1 (`corAgua` de
  cada cenário, RFC-017) mas nunca tinha uso visual — o mar do mapa
  passa a reagir à cor do último cenário sorteado, com transição suave, e
  cada categoria (Boom/Crise/Inflação Alta/Estável) ganhou 1 efeito de
  clima próprio (brilho dourado/chuva/névoa/nenhum). Ciclo dia/noite
  ambiente contínuo (4 fases com crossfade, ~4-5min por volta), incluindo
  as janelas do Banco/Escritório acendendo mais à noite — puramente
  decorativo, sem afetar nenhuma mecânica. Dívida técnica registrada: o
  PolvIn 3D (RFC-023) não escurece junto com o overlay 2D, por viverem em
  canvases separados sem ponte entre eles hoje.
- ✅ **RFC-023 — PolvIn 3D dentro do jogo 2D** (v1.44.0): o token jogável
  deixou de ser uma imagem plana e virou um personagem 3D modelado por
  geometria procedural (esfera + tentáculos articulados + olhos + óculos),
  com sombreamento toon/cel-shading — mapa e construções continuam 2D, a
  pedido explícito do usuário. Renderizado via Three.js num overlay
  transparente sincronizado por frame com a posição real do jogador
  (câmera/movimento/proximidade das 5 construções sem nenhuma mudança).
  Base pronta pra uma futura Personalização de Personagem (cor/acessório).
- ✅ **RFC-022, Fase 6 — mais construções, fim do painel legado** (v1.43.0):
  as últimas 4 seções que ainda viviam num card de dashboard "temporário"
  (Educação, Veículos, Imóveis, Emprego/Negócio) ganharam construções
  próprias no mapa — Universidade, Concessionária, Imobiliária e
  Escritório — seguindo o mesmo padrão proximidade→balão→diálogo provado
  na Fase 5. `#cityLifeLegacyPanel` foi removido: a aba Cidade não tem mais
  nenhum fallback em formato de card, só o mapa. `CityGame.BUILDINGS` virou
  uma lista genérica (não mais 1 construção hardcoded), preparada pra
  próximas construções sem duplicar código de proximidade/balão/diálogo.
  Zero regra econômica mudou. Fases futuras (ainda não escopadas): NPCs com
  diálogo próprio, e os sistemas mais amplos da visão de longo prazo do
  usuário (Quest/Weather/Audio Manager/Character Customization/World
  Events).
- ✅ **RFC-021, Fase 5 — fundação do motor de jogo 2D** (v1.42.0): mudança
  de direção pedida pelo usuário depois das Fases 1-4 — a Cidade
  virava um dashboard quando deveria ser um "jogo web" de verdade
  (termo interno adotado a partir daqui). PolvIn agora é um token
  jogável (Phaser 3 via CDN, sem build step) num mapa litoral, com
  câmera que segue o personagem e 1 construção interativa por
  proximidade (Banco) — que abre um painel de diálogo hospedando o
  MESMO ciclo semanal do `CityLife`, sem nenhuma mudança de regra
  econômica das Fases 1-4. Educação/Patrimônio/Negócio seguem num
  painel "legado" abaixo do mapa até ganharem suas próprias
  construções. Fases futuras (registradas aqui, não escopadas ainda):
  mais construções no mesmo padrão proximidade→balão→diálogo
  (Concessionária p/ carros, Universidade p/ cursos, Imobiliária p/
  imóveis, Escritório p/ negócio); depois, os sistemas mais amplos
  pedidos pelo usuário como visão de longo prazo — Quest System,
  Weather System (clima/dia-e-noite), Audio Manager, Character
  Customization, NPCs com diálogo próprio, eventos de mundo.
- ✅ **RFC-017, Fase 1** (v1.38.0): núcleo do ciclo semanal (1 semana = ~1 mês de vida). Novo estado próprio e persistente (`STORAGE_KEYS.CITY_LIFE`, separado da grade de 13 construções do RFC-005/010, que continua intacta) — a cada "avançar semana": sorteia 1 de 4 cenários econômicos fictícios (Boom/Crise/Inflação Alta/Estável, direção macroeconômica validada pelo Financial Specialist), mostra indicadores da simulação (claramente distintos dos dados reais da aba Mercado), credita salário, debita despesas fixas, e o jogador decide o que fazer com a sobra (reserva/renda fixa/ações/lazer) — sempre com o comparativo das 4 opções lado a lado, nunca subtraindo patrimônio já conquistado. Patrimônio/felicidade/saúde/disciplina são métricas paralelas, não tocam `COINS`/XP reais — só 2 conquistas de marco fazem essa ponte.
- ✅ **RFC-018, Fase 2** (v1.39.0): emprego, educação e catálogo de investimentos. 5 empregos com salário crescente (`CITY_LIFE_JOBS`), cada um exigindo um curso simulado ou um nível real da trilha Aprender — promoção aparece como banner (nunca bloqueia o ciclo, aceitar é opcional). 5 cursos que custam patrimônio simulado (`CITY_LIFE_COURSES`), cada um desbloqueando 1 emprego ou 1 opção de investimento. 4 opções de investimento novas (FIIs, ETFs, Criptomoedas, Ouro) somadas às 4 da Fase 1 — 2 delas exigem requisito (curso OU trilha real concluída, o mesmo padrão "múltiplos caminhos" do `js/progression.js`), sempre visíveis mesmo bloqueadas, com o requisito exato escrito. Direção dos retornos de cada ativo por cenário validada pelo Financial Specialist (corrigiu, por exemplo, que FIIs **caem** — não sobem menos — em Inflação Alta, por marcação a mercado).
- ✅ **RFC-019, Fase 3** (v1.40.0): patrimônio físico — mercado imobiliário e sistema de luxo unificados num só catálogo (`CITY_LIFE_ASSETS`, 6 bens), por serem mecanicamente idênticos. Comprar um imóvel de valor justo não reduz patrimônio (só converte dinheiro em ativo equivalente); comprar um item de luxo reduz exatamente pelo "ágio de status" (`custo - valorInicial`, nunca recuperável — carro de luxo perde R$50 mil só de ágio na saída da loja). Todo bem possuído soma manutenção mensal às despesas (e aluguel à renda, pros imóveis alugáveis) e valoriza/deprecia toda semana — imóveis conforme o cenário sorteado, veículos numa taxa fixa que deprecia mesmo em Boom (validado pelo Financial Specialist: perda por uso/idade não desaparece numa alta de mercado). Novo atributo ⭐ Status Social, subindo uma vez a cada compra.
- ✅ **RFC-020, Fase 4** (v1.41.0): empresas com fluxo de caixa e reputação — a primeira fase a dar uso real ao emprego "Empresário(a)" (Fase 2). 3 tipos de negócio (Cafeteria, Loja de Roupas, Consultoria), receita reagindo ao cenário econômico da semana, funcionários (0-5) aumentando receita potencial E despesa. Lucro/prejuízo real soma ao patrimônio toda semana; Reputação sobe em semana lucrativa, cai um pouco em prejuízo. Fechar o negócio não devolve o investimento de abertura — risco real de empreender, deliberadamente diferente da regra "sem penalidade" das decisões semanais de investimento (abrir empresa é uma aposta consciente, não uma alocação de sobra mensal).
- **Fases seguintes, ainda não escopadas em detalhe**: cenário isométrico animado (única peça de visual ainda pendente); linha do tempo dos 18 anos à aposentadoria e relatório de fim de temporada foram concluídos pela RFC-025 (ver entrada acima). Além disso, a visão de longo prazo do usuário segue não escopada: NPCs com diálogo próprio, Quest System, Audio Manager, Character Customization, World Events. Uma fase por vez, mesma disciplina das Fases 2A/2B/2C de identidade visual (RFC-008/010/011).

## Migração de armazenamento para Supabase — ✅ concluída (v1.51.0, RFC-027)

- ✅ **Conta obrigatória + Supabase como fonte de verdade dos dados** (v1.51.0, RFC-027): o usuário confirmou que queria a nuvem como fonte de verdade — toda conta precisa de login, os dados moram no Supabase, o navegador guarda só um cache local. Isso foi uma reversão deliberada do princípio "100% funcional sem conta" documentado no README e em RFCs anteriores (não um erro a corrigir, uma prioridade nova que superou a anterior). Entregue: gate de conta obrigatória no boot (4 telas novas — login/cadastro, colisão de sincronização, ambiente não configurado, reset de senha), colisão detectada por divergência real de conteúdo (não por mera presença — ver `CHANGELOG.md`, v1.51.0, "Corrigido"), e as correções de segurança da auditoria (XSS armazenado, SRI nos CDNs, senha mínima do cofre local 8+). Detalhe completo em `CHANGELOG.md` (v1.51.0) e no histórico completo em `rfcs/RFC-027-migracao-supabase-fonte-de-verdade.md`.
  - **Sequenciamento confirmado pelo usuário 2026-08-06**: essa migração só começaria depois que TODAS as fases da Cidade Financeira (acima) estivessem prontas — "o jogo" vem primeiro, a migração de dados vem depois.
  - **Sequenciamento invertido pelo usuário em 2026-08-07**: essa ordem foi trocada — a migração para Supabase (RFC-027) e a expansão das trilhas de conteúdo (Onda 9, RFC-028, ver seção acima) passaram a ter prioridade; a Cidade Financeira (RFC-026, em andamento) ficou pausada, a ser retomada depois. Essa inversão já foi executada — a Cidade Financeira segue pausada (RFC-026 em `wip:`) até ser retomada numa próxima sessão, não há contradição pendente a resolver aqui.
  - **Merge inteligente entre dispositivos** continua fora do escopo desta RFC (decisão explícita do Software Architect, item 7 da etapa dele) — já registrado no README, "Roadmap sugerido", item 2.

## Bugs conhecidos (backlog técnico)

Itens encontrados durante o desenvolvimento/QA de uma RFC, mas fora do escopo dela — registrados aqui em vez de ficarem só na conversa que os encontrou, até ganharem uma RFC própria de correção.

- ✅ **RESOLVIDO fora de RFC (2026-08-07)** — App inteiro inacessível por padrão: `SUPABASE_URL` vazio em `js/supabase-config.js` combinado com o gate de conta obrigatória (RFC-027) travava qualquer sessão nova atrás de uma tela terminal. Gravidade era **crítica** (herdado da RFC-027, commit `a534bdb`; encontrado pelo QA Engineer da RFC-029, corrigido pelo Orchestrator logo em seguida — correção pontual demais para justificar uma RFC própria: 1 valor de configuração + 2 comentários desatualizados, sem decisão de arquitetura envolvida).
  - **Onde**: `js/supabase-config.js` (linha 26-27) tinha `SUPABASE_URL = ""` vazio, enquanto `SUPABASE_ANON_KEY` já vinha preenchida com uma chave real. `Cloud.isAvailable()` retornava `false` (exige URL e chave truthy) → `App.ensureCloudAvailable()` (`js/app.js`, linha ~113) exibia `#cloudUnavailableScreen` — o "Gate 0" documentado no próprio `index.html` como tela terminal.
  - **Decisão tomada sobre (a) vs (b)** (as duas opções que este item deixava em aberto): **(a)** — a Project URL do Supabase não é segredo (mesmo status da `SUPABASE_ANON_KEY`, já documentada no próprio arquivo como "chave PÚBLICA... segura para o navegador"; a segurança real vem das políticas de RLS em `supabase/schema.sql`, não de esconder a URL/chave anônima). Preenchido com a URL real do projeto do usuário (`https://nfqwjmzzsuycmseyjwrr.supabase.co`).
  - **Correção**: `SUPABASE_URL` preenchida em `js/supabase-config.js`; comentário de cabeçalho do mesmo arquivo atualizado para não prometer mais um "modo 100% local" que deixou de existir desde a RFC-027.
  - **Validado ao vivo**: servidor estático (PowerShell `HttpListener`, Node/Python indisponíveis neste ambiente) + Chrome headless real via CDP — confirmado `Cloud.isAvailable() === true`, `#cloudUnavailableScreen` com classe `hidden`, e a tela real de criação de conta (`Oi, eu sou o POLVIn... Antes de começar, cria uma conta rapidinho`) renderizando no lugar da tela de erro, sem erros de console.
  - **`README.md` corrigido em seguida (2026-08-07, a pedido do usuário)**: cumpre o critério de aceite #8 da própria RFC-027 ("`README.md` deixa de descrever Supabase como 'opcional' e o app como '100% local, sem conta'"), nunca executado porque a RFC-027 pausou antes da etapa de Documentation Specialist. Reescritas as seções "Como usar", "Sincronização multiusuário com Supabase" (título perde o "(opcional)"), "Segurança e privacidade" e a árvore de arquivos — todas paravam de descrever conta/Supabase como opcionais.

- ✅ **RESOLVIDO na RFC-025 (v1.46.0)** — `Achievements.CHECKERS.primeiro_curso_cidade` pode lançar `TypeError` no boot (encontrado pelo QA Engineer durante o RFC-024, fora do escopo daquela RFC — confirmado pré-existente, `js/citygame.js`/`js/citylife.js` não tocam esse arquivo). Gravidade original: **média-alta**. Mantido aqui como histórico do achado; a correção aplicada foi validada ao vivo pelo QA Engineer da RFC-025, reproduzindo exatamente o cenário de reprodução descrito abaixo — zero erro de console, migração confirmada persistida no `localStorage`.
  - **Onde**: `js/achievements.js:63` lê `Store.get(STORAGE_KEYS.CITY_LIFE, { cursosComprados: [] }).cursosComprados.length` direto do `localStorage`, sem passar pela migração que `CityLife.getState()` faz (`js/citylife.js:44-59`) para preencher `cursosComprados`/`bensComprados`/`negocio`/`status`/`reputacao` quando ausentes de saves de fases anteriores.
  - **Por que quebra**: essa migração só existe no objeto em memória devolvido por `getState()` — nunca é persistida de volta via `setState()`. Se o `if_city_life` salvo no `localStorage` de um usuário real não tiver `cursosComprados` (save de antes da Fase 2/RFC-018, nunca reaberto na Cidade desde então), `Store.get` retorna o objeto salvo como está (o `default` do 2º argumento só vale quando a chave não existe) — `.cursosComprados` fica `undefined`, e `.length` lança `TypeError: Cannot read properties of undefined (reading 'length')`.
  - **Por que é média-alta e não só um detalhe da aba Cidade**: o stack trace passa por `app.js init() → Engagement.init() → Engagement.renderHome() → Achievements.checkAwards() → Achievements.checkAll()`, ou seja, roda no **boot da aplicação**, não só ao abrir a aba Cidade — para o usuário real cujo save antigo dispara essa condição, o erro pode interromper silenciosamente o resto da cadeia síncrona de boot antes que a pessoa toque em nada.
  - **Como reproduzir**: `localStorage.setItem("if_city_life", JSON.stringify({ semana: 3, ultimoCenarioId: "crise" }))` (sem `cursosComprados`) + um perfil válido qualquer (pra pular o onboarding) + recarregar a página.
  - **Correção sugerida (QA Engineer)**: (a) `CityLife.getState()` passar a persistir o patch de migração (`this.setState(state)` ao final do próprio método, não só devolver o objeto em memória) — resolve na raiz para qualquer consumidor futuro que leia `STORAGE_KEYS.CITY_LIFE` direto via `Store.get`; ou (b), mais local, os 3 checkers de Cidade em `achievements.js:63-65` (`primeiro_curso_cidade`, `primeiro_bem_cidade`, `primeiro_negocio_cidade`) chamarem `CityLife.getState()` em vez de `Store.get(STORAGE_KEYS.CITY_LIFE, ...)` direto, reaproveitando a migração já escrita.
  - **Implementado na RFC-025**: ambas as abordagens (a) e (b) foram aplicadas, não só uma — o Software Architect da RFC-025 determinou que não são redundantes (cada uma fecha uma janela de crash diferente; ver seção 2 da RFC-025 para o raciocínio completo).
  - **Donos**: Software Architect + Backend Engineer (dono de `js/citylife.js`/persistência) com Frontend Engineer em cópia (dono de `js/achievements.js`), via RFC-025.

- **Aberto** — 3 itens de segurança da auditoria da RFC-027 (Cyber Security Specialist) que dependem de configuração no painel do Supabase, fora do código deste repositório, e por isso não bloqueiam o fechamento da RFC. **Gravidade**: média (os dois primeiros) e baixa (o terceiro).
  - **Ligar "Confirm email"** (Authentication → Providers → Email): estava desligado no projeto real testado. Com ele desligado, `signUp()` devolve o erro literal "User already registered" para e-mail já cadastrado, e `Cloud.translateError` já traduz isso ao usuário — um oráculo de enumeração de contas. Ligar fecha esse oráculo sem exigir nenhum código novo (o ramo `needsConfirmation` já existe em `Cloud.signUp`, hoje código morto só porque a chave está desligada). Recomendação do Security Specialist: ligar. Sem dono formal no workflow atual — usuário ou DevOps Engineer.
  - **Travar a allow-list de Redirect URLs** (Authentication → URL Configuration) antes do primeiro deploy público: o fluxo de recuperação de senha usa a Site URL configurada no painel (`Cloud.resetPasswordForEmail` não passa `redirectTo` explícito). Se a allow-list ficar com `localhost` ou wildcards amplos demais em produção, aumenta a superfície de sequestro de link sem nenhum código mudar. Dono: DevOps Engineer, etapa 12 (ainda não rodou para esta RFC).
  - **Considerar Captcha (hCaptcha/Turnstile) e "Leaked Password Protection"** no painel do Supabase (Authentication → Policies), sem custo no plano gratuito — mitigam abuso de rate limit (há um bug documentado e aberto do próprio Supabase, issue pública `supabase/supabase#41947`, onde os limites configurados nem sempre são aplicados) e senhas já vazadas em bases públicas (checagem k-anonimity contra o HaveIBeenPwned). Dono: DevOps Engineer (configuração) + Frontend Engineer (widget do captcha no formulário, só se habilitado).
  - **Onde**: registrado na íntegra em `rfcs/RFC-027-migracao-supabase-fonte-de-verdade.md`, seção 7 (Cyber Security Specialist), achados 2, 3 e 7.

- **Aberto** — resposta correta da trilha `COURSE` quase sempre no índice 1 (achado do QA Engineer da RFC-031, pré-existente, não causado por essa Onda). **Gravidade**: baixa (não é um bug funcional, é um padrão de conteúdo que enfraquece o valor pedagógico do quiz).
  - **Onde**: campo `correta` de cada `pergunta` em `COURSE` (`js/data.js`), em toda a trilha, não só no nível/Onda testado.
  - **Descrição**: em `nivel4` (lições `dr_01`-`dr_06`), 60 das 60 respostas corretas são o índice `1` (segunda alternativa) — 58 das 60 já eram `1` antes da Onda 12, e as 3 lições novas desta Onda (`dr_04`/`dr_05`/`dr_06`, 60 perguntas+variantes) mantiveram o mesmo padrão. Um usuário atento poderia perceber a distribuição e "chutar sempre a segunda opção" para passar sem aprender o conteúdo.
  - **Como reproduzir**: `grep -o "correta: [0-9]*" js/data.js` no trecho de `dr_01` a `dr_06` (por volta das linhas 5665-7068) e observar a distribuição — o mesmo grep em outros níveis de `COURSE` deve ser feito para confirmar se o padrão é da trilha inteira ou só de `nivel4`.
  - **Sugestão (QA Engineer da RFC-031)**: fora do escopo de correção de conteúdo — registrar para o Gamification Designer avaliar uma passada de aleatorização do índice correto em todo `COURSE` (e, se o mesmo padrão existir, em `HISTORY_COURSE`/`BUSINESS_COURSE` também), preservando o texto de cada alternativa e só embaralhando a posição da correta (com o índice de `explicacao`/lógica de acerto ajustado junto).
  - **Dono sugerido**: Gamification Designer, para avaliar a mecânica; Frontend/Backend Engineer para implementar, se aprovado.

## Ideias futuras (fora do backlog original das 13 ideias)

(nenhuma pendente no momento — "Gating de conteúdo por nível" foi implementado como RFC-012)

## Como este roadmap é usado

Cada etapa é implementada em turnos/sessões subsequentes, seguindo o mesmo processo de commit + tag SemVer + entrada no `CHANGELOG.md` já em uso no projeto. Ideias trazidas depois deste roadmap devem ser encaixadas em uma das etapas acima (ou abrir uma nova), não implementadas soltas.
