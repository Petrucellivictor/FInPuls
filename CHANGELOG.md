# Changelog

Todas as alterações relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

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
