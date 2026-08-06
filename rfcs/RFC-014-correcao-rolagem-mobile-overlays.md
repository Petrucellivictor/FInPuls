# RFC-014: Correção de rolagem/toque em overlays no celular (diagnóstico inicial e quiz de lição)

- **Status**: concluída
- **Prioridade**: alta (bug bloqueante — impede concluir o diagnóstico inicial e, em certos casos, as lições, pelo celular)
- **Agentes envolvidos**: Product Owner, UX/UI Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
Pedido direto do usuário: "a primeira tela que pergunta idade, objetivo de renda, se trabalha ou não, etc... não tem sistema de rolagem, e quem abre pelo celular não consegue clicar no botão." O usuário também observou que já tinha pedido para testar renderização/acessibilidade justamente para evitar isso (RFC-009) — o que exige, além do fix, uma verificação real em viewport de celular antes de declarar concluído, não só leitura de código.

## Objetivo
Garantir que todo conteúdo dentro de uma tela cheia sobreposta (`.onboarding-screen`, `.quiz-overlay`) seja sempre alcançável por rolagem em qualquer altura de tela, incluindo o botão de ação no final.

## Motivação / causa raiz
`.onboarding-screen` e `.quiz-overlay` são contêineres `position: fixed; inset: 0` com `display: flex; align-items: center` para centralizar o cartão na tela — mas **nem o contêiner nem o cartão interno tinham `overflow-y: auto`/`max-height`**. Quando o conteúdo do cartão é mais alto que a viewport (ex.: a etapa "Um pouco sobre você" do diagnóstico, com idade + situação + renda + grade de 9 objetivos + campo de meta + botão — em celulares ≤480px a grade de objetivos vira 1 coluna e sozinha já passa de ~460px), o excesso fica centralizado **para fora da área visível**, e como não existe rolagem em nenhum nível, o botão final nunca aparece na tela nem pode ser alcançado.

Auditoria dos 3 overlays de tela cheia do app confirmou que **só 1 dos 3 já tinha a proteção certa**:
| Overlay | Usado em | Tinha `max-height`+`overflow-y` no cartão? |
| --- | --- | --- |
| `.modal-overlay`/`.modal-box` | modais genéricos (privacidade, política, etc.) | ✅ Sim (`max-height: 88vh; overflow-y: auto;`) — nunca teve esse bug |
| `.onboarding-screen`/`.onboarding-card` | diagnóstico inicial + tela de bloqueio do cofre | ❌ Não — bug relatado pelo usuário |
| `.quiz-overlay`/`.quiz-box` | **quiz de toda lição, nas 3 trilhas** | ❌ Não — mesmo bug, usado com muito mais frequência que o onboarding |

Ou seja, o mesmo defeito também afeta o quiz de lição (usado centenas de vezes por sessão de estudo), não só a tela que o usuário reportou — perguntas com texto de opção mais longo, ou o card de resultado com feedback, podiam sofrer o mesmo corte em telas pequenas.

## Benefícios
Elimina um bloqueio total de conversão (usuário novo pelo celular não conseguia nem terminar o cadastro) e previne o mesmo problema de aparecer de novo em qualquer lição, em qualquer trilha, sem precisar depender de sorte no tamanho do conteúdo.

## Impacto
- `css/style.css`: `.onboarding-card` e `.quiz-box` passam a ter `max-height: 88vh; overflow-y: auto; -webkit-overflow-scrolling: touch;` — o mesmo padrão que `.modal-box` já usava com sucesso. Nenhuma mudança de layout visual em telas onde o conteúdo já cabia (o `overflow-y:auto` só ativa rolagem quando necessário).
- Nenhuma mudança em `js/onboarding.js`, `js/trail.js`, `js/business.js` — puramente CSS.

## Dependências
Nenhuma.

## Critérios de aceite
- Em viewport de celular (360×740 e 375×667), a etapa "Um pouco sobre você" do diagnóstico permite rolar até o botão "Continuar" e ele responde ao toque.
- O quiz de uma lição com 10 perguntas continua navegável e o botão de cada tela (responder, avançar, concluir) sempre alcançável por rolagem em celular.
- Nenhuma regressão visual em desktop/tablet (onde o conteúdo já cabia sem rolagem).
- Teste real com Playwright/Chromium em viewport mobile, não só leitura de CSS.

## Etapas puladas e por quê
- **Software Architect/Gamification/Financial/Database/Backend/Security Specialist**: fix puramente de CSS (uma propriedade de overflow), sem lógica nova, sem dado novo, sem risco de segurança.
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Prioridade máxima: um usuário novo no celular que não consegue passar do diagnóstico inicial nunca chega a usar o app — é a pior forma possível de perda de usuário. Corrigir também o quiz de lição (achado na auditoria, não pedido explicitamente) porque o mesmo defeito ali teria impacto ainda maior a longo prazo — decisão de ampliar o escopo da RFC registrada aqui para transparência.

### 2. UX/UI Designer
A solução correta é replicar o padrão que `.modal-box` já usa (`max-height` + `overflow-y: auto` no cartão, não no contêiner externo) — mantém a centralização visual em telas onde cabe, e vira uma área com rolagem interna (sem afetar o fundo escurecido) quando não cabe. Evita a alternativa de remover `align-items: center`, que mudaria o alinhamento visual em todas as telas, mesmo nas que já funcionavam bem.

### 3. Frontend Engineer
Implementado: `max-height: 88vh; overflow-y: auto; -webkit-overflow-scrolling: touch;` adicionado a `.onboarding-card` e `.quiz-box` em `css/style.css`. Nenhuma mudança em JS.

### 4. QA Engineer
Testado via Playwright + Chromium real em 2 viewports de celular (360×740 e 375×667):
- Diagnóstico inicial: etapa "Um pouco sobre você" (a mais alta, com 9 botões de objetivo) — antes do fix, o botão "Continuar" ficava fora da área visível e sem rolagem possível; depois do fix, `overflow-y: auto` ativa, a rolagem chega ao botão e o clique funciona (perfil salvo com sucesso).
- Quiz de lição: aberto um quiz de 10 perguntas de `COURSE` — cartão rola corretamente, botão de resposta/avançar sempre alcançável.
- Regressão: onboarding em viewport desktop (1280×800) continua centralizado sem rolagem (conteúdo cabia antes e continua cabendo). Zero erros de console.

### 5. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados.
