# Changelog

Todas as alterações relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [1.44.0] - 2026-08-06

### Alterado
- **Cidade Financeira — PolvIn 3D dentro do jogo 2D** (RFC-023): o token
  jogável, antes uma imagem plana (`Polvin-logo.png` redimensionado),
  agora é um personagem 3D real — modelado por geometria procedural
  (esfera + 6 tentáculos articulados + olhos + óculos redondos), com
  sombreamento toon/cel-shading (3 bandas de luz, contorno preto), nas
  cores da identidade visual do PolvIn. Mapa e construções continuam
  100% 2D, por decisão explícita do usuário — só o personagem ganhou
  volume. Renderizado via Three.js (CDN, sem build step) num canvas
  transparente por cima do canvas do Phaser, sincronizado por frame com a
  posição real do jogador (câmera, movimento e proximidade das 5
  construções continuam exatamente como antes — zero regressão). Base
  pronta pra uma futura Personalização de Personagem (cor/acessório no
  mesmo rig).

## [1.43.0] - 2026-08-06

### Alterado
- **Cidade Financeira — Fase 6: mais construções no mapa, fim do painel
  legado** (RFC-022): as 4 seções que ainda viviam num card de dashboard
  "temporário" abaixo do mapa (Educação, Veículos, Imóveis, Emprego/Negócio)
  ganharam suas próprias construções jogáveis, seguindo exatamente o mesmo
  padrão proximidade → balão → diálogo provado na Fase 5 com o Banco:
  Universidade (cursos), Concessionária (bicicleta/carros), Imobiliária
  (terreno/casa/apartamento) e Escritório (promoção de emprego + abrir/
  gerenciar negócio). Cada construção tem silhueta e animação próprias
  (cúpula com emblema balançando, vitrine com holofote giratório, placa de
  "à venda" balançando ao vento, janelas de escritório acendendo em
  sequência) — nenhuma repete a arte do Banco. `#cityLifeLegacyPanel` e o
  card que o envolvia saem do HTML: a aba Cidade passa a ser 100% jogo, sem
  nenhum fallback em formato de card. Zero regra econômica mudou — é
  relocação de interface sobre a mesma lógica das Fases 1-4.

## [1.42.0] - 2026-08-06

### Alterado
- **Cidade Financeira — Fase 5: fundação do motor de jogo 2D** (RFC-021):
  mudança de direção pedida diretamente pelo usuário — a aba Cidade
  virava um dashboard (cards, barras, listas), quando deveria ser um
  jogo 2D de verdade, no espírito de Animal Crossing/Stardew
  Valley/Pou (conceitos, não cópia). Agora o jogador controla o
  PolvIn andando livremente por um cenário litoral (Phaser 3, via
  CDN, sem build step) — clique/toque move o token com animação de
  passo, a câmera acompanha o personagem num mundo maior que a tela.
  O Banco é a 1ª construção jogável: aparece um balão ao se aproximar
  e, ao entrar, abre um painel de diálogo na base da tela com o ciclo
  semanal — que é o MESMO `CityLife` das Fases 1-4 (RFC-017 a
  RFC-020), sem nenhuma reescrita de regra econômica. Educação,
  Patrimônio Físico e Negócio continuam num painel abaixo do mapa,
  marcados como temporários até ganharem suas próprias construções
  (Concessionária, Universidade, Imobiliária, Escritório — fases
  seguintes). Bug real pego na verificação visual: o sprite do PolvIn
  "explodia" pro tamanho nativo da imagem após o primeiro movimento
  (escala absoluta sobrescrevendo a do `setDisplaySize`) — corrigido
  antes do merge.

## [1.41.0] - 2026-08-06

### Adicionado
- **Cidade Financeira — Fase 4: empresas com fluxo de caixa e
  reputação** (RFC-020): quem alcançar o emprego Empresário(a)
  (desbloqueado na Fase 2) pode abrir 1 de 3 negócios — Cafeteria,
  Loja de Roupas, Consultoria. Cada um tem receita e despesa próprias
  que reagem ao cenário econômico da semana; contratar funcionários
  (até 5) aumenta a receita potencial, mas também a despesa — nem
  sempre compensa. Lucro ou prejuízo de cada semana soma direto ao
  patrimônio; Reputação sobe em semana lucrativa e cai um pouco em
  semana de prejuízo. Fechar o negócio não devolve o valor investido
  na abertura — um risco real de empreender, diferente das decisões
  semanais de investimento (que nunca subtraem patrimônio já
  conquistado). Novo atributo 🤝 Reputação e conquista "Empreendedor
  de verdade".

## [1.40.0] - 2026-08-06

### Adicionado
- **Cidade Financeira — Fase 3: patrimônio físico (imóveis e luxo)**
  (RFC-019): 6 bens compráveis com patrimônio simulado — Bicicleta,
  Carro Popular, Carro de Luxo, Terreno, Casa Própria e Apartamento
  p/ Alugar. Comprar um imóvel de valor justo não reduz patrimônio
  (só converte dinheiro em ativo de valor equivalente); itens de
  luxo reduzem exatamente pelo "ágio de status" — a parte do preço
  que é marca/status, nunca recuperável (o Carro de Luxo, por
  exemplo, perde R$ 50.000 de ágio já na saída da concessionária).
  Todo bem possuído soma manutenção mensal às despesas da semana (e,
  pros imóveis alugáveis, soma aluguel à renda), e valoriza ou
  deprecia toda semana — imóveis conforme o cenário econômico
  sorteado, veículos numa depreciação fixa que não desaparece nem
  durante um Boom. Novo atributo ⭐ Status Social, que sobe uma vez a
  cada compra. Nova conquista "Patrimônio de verdade".

## [1.39.0] - 2026-08-06

### Adicionado
- **Cidade Financeira — Fase 2: emprego, educação e catálogo de
  investimentos** (RFC-018): 5 empregos com salário crescente, cada um
  exigindo um curso simulado ou um nível real da trilha Aprender —
  promoção aparece como banner, nunca bloqueia o ciclo (aceitar é
  opcional, e reduz um pouco felicidade/saúde no início, refletindo
  "mais responsabilidade, mais estresse"). 5 cursos que custam
  patrimônio simulado da Cidade, cada um desbloqueando 1 emprego ou 1
  opção de investimento. 4 opções de investimento novas na decisão
  semanal — FIIs, ETFs, Criptomoedas e Ouro, somadas às 4 já
  existentes — 2 delas exigindo um requisito (curso comprado OU trilha
  real concluída), sempre visíveis mesmo bloqueadas, com o requisito
  exato escrito. Direção dos retornos de cada ativo por cenário
  econômico validada pelo Financial Specialist. Nova conquista
  "Investindo em você mesmo" (primeiro curso comprado).
- Saves da Fase 1 (RFC-017) migram automaticamente sem nenhuma perda.

## [1.38.0] - 2026-08-06

### Adicionado
- **Cidade Financeira ganha vida — Fase 1 do simulador de vida financeira**
  (RFC-017): novo card "🌊 Sua Vida Financeira" na aba Cidade, com estado
  próprio e persistente. Cada "semana" representa ~1 mês: sorteia 1 de 4
  cenários econômicos fictícios (Boom, Crise, Inflação Alta, Estável —
  direção macroeconômica validada antes de publicar), mostra indicadores
  da simulação (claramente rotulados como fictícios, distintos dos dados
  reais da aba Mercado), credita salário, debita despesas fixas, e o
  jogador decide o que fazer com a sobra do mês (reserva de emergência,
  renda fixa, ações ou lazer) — sempre vendo o comparativo das 4 opções
  lado a lado, sem nunca subtrair patrimônio já conquistado. Acompanha 3
  atributos (felicidade, saúde, disciplina) e 2 conquistas de marco
  ("Uma vida começa", "Um ano de decisões"). Sem Game Over — só
  consequências, sempre explicadas pelo PolvIn.
