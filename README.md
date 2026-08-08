# PolvIn 💚

> **Polv** de Polvo — nosso mascote-guia de 8 braços — **In** de
> Investimentos e educação financeira: controle de gastos e variedade de
> conteúdos, do zero ao avançado.

Ferramenta web (HTML + CSS + JavaScript puro, sem frameworks e sem build)
para ajudar qualquer pessoa — do zero absoluto ao investidor experiente —
a entender o mercado financeiro, controlar gastos e aprender investimentos
de forma gamificada.

Funciona 100% localmente (dados salvos em `localStorage`, sem nenhuma
conta) e, **opcionalmente**, pode sincronizar os dados na nuvem via
**Supabase** (Postgres + autenticação), o que permite hospedar o site
publicamente (ex.: **Vercel**) e ter múltiplas pessoas usando com contas e
dados isolados de verdade. Sem configurar o Supabase, tudo continua
funcionando exatamente como um app 100% local.

## Como usar

Basta abrir `index.html` em um navegador. Não há build nem instalação de
dependências — tudo roda no navegador. Sem o Supabase configurado (ver
seção abaixo), os dados ficam só em `localStorage` (no seu próprio
computador/navegador).

> Para os indicadores de mercado e as cotações de cripto funcionarem, o
> navegador precisa de acesso à internet (os dados vêm de APIs públicas
> gratuitas).

### Habilitar o login com Google (opcional)

O login com Google usa o **Google Identity Services** para obter um token
de identidade; o que o PolvIn faz com esse token depende de o Supabase estar
configurado ou não (ver seção "Sincronização multiusuário" abaixo):

