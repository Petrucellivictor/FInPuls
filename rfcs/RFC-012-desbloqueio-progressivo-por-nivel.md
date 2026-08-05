# RFC-012: Desbloqueio progressivo de ferramentas por nível

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário — "Gating de conteúdo por nível", já registrado como ideia futura desde o RFC-005)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
"O app pode começar mais vazio para quem não sabe nada, e ir evoluindo conforme o nível de aprendizado, e também de acordo com a pesquisa de perfil no início" — hoje o Fin+ mostra TODAS as 14 abas e ferramentas pra todo mundo desde o primeiro acesso, e `profile.nivel` (iniciante/intermediário/avançado, calculado no diagnóstico inicial) é puramente decorativo — não trava nem libera nada. Esta RFC cria o sistema de desbloqueio progressivo e aplica ele a 2 ferramentas concretas nesta primeira leva.

## Objetivo
Reduzir a sobrecarga de informação pra quem está começando, e dar um motivo real e visível para progredir na trilha — reaproveitando exatamente o padrão de "conquista → aviso → interface atualizada" já testado com `Achievements`/`City`.

## Motivação
Pedido direto do usuário, com exemplo próprio: "ao concluir as aulas de rendas variáveis, aí sim habilita as cotações atualizadas de ações e fundos de renda variável... deve avisar como: 'Parabéns, agora você consegue acompanhar Ações em tempo real'."

## Ajuste de escopo sobre o exemplo do usuário (Product Owner)
O exemplo citado — "cotações atualizadas de ações em tempo real" — **não existe no Fin+ hoje e não é o que esta RFC libera**. Isso já está documentado desde antes desta sessão (`js/stocks.js:1-7,312`): cotação automática de ações/FIIs individuais exige uma API paga, fora do escopo client-only do projeto (mesma decisão da Etapa 0 do `ROADMAP.md`). O que a trilha de Renda Variável passa a liberar de fato é a **ferramenta de Ações & FIIs em si** (registro de compras/dividendos, comparação de ganho/perda, com preços atualizados manualmente pelo usuário — e cotação de cripto, essa sim automática, dentro da mesma tela). É a interpretação mais honesta do espírito do pedido (não expor uma ferramenta de investimento avançada pra quem ainda não viu o conteúdo de Renda Variável) sem prometer uma funcionalidade que não existe.

## Benefícios
Reaproveita 100% o padrão já testado de `Achievements` (registro de condições + notificação + re-render) em vez de inventar um mecanismo novo. `profile.nivel` do diagnóstico inicial finalmente tem um efeito real, sem duplicar a lógica de progresso da trilha.

## Impacto
- `js/data.js`: `FEATURE_GATES` novo (2 ferramentas nesta leva).
- `js/storage.js`: `STORAGE_KEYS.FEATURES_UNLOCKED` novo.
- `js/progression.js` (novo módulo): `Progression.CHECKERS`, `getUnlocked`, `isUnlocked`, `checkAll` (mesmo formato de `Achievements.checkAll`), `notify` (toast, `role="status"`/`aria-live`), `renderTabs` (aplica/remove o estado bloqueado nas abas), `lockedPanelHtml`.
- `index.html`: `#tab-acoesfiis` e `#tab-avancado` ganham um `<div class="gate-lock-overlay">` vazio como primeiro filho (preenchido por JS).
- `css/style.css`: `.tab-btn.tab-locked` (opacidade + 🔒 via `::after`), `.tab-panel.gate-locked` (esconde o conteúdo real, mostra só o overlay).
- `js/app.js`: `Progression.init()` no boot; `Progression.checkAll()` chamado nos mesmos eventos que já chamam `Achievements.checkAll()` (`wallet:updated`, `course:updated`, `goals:updated`, `lesson:passed`).

## Ferramentas desta primeira leva
| Ferramenta | Condição de desbloqueio | Por quê |
| --- | --- | --- |
| Ações & FIIs | Concluir Renda Variável (Nível 3) **OU** `profile.nivel === "avancado"` no diagnóstico inicial | Exemplo direto do usuário; ninguém deveria registrar posições de ações sem ter visto o conteúdo, ou já ter testado como experiente. |
| Avançado (carteiras-modelo, calculadoras, glossário avançado) | Concluir o Nível 1 · Fundamentos **OU** `profile.nivel` for "intermediário" ou "avançado" | Conteúdo já é rotulado "para quem já sabe o básico" no próprio subtítulo da aba — a barra de entrada (Fundamentos) já era a intenção, só não era aplicada. |

O uso de `profile.nivel` como atalho (não só progresso na trilha) atende diretamente "também de acordo com a pesquisa de perfil no início" — quem já se autoavaliou como experiente no diagnóstico não precisa refazer o caminho todo dentro do app pra destravar.

## Dependências
Nenhuma.