- A grade de 13 construções por conquista (RFC-005/010) continua 100%
  intacta, sem nenhuma mudança — a nova mecânica vive ao lado dela, com
  estado totalmente separado, e não converte patrimônio/atributos
  simulados em moedas/XP reais (só os 2 marcos de conquista fazem essa
  ponte, com XP fixo e pequeno).
- Fase 1 de um pedido bem maior (carreira, catálogo completo de
  investimentos com conhecimento bloqueando acesso, imóveis, empresas,
  luxo/status, isométrico, linha do tempo, relatório de temporada) —
  próximas fases registradas no `ROADMAP.md`.

## [1.37.0] - 2026-08-06

### Adicionado
- **Cotação automática de ações/FIIs via brapi.dev** (RFC-016): PETR4,
  MGLU3, VALE3 e ITUB4 já atualizam sozinhos sem nenhuma configuração;
  qualquer outro ticker passa a atualizar automaticamente também, com
  um token gratuito opcional (`js/brapi-config.js`, ver README). Sem
  token/fora do plano gratuito, o ticker continua com a entrada manual
  de sempre — nunca quebra, só deixa de mostrar "🔄 cotação
  automática". Botão "🔄 Atualizar cotações" novo na aba Ações & FIIs.

### Alterado
- **Simulador usa a Selic real como padrão** (RFC-016): o campo
  "Rentabilidade estimada" do simulador de juros compostos, antes
  fixo em "12" no HTML, agora vem preenchido com a Selic atual (via
  `Market`), sempre editável para simular outro cenário — e para de
  perder essa edição quando a Selic é atualizada. Botão "🔄 Selic
  atual" permite voltar ao valor sugerido. Corrigido também um bug de
  ordenação de inicialização: o comparador de investimentos nunca era
  re-renderizado quando a Selic terminava de carregar, então a
  primeira exibição podia ficar no valor de fallback (10,5%) mesmo com
  a Selic real já disponível segundos depois.

## [1.36.0] - 2026-08-06

### Adicionado
- **Onda 8 da expansão para 300 lições**: as 15 lições da trilha
  "Empreender" (Níveis 1-5, `enivel1`-`enivel5`) foram retrofitadas de
  3 para 10 perguntas cada (150 perguntas no total), completando o
  padrão de 10 perguntas/lição nas **3 trilhas do app** (financeira
  desde a Onda 6, história desde a Onda 7). Nenhuma lição nova — todas
  as 15 já existentes ganharam profundidade real, com 1 novo parágrafo
  de aula cada, cobrindo conceitos factualmente atualizados para 2026
  (verificados via busca antes de publicar): empreendedorismo por
  oportunidade/necessidade e empreendedorismo social, contribuinte
  individual do INSS, margem de contribuição e capital de giro
  (Nível 01 · Empreender); a regra de ultrapassagem do teto do MEI
  (até 20% vs. mais de 20%), os 5 Anexos do Simples Nacional, a
  transição da Reforma Tributária (IBS/CBS) em 2026 e o que entra ou
  não no cálculo do Fator R (Nível 02 · MEI/Simples); a segmentação de
  presunção do Lucro Presumido acima de R$ 5 milhões trazida pela Lei
  Complementar 224/2025, adições/exclusões e a "trava dos 30%" do
  Lucro Real (Nível 03 · Presumido/Real); NF-e vs. NFS-e, CFOP, multa
  de mora vs. multa de ofício, sublimite de ICMS/ISS, regime de
  competência vs. caixa e Balanço Patrimonial vs. DRE (Nível 04 ·
  Obrigações); e os componentes do custo de um CLT, banco de horas,
  turnover, feedback construtivo, distribuição desproporcional de
  lucros e a tributação de dividendos altos (Nível 05 · Pessoas).
- Conteúdo redigido pelo papel de Financial Specialist (5 chamadas
  paralelas, uma por nível, com verificação via busca antes de
  publicar qualquer dado tributário) e validado estruturalmente
  (150/150 perguntas, todo índice `correta` dentro do range) e
  comportamentalmente (`Business.finishLesson()` real, sem mock).
- **Com a Onda 8, as 3 trilhas do PolvIn (financeira, história e
  empreender) estão no mesmo padrão de 10 perguntas/lição** — a
  expansão continua rumo às ~300 lições por trilha do Blueprint,
  agora com conteúdo novo (não só retrofit), a ser escolhido em
  turnos seguintes.

## [1.35.0] - 2026-08-06

### Alterado
- **Rebrand: Fin+/FinPlus → PolvIn** (RFC-015): o app passa a se chamar
  **PolvIn** — o mesmo nome que o mascote já usa (estilizado como
  "POLVIn" nas falas em 1ª pessoa), unificando produto e personagem.
  Novo wordmark no header (`Polv` + `In` em verde, no lugar de `Fin` +
  `+`), título da aba, README, `CLAUDE.md` e todo o conteúdo em runtime
  atualizados. Backup manual (exportar/importar) ganhou o novo prefixo
  de arquivo (`polvin-backup-*.json`) sem quebrar a importação de
  backups antigos. `CHANGELOG.md` e as RFCs numeradas já concluídas
  antes desta (registro histórico) foram deliberadamente preservadas
  com o nome antigo, assim como o nome do repositório no GitHub
  (`FInPuls`) — nenhum dos dois é o "nome do produto" que foi pedido.

## [1.34.0] - 2026-08-06

### Corrigido
- **Rolagem/toque em celular no diagnóstico inicial e no quiz de lição**
  (RFC-014): `.onboarding-card` e `.quiz-box` (as 3 trilhas) ficavam sem
  `overflow-y`/`max-height`, então em telas de celular o conteúdo mais
  alto que a viewport (ex.: a etapa "Um pouco sobre você", com 9 opções
  de objetivo) ficava centralizado para fora da área visível, sem
  nenhuma forma de rolar até o botão — impedindo terminar o cadastro
  pelo celular. Corrigido replicando o padrão que `.modal-box` já usava
  (`max-height: 88vh; overflow-y: auto;`). Testado com Playwright em
  360×740 e 375×667 (diagnóstico e quiz) e 1280×800 (regressão desktop).

## [1.33.0] - 2026-08-05

### Adicionado
- **Onda 7 da expansão para 300 lições**: as 9 lições da trilha
  "Brasil: História & Economia" (Módulos 01-04, `hnivel1`-`hnivel4`)
  foram retrofitadas de 2-3 para 10 perguntas cada (90 perguntas no
  total), completando o padrão de 10 perguntas/lição também nesta
  trilha (a trilha financeira já estava completa desde a Onda 6).
  Nenhuma lição nova — todas as 9 já existentes ganharam profundidade
  real, com 1-2 parágrafos novos de "conto" cada, cobrindo conceitos
  historicamente precisos: capitanias hereditárias, pacto colonial e
  colonização de exploração, Casas de Fundição/Derrama/Inconfidência
  Mineira e o Tratado de Methuen (Módulo 01 · Colônia); a migração da
  produção cafeeira, o sistema de colonato, a política do café-com-leite
  e o Convênio de Taubaté, a Revolução de 1930, o Estado Novo, o
  salário mínimo (1940) e o financiamento da CSN via Segunda Guerra
  (Módulo 02 · Café/Vargas); o AI-5, os slogans do regime militar, a
  Transamazônica, o II PND e o crescimento da dívida externa (Módulo
  03 · Milagre/Moedas); a indexação generalizada, a inflação inercial,
  o bloqueio de contas do Plano Collor e o pico de quase 80% de
  inflação mensal (Módulo 03 · continuação); e, no Plano Real, a
  equipe econômica, o ajuste fiscal prévio (PAI), o câmbio semi-fixo e
  sua flutuação em 1999, além da Lei de Terras de 1850, o índice de
  Gini, a PNAD/IBGE, a tributação regressiva e a reforma tributária de
  2023 (Módulo 04 · Real/Desigualdade/Estado).
