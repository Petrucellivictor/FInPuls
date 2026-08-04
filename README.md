# Fin+ 💚

> **Fin** de Finanças, **In** de Investimentos, **+** de tudo o que vem além:
> educação financeira, controle de gastos e variedade de conteúdos — do
> zero ao avançado.

Ferramenta web (HTML + CSS + JavaScript puro, sem frameworks e sem backend)
para ajudar qualquer pessoa — do zero absoluto ao investidor experiente —
a entender o mercado financeiro, controlar gastos e aprender investimentos
de forma gamificada.

## Como usar

Basta abrir `index.html` em um navegador. Não há build, servidor ou
instalação de dependências — tudo roda no navegador, com dados salvos em
`localStorage` (ou seja, ficam salvos no seu próprio computador/navegador).

> Para os indicadores de mercado e as cotações de cripto funcionarem, o
> navegador precisa de acesso à internet (os dados vêm de APIs públicas
> gratuitas).

### Habilitar o login com Google (opcional)

O cadastro por e-mail (perfil local, sem senha) funciona sempre. Já o
"Entrar com Google" só funciona depois de dois passos, porque depende de
infraestrutura do Google que este projeto não controla:

1. Crie um **OAuth Client ID gratuito** em
   [console.cloud.google.com](https://console.cloud.google.com/) → APIs e
   Serviços → Credenciais → Criar credenciais → ID do cliente OAuth →
   Aplicativo da Web, e registre a origem onde você for abrir o app.
2. Substitua o valor de `GOOGLE_CLIENT_ID` no topo de `js/auth.js` pelo
   Client ID gerado.
3. Abra o Fin+ por um **servidor local ou remoto (http/https)** — por
   exemplo, a extensão "Live Server" do VS Code, ou hospedando no GitHub
   Pages (ver seção "Hospedagem" abaixo). O login do Google **não
   funciona** abrindo o `index.html` direto (protocolo `file://`); o app
   detecta isso e avisa na tela em vez de mostrar um botão quebrado.

## Hospedagem

**Não existe banco de dados nem servidor no Fin+** — não há credenciais de
acesso a fornecer, porque nenhuma infraestrutura desse tipo existe. Todo o
"backend" do app é o próprio navegador de cada visitante (`localStorage`).
Hospedar o Fin+ significa apenas publicar os arquivos estáticos (HTML/CSS/
JS) em algum lugar acessível por HTTPS. A forma mais simples, já que o
código vive neste repositório no GitHub, é o **GitHub Pages** (gratuito):

1. No GitHub, vá em **Settings → Pages** do repositório.
2. Em "Source", selecione o branch `main` e a pasta raiz (`/`).
3. Salve — em alguns minutos o GitHub publica o site em uma URL do tipo
   `https://petrucellivictor.github.io/FInPuls/`.

Isso também resolve, de graça, a limitação do login com Google citada
acima (que exige `http`/`https`, não `file://`). Cada visitante continua
com seus próprios dados isolados no próprio navegador — publicar o site
não cria um banco de dados compartilhado nem sincroniza usuários entre si.

## Segurança e privacidade (LGPD)

- **Sem servidor, sem coleta remota**: como não há backend, nenhum dado
  financeiro seu é transmitido ou armazenado fora do seu navegador. Ver o
  texto completo em **Política de Privacidade** (link no rodapé do site,
  implementado em `js/privacy.js`).
- **Cofre de criptografia opcional** (`js/vault.js`, aba **Perfil →
  Segurança**): cifra com AES-256 (chave derivada por PBKDF2, 150.000
  iterações) os dados sensíveis — perfil, conta, transações, orçamentos,
  cofrinhos, investimentos, ações/FIIs, parcelamentos e ligas — usando uma
  senha local que nunca é enviada a lugar nenhum. Isso protege contra
  alguém que copie os arquivos do seu navegador sem essa senha (dado em
  repouso). **Isso não protege**, e nenhuma criptografia no navegador de
  nenhum app protegeria, contra uma vulnerabilidade de execução de código
  (XSS) enquanto o cofre está desbloqueado — o próprio app precisa
  conseguir ler os dados para funcionar, a mesma limitação de qualquer
  gerenciador de senhas local. **Não há recuperação de senha**: se
  esquecida, os dados cifrados não podem ser restaurados por ninguém.
- **Direitos do titular já cobertos pelas ferramentas existentes**:
  acesso/portabilidade (⬇️ Exportar), correção (edição direta ou
  ⬆️ Importar) e eliminação (Reiniciar).

## Identidade visual

- **Roxo** (`--primary`) → cor de marca: cabeçalho, botões principais, abas ativas
  e o mascote **POLVIn**.
- **Verde** (`--green`) → linguagem de "crescimento financeiro": entradas de
  dinheiro, indicadores em alta, lições concluídas, respostas certas no quiz
  e o "+" do logotipo **Fin+**.
- **Dourado, coral e azul** seguem como cores de apoio para gamificação (XP),
  alertas/saídas e informações neutras, respectivamente.
- **POLVIn**, o mascote, usa a arte 3D real (`Polvin-logo.png`) em todos os
  lugares — logotipo do cabeçalho, telas de boas-vindas, balões de fala e
  assistente — com um selo de acessório/bandeira/moldura sobreposto quando
  você equipa algo na Loja (aba Perfil).

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
  chave sobre o próprio conteúdo do Fin+ (a base de FAQ em
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
│   ├── privacy.js                       → modal da Política de Privacidade (LGPD)
│   ├── fx.js                           → efeitos visuais compartilhados (confete, toast de subida de nível)
│   ├── polvin.js                        → mascote interativo: avatar SVG animado em 3D (CSS), fala com
│   │                                       efeito de digitação + voz nativa do navegador, e o assistente
│   │                                       flutuante "Pergunte ao POLVIn" (busca por palavras-chave)
│   ├── tabs.js                            → navegação entre abas
│   ├── auth.js                       → login com Google ou perfil local por e-mail
│   ├── onboarding.js                  → diagnóstico inicial: "sobre você" + 5 perguntas de perfil de risco
│   ├── investments.js                  → guia de investimentos com filtros e modal
│   ├── simulator.js                     → simulador de juros compostos (investir x não investir)
│   ├── wallet.js                          → carteira digital: transações, orçamentos, lista de espera
│   ├── installments.js                     → compras parceladas: parcelas pagas x restantes
│   ├── goals.js                              → cofrinhos virtuais (metas de economia)
│   ├── portfolio.js                            → carteira de investimentos: alocação real x carteira-modelo
│   ├── stocks.js                                 → aba Ações & FIIs: posições, dividendos, cripto fracionada
│   ├── learn.js                                    → utilitários de gamificação (XP, moedas, streak, pontuação total, nível de jogador)
│   ├── trail.js                                      → trilha única intercalada (financeira + Brasil: História), caminho sinuoso
│   ├── business.js                                     → trilha "Empreender" (independente): regimes tributários,
│   │                                                      obrigações fiscais/contábeis e gestão de pessoas/finanças
│   ├── engagement.js                                   → desafios diários, missão da semana e evento do dia
│   ├── achievements.js                                   → conquistas desbloqueadas pelo uso real do app
│   ├── market.js                                           → indicadores em tempo real (moedas, cripto, BCB)
│   ├── news.js                                               → notícias com impacto na economia brasileira
│   ├── advanced.js                                             → aba Avançado: carteiras-modelo, calculadoras, dicionário
│   ├── books.js                                                  → aba Biblioteca Fin+: recomendações de livros
│   └── app.js                                                      → orquestrador geral / dashboard
└── README.md
```

## O que já funciona (v7 — com moedas, loja, medalhas, ligas e perfil)

### Conta e personalização
- **Login com Google ou perfil local por e-mail** (sem senha): personaliza
  a saudação com nome/foto. Sem backend, não há sincronização entre
  dispositivos — é só identificação local neste navegador (ver seção
  "Habilitar o login com Google" acima).
- **Onboarding em duas etapas**: "sobre você" (idade, situação
  profissional, faixa de renda e objetivo principal com ícones) + o
  diagnóstico de 5 perguntas que calcula nível, objetivo e tolerância a
  risco. O objetivo escolhido já cria automaticamente um cofrinho sugerido.

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
  manualmente para competir. **Importante:** o Fin+ não tem servidor, então
  isso é um placar local e manual (como uma "tabela de placar" que vocês
  atualizam comparando o que cada um vê na própria aba Perfil) — não é um
  ranking automático sincronizado entre instalações diferentes. Sua
  própria linha na tabela é sempre calculada automaticamente.

### Gamificação ("Academia Fin+")
- **Trilha única e intercalada** (nova!): a trilha financeira "Do Zero ao
  Avançado" (6 níveis, 20 lições) e a trilha "Brasil: História & Economia"
  (4 níveis, 9 lições, cada uma com um pequeno conto — moedas do Réis ao
  Real, ciclos econômicos, Vargas, milagre econômico, Plano Real,
  desigualdade e o papel do Estado) não são mais abas separadas: os níveis
  se alternam em **um único caminho sequencial** (financeira → história →
  financeira → história...), como capítulos de uma mesma jornada. Uma
  lição só destrava a próxima depois de concluída, seja ela de qual das
  duas trilhas for. Ambas compartilham o mesmo XP.
- **Caminho sinuoso e animado**: os níveis aparecem como estações de um
  trajeto vertical, com nós de lição em zigue-zague conectados por uma
  "espinha" que se preenche de cor conforme seu progresso avança. A lição
  atual pulsa suavemente para indicar o próximo passo; nós, banners e
  respostas do quiz têm animações de entrada, ondulação ao toque (ripple),
  confete na conclusão e um toast comemorativo ao subir de "nível de
  jogador" — tudo respeitando `prefers-reduced-motion`.
- **Níveis de jogador nomeados**: Iniciante → Aprendiz Financeiro →
  Planejador → Investidor → Construtor de Patrimônio → Mestre Fin+, com o
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
  Fin+ simula Poupança, CDB, LCI/LCA e Tesouro Selic, usando a Selic
  atual (Banco Central) como referência, aplica o IR regressivo real e
  ranqueia as 3 opções de renda fixa mais vantajosas líquidas — mais 1
  comparação com FIIs (renda variável, via dividend yield estimado) — com
  uma explicação de por que a vencedora venceu (isenção de IR x taxa
  nominal maior).
- **Carteira digital**: entradas/saídas, orçamento por categoria, alertas
  de gasto compulsivo, lista de espera de desejos (regra de 7 dias).
- **Compras parceladas** (nova!): registre o valor total e o número de
  parcelas de uma compra — o Fin+ calcula automaticamente quantas parcelas
  já "venceram" (com base na data da compra) e quanto ainda falta pagar,
  com um indicador visual de cada parcela paga/futura e o total
  comprometido no mês.
- **Cofrinhos** (metas de economia) e **Carteira de Investimentos**
  (alocação real por classe de ativo x carteira-modelo do seu perfil).
- **Ações & FIIs**: registre compras, dividendos e preço atual (manual).
  Para **criptomoedas** (nova!), a compra é por valor em reais — o Fin+
  busca a cotação atual (CoinGecko) e calcula a quantidade fracionária
  automaticamente, já que cripto não se compra em "cotas" inteiras. O
  preço de posições em cripto também se atualiza automaticamente.
- **Aba Avançado**: carteiras-modelo, calculadoras pro (tributação de
  renda fixa, independência financeira, retorno real) e um dicionário do
  mercado com ~39 termos.

### Conteúdo e mercado
- **Biblioteca Fin+**: agora com 18 livros reais — do "Pai Rico, Pai
  Pobre" ao "O Capital" (Marx), "Formação Econômica do Brasil" (Celso
  Furtado) e "O Capital no Século XXI" (Piketty) — cobrindo também
  distribuição de renda, dependência econômica e pensamento crítico sobre
  o capitalismo, não só finanças de mercado.
- **Indicadores em tempo real**: moedas, cripto e Selic/CDI/IPCA/Dólar
  oficiais, com ranking educativo por perfil de risco.
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
- **Ranking global automático entre usuários**: exigiria múltiplos
  usuários sincronizados em um backend; hoje cada navegador guarda dados
  isolados. Por isso as **Ligas** (aba Desafios) são manuais e locais —
  ótimas para competir com amigos reais, mas não um ranking ao vivo.
- **Login com Google 100% "pronto de fábrica"**: tecnicamente depende de
  um Client ID vinculado a um domínio/origem específico — algo que só
  quem hospeda o app pode gerar (não é possível deixar pré-configurado de
  forma genérica). O cadastro por e-mail local não tem essa limitação.
- **Cotação automática de qualquer ação/FII**: testamos APIs públicas
  gratuitas (ex.: brapi.dev) e a maioria dos tickers exige token — por
  isso ações/FIIs usam preço manual, enquanto criptomoedas (com APIs
  públicas mais abertas, como a CoinGecko) já são 100% automáticas.

## Roadmap sugerido (próximas etapas)

1. **Conta e sincronização real** — um backend simples (ex.: Node/Firebase)
   permitiria acessar os dados de qualquer dispositivo com o mesmo login.
2. **Notícias ao vivo** — plugar uma News API real na função
   `fetchLiveNews()` em `js/news.js`.
3. **Gráficos de evolução de patrimônio** — histórico mensal do saldo e
   dos investimentos, usando um `<canvas>` dedicado.
4. **Indicadores adicionais** — Ibovespa, IFIX e curva de juros (DI
   futuro) na aba Mercado, quando houver fonte pública gratuita estável.
5. **Cotação automática opcional para ações/FIIs** — permitir que quem
   tiver um token gratuito do brapi.dev conecte para atualizar preços
   automaticamente, mantendo a atualização manual como padrão.
6. **Temas visuais na Loja** — trocar moedas por temas de cor além dos
   acessórios/molduras já disponíveis.
7. **Exportar/importar liga** — permitir compartilhar uma liga via
   arquivo (hoje ela vive só neste navegador, como o resto dos dados).
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
