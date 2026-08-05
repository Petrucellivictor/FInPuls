# RFC-001: Finalizar Etapa 1 — missões diárias variadas, Mercado expandido, avisos leves do POLVIn

- **Status**: concluída
- **Prioridade**: alta (fecha a Etapa 1 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist. (DevOps Engineer fora do fluxo — não há deploy envolvido.)

## Descrição
Três melhorias já triadas no `ROADMAP.md` (Etapa 1), pendentes desde a v1.18.0: (1) o pool de missões diárias é pequeno (7 itens) e a seleção é previsível; (2) a aba Mercado mostra poucos ativos além de USD/EUR e 4 criptos; (3) não existe nenhum aviso contextual do POLVIn — só o bônus de login e as missões, sem nudge de streak/nível.

## Objetivo
Fechar a Etapa 1 do roadmap de gamificação sem abrir nenhuma nova decisão de arquitetura (tudo cabe na stack client-side atual).

## Motivação
Usuário pediu explicitamente essas 3 melhorias como as pendências da Etapa 1, e autorizou o Orchestrator a sequenciar e executar.

## Benefícios
Mais variedade percebida no engajamento diário; painel de mercado mais rico sem depender de APIs pagas; reforço de hábito (POLVIn) sem exigir infraestrutura de push.

## Impacto
Nenhuma mudança de schema quebra dados existentes — tudo é aditivo (novas chaves em `STORAGE_KEYS`, novos itens em pools de dados existentes).

## Dependências
Nenhuma — as três frentes são independentes entre si.

## Critérios de aceite
- Pool de missões diárias com pelo menos 12 itens e seleção que não repete o mesmo padrão de deslocamento fixo dia após dia.
- Aba Mercado exibindo mais pares de moeda e mais criptomoedas do que hoje, sem quebrar o fallback quando a API falha.
- Um aviso do POLVIn (streak em risco, perto de subir de nível, ou "sentiu sua falta") aparece no máximo 1x por dia, sem se repetir a cada troca de aba.
- `node --check` limpo em todos os arquivos tocados; lógica validada por execução real (não só leitura), como já é padrão neste projeto.

## Etapas puladas e por quê
- **DevOps Engineer**: não há deploy nesta RFC (mudança só de código/dados no repo) — pulado por não se aplicar, não por omissão.

## Registro por etapa

### 1. Product Owner
- Resumo: escopo confirmado como as 3 pendências literais da Etapa 1, sem adicionar nada fora disso (nada de gating por nível, nada de Cidade Financeira — isso é Etapa 3).
- Decisões: tratar como 3 sub-entregas de uma RFC única, não 3 RFCs separadas (esforço pequeno demais para justificar o overhead de 3 documentos).
- Próximo agente: Software Architect

### 2. Software Architect
- Resumo: nenhuma mudança estrutural de módulos — tudo estende arquivos/módulos já existentes.
- Decisões técnicas:
  - Missões: novo algoritmo de seleção (shuffle determinístico por dia, LCG simples) dentro de `Engagement.ensureFreshState()`; 5 itens novos em `DAILY_CHALLENGES` (`js/data.js`), dois deles "auto" apoiados por dois logs novos (`STORAGE_KEYS.SIMULATOR_LOG`, `STORAGE_KEYS.POLVIN_LOG` — arrays de data ISO, mesmo padrão já usado em `LESSON_LOG`).
  - Mercado: só estende os arrays já buscados em `Market.fetchMoedas()`/`fetchCriptos()` — nenhuma chamada de API nova, mesmas duas fontes já em uso (AwesomeAPI, CoinGecko).
  - Avisos do POLVIn: nova função `Engagement.checkPolvinNotice()`, chamada em `Engagement.init()`; reaproveita `Fx`-style toast (novo `Fx.polvinNoticeToast`); nova chave `STORAGE_KEYS.POLVIN_NOTICE_SHOWN` (string, data ISO) para gating de 1x/dia.
- Próximo agente: UX/UI Designer

### 3. UX/UI Designer
- Resumo: nenhum componente novo de layout — reaproveita os cards/grids já existentes em `js/market.js` (mais itens no mesmo grid) e o padrão visual de toast já usado por `Fx.levelUpToast`/`Fx.energyToast` para o aviso do POLVIn (emoji 🐙, mesmo estilo `.achievement-toast.level-toast`).
- Próximo agente: Gamification Designer

### 4. Gamification Designer
- Resumo: os 5 desafios diários novos usam telas que já existem (Simulador, assistente POLVIn, Perfil, Conquistas, Carteira de Investimentos) — sem inventar nenhuma tela nova. XP de cada um mantido na faixa 5-15, igual ao padrão dos 7 já existentes.
- Prioridade dos avisos do POLVIn (só 1 por dia, o mais relevante): 1º "sentiu sua falta" (gap ≥ 2 dias sem atividade) > 2º "streak em risco" (tem streak ativo mas nada feito hoje) > 3º "perto de subir de nível" (≤ 20 XP do próximo nível).
- Próximo agente: Financial Specialist

### 5. Financial Specialist
- Resumo: nenhum conteúdo financeiro novo é criado nesta RFC (sem lições/quizzes) — só textos de UI/engajamento. Nada a validar aqui além de revisar o tom dos textos das novas missões, que ficou consistente com o restante do app.
- Próximo agente: Database Engineer

### 6. Database Engineer
- Resumo: 3 chaves novas em `STORAGE_KEYS`: `SIMULATOR_LOG` (array `{data}`), `POLVIN_LOG` (array `{data}`), `POLVIN_NOTICE_SHOWN` (string). Todas seguem o padrão chave-valor já usado — entram automaticamente no backup (`Store.exportAll()`) e na sincronização (`Cloud.pushAllLocal()`) sem código extra, por já serem `STORAGE_KEYS`.
- Próximo agente: Backend Engineer

### 7. Backend Engineer
- Resumo: implementado — `js/engagement.js` (seleção determinística por shuffle + `checkPolvinNotice()`), `js/simulator.js`/`js/polvin.js` (logs de uso), `js/data.js` (5 desafios novos), `js/achievements.js` sem mudança (não afetado).
- Próximo agente: Frontend Engineer

### 8. Frontend Engineer
- Resumo: `js/market.js` — mais pares de moeda e criptos; `js/fx.js` — novo `polvinNoticeToast()`. Nenhuma tela nova, só mais dados nos grids/ticker já existentes.
- Próximo agente: Cyber Security Specialist

### 9. Cyber Security Specialist
- Resumo: superfície de risco nula — sem dados sensíveis, sem autenticação, sem nova chamada externa (Mercado usa as mesmas 2 APIs públicas já auditadas). Nenhum achado.
- Próximo agente: QA Engineer

### 10. QA Engineer
- Resumo: testes executados via Node (shuffle determinístico, logs de simulador/POLVIn, prioridade dos avisos) — ver seção de verificação no commit. `node --check` limpo em todos os arquivos tocados.
- Próximo agente: Documentation Specialist

### 11. Documentation Specialist
- Resumo: `CHANGELOG.md` e `ROADMAP.md` atualizados marcando a Etapa 1 como concluída.
- Próximo agente: (nenhum — RFC concluída; DevOps fora do fluxo, sem deploy)