1. Crie um **OAuth Client ID gratuito** em
   [console.cloud.google.com](https://console.cloud.google.com/) → APIs e
   Serviços → Credenciais → Criar credenciais → ID do cliente OAuth →
   Aplicativo da Web, e registre a origem onde você for abrir o app.
2. Substitua o valor de `GOOGLE_CLIENT_ID` no topo de `js/auth.js` pelo
   Client ID gerado.
3. Abra o PolvIn por um **servidor local ou remoto (http/https)** — por
   exemplo, a extensão "Live Server" do VS Code, ou hospedando (ver
   "Hospedagem" abaixo). O login do Google **não funciona** abrindo o
   `index.html` direto (protocolo `file://`); o app detecta isso e avisa
   na tela em vez de mostrar um botão quebrado.

### Habilitar cotação automática de mais ações/FIIs (opcional)

Sem nenhuma configuração, a aba **Ações & FIIs** já busca cotação automática
para 4 tickers de teste da [brapi.dev](https://brapi.dev/) — **PETR4, MGLU3,
VALE3, ITUB4** — sem precisar de cadastro. Os demais tickers continuam com o
"preço atual" atualizado manualmente, exatamente como sempre funcionou.

Para liberar cotação automática de qualquer ticker:

1. Crie uma conta gratuita em [brapi.dev](https://brapi.dev/) (plano
   Gratuito: 15.000 requisições por mês) e copie o seu token em
   [brapi.dev/dashboard](https://brapi.dev/dashboard).
2. Cole o token em `BRAPI_TOKEN`, no topo de `js/brapi-config.js`.

Esse token fica visível no navegador (o PolvIn não tem servidor pra
escondê-lo) — a API só devolve cotações públicas, então o único risco é
outra pessoa consumir a sua cota gratuita, não exposição de dado sensível.
Se a cota se esgotar, o app volta a pedir a cotação manualmente, sem quebrar.

## Sincronização multiusuário com Supabase (opcional)

Por padrão o PolvIn não tem banco de dados nem servidor — é esse o motivo de
não existirem "credenciais de acesso" a um banco para te passar quando
ninguém configurou nada. Se você quer publicar o site para vários usuários
testarem com contas e dados próprios, o PolvIn já vem com a integração
pronta para o **Supabase** (Postgres gerenciado + autenticação, com plano
gratuito). Veja como ativar:

1. **Crie um projeto gratuito** em [supabase.com](https://supabase.com/) →
   New Project (guarde a senha do banco que você definir ali, não é
   usada pelo app, mas pode ser útil para você mesmo administrar o banco).
2. **Rode o schema**: no painel do projeto, abra **SQL Editor** → New
   query, cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql)
   deste repositório e clique em **Run**. Isso cria a tabela `user_data`
   (uma linha por chave de dado, por usuário) já com as políticas de
   **Row Level Security** que garantem que cada pessoa só acessa os
   próprios dados.
3. **Copie as credenciais**: em **Project Settings → API**, copie a
   **Project URL** e a chave **anon public**.
4. **Cole no código**: abra [`js/supabase-config.js`](js/supabase-config.js)
   e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` com os valores copiados.
   A anon key é feita para ser pública no navegador — quem protege os
   dados de verdade são as políticas de RLS do passo 2, não o segredo
   dessa chave.
5. **(Opcional, recomendado para testes)** Em **Authentication → Providers
   → Email**, desative "Confirm email" para que novas contas já entrem
   direto, sem precisar clicar num link de confirmação por e-mail.
6. **(Opcional)** Para o botão "Entrar com Google" criar uma conta real
   sincronizada (em vez de só decorar a saudação), habilite o provedor
   Google em **Authentication → Providers → Google**, usando o mesmo
   Client ID/Secret do OAuth criado na seção anterior.

A partir daí, qualquer pessoa que criar uma conta (e-mail/senha ou Google)
pelo botão "👤 Entrar" passa a ter transações, orçamentos, cofrinhos,
investimentos, progresso e conquistas sincronizados entre dispositivos —
protegidos por login, e nunca visíveis para outra conta. Se o cofre local
de criptografia (Perfil → Segurança) estiver ativo, o Supabase nunca chega
a receber o conteúdo em texto puro dos dados sensíveis — só a versão já
cifrada (ver seção "Segurança e privacidade" abaixo).

> **Limitação atual, por ser uma fase de testes**: a sincronização não faz
> merge inteligente entre dispositivos. Ao entrar com uma conta, os dados
> da nuvem substituem os locais deste navegador (a não ser na primeira vez,
> quando a nuvem ainda está vazia — nesse caso os dados locais são
> enviados para a nuvem). Use um dispositivo por vez com a mesma conta.

## Hospedagem

Hospedar o PolvIn significa publicar os arquivos estáticos (HTML/CSS/JS) em
algum lugar acessível por HTTPS — com ou sem o Supabase configurado, isso
não muda. Duas opções simples:

**GitHub Pages** (mais simples, já que o código está aqui no GitHub):
1. No GitHub, vá em **Settings → Pages** do repositório.
2. Em "Source", selecione o branch `main` e a pasta raiz (`/`).
3. Salve — em alguns minutos o GitHub publica o site em uma URL do tipo
   `https://petrucellivictor.github.io/FInPuls/`.

**Vercel** (também gratuito, e é a que combina melhor com o Supabase para
testes com vários usuários):
1. Em [vercel.com](https://vercel.com/), **Add New → Project** e importe
   este repositório do GitHub.
2. Como não há build, use **Framework Preset: "Other"**, deixe **Build
   Command** e **Output Directory** em branco, e clique em **Deploy**.
3. Em alguns segundos o Vercel publica o site em uma URL do tipo
   `https://fin-plus-seu-usuario.vercel.app`.
4. Se você já preencheu `js/supabase-config.js` com URL/chave reais antes
   de fazer o commit, a sincronização já funciona nessa URL — não é
   preciso configurar nenhuma variável de ambiente no Vercel, porque a
   anon key do Supabase é destinada a ficar no código do cliente (a
   segurança vem das políticas de RLS, não do sigilo dessa chave).

Publicar o site (em qualquer uma das duas opções) também resolve, de
graça, a limitação do login com Google que exige `http`/`https` (não
`file://`).

## Segurança e privacidade (LGPD)

- **Sem Supabase configurado**: nenhum dado financeiro seu é transmitido
  ou armazenado fora do seu navegador — comportamento padrão do projeto.
- **Com Supabase configurado** (sincronização multiusuário, seção acima):
  seus dados passam a ser armazenados também no banco Postgres do seu
  projeto Supabase, protegidos por autenticação e por políticas de Row
  Level Security (cada conta só lê/escreve as próprias linhas — ver
  `supabase/schema.sql`). Isso é uma transmissão de dados pessoais que
  passa a existir só a partir do momento em que a própria pessoa cria uma
  conta — quem não criar conta continua 100% local. Ver o texto completo
  em **Política de Privacidade** (link no rodapé do site, `js/privacy.js`).
- **Cofre de criptografia opcional** (`js/vault.js`, aba **Perfil →
  Segurança**): cifra com AES-256 (chave derivada por PBKDF2, 150.000
  iterações) os dados sensíveis — perfil, conta, transações, orçamentos,
  cofrinhos, investimentos, ações/FIIs, parcelamentos e ligas — usando uma
  senha local que nunca é enviada a lugar nenhum, nem para o Supabase.
  Quando o cofre está ativo, o que sincroniza com a nuvem para essas
  chaves sensíveis é só o blob já cifrado — o banco de dados nunca recebe
  o conteúdo em texto puro delas, mesmo com a sincronização ativada. Isso
  protege contra alguém que copie os arquivos do seu navegador, ou tenha
  acesso ao banco de dados, sem essa senha (dado em repouso). **Isso não
  protege**, e nenhuma criptografia no navegador de nenhum app protegeria,
  contra uma vulnerabilidade de execução de código (XSS) enquanto o cofre
  está desbloqueado — o próprio app precisa conseguir ler os dados para
  funcionar, a mesma limitação de qualquer gerenciador de senhas local.
  **Não há recuperação de senha**: se esquecida, os dados cifrados não
  podem ser restaurados por ninguém.
- **Direitos do titular já cobertos pelas ferramentas existentes**:
  acesso/portabilidade (⬇️ Exportar), correção (edição direta ou
  ⬆️ Importar) e eliminação (Reiniciar).

## Identidade visual

- **Roxo** (`--primary`) → cor de marca: cabeçalho, botões principais, abas ativas
  e o mascote **POLVIn**.
- **Verde** (`--green`) → linguagem de "crescimento financeiro": entradas de
  dinheiro, indicadores em alta, lições concluídas, respostas certas no quiz
  e o "+" do logotipo **PolvIn**.
- **Dourado, coral e azul** seguem como cores de apoio para gamificação (XP),
  alertas/saídas e informações neutras, respectivamente.
- **POLVIn**, o mascote, usa a arte 3D real (`Polvin-logo.png`) em todos os
  lugares — logotipo do cabeçalho, telas de boas-vindas, balões de fala,
  assistente e também como **favicon da aba do navegador** — com um selo
  de acessório/bandeira/moldura sobreposto quando você equipa algo na
  Loja (aba Perfil).

## O mascote POLVIn como personagem interativo

O POLVIn não é só uma imagem — ele fala, "conta" as histórias da trilha e
responde dúvidas sobre o site, com uma animação 3D em CSS puro (nada de
biblioteca externa: `perspective` + `rotateX/Y` + `translateZ` sobre a
própria arte do mascote).

- **Fala com efeito de digitação**: toda vez que o POLVIn dá uma dica —
  na Home (dica do dia e insights financeiros sobre você), na Carteira
  (avisos de gasto por impulso) e nos Investimentos — o texto aparece
  "digitando".
- **Leitura em voz alta de verdade**: o botão "🔊 Ouvir" usa a Web Speech
  API nativa do navegador (`speechSynthesis`) para narrar a dica ou o
  conto da trilha — sem nenhuma chave de API, sem custo, e sem depender de
  internet (o navegador usa vozes já instaladas no seu sistema). A
  disponibilidade de uma voz em português depende do seu navegador/SO.
- **"Pergunte ao POLVIn"**: um botão flutuante, disponível em qualquer
  aba, abre um chat onde você pode perguntar sobre qualquer funcionalidade
  do site ou termo financeiro. **Importante: não é uma IA generativa** —
  não há nenhum modelo de linguagem por trás. É uma busca por palavras-
  chave sobre o próprio conteúdo do PolvIn (a base de FAQ em
  `ASSISTANT_FAQ`, o glossário, o guia de investimentos e a biblioteca de
  livros). O próprio POLVIn explica isso na primeira mensagem do chat,
  para não gerar uma expectativa que a ferramenta não cumpre.
- **Insights sobre sua vida financeira real**: na Home, o POLVIn lê seus
  próprios dados (cofrinhos, investimentos, gastos do mês) e conta fatos
  como "você já guardou R$X em cofrinhos" ou "faltam R$Y para sua meta" —
  sempre com números reais, nunca inventados.

## Estrutura do projeto

```
fin-plus/
├── index.html                 → estrutura da página e das 13 abas
├── Polvin-logo.png             → arte 3D do POLVIn (logotipo do cabeçalho, telas de boas-vindas)
├── PolvIN.png                    → mood board/identidade visual do mascote (referência de marca)
├── assets/
│   └── polvin.svg                  → (legado) mascote em SVG simples
├── css/
│   └── style.css                    → todo o sistema de design (cores, tipografia, componentes, animações)
├── js/
│   ├── data.js                       → conteúdo: investimentos, trilhas, glossário, carteiras-modelo,
│   │                                     tabela de IR, níveis nomeados, desafios, eventos, conquistas,
│   │                                     livros, dicas, base de conhecimento do assistente, itens da
│   │                                     Loja e faixas de medalha
│   ├── profile.js                       → aba Perfil: avatar, estatísticas, medalha atual e a Loja
│   ├── leagues.js                        → aba Desafios: seu placar e Ligas locais manuais
│   ├── storage.js                     → camada de persistência (localStorage) + exportar/importar backup
│   ├── vault.js                        → cofre opcional de criptografia local (AES-256) dos dados sensíveis
│   ├── supabase-config.js               → credenciais do Supabase (obrigatórias desde a RFC-027 — sem elas o app não inicia)
│   ├── cloud.js                          → sincronização multiusuário via Supabase (obrigatória desde a RFC-027, fonte de verdade dos dados)
│   ├── privacy.js                       → modal da Política de Privacidade (LGPD)
│   ├── fx.js                           → efeitos visuais compartilhados (confete, toast de subida de nível)
│   ├── polvin.js                        → mascote interativo: avatar SVG animado em 3D (CSS), fala com
│   │                                       efeito de digitação + voz nativa do navegador, e o assistente
│   │                                       flutuante "Pergunte ao POLVIn" (busca por palavras-chave)
│   ├── tabs.js                            → navegação entre abas
│   ├── auth.js                       → login (Supabase real quando configurado, ou perfil local por e-mail/Google)
│   ├── onboarding.js                  → diagnóstico inicial: "sobre você" + 5 perguntas de perfil de risco
│   ├── investments.js                  → guia de investimentos com filtros e modal
│   ├── simulator.js                     → simulador de juros compostos (investir x não investir)
│   ├── wallet.js                          → carteira digital: transações, orçamentos, lista de espera
│   ├── installments.js                     → compras parceladas: parcelas pagas x restantes
│   ├── goals.js                              → cofrinhos virtuais (metas de economia)
│   ├── portfolio.js                            → carteira de investimentos: alocação real x carteira-modelo
│   ├── stocks.js                                 → aba Ações & FIIs: posições, dividendos, cripto fracionada
│   ├── learn.js                                    → utilitários de gamificação (XP, moedas, streak, pontuação total, nível de jogador)
│   ├── energy.js                                    → sistema de energia (estilo Duolingo): 3/dia, gasta por lição iniciada,
│   │                                                    renova por dia, +1 por combo de 3 acertos seguidos numa lição
│   ├── trail.js                                      → trilha única intercalada (financeira + Brasil: História), caminho sinuoso
│   ├── business.js                                     → trilha "Empreender" (independente): regimes tributários,
│   │                                                      obrigações fiscais/contábeis e gestão de pessoas/finanças
│   ├── engagement.js                                   → desafios diários, missão da semana e evento do dia
│   ├── achievements.js                                   → conquistas desbloqueadas pelo uso real do app
│   ├── market.js                                           → indicadores em tempo real (moedas, cripto, BCB)
│   ├── news.js                                               → notícias com impacto na economia brasileira
│   ├── advanced.js                                             → aba Avançado: carteiras-modelo, calculadoras, dicionário
│   ├── books.js                                                  → aba Biblioteca PolvIn: recomendações de livros
│   └── app.js                                                      → orquestrador geral / dashboard
├── supabase/
│   └── schema.sql                  → script SQL (tabela + Row Level Security) para o Supabase opcional
├── .claude/agents/                 → definições dos 12 agentes especializados (ver seção abaixo)
└── README.md
```

## Orchestrator AI e a equipe de agentes especializados

O desenvolvimento do PolvIn com Claude Code segue o protocolo definido em [`CLAUDE.md`](CLAUDE.md): toda solicitação passa primeiro por uma **RFC** (`rfcs/RFC-NNN-*.md`) e é coordenada por um **Orchestrator AI** através de 13 papéis definidos em `.claude/agents/*.md`, cada um com contexto real do projeto (não descrições genéricas) e limites claros do que pode e não pode fazer. O Orchestrator nunca implementa diretamente — ele encaminha, na ordem abaixo, e consolida os resultados.

| # | Papel (Workflow Oficial) | Arquivo em `.claude/agents/` |
| - | --- | --- |
| 1 | Product Owner | `product-owner` — define/prioriza funcionalidades, roadmap, user stories — nunca escreve código |
| 2 | Software Architect | `software-architect` — define estrutura de módulos, dependências e formato de dados antes de codar — não cria interface |
| 3 | UX/UI Designer | `ux-ui-design-lead` — UX/UI, design system, acessibilidade, responsividade |
| 4 | Gamification Designer | `gamification-designer` — XP, energia, streak, conquistas, ligas, loja — só especifica, não codifica |
| 5 | Financial Specialist | `financial-education-specialist` — cria/valida todo o conteúdo da trilha (lições, quizzes, simuladores) |
| 6 | Database Engineer | `database-engineer` — modelagem de dados (`STORAGE_KEYS`, schema/RLS do Supabase) |
| 7 | Backend Engineer | `backend-engineer` — regras de negócio, gamificação, integração com Supabase |
| 8 | Frontend Engineer | `frontend-engineer` — implementa telas e interatividade (HTML/CSS/JS puro) |
| 9 | Cyber Security Specialist | `security-specialist` — auditoria OWASP, RLS do Supabase, XSS, exposição de segredos |
| 10 | QA Engineer | `qa-engineer` — testa e reporta bugs — não corrige código |
| 11 | Documentation Specialist | `documentation-specialist` — mantém README, CHANGELOG e ROADMAP atualizados a cada mudança |
| 12 | DevOps Engineer | `devops-engineer` — git/GitHub, deploy, infraestrutura do Supabase, segredos (só quando há deploy) |
| — | *(fora do workflow obrigatório)* | `ai-prompt-engineer` — personalidade do POLVIn e o assistente por palavras-chave |

Veja `CLAUDE.md` para a Regra de Ouro, o template de RFC e os critérios de qualidade completos.

## O que já funciona (v7 — com moedas, loja, medalhas, ligas e perfil)

### Conta e personalização
- **Login com Google ou e-mail**: por padrão, é só um perfil local (sem
  senha) que personaliza a saudação com nome/foto, sem sincronização entre
  dispositivos. Com o Supabase configurado (nova! ver seção "Sincronização
  multiusuário" acima), o mesmo botão passa a criar uma conta real
  (e-mail+senha, ou Google validado pelo Supabase), com dados sincronizados
  entre dispositivos e isolados por conta via Row Level Security.
- **Onboarding em duas etapas**: "sobre você" (idade, situação
  profissional, faixa de renda, objetivo principal com ícones — entre 9
  opções, incluindo aposentadoria e investir em estudos — e o **valor real
  da meta**, que a pessoa digita) + o diagnóstico de 5 perguntas que
  calcula nível, objetivo e tolerância a risco. O cofrinho criado
  automaticamente usa o valor que a pessoa informou, não um valor fixo.

### Mascote interativo (nova!)
- **Avatar 3D animado** (CSS puro) com tentáculos e olhos animados,
  presente na Home, Carteira, Investimentos, na trilha e no assistente.
- **Fala com efeito de digitação** + **botão "🔊 Ouvir"** com leitura em
  voz alta nativa do navegador (Web Speech API).
- **"Pergunte ao POLVIn"**: botão flutuante em qualquer aba, abre um chat
  com busca por palavras-chave sobre todo o conteúdo do site — transparente
  sobre não ser uma IA generativa de verdade.

### Perfil, Loja e Desafios (novo!)
- **Moedas**: uma segunda moeda de troca, separada do XP — ganhe
  completando lições (+5), desafios diários (+2), missões da semana
  (+10) e cofrinhos (+15), mais um **bônus de login diário** (como os
  "foguinhos" do Duolingo: só por abrir o app hoje, escalando de 5 a 30
  moedas conforme sua ofensiva).
- **Aba Perfil**: seu avatar (com os itens equipados), XP, moedas,
  ofensiva, pontuação total, medalha atual e a **Loja** — compre
  acessórios (chapéus), insígnias/bandeiras e molduras com moedas, e
  equipe no POLVIn. Como o avatar agora é a arte real do mascote (não um
  SVG editável), os itens aparecem como selos sobrepostos — uma
  simplificação visual, não uma re-ilustração do personagem.
- **Aba Desafios**: seu placar (pontuação = XP + moedas×2 +
  conquistas×20 + streak×5), a tabela de medalhas por faixa de pontuação
  (Bronze → Prata → Ouro → Platina → Diamante), e **Ligas** — crie um
  grupo, adicione o nome de amigos e atualize a pontuação deles
  manualmente para competir. **Importante:** o PolvIn não tem servidor, então
  isso é um placar local e manual (como uma "tabela de placar" que vocês
  atualizam comparando o que cada um vê na própria aba Perfil) — não é um
  ranking automático sincronizado entre instalações diferentes. Sua
  própria linha na tabela é sempre calculada automaticamente.

### Gamificação ("Academia PolvIn")
- **Trilha única e intercalada**: a trilha financeira "Do Zero ao
  Avançado" (6 níveis, 67 lições — o Nível 1 "Fundamentos e Comportamento
  Financeiro" foi expandido de 5 para 35 lições, cobrindo desde receita
  e despesa até score de crédito, INSS e viés comportamental, com perfil
  de investidor e juros compostos nos fundamentos, antes de qualquer
  produto específico; o Nível 2 "Renda Fixa" foi expandido de 3 para 20
  lições, cobrindo Tesouro, CDB/LCI/LCA/CRI/CRA, debêntures, rating,
  duration, marcação a mercado, curva de juros e fundos DI) e a trilha
  "Brasil: História & Economia" (6 níveis, 15
  lições, cada uma com um pequeno conto — moedas do Réis ao Real, a
  chegada da Corte portuguesa e a Independência com dívida (Onda 9), a
  redemocratização de 1945, o Plano de Metas de JK e a crise
  institucional pré-1964 (Onda 10), ciclos econômicos, Vargas, milagre
  econômico, Plano Real, desigualdade e o papel do Estado) não são abas
  separadas: os níveis se alternam em **um
  único caminho sequencial** (financeira → história → financeira →
  história...), como capítulos de uma mesma jornada. Uma lição só
  destrava a próxima depois de concluída, seja ela de qual das duas
  trilhas for. Ambas compartilham o mesmo XP.
- **Introdução didática + reforço após erro** (nova!): toda lição (das
  três trilhas — financeira, história e Empreender) começa com um texto
  curto do POLVIn usando analogias do dia a dia (ex.: inflação como um
  balão furado, diversificação como "não colocar todos os ovos na mesma
  cesta") antes do quiz. Ao errar uma pergunta, a pessoa vê a explicação
  correta e, quando existe, responde uma segunda versão da mesma pergunta
  (outro exemplo/cenário) antes de seguir — para fixar o conceito, não só
  mostrar a resposta certa.
- **Caminho sinuoso e animado**: os níveis aparecem como estações de um
  trajeto vertical, com nós de lição em zigue-zague conectados por uma
  "espinha" que se preenche de cor conforme seu progresso avança. A lição
  atual pulsa suavemente para indicar o próximo passo; nós, banners e
  respostas do quiz têm animações de entrada, ondulação ao toque (ripple),
  confete na conclusão e um toast comemorativo ao subir de "nível de
  jogador" — tudo respeitando `prefers-reduced-motion`.
- **Níveis de jogador nomeados**: Iniciante → Aprendiz Financeiro →
  Planejador → Investidor → Construtor de Patrimônio → Mestre PolvIn, com o
  contador de XP no cabeçalho "subindo" com animação ao ganhar pontos.
- **Trilha "Empreender"** (nova!): uma trilha independente, no mesmo
  estilo, para quem quer abrir ou já tem uma empresa — 5 níveis, 15 mini
  aulas didáticas com quiz. Cobre a diferença entre empreender e ser
  empresário, os 4 regimes tributários (MEI, Simples Nacional, Lucro
  Presumido, Lucro Real — o que é cada um, limites e quando compensa
  migrar), obrigações fiscais/contábeis (notas fiscais, prazos, como
  preparar a entrega mensal para o contador) e gestão de pessoas e
  finanças (custo real de um funcionário, como reter talento, separar
  finanças pessoais da empresa). Conteúdo educativo — não é consultoria
  contábil, tributária ou trabalhista, e valores de limites/alíquotas
  mudam por lei; confirme sempre com seu contador.
- **Desafios diários**, **missão da semana** e **evento aleatório do dia**
  (cenários educativos), com detecção automática de progresso.
- **Conquistas**: 19 badges desbloqueadas pelo uso real do app, incluindo
  completar a trilha unificada e a trilha Empreender por completo.

### Dinheiro e investimentos
- **Guia de investimentos** com 9 tipos, risco, liquidez, tributação,
  garantia, prós e contras, e filtros por categoria/nível.
- **Simulador de juros compostos** (investir x guardar sem render) e um
  **Comparador de Investimentos** (novo!): informe o valor e o prazo, e o
  PolvIn simula Poupança, CDB, LCI/LCA e Tesouro Selic, usando a Selic
  atual (Banco Central) como referência, aplica o IR regressivo real e
  ranqueia as 3 opções de renda fixa mais vantajosas líquidas — mais 1
  comparação com FIIs (renda variável, via dividend yield estimado) — com
  uma explicação de por que a vencedora venceu (isenção de IR x taxa
  nominal maior).
- **Carteira digital**: entradas/saídas, orçamento por categoria, alertas
  de gasto compulsivo, lista de espera de desejos (regra de 7 dias).
- **Compras parceladas** (nova!): registre o valor total e o número de
  parcelas de uma compra — o PolvIn calcula automaticamente quantas parcelas
  já "venceram" (com base na data da compra) e quanto ainda falta pagar,
  com um indicador visual de cada parcela paga/futura e o total
  comprometido no mês.
- **Cofrinhos** (metas de economia) e **Carteira de Investimentos**
  (alocação real por classe de ativo x carteira-modelo do seu perfil).
- **Ações & FIIs**: registre compras, dividendos e preço atual (manual).
  Para **criptomoedas** (nova!), a compra é por valor em reais — o PolvIn
  busca a cotação atual (CoinGecko) e calcula a quantidade fracionária
  automaticamente, já que cripto não se compra em "cotas" inteiras. O
  preço de posições em cripto também se atualiza automaticamente.
- **Aba Avançado**: carteiras-modelo, calculadoras pro (tributação de
  renda fixa, independência financeira, retorno real) e um dicionário do
  mercado com ~39 termos.

### Conteúdo e mercado
- **Biblioteca PolvIn**: agora com 18 livros reais — do "Pai Rico, Pai
  Pobre" ao "O Capital" (Marx), "Formação Econômica do Brasil" (Celso
  Furtado) e "O Capital no Século XXI" (Piketty) — cobrindo também
  distribuição de renda, dependência econômica e pensamento crítico sobre
  o capitalismo, não só finanças de mercado.
- **Indicadores em tempo real**: moedas, cripto e Selic/CDI/IPCA/Dólar
  oficiais, com ranking educativo por perfil de risco, e uma seção de
  **Ações e FIIs em destaque** — exemplos reais categorizados por
  característica estrutural (dividendos consistentes / setores cíclicos
  / exposição diversificada), já que o app não tem cotação em tempo real
  de ativos individuais. Não é recomendação de investimento.
- **Dicas rápidas** (`js/tooltip.js`): um ícone "?" em campos de
  calculadoras e indicadores explica, em linguagem simples, o que aquele
  termo/campo significa — funciona com mouse, teclado e toque.
- **Notícias** e **Educação financeira e consciência de classe**.

### Infraestrutura
- **Exportar/Importar dados**: backup manual completo em um arquivo JSON.
- **Design responsivo e animado**, acessível via teclado, respeitando
  `prefers-reduced-motion`.

## Fora do escopo (e por quê)

Alguns pedidos comuns de "app financeiro completo" exigem infraestrutura
que este projeto — deliberadamente HTML/CSS/JS puro, sem backend próprio —
não tem, e não deveria simular de forma enganosa:

- **Scanner de nota fiscal (IA de visão) e scanner de extrato/Open
  Finance**: exigem processamento de IA e/ou integração regulada com
  instituições financeiras, com backend seguro e credenciamento.
- **IA conversacional de verdade (tipo ChatGPT)**: exigiria uma chave de
  API de LLM guardada em servidor — nunca deve ficar exposta direto no
  navegador. O "Pergunte ao POLVIn" existe, mas é busca por palavras-chave
  sobre o conteúdo do site (ver seção "O mascote POLVIn como personagem
  interativo"), não uma IA generativa.
- **Ranking global automático entre usuários**: com o Supabase configurado
  (seção "Sincronização multiusuário" acima) já existe uma base de dados
  compartilhada, então isso deixou de ser tecnicamente impossível — mas
  ainda não foi implementado (as **Ligas**, aba Desafios, continuam
  manuais e locais por enquanto). Um próximo passo natural seria uma view
  pública só de XP/moedas/streak para montar um ranking ao vivo.
- **Login com Google 100% "pronto de fábrica"**: tecnicamente depende de
  um Client ID vinculado a um domínio/origem específico — algo que só
  quem hospeda o app pode gerar (não é possível deixar pré-configurado de
  forma genérica). O cadastro por e-mail local não tem essa limitação.
- **Cotação automática de qualquer ação/FII**: testamos APIs públicas
  gratuitas (ex.: brapi.dev) e a maioria dos tickers exige token — por
  isso ações/FIIs usam preço manual, enquanto criptomoedas (com APIs
  públicas mais abertas, como a CoinGecko) já são 100% automáticas.

## Roadmap sugerido (próximas etapas)

0. **Expansão das 3 trilhas para ~300 lições cada** — já existe um
   blueprint modular (17-21 módulos por trilha, pedagogicamente ordenado
   com base em referências reais de currículo financeiro/históricos/MBA)
   rumo ao conteúdo "do zero ao mestrado" em Financeira, História &
   Economia e Empreender. A escrita do conteúdo em si acontece em ondas
   revisáveis nas próximas atualizações — não é uma tarefa de uma vez só.
1. **Ranking/Ligas ao vivo** — agora que existe um backend (Supabase),
   dá para expor um ranking público de XP/moedas/streak e ligas
   sincronizadas de verdade, em vez de manuais/locais.
2. **Merge inteligente entre dispositivos** — hoje a sincronização
   (seção "Sincronização multiusuário") sempre faz a nuvem sobrescrever o
   local ao entrar; um merge por campo/timestamp evitaria perda de dados
   ao usar dois dispositivos offline com a mesma conta.
3. **Notícias ao vivo** — plugar uma News API real na função
   `fetchLiveNews()` em `js/news.js`.
4. **Gráficos de evolução de patrimônio** — histórico mensal do saldo e
   dos investimentos, usando um `<canvas>` dedicado.
5. **Indicadores adicionais** — Ibovespa, IFIX e curva de juros (DI
   futuro) na aba Mercado, quando houver fonte pública gratuita estável.
6. **Cotação automática opcional para ações/FIIs** — permitir que quem
   tiver um token gratuito do brapi.dev conecte para atualizar preços
   automaticamente, mantendo a atualização manual como padrão.
7. **Temas visuais na Loja** — trocar moedas por temas de cor além dos
   acessórios/molduras já disponíveis.
8. **Modo escuro** e mais opções de acessibilidade (tamanho de fonte,
   alto contraste).

---
*Este projeto é uma ferramenta educativa. Nenhum conteúdo aqui constitui
recomendação de investimento, tributária, contábil, trabalhista, política
ou econômica personalizada — os temas de história e economia são
apresentados de forma factual e educativa, incluindo diferentes correntes
de pensamento econômico, e os valores de limites/alíquotas tributárias
citados na trilha Empreender são aproximados e mudam por lei: confirme
sempre com um contador antes de qualquer decisão real.*