- Esse é o primeiro passo rumo ao **Blueprint das Trilhas** (mapa de
  ~300 lições por trilha, calibrado contra NFEC/BNCC, corpo de
  conhecimento CFA e a periodização da história econômica brasileira)
  — ainda em andamento, próxima leva a ser escolhida em turnos
  seguintes.

## [1.32.0] - 2026-08-05

### Alterado
- **RFC-013 — Consolidação de abas** (`rfcs/RFC-013-consolidacao-de-abas.md`):
  auditoria de usabilidade das 14 abas encontrou 2 sem substância
  própria — "Educação" (só texto estático que já mandava o usuário pra
  outras abas) e "Notícias" (curadoria estática de 5 itens, sem busca
  ao vivo). Nenhum conteúdo foi perdido:
  - O card de notícias agora vive dentro da aba **Mercado**, como
    seção final.
  - Os 2 cards de educação financeira (comparação investir x não
    investir, texto sobre consciência de classe) agora vivem dentro da
    aba **Investimentos**.
  - Botão "Investimentos" renomeado para "Guia de Investimentos", pra
    não confundir com "Ações & FIIs" (catálogo educativo x carteira
    real).
  - O app passa de 14 para **12 abas**.

## [1.31.0] - 2026-08-05

### Adicionado
- **RFC-012 — Desbloqueio progressivo de ferramentas por nível**
  (`rfcs/RFC-012-desbloqueio-progressivo-por-nivel.md`): o app agora
  começa mais simples pra quem está aprendendo, e libera ferramentas
  conforme o progresso real (ou o nível já indicado no diagnóstico
  inicial):
  - **Ações & FIIs** fica bloqueada até concluir a trilha de Renda
    Variável (Nível 3) — ou já vem destravada se o diagnóstico inicial
    classificou a pessoa como avançada.
  - **Avançado** (carteiras-modelo, calculadoras, glossário) fica
    bloqueada até concluir o Nível 1 · Fundamentos — ou já vem
    destravada pra quem se autoavaliou intermediário/avançado.
  - As abas nunca desaparecem do menu — ficam marcadas com 🔒 e mostram
    uma prévia explicando o que falta. Ao desbloquear de verdade
    (sem precisar recarregar a página), aparece um aviso específico:
    "Parabéns! Você concluiu Renda Variável e desbloqueou o rastreador
    de Ações & FIIs."
  - `profile.nivel` (calculado no diagnóstico inicial) deixa de ser
    só decorativo e passa a ter um efeito real na experiência.
- Módulo novo `js/progression.js`, mesmo padrão de
  `js/achievements.js` — nenhuma mudança em `js/stocks.js`/
  `js/advanced.js` (o bloqueio é inteiramente visual/externo a eles).

## [1.30.0] - 2026-08-05

### Adicionado
- **RFC-011 — Guarda-roupa do POLVIn (Fase 2B)**
  (`rfcs/RFC-011-guarda-roupa-do-polvin.md`): o POLVIn agora muda de
  cor — 6 cores novas na Loja (Verde Esmeralda, Azul Oceano, Rosa
  Choque, Vermelho Fogo, Dourado Lendário, Ciano Neon), aplicadas via
  filtro CSS sobre a arte já existente do mascote (sem gerar nenhum
  asset novo). Cor é só mais uma categoria dentro do mesmo sistema de
  equipar já usado por acessórios/bandeiras/molduras — pode combinar
  todas ao mesmo tempo.
  - **Guarda-roupa**: a Loja do Perfil ganhou um preview grande ao
    vivo do POLVIn no topo (mostra o efeito de cada troca na hora) e
    os itens agora aparecem agrupados por categoria, em vez de uma
    vitrine única misturada.
- Fecha a **Fase 2B** do plano de redesign registrado no RFC-010.
  Restam as Fases 2C+ (demais abas do app), ainda não escopadas.

## [1.29.0] - 2026-08-05

### Adicionado
- **RFC-010 — Cidade Financeira: Fundo do Mar (Fase 2A)**
  (`rfcs/RFC-010-fundo-do-mar-cidade-e-plano-de-fases.md`): a Cidade
  Financeira deixou de ser uma grade de cards e virou um cenário 2D
  animado de fundo do mar (bolhas subindo, peixes nadando, coral
  balançando, areia ondulada) — condizente com o POLVIn ser um polvo.
  As 13 construções continuam desbloqueando exatamente pelas mesmas
  conquistas de antes, agora numa fileira em zigue-zague sobre o leito
  do mar, com um "guia" do POLVIn boiando no canto. Clicar numa
  construção abre um card de detalhe (nome/descrição se já construída,
  dica da conquista se ainda bloqueada).
  - **Nova mecânica: Loja do Fundo do Mar** — 6 decorações cosméticas
    (Castelo de Areia, Recife de Coral, Cardume Colorido, Farol
    Submerso, Baú do Tesouro, Navio Naufragado) compráveis com moedas,
    puramente visuais — não afetam progresso nem conquistas. Uma vez
    comprada, a decoração aparece de verdade na cena.
- **Plano de fases registrado** para o pedido de redesign completo do
  site: Fase 2A (esta, concluída) → Fase 2B (customização do POLVIn
  estilo POU: cor, guarda-roupa) → Fases 2C+ (demais abas, uma ou
  poucas por vez) — nenhuma tentativa de redesenhar tudo de uma vez.

## [1.28.0] - 2026-08-05

