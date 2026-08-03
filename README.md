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

> Para os indicadores de mercado funcionarem, o navegador precisa de acesso
> à internet (as cotações vêm de APIs públicas gratuitas).

## Identidade visual

- **Roxo** (`--primary`) → cor de marca: cabeçalho, botões principais, abas ativas
  e o mascote **POLVIn**.
- **Verde** (`--green`) → linguagem de "crescimento financeiro": entradas de
  dinheiro, indicadores em alta, lições concluídas, respostas certas no quiz
  e o "+" do logotipo **Fin+**.
- **Dourado, coral e azul** seguem como cores de apoio para gamificação (XP),
  alertas/saídas e informações neutras, respectivamente.
- **POLVIn**, o mascote (SVG em `assets/polvin.svg`), aparece na tela de
  boas-vindas do diagnóstico, no resultado do diagnóstico, na "Dica do dia"
  do Início (com um selo de acessório que evolui conforme seu nível de
  jogador) e na dica contra gastos compulsivos da Carteira.

## Estrutura do projeto

```
fin-plus/
├── index.html               → estrutura da página e das 10 abas
├── assets/
│   └── polvin.svg             → mascote POLVIn (usado em pontos de orientação)
├── css/
│   └── style.css             → todo o sistema de design (cores, tipografia, componentes)
├── js/
│   ├── data.js                → conteúdo: investimentos, trilha, glossário, carteiras-modelo,
│   │                              tabela de IR, níveis nomeados, desafios, eventos, conquistas, livros
│   ├── storage.js              → camada de persistência (localStorage) + exportar/importar backup
│   ├── tabs.js                  → navegação entre abas
│   ├── onboarding.js             → diagnóstico inicial: "sobre você" (idade, situação, renda,
│   │                                objetivo) + 5 perguntas de perfil de risco
│   ├── investments.js             → guia de investimentos com filtros e modal
│   ├── simulator.js                → simulador de juros compostos (investir x não investir)
│   ├── wallet.js                    → carteira digital: transações, orçamentos, lista de espera
│   ├── goals.js                      → cofrinhos virtuais (metas de economia)
│   ├── portfolio.js                   → carteira de investimentos: alocação real x carteira-modelo
│   ├── stocks.js                       → aba Ações & FIIs: posições, dividendos, histórico por ano/mês
│   ├── learn.js                         → trilha gamificada "Duolingo das finanças"
│   ├── engagement.js                     → desafios diários, missão da semana e evento do dia
│   ├── achievements.js                    → conquistas desbloqueadas pelo uso real do app
│   ├── market.js                           → indicadores em tempo real (moedas, cripto, BCB)
│   ├── news.js                              → notícias com impacto na economia brasileira
│   ├── advanced.js                           → aba Avançado: carteiras-modelo, calculadoras pro, dicionário
│   ├── books.js                               → aba Biblioteca Fin+: recomendações de livros
│   └── app.js                                  → orquestrador geral / dashboard
└── README.md
```

## O que já funciona (v3 — jornada gamificada completa)

### Diagnóstico e personalização
- **Onboarding em duas etapas**: primeiro "sobre você" (idade, situação
  profissional, faixa de renda e objetivo principal com ícones — comprar
  carro/casa, viajar, investir, sair das dívidas, reserva de emergência,
  viver de renda), depois o diagnóstico de 5 perguntas que calcula nível
  (iniciante/intermediário/avançado), objetivo e tolerância a risco. O
  objetivo escolhido já cria automaticamente um primeiro cofrinho sugerido.

### Gamificação ("Academia Fin+")
- **Trilha "Do Zero ao Avançado"**: 6 níveis, 19 lições, ~54 perguntas de
  múltipla escolha, XP, streak diário e bloqueio sequencial de lições
  (estilo Duolingo) — incluindo um nível "Pro" com alocação de ativos,
  curva de juros, indicadores fundamentalistas avançados, planejamento
  tributário/sucessório, derivativos, finanças comportamentais e
  independência financeira.
- **Níveis de jogador nomeados**: Iniciante → Aprendiz Financeiro →
  Planejador → Investidor → Construtor de Patrimônio → Mestre Fin+, com o
  mascote POLVIn ganhando um selo/acessório visual a cada nova fase.
- **Desafios diários** (3 por dia, ex.: registrar uma transação, completar
  uma lição, guardar em um cofrinho) e **missão da semana** (ex.: completar
  3 lições, guardar R$ 100), com detecção automática de progresso sempre
  que possível.
- **Evento aleatório do dia**: cenários educativos (carro quebrou, perdeu o
  emprego, oferta de investimento milagroso...) com escolhas e feedback —
  ensina na prática a importância da reserva de emergência e de evitar
  fraudes.
- **Conquistas**: 13 badges desbloqueadas pelo uso real do app (primeiro
  cofrinho, primeira meta concluída, primeiro investimento, primeira
  ação/FII comprado, primeiro dividendo, streaks de 7/30/100 dias, reserva
  formada, trilha completa, entre outras).

