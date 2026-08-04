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
   exemplo, a extensão "Live Server" do VS Code. O login do Google **não
   funciona** abrindo o `index.html` direto (protocolo `file://`); o app
   detecta isso e avisa na tela em vez de mostrar um botão quebrado.

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
├── index.html                 → estrutura da página e das 11 abas
├── assets/
│   └── polvin.svg               → mascote POLVIn
├── css/
│   └── style.css               → todo o sistema de design (cores, tipografia, componentes, animações)
├── js/
│   ├── data.js                  → conteúdo: investimentos, trilhas, glossário, carteiras-modelo,
│   │                                tabela de IR, níveis nomeados, desafios, eventos, conquistas, livros
│   ├── storage.js                → camada de persistência (localStorage) + exportar/importar backup
│   ├── fx.js                      → efeitos visuais compartilhados (confete, toast de subida de nível)
│   ├── tabs.js                      → navegação entre abas
│   ├── auth.js                       → login com Google ou perfil local por e-mail
│   ├── onboarding.js                  → diagnóstico inicial: "sobre você" + 5 perguntas de perfil de risco
│   ├── investments.js                  → guia de investimentos com filtros e modal
│   ├── simulator.js                     → simulador de juros compostos (investir x não investir)
│   ├── wallet.js                          → carteira digital: transações, orçamentos, lista de espera
│   ├── installments.js                     → compras parceladas: parcelas pagas x restantes
│   ├── goals.js                              → cofrinhos virtuais (metas de economia)
│   ├── portfolio.js                            → carteira de investimentos: alocação real x carteira-modelo
│   ├── stocks.js                                 → aba Ações & FIIs: posições, dividendos, cripto fracionada
│   ├── learn.js                                    → trilha gamificada financeira ("Duolingo das finanças")
│   ├── history.js                                    → trilha "Brasil: História & Economia" (contos + quiz)
│   ├── engagement.js                                   → desafios diários, missão da semana e evento do dia
│   ├── achievements.js                                   → conquistas desbloqueadas pelo uso real do app
│   ├── market.js                                           → indicadores em tempo real (moedas, cripto, BCB)
│   ├── news.js                                               → notícias com impacto na economia brasileira
│   ├── advanced.js                                             → aba Avançado: carteiras-modelo, calculadoras, dicionário
│   ├── books.js                                                  → aba Biblioteca Fin+: recomendações de livros
│   └── app.js                                                      → orquestrador geral / dashboard
└── README.md
```

## O que já funciona (v4 — jornada completa, do bolso à história econômica)

### Conta e personalização
- **Login com Google ou perfil local por e-mail** (sem senha): personaliza
  a saudação com nome/foto. Sem backend, não há sincronização entre
  dispositivos — é só identificação local neste navegador (ver seção
  "Habilitar o login com Google" acima).
- **Onboarding em duas etapas**: "sobre você" (idade, situação
  profissional, faixa de renda e objetivo principal com ícones) + o
  diagnóstico de 5 perguntas que calcula nível, objetivo e tolerância a
  risco. O objetivo escolhido já cria automaticamente um cofrinho sugerido.

### Gamificação ("Academia Fin+")
- **Trilha financeira "Do Zero ao Avançado"**: 6 níveis, 19 lições, ~54
  perguntas, XP, streak diário e bloqueio sequencial de lições.
- **Trilha "Brasil: História & Economia"** (nova!): 4 níveis, 9 lições,
  cada uma abrindo com um pequeno conto — as moedas que o Brasil já teve
  (Réis ao Real), os ciclos econômicos (açúcar, ouro, café), a
  industrialização de Vargas, o "milagre econômico" e a década perdida, o
  Plano Real, desigualdade de renda e o papel do Estado — antes do quiz.
  Compartilha o mesmo XP da trilha financeira.
- **Interface mais animada**: lições aparecem com entrada escalonada,
  respostas certas/erradas têm animação de pulso/tremor, conclusão de
  lição solta confete, e subir de "nível de jogador" dispara um toast
  comemorativo.
- **Níveis de jogador nomeados**: Iniciante → Aprendiz Financeiro →
  Planejador → Investidor → Construtor de Patrimônio → Mestre Fin+, com o
  mascote POLVIn ganhando um selo/acessório visual a cada nova fase.
- **Desafios diários**, **missão da semana** e **evento aleatório do dia**
  (cenários educativos), com detecção automática de progresso.
- **Conquistas**: 16 badges desbloqueadas pelo uso real do app.

### Dinheiro e investimentos
- **Guia de investimentos** com 9 tipos, risco, liquidez, tributação,
  garantia, prós e contras, e filtros por categoria/nível.
- **Simulador de juros compostos** (investir x guardar sem render).
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
- **IA conversacional (tipo ChatGPT)**: exigiria uma chave de API de LLM
  guardada em servidor — nunca deve ficar exposta direto no navegador.
- **Comunidade/ranking entre usuários**: exige múltiplos usuários
  sincronizados em um backend; hoje cada navegador guarda dados isolados.
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
6. **Loja de recompensas e temas visuais** — trocar XP/moedas por temas de
   cor e acessórios extras do POLVIn.
7. **Modo escuro** e mais opções de acessibilidade (tamanho de fonte,
   alto contraste).

---
*Este projeto é uma ferramenta educativa. Nenhum conteúdo aqui constitui
recomendação de investimento, política ou econômica personalizada — os
temas de história e economia são apresentados de forma factual e
educativa, incluindo diferentes correntes de pensamento econômico.*
