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

## Cidade Financeira — jogo de simulação de vida

- ✅ **RFC-017, Fase 1** (v1.38.0): núcleo do ciclo semanal (1 semana = ~1 mês de vida). Novo estado próprio e persistente (`STORAGE_KEYS.CITY_LIFE`, separado da grade de 13 construções do RFC-005/010, que continua intacta) — a cada "avançar semana": sorteia 1 de 4 cenários econômicos fictícios (Boom/Crise/Inflação Alta/Estável, direção macroeconômica validada pelo Financial Specialist), mostra indicadores da simulação (claramente distintos dos dados reais da aba Mercado), credita salário, debita despesas fixas, e o jogador decide o que fazer com a sobra (reserva/renda fixa/ações/lazer) — sempre com o comparativo das 4 opções lado a lado, nunca subtraindo patrimônio já conquistado. Patrimônio/felicidade/saúde/disciplina são métricas paralelas, não tocam `COINS`/XP reais — só 2 conquistas de marco fazem essa ponte.
- ✅ **RFC-018, Fase 2** (v1.39.0): emprego, educação e catálogo de investimentos. 5 empregos com salário crescente (`CITY_LIFE_JOBS`), cada um exigindo um curso simulado ou um nível real da trilha Aprender — promoção aparece como banner (nunca bloqueia o ciclo, aceitar é opcional). 5 cursos que custam patrimônio simulado (`CITY_LIFE_COURSES`), cada um desbloqueando 1 emprego ou 1 opção de investimento. 4 opções de investimento novas (FIIs, ETFs, Criptomoedas, Ouro) somadas às 4 da Fase 1 — 2 delas exigem requisito (curso OU trilha real concluída, o mesmo padrão "múltiplos caminhos" do `js/progression.js`), sempre visíveis mesmo bloqueadas, com o requisito exato escrito. Direção dos retornos de cada ativo por cenário validada pelo Financial Specialist (corrigiu, por exemplo, que FIIs **caem** — não sobem menos — em Inflação Alta, por marcação a mercado).
- **Fases seguintes, ainda não escopadas em detalhe**: mercado imobiliário, abertura de empresas com fluxo de caixa, sistema de luxo/status social, reputação, cenário isométrico animado, linha do tempo dos 18 anos à aposentadoria, e relatório de fim de temporada. Uma fase por vez, mesma disciplina das Fases 2A/2B/2C de identidade visual (RFC-008/010/011).

## Iniciativa grande, escopada mas não iniciada

- **Migração de armazenamento para Supabase (conta obrigatória)**: o usuário confirmou que quer a nuvem como fonte de verdade — toda conta precisa de login, os dados moram no Supabase, o navegador guarda só um cache local. Isso é uma reversão deliberada do princípio "100% funcional sem conta" documentado no README e em RFCs anteriores (não um erro a corrigir, uma prioridade nova que supera a anterior). Afeta todo módulo que hoje lê/grava via `Store`/`localStorage` — merece sua própria RFC, bem testada, antes de somar mais uma frente grande em cima. **Sequenciamento confirmado pelo usuário 2026-08-06**: essa migração só começa depois que TODAS as fases da Cidade Financeira (acima) estiverem prontas — "o jogo" vem primeiro, a migração de dados vem depois.

## Ideias futuras (fora do backlog original das 13 ideias)

(nenhuma pendente no momento — "Gating de conteúdo por nível" foi implementado como RFC-012)

## Como este roadmap é usado

Cada etapa é implementada em turnos/sessões subsequentes, seguindo o mesmo processo de commit + tag SemVer + entrada no `CHANGELOG.md` já em uso no projeto. Ideias trazidas depois deste roadmap devem ser encaixadas em uma das etapas acima (ou abrir uma nova), não implementadas soltas.