### Dinheiro e investimentos
- **Guia de investimentos** com 9 tipos (Poupança, CDI, CDB, LCI, LCA,
  Tesouro Direto, FIIs, Ações, Criptomoedas), cada um com risco, liquidez,
  tributação, garantia, prós e contras, e filtros por categoria/nível.
- **Simulador de juros compostos** comparando visualmente "investir" x
  "guardar sem render", com gráfico de barras por ano.
- **Carteira digital**: entradas/saídas por categoria, orçamento mensal com
  barra de progresso, alertas automáticos de gasto compulsivo e uma
  **lista de espera de desejos** com regra de 7 dias.
- **Cofrinhos** (metas de economia): crie metas com nome e valor, faça
  aportes e acompanhe o progresso até 100%.
- **Carteira de Investimentos**: registre sua alocação real por classe de
  ativo e compare com a carteira-modelo do seu perfil de risco.
- **Ações & FIIs**: registre compras (ticker, quantidade, preço pago, data)
  e dividendos recebidos, atualize o preço atual manualmente e acompanhe
  valor investido, valor de mercado, valorização, dividendos recebidos e
  retorno total — com histórico de aportes e dividendos separado por ano
  e mês.
- **Aba Avançado**: carteiras-modelo por perfil de risco, calculadoras pro
  (tributação de renda fixa, independência financeira, retorno real) e um
  dicionário do mercado com ~39 termos, do básico ao avançado.

### Conteúdo e mercado
- **Biblioteca Fin+**: recomendações reais de livros (do "O Homem Mais Rico
  da Babilônia" a "O Investidor Inteligente"), filtráveis por nível, com
  uma sugestão "de agora" que nunca repete até esgotar a lista.
- **Indicadores em tempo real**: cotações de USD/EUR/BTC (AwesomeAPI),
  criptomoedas (CoinGecko) e Selic/CDI/IPCA/Dólar oficiais (Banco Central
  do Brasil, API SGS), com ticker no topo atualizado a cada 60 segundos, e
  um ranking educativo das melhores opções do dia por perfil de risco.
- **Notícias**: curadoria de temas que impactam a economia brasileira.
- **Educação financeira e consciência de classe**: por que investir é uma
  ferramenta de mobilidade social.

### Infraestrutura
- **Exportar/Importar dados**: backup manual de tudo (perfil, transações,
  cofrinhos, carteira de investimentos, ações/FIIs, progresso, XP,
  conquistas) em um único arquivo JSON.
- **Design responsivo**, acessível via teclado, com identidade visual
  própria e o mascote POLVIn evoluindo junto com o usuário.

## Fora do escopo (e por quê)

Alguns pedidos comuns de "app financeiro completo" exigem infraestrutura
que este projeto — deliberadamente HTML/CSS/JS puro, sem backend — não
tem, e não deveria simular de forma enganosa:

- **Scanner de nota fiscal (IA de visão) e scanner de extrato/Open
  Finance**: exigem processamento de IA e/ou integração regulada com
  instituições financeiras, com backend seguro e credenciamento.
- **IA conversacional (tipo ChatGPT)**: exigiria uma chave de API de LLM
  guardada em servidor — nunca deve ficar exposta direto no navegador.
- **Comunidade/ranking entre usuários**: exige múltiplos usuários
  sincronizados em um backend; hoje cada navegador guarda dados isolados.
- **Cotação automática de qualquer ação/FII**: testamos APIs públicas
  gratuitas (ex.: brapi.dev) e a maioria dos tickers exige token — por
  isso a aba Ações & FIIs usa preço atual atualizado manualmente, que
  funciona para qualquer ativo, sem depender de terceiros.

## Roadmap sugerido (próximas etapas)

1. **Conta e sincronização real** — um backend simples (ex.: Node/Firebase)
   permitiria acessar os dados de qualquer dispositivo.
2. **Notícias ao vivo** — plugar uma News API real na função
   `fetchLiveNews()` em `js/news.js`.
3. **Gráficos de evolução de patrimônio** — histórico mensal do saldo e
   dos investimentos, usando um `<canvas>` dedicado.
4. **Indicadores adicionais** — Ibovespa, IFIX e curva de juros (DI
   futuro) na aba Mercado, quando houver fonte pública gratuita estável.
5. **Cotação automática opcional** — permitir que quem tiver um token
   gratuito do brapi.dev conecte para atualizar preços de ações/FIIs
   automaticamente, mantendo a atualização manual como padrão.
6. **Loja de recompensas e temas visuais** — trocar XP/moedas por temas de
   cor e acessórios extras do POLVIn.
7. **Modo escuro** e mais opções de acessibilidade (tamanho de fonte,
   alto contraste).

---
*Este projeto é uma ferramenta educativa. Nenhum conteúdo aqui constitui
recomendação de investimento personalizada.*
