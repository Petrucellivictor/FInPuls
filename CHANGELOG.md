# Changelog

Todas as alterações relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

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
