# Changelog

Todas as alterações relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

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