### Corrigido
- **RFC-009 — Responsividade e acessibilidade**
  (`rfcs/RFC-009-responsividade-acessibilidade.md`): revisão orientada a
  evidências (testada com Playwright/Chromium em 320-1440px, não só lida
  no código), corrigindo os problemas reais encontrados:
  - **Cabeçalho** caía em 3 linhas em celulares — os botões Exportar/
    Importar/Reiniciar saíram do header e agora vivem num novo card
    "Conta e dados" na aba Perfil (mesmo lugar de "Segurança e
    privacidade"). Cabeçalho agora cabe em 2 linhas.
  - **Navegação por abas**: só 2 das 14 abas apareciam sem rolar em
    celulares, sem nenhum indicativo visual de que havia mais abas.
    Adicionado um fade nas bordas do `.tabs-nav` (indicador de scroll)
    e reduzido o padding das abas em telas pequenas.
  - **10 alvos de toque abaixo de 40px** (botões pequenos, chip de
    conta) corrigidos — `min-height` nos botões, e área de toque
    estendida via `::before` nos elementos que precisavam ficar
    visualmente pequenos por design (chip de conta, link de política de
    privacidade), sem inflar o visual deles.
  - **8 textos abaixo de 11px** (rótulo "NÍVEL", tags da trilha, do
    simulador, de notícias etc.) subiram para 11px.
  - **10 campos de formulário sem rótulo acessível** (orçamento,
    cofrinhos, carteira de investimentos, lista de desejos, liga,
    glossário) ganharam `aria-label`.
  - **Notificações (toasts)** — conquista desbloqueada, subida de
    nível, bônus diário, avisos do POLVIn, energia — ganharam
    `role="status"`/`aria-live="polite"`, para leitores de tela
    anunciarem essas mensagens (antes, nenhuma era anunciada).

## [1.27.0] - 2026-08-05

### Adicionado
- **RFC-008 — Identidade visual e motion design, Fase 1**
  (`rfcs/RFC-008-identidade-visual-motion-design.md`): primeira aplicação
  prática da nova filosofia de design (`.claude/agents/ux-ui-design-lead.md`)
  — nunca genérico, todo componente com identidade própria, "Wow Moment"
  em cada tela.
  - **Biblioteca de animações reutilizável** em `js/fx.js`/`css/style.css`:
    `Fx.coinBurst` (moedas voando até o header via Web Animations API),
    `Fx.xpPop`, `Fx.successGlow`, `Fx.badgeUnlock`, `Fx.screenEnter`,
    `Fx.loadingOrbitHtml`, `Fx.mascotCelebrate`. Sem nenhuma dependência
    externa (nada de GSAP/CDN) — só mecânicas nativas do navegador.
  - **Celebração de lição concluída reconstruída**: na primeira conclusão
    real, o POLVIn aparece comemorando (em vez do emoji genérico 🎉),
    com confete, brilho, "+X XP" flutuante e moedas voando até o
    contador do header — só quando há recompensa de verdade (replay e
    reprovação continuam simples, sem fogos de artifício).
  - **Botões elásticos** em todo o app — `:active` ganhou um efeito de
    "spring" com overshoot na soltura, no lugar de um simples
    `translateY(1px)`.
  - **"Wow Moment" da Início**: o card de boas-vindas virou uma cena —
    o POLVIn mergulha na tela trazendo uma moeda, com partículas
    douradas e um balão de fala estilo HQ, dizendo algo real sobre o
    progresso do jogador (patrimônio virtual investido, sequência de
    dias, ou XP faltante pro próximo nível — sempre dados reais, nunca
    texto decorativo). Anel de nível ganhou um brilho dourado. Conceito
    escolhido entre 3 alternativas apresentadas ao usuário.

## [1.25.0] - 2026-08-05

### Adicionado
- **RFC-007 — Modo Carreira** (`rfcs/RFC-007-modo-carreira.md`): novo
  card "🎯 Modo Carreira" na Início. Reaproveita o objetivo de vida já
  escolhido no diagnóstico inicial (casa, carro, viajar, investir,
  dívidas, reserva de emergência, viver de renda, aposentadoria ou
  estudos) e mostra as 4 lições da Academia mais relevantes para esse
  objetivo, em ordem, com progresso, o cofrinho já vinculado a ele, e
  uma dica de como usar o Simulador para aquele caso específico.
  Possível trocar de objetivo a qualquer momento sem refazer o
  diagnóstico inteiro. Módulo novo `js/career.js`, `CAREER_PATHS` novo
  em `data.js` (9 entradas, uma por objetivo).
- **Isso fecha a Etapa 3 do `ROADMAP.md` por completo — e com ela, as
  13 ideias de engajamento trazidas originalmente pelo usuário.**

## [1.24.0] - 2026-08-05

### Adicionado
- **RFC-006 — Eventos temporários** (`rfcs/RFC-006-eventos-temporarios.md`):
  5 janelas fixas no calendário, recorrentes todo ano — Semana do Bitcoin
  (03-09/jan), Temporada de IR (mar-abr), Férias Fin+ (jul), Black Friday
  Fin+ (20-30/nov) e Natal Fin+ (15-25/dez). Enquanto uma está ativa: um
  card na Início mostra 2 missões especiais temáticas (+15 XP cada),
  todas as lições da trilha (financeira + Empreender) dão **XP em
  dobro**, e uma moldura exclusiva daquele evento fica disponível na
  Loja (permanece equipável mesmo depois do evento acabar, se comprada
  a tempo). Módulo novo `js/events.js`.
- Segundo item da **Etapa 3 do `ROADMAP.md`** concluído.

### Observações de escopo
- Ranking semanal sincronizado entre usuários diferentes (mencionado no
  pedido original) não foi implementado — exigiria backend, mesma
  limitação já registrada na Etapa 0 do roadmap. Quem quiser comparar
  XP ganho durante um evento com amigos já pode usar as Ligas
  locais/manuais existentes na aba Desafios.
- XP em dobro se aplica só às lições da trilha, não a desafios diários,
  missão semanal, metas ou livros — decisão de escopo registrada no
  RFC-006 (Product Owner).

## [1.23.0] - 2026-08-05

### Adicionado
- **RFC-005 — Cidade Financeira** (`rfcs/RFC-005-cidade-financeira.md`):
  nova aba "🏙️ Cidade" com uma grade de 13 terrenos. Cada marco de
  progresso já existente (primeira lição, primeira meta, primeiro
  investimento, streak de 7/30/100 dias, Renda Fixa completa, Renda
  Variável completa, primeiro certificado de livro, primeiro passo
  empreendedor, primeiro conto de História, nível 1 completo, trilha
  unificada completa) constrói um terreno diferente (Casa, Parque,
  Garagem, Banco, Empresa, Prefeitura, Cofre, Bolsa de Valores,
  Biblioteca, Escritório, Museu Histórico, Escola, Monumento da Lenda
  Financeira). Terrenos ainda não desbloqueados aparecem como "???"/🔲.
  Módulo novo `js/city.js` — sem estado próprio, deriva 100% de
  `Achievements.getUnlocked()` e atualiza em tempo real ao desbloquear
  uma conquista nova (hook em `Achievements.checkAll()`).
- Primeiro item da **Etapa 3 do `ROADMAP.md`** concluído.

### Adicionado (conquistas)
- `renda_variavel_completa` (concluir toda a trilha de Renda Variável)
  e `primeira_licao` (concluir qualquer lição pela primeira vez), que
  também alimentam os terrenos "Bolsa de Valores" e "Casa" da Cidade.

## [1.22.0] - 2026-08-05

### Adicionado
- **RFC-004 — Histórias interativas na trilha financeira**
  (`rfcs/RFC-004-historias-interativas-trilha.md`): a cada 3ª lição
  concluída pela primeira vez na trilha financeira, uma história curta
  aparece antes de voltar à trilha — um personagem fictício (João,
  Maria, Carlos, Ana ou Pedro) enfrenta um dilema financeiro real
  (reserva de emergência, rotativo do cartão, hábito de investir,
  parcelamento x à vista, inflação do estilo de vida), o usuário
  escolhe entre 2 opções, e vê um desfecho narrativo diferente
  conforme a escolha, seguido de uma "lição aprendida". Sem XP direto
  — cicla pelas 5 histórias sem repetir, como já acontece com os
  livros recomendados.
- Isso **fecha a Etapa 2 do `ROADMAP.md`** por completo.

## [1.21.0] - 2026-08-05

### Adicionado
- **RFC-002 — Simulador de Decisões** (`rfcs/RFC-002-simulador-estilo-jogo.md`):
  novo bloco na aba Simulador. O usuário "recebe" um valor de uma vez
  (bônus, herança, prêmio, 13º turbinado) e escolhe entre 4 opções (2
  de gasto, 1 investir, 1 poupança); a tela de resultado mostra sempre
  as 3 projeções "10 anos depois" (o que a escolha real gerou, o que
  teria sido se investido, o que teria sido na poupança), usando a
  Selic real via `Simulator.currentSelic()`. Escolher uma opção conta
  como uma simulação para a conquista "50 simulações" e o desafio
  diário "Faça uma simulação".
- **RFC-003 — Estante de livros + certificados**
  (`rfcs/RFC-003-estante-livros-certificados.md`): os 18 livros da
  Biblioteca ganharam resumo (3 parágrafos, contado pelo POLVIn) e um
  quiz de 2 perguntas. Completar o quiz marca o livro como lido na
  estante e gera um certificado numa nova "Parede de Certificados" —
  sem reprovação, já que o objetivo é incentivar a leitura. XP/moedas
  só na primeira conclusão de cada livro. Nova conquista
  `primeiro_certificado`.

### Alterado
- **Conquista "Leitor voraz" (`leu_10_livros`)**: critério mudou de
  "10 livros recomendados" (`BOOKS_SEEN`) para "10 livros
  *completados*, com quiz" (`BOOKS_COMPLETED`) — mais rigoroso, mas
  mais fiel ao que a conquista sempre quis dizer.

## [1.20.0] - 2026-08-05

### Adicionado
- **RFC-001** (primeira RFC formal sob o protocolo do Orchestrator AI,
  `rfcs/RFC-001-etapa1-missoes-mercado-avisos.md`): fecha a Etapa 1 do
  `ROADMAP.md` com 3 entregas.
- **Missões diárias mais variadas**: pool de `DAILY_CHALLENGES` de 7
  para 12 itens (novos: fazer uma simulação, perguntar ao POLVIn,
  conferir nível/conquistas/carteira). A seleção diária trocou o
  deslocamento fixo por um embaralhamento determinístico por dia
  (`Engagement.seededShuffle`) — mesmo dia sempre gera o mesmo pacote,
  mas dia para dia a variedade é real (27 combinações distintas em 30
  dias simulados, contra um padrão previsível antes).
- **Aba Mercado expandida**: mais pares de moeda (GBP/BRL, ARS/BRL) e
  mais criptomoedas (BNB, XRP), usando as mesmas duas APIs públicas já
  auditadas (AwesomeAPI, CoinGecko) — sem nenhuma chamada nova.
- **Avisos leves do POLVIn**: toast único por dia ao abrir o app, com
  o aviso mais relevante — "sentiu sua falta" (2+ dias sem atividade),
  "streak em risco" (nada feito hoje) ou "faltam X XP para o próximo
  nível" — sem depender de push notification (que exigiria backend).
- Novas chaves `SIMULATOR_LOG`, `POLVIN_LOG` e `POLVIN_NOTICE_SHOWN`
  em `STORAGE_KEYS`.

## [1.19.0] - 2026-08-05

### Adicionado
- **`CLAUDE.md`**: protocolo formal do Orchestrator AI — a partir de
  agora, toda solicitação de funcionalidade/melhoria/correção passa
  por uma RFC (`rfcs/RFC-NNN-*.md`) coordenada pelo Orchestrator
  através de um Workflow Oficial de 12 etapas (Product Owner →
  Software Architect → UX/UI Designer → Gamification Designer →
  Financial Specialist → Database Engineer → Backend Engineer →
  Frontend Engineer → Cyber Security Specialist → QA Engineer →
  Documentation Specialist → DevOps Engineer), com critérios de
  qualidade explícitos antes de considerar algo concluído.
- **Agente `software-architect`** (13º papel): define estrutura de
  módulos, dependências e formato de dados antes de qualquer
  implementação — papel que faltava no time original de 12.
- **`rfcs/`**: pasta e convenção para os documentos de RFC exigidos
  pelo novo protocolo.
- README: seção da equipe de agentes atualizada para refletir o
  Workflow Oficial de 12 etapas e o novo papel de Software Architect.

## [1.18.0] - 2026-08-05

### Adicionado
- **`ROADMAP.md`**: triagem em etapas de 13 ideias de melhoria trazidas
  pelo usuário (sistema de níveis, Cidade Financeira, missões nunca
  iguais, simulador estilo jogo, mercado em tempo real, histórias
  interativas, mais conquistas, estante de livros, eventos temporários,
  IA financeira, notificações inteligentes, certificados, modo
  carreira). Duas decisões de arquitetura registradas na Etapa 0 (IA
  financeira e notificações push exigem backend, que o projeto não
  tem hoje) antes de qualquer código.
- **Sistema de níveis narrativo (Etapa 1)**: `PLAYER_LEVEL_TITLES`
  trocou os títulos genéricos por uma progressão de investidor —
  🥉 Iniciante → 🥈 Poupador → 🥇 Investidor → 💎 Estrategista →
  🚀 Trader → 🏛️ Mestre das Finanças → 👑 Lenda Financeira.
- **4 conquistas novas**: Especialista em Renda Fixa (Nível 2
  completo), Mestre dos simuladores (50 simulações), Leitor voraz (10
  livros na Biblioteca), Amigo do POLVIn (10 perguntas ao assistente).
  Novas chaves `SIMULATOR_RUNS` e `POLVIN_QUESTIONS_ASKED` em
  `STORAGE_KEYS` para rastrear esse uso.

## [1.17.2] - 2026-08-05

### Corrigido
- **XP ganho ao refazer uma lição já concluída**: `finishLesson()` (em
  `js/trail.js` e `js/business.js`) registrava uma entrada nova em
  `LESSON_LOG` a cada conclusão, mesmo em uma repetição — isso não
  duplicava o XP direto da lição (que já tinha proteção), mas inflava
  a contagem da missão semanal "Complete 3 lições esta semana"
  (que conta entradas no log, não lições distintas), permitindo
  completar essa missão e ganhar XP/moedas de bônus só repetindo a
  mesma lição 3 vezes. Agora o registro no log só acontece na
  primeira conclusão, igual ao XP e às moedas.
- **Mensagem enganosa na tela de conclusão**: ao refazer uma lição já
  concluída, a tela sempre mostrava "+X XP adicionados à sua conta",
  mesmo quando nenhum XP era de fato creditado. Agora mostra uma
  mensagem diferente ("revisar não dá XP de novo, mas ajuda a fixar o
  conteúdo") quando a lição já estava concluída antes.

## [1.17.1] - 2026-08-05

### Adicionado
- **Equipe de 12 agentes especializados** (`.claude/agents/*.md`) para o
  desenvolvimento do Fin+ com Claude Code: Product Owner, UX/UI &
  Design Lead, Front-end Engineer, Back-end Engineer, QA Engineer,
  Cyber Security Specialist, Database Engineer, Gamification Designer,
  Financial Education Specialist, AI Prompt Engineer, DevOps Engineer
  e Documentation Specialist. Cada um tem contexto real do projeto
  (arquivos, convenções, arquitetura atual) e limites explícitos do
  que pode/não pode fazer, documentados no README ("Equipe de agentes
  especializados").

### Corrigido
- README: árvore de `Estrutura do projeto` estava sem `js/energy.js`
  (adicionado na v1.14.0) — corrigido.

## [1.17.0] - 2026-08-05

### Adicionado
- **Onda 6 da expansão para 300 lições**: as 6 lições do Módulo 06 da
  trilha financeira ("Nível 6 · Mercado Avançado (Pro)") foram
  retrofitadas de 3 para 10 perguntas cada (60 perguntas no total),
  completando o padrão de 10 perguntas/lição em toda a trilha
  financeira. Novos conceitos cobertos: desvio padrão, taxa livre de
  risco, Beta, fronteira eficiente e alocação estratégica x tática
  (l6_1); yield to maturity, risco de mercado x crédito, spread de
  crédito e laddering (l6_2); ROIC, margem EBITDA, Dívida Líquida/
  EBITDA, fluxo de caixa livre, payout ratio e PEG ratio (l6_3); ITCMD,
  doação com reserva de usufruto, testamento, seguro de vida e IOF
  regressivo (l6_4); calls e puts, contratos futuros, ancoragem,
  excesso de confiança, contabilidade mental e viés de confirmação
  (l6_5); variantes do FIRE, risco de sequência de retornos,
  diversificação de fontes de renda e glide path (l6_6). A trilha
  financeira (COURSE) chegou a 342 perguntas no total, com todos os 6
  níveis agora no padrão de 10 perguntas/lição.

## [1.16.0] - 2026-08-05

### Corrigido
- **Trilha invisível/lenta para aparecer na aba Aprender**: a aba
  começa com `display:none` até o usuário clicar nela, então o
  `IntersectionObserver` que revela cada nível ao rolar a tela (efeito
  fade-in) era configurado contra elementos sem geometria nenhuma —
  ele nunca disparava, deixando a trilha (e a subaba Empreender)
  travada em `opacity:0`. Agora `observeReveal()` não tenta observar
  enquanto o container ainda está escondido, e é chamado de novo
  quando a aba/subaba realmente fica visível (`tab:changed` e
  `goSection`). O limiar de revelação também caiu de 12% para 1% da
  área do nível, para não demorar tanto em níveis muito longos.

### Alterado
- **Zigue-zague na trilha**: os nós de cada nível agora alternam
  esquerda/direita (`nth-child(odd/even)`) em vez do padrão anterior a
  cada 4 nós, com deslocamento maior (±84px no desktop, ±38px no
  mobile) — quebra a descida reta agora que os níveis têm muito mais
  lições.

## [1.15.0] - 2026-08-05

### Adicionado
- **Onda 5 da expansão para 300 lições**: o Módulo 05 da trilha
  financeira ("Nível 5 · Avançado") ganhou 3 lições novas — análise
  técnica (tendência, suporte/resistência, médias móveis), balanço
  patrimonial e DRE (ativo, passivo, patrimônio líquido, lucro bruto x
  líquido), e aportes regulares com juros compostos no longo prazo —
  e as 2 lições já existentes (análise fundamentalista, estratégia de
  longo prazo) foram retrofitadas de 2 para 10 perguntas cada, com
  aula expandida cobrindo margem líquida, comparação de P/L só dentro
  do mesmo setor, fundamentalista x técnica, timing de mercado e o
  custo de interromper aportes/resgatar antes do prazo. Nível 5 foi de
  2 para 5 lições (50 perguntas). A trilha financeira (COURSE) chegou
  a 93 lições no total.

## [1.14.0] - 2026-08-05

### Adicionado
- **Sistema de energia (estilo Duolingo)**: cada lição iniciada (trilha
  financeira/história ou Empreender) gasta 1 energia, com máximo de 3
  por dia. Energia renova todo dia (mesma lógica de data do streak); um
  combo de 3 respostas certas seguidas dentro de uma lição devolve +1
  energia na hora, com um toast de aviso. Sem energia, um modal explica
  a situação em vez de abrir a lição. Novo `js/energy.js`, chip "⚡" no
  header, chave `STORAGE_KEYS.ENERGY` (sincronizada na nuvem como as
  demais).
- **Onda 4 da expansão para 300 lições — novo padrão de 10 perguntas
  por lição**: o Módulo 04 da trilha financeira ("Nível 4 ·
  Diversificação e Risco") ganhou 3 lições novas (perfil de investidor
  e suitability, correlação entre ativos, hedge) e as 2 lições já
  existentes (diversificação de carteira, criptomoedas com
  responsabilidade) foram retrofitadas de 2 para 10 perguntas cada,
  com aula expandida cobrindo risco sistemático x não sistemático,
  diversificação entre classes/geográfica, rebalanceamento, custódia
  própria x exchange, tributação de cripto, golpes comuns e
  stablecoins. A partir desta onda, toda lição nova passa a ter 10
  perguntas (em vez de 2-3), seguindo a mesma lógica de repetição do
  Duolingo — as demais ~106 lições já publicadas serão retrofitadas
  gradualmente em ondas futuras.

## [1.13.0] - 2026-08-05

### Adicionado
- **Onda 3 da expansão para 300 lições**: o Módulo 03 da trilha
  financeira ("Nível 3 · Renda Variável") saiu de 2 para 22 lições — 20
  lições novas sobre ações e Fundos Imobiliários, em ordem pedagógica
  seguindo a lógica dos Módulos 01 e 02: tipos de ação (ON, PN, units),
  como comprar na prática (corretora, home broker, lote padrão),
  dividendos x Juros sobre Capital Próprio, múltiplos de avaliação (P/L,
  P/VP, Dividend Yield), Ibovespa e IFIX, volatilidade e liquidez, IPO,
  tributação de ações (isenção de R$20 mil, DARF, day trade x swing
  trade), ETFs, BDRs, tipos de FII (tijolo, papel, fundo de fundos,
  híbridos), a regra de isenção dos FIIs, taxa de administração/gestão,
  risco de crédito nos FIIs de papel, diversificação e os erros mais
  comuns ao começar em renda variável. A trilha financeira (COURSE) foi
  de 67 para 87 lições no total.

## [1.12.0] - 2026-08-04

### Adicionado
- **Onda 2 da expansão para 300 lições**: o Módulo 03 da trilha financeira
  ("Nível 2 · Renda Fixa") saiu de 3 para 20 lições — 17 lições novas,
  cobrindo debêntures (comuns e incentivadas), CRI/CRA, rating de
  crédito, FGC em detalhe, marcação a mercado, duration, curva de
  juros, Tesouro Prefixado e IPCA+ na prática, CDB pós-fixado x
  prefixado x híbrido, fundos de renda fixa e fundos DI, come-cotas,
  comparação de renda fixa "de verdade" (taxa, prazo, liquidez, IR,
  garantia) e os erros mais comuns na escolha. A trilha financeira
  (COURSE) foi de 50 para 67 lições no total.
- Blueprint das trilhas atualizado registrando o Módulo 03 como quase
  concluído (20/25 lições).

### Corrigido
- Aba Mercado: removida a duplicidade do card de Bitcoin — a cotação
  BTC-BRL vinha tanto da AwesomeAPI (moedas) quanto da CoinGecko
  (criptoativos), aparecendo duas vezes no ticker e na grade do
  Mercado. Mantida apenas a fonte da CoinGecko, que já traz variação
  em 24h.

### Alterado
- Textos de apoio simplificados em várias abas (Investimentos,
  Simulador, Carteira Digital, Aprender, Notícias, Educação
  Financeira, Avançado, Ações & FIIs): frases mais curtas, linguagem
  do dia a dia em vez de termos técnicos, mantendo o significado.
- Redesign visual com mais uso da cor roxa da marca: títulos de card,
  barra de destaque nos títulos de seção, KPIs com borda lateral e
  fundo tonalizado, valores do Mercado e itens do glossário — usando
  as variáveis de cor já existentes, sem introduzir novas cores.

## [1.11.0] - 2026-08-04

### Adicionado
- **Onda 1 da expansão para 300 lições**: o Módulo 01 da trilha financeira
  ("Fundamentos e Comportamento Financeiro") saiu de 5 para 35 lições —
  30 lições novas, cada uma com introdução didática (analogia do dia a
  dia) e pergunta de reforço após erro, cobrindo: contabilidade básica
  pessoal (receita/despesa, ativo/passivo, patrimônio líquido, custo de
  oportunidade), juros simples x compostos e Regra dos 72, liquidez e
  seguro, metas SMART e planejamento familiar, viés comportamental
  (contabilidade mental, gatilhos de consumo, compra por impulso,
  ancoragem de preço), crédito e dívida (score de crédito, rotativo,
  cheque especial, consignado, negociação de dívidas) e planejamento de
  vida (INSS, previdência privada, alugar x financiar, educação
  financeira para crianças, independência dos pais). A trilha financeira
  (COURSE) foi de 20 para 50 lições no total.
- Blueprint das trilhas atualizado registrando o Módulo 01 como
  concluído (35/35), rumo à meta de ~300 lições por trilha.

## [1.10.0] - 2026-08-04

### Adicionado
- Aba Mercado: seção "Ações e FIIs em destaque" (`STOCK_HIGHLIGHTS` em
  data.js), categorizando exemplos reais e líquidos da bolsa brasileira
  em Histórico de dividendos consistentes / Setores cíclicos (maior
  volatilidade) / Exposição ampla e diversificada. Deixado explícito que
  não é um ranking de altas e baixas do dia (o Fin+ não tem cotação em
  tempo real de ativos individuais) — são características estruturais
  conhecidas, para fins didáticos, não recomendação de investimento.
- Sistema de dica rápida (`js/tooltip.js`, componente `Tooltip`):
  ícone "?" ao lado de campos de calculadoras (Simulador, Comparador de
  Investimentos, Calculadoras Pro) e indicadores do Banco Central,
  explicando em linguagem simples o que cada termo/campo significa.
  Funciona por hover (mouse), foco (teclado) e toque (mobile).

### Corrigido
- Bug real no componente de tooltip: ao passar o mouse sobre um campo e
  então clicar nele, o clique fechava a dica imediatamente (interpretava
  como "alternar para fechar"), quando o usuário só queria confirmar que
  ficasse visível. Corrigido rastreando se a dica foi aberta por um
  clique deliberado ou só por hover/foco.

## [1.9.0] - 2026-08-04

### Adicionado
- Onboarding agora pergunta o **valor da meta** de cada objetivo (em vez de
  usar sempre um valor fixo sugerido, como os R$ 100.000 da carteira de
  renda passiva) — o cofrinho criado automaticamente usa o valor real
  que a pessoa digitar. Adicionados também dois novos objetivos:
  "Me aposentar bem" e "Investir em estudos".
- Toda lição da trilha financeira (COURSE) agora tem uma introdução
  didática com analogias do dia a dia (ex.: inflação como um balão
  furado, juros compostos como uma bola de neve) antes do quiz — mesmo
  padrão que já existia nas trilhas de História e Empreender.
- **Reforço após erro**: ao errar uma pergunta, a pessoa vê a explicação
  correta e, se houver uma "pergunta-variante" cadastrada, responde uma
  segunda versão da mesma pergunta (outro exemplo/cenário) antes de
  seguir — implementado nas três trilhas (financeira, história,
  empreender). Acertar a variante conta para a pontuação da lição.
- Trilha financeira reordenada: "Perfil de investidor" e "Juros
  compostos" movidos para o Nível 1 (Fundamentos), antes de qualquer
  produto específico de renda fixa/variável — sequência mais alinhada
  com como currículos de educação financeira reais são estruturados
  (valores/comportamento → mecânica → produtos → estratégia).

## [1.8.0] - 2026-08-04
## [1.8.0] - 2026-08-04

### Corrigido
- Responsividade mobile revisada de ponta a ponta. Testado com Playwright
  em 320px, 360px, 375px e 768px de largura, nas 13 abas — sem overflow
  horizontal em nenhum cenário.
- Tabelas (`compare-table`/`stock-table`, usadas em Simulador, Avançado,
  Carteira, Ações & FIIs, Desafios/Ligas e Mercado) agora ficam dentro de
  um contêiner com rolagem horizontal própria (`.table-scroll`), em vez de
  espremer colunas ou vazar da tela em telas estreitas.
- Bug real (não só cosmético): o ticker de cotações no topo, animado via
  `transform`, inflava ocasionalmente a largura rolável de toda a página
  em telas pequenas (`document.documentElement.scrollWidth` maior que o
  viewport), permitindo um scroll horizontal indesejado da página inteira
  em alguns momentos da animação. Corrigido com `position: relative` no
  contêiner do ticker e uma proteção global (`overflow-x: hidden` em
  `html`/`body`) contra qualquer recorrência do mesmo tipo de problema.
- Campos de formulário (`input`/`select`/`textarea`) usavam `font-size:
  14px`, abaixo do limite de 16px que evita o zoom automático do Safari
  no iOS ao focar um campo — ajustado para 16px em telas pequenas.
- Botão "Entrar com Google" tinha largura fixa de 280px, podendo vazar do
  modal em telas bem estreitas — agora se ajusta ao espaço disponível.
- `.pros-cons` (vantagens/desvantagens, no modal de Investimentos) e um
  campo de busca do Dicionário com `min-width` fixo agora se adaptam a
  telas pequenas em vez de espremer ou forçar overflow.
- Cabeçalho, abas, modais, tela de onboarding e tela de quiz com menos
  espaçamento em telas pequenas (mais conteúdo visível, menos rolagem
  desnecessária); subtítulo da marca oculto no cabeçalho em telas muito
  estreitas para dar espaço aos indicadores.
- Aba ativa agora rola automaticamente para dentro da área visível do
  menu de abas (`Tabs.go`), relevante porque esse menu rola
  horizontalmente em telas pequenas.

## [1.7.1] - 2026-08-04

### Corrigido
- `.alert-box` usava `display: flex`, que quebra qualquer conteúdo
  misturando texto com tags `<b>`/`<span>` em vários "itens flex"
  anônimos (um por trecho de texto) — isso fragmentava o layout em
  colunas estreitas na tela de resultado do onboarding, nas calculadoras
  (`js/advanced.js`), no simulador (`js/simulator.js`) e no aviso de
  Ligas. Trocado para bloco normal, corrigindo todos os casos de uma vez.
- Chave pública do Supabase que havia sido colada no campo errado de
  `js/supabase-config.js`.

### Alterado
- Pergunta "quanto tempo você dedica" do onboarding agora pergunta a
  intenção diária em minutos (5, 10, 15 ou 30 min/dia), em vez de horas
  semanais retrospectivas.

## [1.7.0] - 2026-08-04

### Adicionado
- **Sincronização multiusuário via Supabase** (opcional): `js/cloud.js` +
  `js/supabase-config.js` + `supabase/schema.sql`. Com um projeto Supabase
  configurado, contas reais (e-mail/senha, ou Google validado pelo
  Supabase) passam a ter os dados sincronizados entre dispositivos, numa
  tabela genérica chave/valor (`user_data`) protegida por Row Level
  Security — cada conta só acessa as próprias linhas. Sem configurar
  nada, o app continua 100% local, exatamente como antes.
- `js/auth.js` reescrito: quando o Supabase está configurado, o modal de
  conta ganha abas "Entrar"/"Criar conta" com e-mail e senha reais, e o
  botão do Google passa a criar uma sessão Supabase de verdade (via
  `signInWithIdToken`) em vez de só decorar a saudação.
- Compatibilidade entre o cofre local (`js/vault.js`) e a nuvem: quando o
  cofre está ativo, o que sincroniza para as chaves sensíveis é sempre o
  blob já cifrado — o Supabase nunca recebe esse conteúdo em texto puro.
- Favicon do site usando a arte do POLVIn (`Polvin-logo.png`).
- Seções "Sincronização multiusuário com Supabase" e "Hospedagem
  (Vercel)" no README, com o passo a passo completo de configuração.

### Corrigido
- Texto do rodapé, que afirmava categoricamente que os dados só ficam no
  navegador — agora reflete corretamente o modo de sincronização opcional.

## [1.6.0] - 2026-08-04

### Adicionado
- **Cofre de criptografia local** (`js/vault.js`), opcional, ativável na
  aba Perfil → Segurança: cifra com AES-GCM 256 bits (chave derivada por
  PBKDF2, 150.000 iterações) os dados sensíveis — perfil, conta,
  transações, orçamentos, cofrinhos, investimentos, ações/FIIs,
  parcelamentos e ligas — usando uma senha local que nunca é enviada a
  lugar nenhum. Inclui migração automática de dados já existentes, tela de
  bloqueio no boot do app (`App.ensureVaultUnlocked`), troca de senha,
  desativação (reversível, volta para texto puro) e uma opção de
  "esqueci a senha" que limpa tudo. Documentado com o alcance real da
  proteção (dado em repouso) e sua limitação honesta (não protege contra
  XSS enquanto o cofre está desbloqueado, nem permite recuperação de senha
  perdida).
- Seção "Segurança" na aba Perfil, com o fluxo completo de ativar,
  bloquear, trocar senha e desativar o cofre.
- Política de Privacidade (LGPD) em modal (`js/privacy.js`, link no
  rodapé): explica a ausência de servidor/banco de dados, os dois casos
  em que algo trafega pela internet (login Google e cotações públicas de
  mercado), os dados tratados e os direitos do titular (acesso,
  portabilidade, correção, eliminação, revogação).
- Seção "Hospedagem" no README, esclarecendo que não existe banco de
  dados/servidor no projeto e orientando a publicação real via GitHub
  Pages (o que também resolve a limitação de login Google via `file://`).

### Alterado
- Fonte do menu de abas (`.tab-btn`) aumentada de 13.5px para 16px, a
  pedido do usuário, sem alterar nenhum outro conteúdo das páginas.
- `Store.get/set/remove/clearAll/exportAll/importAll` agora roteiam
  chaves sensíveis pelo cofre quando ativado, de forma transparente para
  todo o restante do app.

## [1.5.0] - 2026-08-04

### Adicionado
- Sistema de moedas (separado do XP): ganhas em lições, desafios diários,
  missões da semana, cofrinhos concluídos e um bônus de login diário
  escalando com a ofensiva (5 a 30 moedas).
- Aba Perfil: avatar equipável, estatísticas (XP, moedas, ofensiva,
  pontuação total, medalha) e a Loja (acessórios, insígnias/bandeiras e
  molduras para o POLVIn).
- Aba Desafios: placar próprio, tabela de medalhas por pontuação
  (Bronze/Prata/Ouro/Platina/Diamante) e Ligas locais para desafiar
  amigos manualmente.
- Cartão "O que o POLVIn percebeu sobre você" na Home, com insights
  reais (total guardado em cofrinhos, total investido, próxima meta,
  maior categoria de gasto do mês).

### Alterado
- Avatar do POLVIn passou do SVG simples para a arte 3D real
  (`Polvin-logo.png`) em todos os balões de fala, assistente e FAB.
- Conquistas movidas da aba Aprender para a nova aba Perfil.

## [1.4.0] - 2026-08-04

### Adicionado
- Trilha "Empreender" (`js/business.js` + `BUSINESS_COURSE`): 5 níveis, 15
  mini aulas + quiz sobre empreender x ser empresário, MEI, Simples
  Nacional, Lucro Presumido, Lucro Real, obrigações fiscais/contábeis e
  gestão de pessoas e finanças. Acessível via subnav na aba Aprender.
- Comparador de Investimentos no Simulador: ranking das 3 melhores opções
  de renda fixa (Poupança, CDB, LCI/LCA, Tesouro Selic) líquidas de IR,
  usando a Selic atual do Banco Central, mais comparação com 1 opção de
  renda variável (FII via dividend yield estimado).
- 2 novas conquistas (primeiro passo empreendedor, mestre empreendedor).

## [1.3.0] - 2026-08-04

### Adicionado
- Logo real do POLVIn (`Polvin-logo.png`) no cabeçalho e nas telas de
  boas-vindas/resultado do onboarding.
- `js/polvin.js`: avatar SVG inline com animação 3D em CSS puro
  (tentáculos e olhos animados, boca que se move ao "falar").
- Fala com efeito de digitação e leitura em voz alta via Web Speech API
  nativa do navegador (sem API externa/paga).
- Dica de investimento do POLVIn na aba Investimentos (`INVESTMENT_TIPS`).
- POLVIn narra os contos da trilha de história (antes só texto).
- Assistente flutuante "Pergunte ao POLVIn": busca por palavras-chave
  sobre todo o conteúdo do site (`ASSISTANT_FAQ` + glossário +
  investimentos + livros), com aviso explícito de que não é uma IA
  generativa.

### Removido
- Selo de acessório do mascote na Home (redundante com o título de nível
  já exibido no hero card) e CSS morta de tamanhos antigos do mascote.

## [1.2.0] - 2026-08-04

### Alterado
- A trilha financeira e a trilha "Brasil: História & Economia" deixaram de
  ser abas/seções separadas e passaram a ser **uma única trilha
  intercalada**: os níveis se alternam (financeira → história →
  financeira → ...) em um só caminho sequencial de desbloqueio.
- Redesign visual completo da Academia Fin+: caminho sinuoso com espinha
  de progresso animada, nós de lição em zigue-zague, aros de progresso
  por nível, entrada animada por scroll, nó atual com pulso, ripple ao
  clicar, contador de XP com count-up, overlay de quiz com blur e dots de
  progresso por pergunta.
- `js/learn.js` reduzido a utilitários de gamificação; `js/history.js`
  removido (lógica migrada para o novo `js/trail.js`).

### Adicionado
- Conquista "Mestre da trilha completa" por concluir as duas trilhas.

## [1.1.0] - 2026-08-04

### Adicionado
- Compras parceladas na Carteira: valor total + número de parcelas, com
  cálculo automático de parcelas pagas/restantes e total comprometido no mês.
- Login com Google (Identity Services) ou perfil local por e-mail, sem senha.
- Trilha gamificada "Brasil: História & Economia" (4 níveis, 9 lições): contos
  sobre moedas do Brasil, ciclos econômicos, industrialização, hiperinflação,
  Plano Real, desigualdade de renda e o papel do Estado.
- Compra de criptomoedas por valor em reais na aba Ações & FIIs, com cotação
  automática (CoinGecko) e cálculo da quantidade fracionária.
- 5 novos livros na Biblioteca Fin+ sobre socialismo, distribuição de renda e
  dependência econômica (Marx, Furtado, Cardoso/Faletto, Stiglitz, Piketty).
- Interface da Academia Fin+ mais animada: confete ao concluir lições, toast
  de subida de nível, entrada escalonada dos nós da trilha, feedback visual
  nas respostas do quiz.
- 3 novas conquistas (primeiro conto, trilha de história completa, primeira
  compra parcelada).

## [1.0.0] - 2026-08-03

Primeira versão publicada no repositório.

### Adicionado
- Onboarding em duas etapas (dados pessoais + diagnóstico de perfil de risco).
- Trilha gamificada "Do Zero ao Avançado" (6 níveis, 19 lições, ~54 perguntas).
- Carteira digital (transações, orçamentos, lista de espera de desejos).
- Cofrinhos (metas de economia) e Carteira de Investimentos (alocação por classe de ativo).
- Aba Ações & FIIs: posições, dividendos, valorização e histórico por ano/mês.
- Aba Avançado: carteiras-modelo, calculadoras pro e dicionário do mercado.
- Biblioteca Fin+: recomendações de livros por nível.
- Desafios diários, missão da semana, evento aleatório do dia e conquistas.
- Indicadores de mercado em tempo real (AwesomeAPI, CoinGecko, Banco Central).
- Exportar/importar dados (backup manual em JSON).
