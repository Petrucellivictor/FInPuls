# RFC-004: Histórias interativas na trilha financeira

- **Status**: concluída
- **Prioridade**: alta (fecha a Etapa 2 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
A cada 3 lições novas concluídas na trilha financeira (COURSE — não a de História, nem Empreender), em vez de simplesmente voltar para a trilha, o usuário vê uma história curta com um personagem fictício enfrentando um dilema financeiro (ex.: "João recebeu R$ 3.000, o que ele faz?"), escolhe entre 2 opções, e vê um desfecho narrativo diferente conforme a escolha, seguido de uma "lição aprendida" explícita.

## Objetivo
Quebrar a repetição do formato aula+quiz com um momento narrativo leve, reforçando conceitos já vistos (reserva de emergência, rotativo do cartão, hábito de investir, parcelamento x pagamento à vista, inflação do estilo de vida) através de consequência, não de mais uma pergunta de múltipla escolha.

## Motivação
Item pedido explicitamente pelo usuário: histórias tipo "João ganha R$3.000... Cada escolha altera a história", intercaladas "não em todas, a cada 3 pontos, na trilha 1" — último item da Etapa 2 do roadmap.

## Benefícios
Varia o ritmo da trilha sem exigir nenhuma tela nova (reaproveita o overlay de quiz já existente) e sem inflar a economia de XP (histórias não dão recompensa direta — o valor é o próprio aprendizado via consequência narrativa).

## Impacto
Aditivo: `INTERACTIVE_STORIES` novo em `js/data.js` (5 histórias); `Trail.maybePickStory/showInteractiveStory/resolveInteractiveStory` novos em `js/trail.js`; `Trail.finishLesson()` ganhou um parâmetro de decisão (`storyToShow`) que desvia o botão "Continuar" para a história em vez de fechar direto, quando aplicável. Nenhum comportamento existente da trilha (XP, progresso, `alreadyDone`) foi alterado — histórias só disparam na *primeira* conclusão de uma lição financeira, nunca em replay.

## Dependências
Nenhuma.

## Critérios de aceite
- História aparece exatamente a cada 3ª lição financeira concluída pela primeira vez (não em replay, não na trilha de História/Empreender).
- Nunca repete uma história até esgotar as 5 do pool (mesmo padrão de `Books.pickNext()`), depois recicla.
- Cada história tem 2 escolhas com desfechos narrativos distintos + uma "lição aprendida" explícita ao final.
- `node --check` limpo; lógica de disparo (múltiplo de 3, guard de replay), ciclo do pool, renderização das 3 telas (situação → desfecho) e o roteamento real do botão "Continuar" (fechar normal x abrir história) verificados por execução real do código, não só leitura.

## Etapas puladas e por quê
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo confirmado: só a trilha financeira (COURSE), a cada 3 lições, sem XP direto pela história — o valor é educativo/narrativo. Próximo: Software Architect.

### 2. Software Architect
Decisão: viver dentro de `js/trail.js` (não um módulo novo), reaproveitando o mesmo `overlayEl()`/`.quiz-overlay`/`.story-box` já usados pela introdução de lição ("aula"/"conto"). O gatilho usa `Object.keys(getProgress("financeira")).length % 3 === 0`, computado dentro de `finishLesson()` — não uma chave de contador redundante, já que o progresso da trilha já é a fonte da verdade. Nova chave `STORAGE_KEYS.STORIES_SEEN` (array), mesmo padrão de `BOOKS_SEEN`. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Nenhum CSS novo — a tela de história reaproveita `.quiz-box`/`.story-box`/`.quiz-option`/`.alert-box.info` já existentes. Próximo: Gamification Designer.

### 4. Gamification Designer
Confirmado: sem XP/moedas diretos pela história (evita mais uma fonte de XP a gerenciar); o gancho de engajamento é a curiosidade pela narrativa e o reforço do conceito, não uma recompensa numérica. Próximo: Financial Specialist.

### 5. Financial Specialist
5 histórias escritas, cada uma ilustrando um conceito já ensinado na trilha: reserva de emergência (João), custo do rotativo do cartão (Maria), hábito de investir mesmo com pouco (Carlos), parcelamento x à vista (Ana), e inflação do estilo de vida (Pedro) — todas com desfechos plausíveis e consistentes com o conteúdo já publicado nas Ondas anteriores. Próximo: Database Engineer.

### 6. Database Engineer
`STORIES_SEEN` segue o padrão chave-valor já usado, sem necessidade de tabela nova. Próximo: Backend Engineer.

### 7. Backend Engineer
Implementado: `Trail.maybePickStory()` (gatilho + ciclo do pool) e a integração em `finishLesson()`. Próximo: Frontend Engineer.

### 8. Frontend Engineer
Implementado: `Trail.showInteractiveStory()`/`resolveInteractiveStory()` e o desvio do botão "Continuar" da tela de conclusão de lição. Próximo: Cyber Security Specialist.

### 9. Cyber Security Specialist
Sem superfície de risco — todo o conteúdo é estático (`INTERACTIVE_STORIES` em `data.js`), sem entrada de usuário livre interpolada em HTML. Nenhum achado.

### 10. QA Engineer
Testado via Node (execução real do código): estrutura das 5 histórias, disparo exato a cada 3ª lição (não antes, não em replay), ciclo do pool sem repetição até esgotar e reset correto depois, renderização de `showInteractiveStory`/`resolveInteractiveStory`, e o roteamento real do listener do botão "Continuar" (capturado e invocado diretamente) confirmando que abre a história em vez de fechar a tela quando uma está pendente.

### 11. Documentation Specialist
`CHANGELOG.md` e `ROADMAP.md` atualizados — Etapa 2 marcada como 100% concluída.
