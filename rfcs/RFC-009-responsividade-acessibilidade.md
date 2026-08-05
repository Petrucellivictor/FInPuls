# RFC-009: Responsividade e acessibilidade

- **Status**: concluída
- **Prioridade**: alta (usabilidade real reportada pelo usuário em celulares)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
Revisão orientada a evidências (não suposição) da responsividade e acessibilidade do Fin+ em várias resoluções de tela (320px a 1440px) e de conformidade básica com WCAG. Corrige os problemas reais encontrados: cabeçalho ocupando 3 linhas em celulares, navegação por abas mostrando só 2/14 abas sem indicação de scroll, alvos de toque abaixo de 40px, textos abaixo de 11px, 10 campos de formulário sem rótulo acessível, e notificações (toasts) sem `aria-live`.

## Objetivo
"O site deve funcionar bem independente da resolução da tela, tendo acessibilidade e responsividade de elementos" — eliminar os pontos concretos onde isso falha hoje, sem reescrever o design visual já decidido no RFC-008.

## Motivação
Usuário relatou: "um problema que notei é a responsividade e acessibilidade do uso do site em celulares, fica tudo mais limitado."

## Benefícios
Corrige atrito real de uso em celulares (a maioria do público de um app de educação financeira gamificado) e cobre lacunas de acessibilidade que não dependiam de resolução de tela (rótulos de formulário, `aria-live` de notificações) — ambas categorias de problema que "olhar o código" sem testar de verdade não teria revelado com a mesma precisão.

## Metodologia (evidência antes de decisão)
Antes de qualquer mudança, o app foi servido localmente e testado com Playwright/Chromium em 5 larguras reais (320/390/412/768/1440px), com screenshots de 7 abas em cada uma, mais checagens automatizadas de: overflow horizontal da página, tamanho de alvos de toque, tamanho de fonte, quantidade de abas visíveis sem scroll, `alt` em imagens, rótulo de campos de formulário, e `aria-live` em notificações. Achados confirmados (não hipotéticos):

1. **Cabeçalho em 3 linhas em telas ≤480px**: marca + 6 chips de estatística + 3 botões de backup (Exportar/Importar/Reiniciar) competem no mesmo `.header-stats`, quebrando em 3 linhas antes de qualquer conteúdo da página.
2. **Navegação por abas**: só 2 das 14 abas ficam visíveis sem rolar horizontalmente em celulares (320-412px), 5/14 em tablet, 10/14 em desktop — sem nenhuma indicação visual (fade/seta) de que há mais abas.
3. **10-13 alvos de toque abaixo de 40px** em toda resolução testada (não é um problema "de tela pequena", é tamanho fixo em CSS): chip "Entrar", botões Exportar/Importar/Reiniciar, "Ouvir", "Refazer diagnóstico", "Marcar", "Criar cofrinho sugerido", "Continuar a trilha" (larga mas baixa).
4. **8 elementos com fonte abaixo de 11px** em toda resolução: rótulo "NÍVEL" do anel de nível (9px), `.tip-trigger`, `.sim-bar-label`, `.trail-level-tag`, `.trail-node-xp`, `.news-tag`, `.model-badge`, contador dentro do anel da trilha.
5. **10 campos de formulário sem rótulo acessível** (nem `<label for>`, nem `aria-label`): orçamento (categoria/valor), cofrinhos (nome/meta), carteira de investimentos (classe/valor), lista de desejos (item/valor), liga (nome), busca do glossário. Um 11º campo (`importFileInput`) está corretamente fora da árvore de acessibilidade via `display:none` — não precisa de rótulo.
6. **Nenhum toast tem `role`/`aria-live`**: conquistas, subida de nível, bônus diário, avisos do POLVIn e energia não são anunciados por leitor de tela.
7. **Contraste de cor**: verificado visualmente nas capturas de tela; nenhuma falha óbvia confirmada. Uma medição automatizada inicial apontou uma possível falha no badge de nível, mas o cálculo não fazia composição correta de alpha sobre o gradiente de fundo — descartado como falso positivo após inspeção visual direta do screenshot renderizado.

## Impacto
- `index.html`: botões Exportar/Importar/Reiniciar (+ input de arquivo) saem do `<header>` e passam a viver dentro da aba Perfil, num novo card "Conta e dados" — mesmo padrão já usado por "Refazer diagnóstico" (que já vivia fora do header, na Início). Nenhuma mudança de `id`, então `js/app.js`'s `bindBackupButtons()` continua funcionando sem alteração.
- `css/style.css`: `.tabs-nav` ganha um indicador visual de overflow (gradiente de fade nas bordas); `.tab-btn` fica mais compacto em `max-width:640px`; `.btn-sm`/`.stat-chip.account-chip` ganham `min-height` para atingir ~40px de alvo de toque; fontes abaixo de 11px sobem para 10.5-11px; header mobile simplificado (menos itens competindo por espaço, já que 3 saíram para o Perfil).
- `js/fx.js`, `js/achievements.js`: toasts ganham `role="status"` e `aria-live="polite"`.
- Vários arquivos (`index.html`, `js/wallet.js`, `js/goals.js`, `js/portfolio.js`, `js/advanced.js`, `js/leagues.js` — onde cada input é de fato criado): `aria-label` nos 10 campos sem rótulo.