## Critérios de aceite
- As duas abas continuam visíveis (nunca escondidas do menu) — aparecem com indicação de bloqueio (🔒 no botão, painel com prévia explicando o que falta), nunca somem.
- Completar a trilha de Renda Variável desbloqueia Ações & FIIs de verdade (sem precisar recarregar a página) e mostra o aviso de "nova ferramenta desbloqueada".
- Completar o Nível 1 desbloqueia Avançado da mesma forma.
- Um perfil que já se autoavaliou "avançado"/"intermediário" no diagnóstico inicial começa com os gates correspondentes já destravados.
- Nenhuma regressão: `Achievements`/`City` continuam funcionando exatamente como antes — `Progression` é um sistema paralelo, não substitui nada.
- `node --check` limpo; teste visual real (Playwright) do fluxo bloqueado → desbloqueado.

## Etapas puladas e por quê
- **Database Engineer**: mesmo padrão chave-valor de sempre.
- **Financial Specialist**: nenhum conteúdo novo.
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Ver "Ajuste de escopo" acima — decisão central desta RFC. Escopo desta leva: só 2 ferramentas (as mais claramente "avançadas demais para principiante" hoje), não as 14 abas de uma vez. Próximo: Software Architect.

### 2. Software Architect
Decisão: módulo novo `js/progression.js`, espelhando exatamente `js/achievements.js` (mesmo formato de `CHECKERS`/`checkAll`/`notify`) — qualquer engenheiro que já entenda Conquistas entende Progression de cara. Decisão de acoplamento: o bloqueio visual vive inteiramente em `Progression.renderTabs()` via classes CSS (`tab-locked`/`gate-locked`) — **nenhuma mudança em `js/stocks.js` ou `js/advanced.js`**, os módulos gated não sabem que estão sendo gated. Isso elimina o risco de tocar em módulos grandes e já complexos só pra adicionar uma checagem de nível.

### 3. UX/UI Designer
Botão da aba bloqueada: opacidade reduzida + 🔒 via `::after` (não esconde, não desabilita o clique — clicar mostra a explicação, mais informativo que um botão cinza sem feedback). Painel bloqueado reaproveita `.card` + a mesma composição visual dos estados "locked" já usados em Cidade/Conquistas (emoji grande, título, texto explicando o requisito).

### 4. Gamification Designer
O aviso de desbloqueio usa o mesmo `.achievement-toast` de sempre, com uma mensagem específica por ferramenta (não um texto genérico) — reforça que progredir na trilha abre coisas novas de verdade, não só pontos.

### 5. Backend Engineer
Implementado `FEATURE_GATES`, `STORAGE_KEYS.FEATURES_UNLOCKED`, `Progression.CHECKERS` (com o atalho por `profile.nivel`).

### 6. Frontend Engineer
Implementado `js/progression.js` completo, overlays em `index.html`, CSS de bloqueio, hooks em `js/app.js`.

### 7. Cyber Security Specialist
Sem superfície de risco nova — é um controle de UX/pedagógico, não uma barreira de segurança (não há dado sensível nas abas gated que precise de proteção real). Nenhuma entrada de usuário interpolada sem escaping.

### 8. QA Engineer
Testado via execução real do código (Node/vm, `Progression.checkAll`/`renderTabs` reais):
- Os 2 gates têm checker real, `tab` e mensagem de desbloqueio.
- Sem progresso/perfil, nada desbloqueado; botão e painel corretamente marcados como bloqueados; overlay mostra o requisito real.
- Completar o Nível 1 desbloqueia SÓ "avancado" (não "acoesfiis") — confirma que os 2 gates são independentes, não uma cascata.
- Completar Renda Variável desbloqueia "acoesfiis", com a mensagem específica da ferramenta (não um texto genérico).
- Re-chamar `checkAll()` depois de já desbloqueado não duplica a entrada em `FEATURES_UNLOCKED`.
- Atalho por `profile.nivel`: perfil "avançado" destrava os 2 gates de uma vez, mesmo sem nenhum progresso real na trilha; perfil "intermediário" destrava só "avancado" (barra baixa), mas não "acoesfiis" (barra alta, exige avançado ou conclusão real) — confirma a calibração de barra por gate.
- **Teste visual real** (Playwright + Chromium): aba "Ações & FIIs" mostra 🔒 no botão + card de bloqueio explicando o requisito; ao completar Renda Variável de verdade (via evento `course:updated`, o mesmo caminho real do app, não um hack direto de storage), aparece o toast "Nova ferramenta desbloqueada! Parabéns! Você concluiu Renda Variável e desbloqueou o rastreador de Ações & FIIs." e a aba se destrava **em tempo real, sem precisar recarregar a página** — o botão perde o 🔒 e o painel mostra a ferramenta real (formulário de compra/dividendo, KPIs). Zero erros de console.
- Regressão: refeito o fluxo de celebração de lição (RFC-008) depois de todas as mudanças — zero erros de console, comportamento idêntico.
- `node --check` limpo em `js/data.js`, `js/storage.js`, `js/progression.js`, `js/app.js`.

### 9. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados (v1.31.0), removendo "Gating de conteúdo por nível" da seção "Ideias futuras" (agora implementado, não mais pendente).