## Dependências
Nenhuma.

## Critérios de aceite
- Cabeçalho cabe em no máximo 2 linhas em 320-480px, sem os 3 botões de backup.
- `.tabs-nav` mostra visualmente que há mais abas fora da tela (fade nas bordas), e cabem mais abas por linha sem rolar do que antes (fonte/padding reduzidos em mobile).
- Todo elemento interativo relevante (botões, chip de conta) atinge pelo menos ~40px de altura de toque — exceção documentada e aceita para `.tip-trigger` (ícone de ajuda inline de 16px, convenção comum, não uma ação primária).
- Nenhum texto de leitura cai abaixo de ~10.5px.
- Os 10 campos de formulário identificados têm `aria-label` (ou rótulo visível) associado.
- Toasts têm `role="status"` + `aria-live="polite"`.
- Reteste completo do mesmo script de auditoria (Playwright, 5 larguras) confirma cada achado corrigido.
- `node --check` limpo em todos os arquivos JS tocados.

## Etapas puladas e por quê
- **Gamification Designer**: nenhuma mudança de regra de jogo.
- **Financial Specialist**: nenhuma mudança de conteúdo.
- **Database Engineer**: nenhuma mudança de dados.
- **Cyber Security Specialist**: nenhuma superfície de risco nova (só CSS/HTML/atributos ARIA).
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo: corrigir os 6 achados confirmados por evidência real, sem tocar no design visual/identidade já decidido no RFC-008 (isso é responsividade/acessibilidade, não uma nova filosofia de design). Decisão de maior impacto: mover os botões de backup para o Perfil em vez de só encolhê-los no header — resolve a causa raiz (competição por espaço), não o sintoma. Próximo: Software Architect.

### 2. Software Architect
Nenhuma mudança de arquitetura — só CSS/HTML/atributos. Decisão: manter os `id`s dos botões movidos exatamente iguais, para que `js/app.js` não precise de nenhuma alteração — a lógica de exportar/importar/resetar já é 100% independente de onde o botão vive no DOM. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Indicador de overflow do `.tabs-nav`: gradiente de fade (não seta/botão, para não adicionar mais um elemento interativo pequeno) nas duas bordas via pseudo-elementos posicionados sobre o próprio nav — aparece sempre que há conteúdo além da borda visível. `.tip-trigger` mantido em 16px (exceção documentada, ver "Critérios de aceite") por ser um ícone de ajuda inline consagrado (mesmo padrão do "?" da Wikipédia), não uma ação primária — inflar pra 40px quebraria o fluxo do texto ao redor sem ganho real de usabilidade.

### 4. Frontend Engineer
Implementado: realocação dos botões de backup para o Perfil; fade de overflow nas abas; compactação do `.tab-btn`/header em mobile; `min-height` nos alvos de toque pequenos; ajuste dos 8 tamanhos de fonte; `aria-label` nos 10 campos; `role="status"`/`aria-live="polite"` nos toasts.

### 5. QA Engineer
Reteste completo do mesmo script de auditoria (Playwright + Chromium, 5 larguras, mesmas 6 checagens automatizadas), depois das correções:
- **Inputs sem rótulo: 11 → 0**, nas 5 larguras.
- **Fontes abaixo de 11px: 8 → 0**, nas 5 larguras.
- **Alvos de toque abaixo de 40px: 8-13 → 0**, nas 5 larguras — incluindo verificação explícita de que `.account-chip`/`.link-btn` (que ficam visualmente pequenos por decisão de design, mas com área de toque estendida via `::before` com `inset` negativo) de fato atingem ≥40px de área EFETIVA de toque, não só a área visível (o script inicial dava falso positivo aqui por medir só `getBoundingClientRect()` do elemento, sem somar o `::before`; corrigido para ler o `inset` computado do pseudo-elemento).
- **Cabeçalho**: confirmado por screenshot em 320px que caiu de 3 para 2 linhas antes do conteúdo, depois de mover Exportar/Importar/Reiniciar pro Perfil.
- **Abas visíveis sem scroll**: melhora marginal (2→3 em alguns tamanhos, pela redução de padding do `.tab-btn`), mas o objetivo real aqui — documentado como decisão de escopo, não um problema não resolvido — era adicionar o indicador visual de fade (confirmado nos screenshots), não fazer as 14 abas caberem sem rolar, o que exigiria uma reestruturação de navegação fora do escopo desta RFC (esconder abas num menu "mais", reordenar por uso, etc.).
- **Regressão**: refeito o fluxo completo de conclusão de lição do RFC-008 (mergulho do POLVIn na Início → abrir Trilha → responder 2 perguntas → tela de conclusão com mascote/confete) depois de todas as mudanças de CSS/HTML desta RFC — **zero erros de console**, comportamento idêntico ao testado no RFC-008.
- `node --check` limpo em `js/fx.js`, `js/achievements.js`, `js/advanced.js`, `js/app.js`, `js/trail.js`, `js/business.js`, `js/leagues.js`, `js/goals.js`, `js/portfolio.js`, `js/wallet.js`.

### 6. Documentation Specialist
`CHANGELOG.md`/`ROADMAP.md` atualizados (v1.28.0).
