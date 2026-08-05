# RFC-003: Estante de livros + certificados

- **Status**: concluída
- **Prioridade**: alta (segundo item da Etapa 2 do `ROADMAP.md`)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
A Biblioteca Fin+ deixa de ser só uma lista/grid estática de recomendações e passa a ter um fluxo real de conclusão: cada um dos 18 livros ganha um resumo (contado pelo POLVIn) e um mini-quiz de 2 perguntas; completar o quiz marca o livro como "lido" na estante e gera um certificado numa "parede de certificados" nova.

## Objetivo
Dar profundidade real à Biblioteca (hoje só recomendação passiva) sem exigir nenhuma infraestrutura nova — tudo client-side, reaproveitando padrões já existentes (overlay de quiz, POLVIn contando história).

## Motivação
Item pedido explicitamente pelo usuário ("Ao invés de apenas listar, faça uma estante... ao completar: resumo, quiz, certificado"), Etapa 2 do roadmap.

## Benefícios
Cria uma razão real para voltar à Biblioteca (progresso visível, certificados coletáveis) e reforça o conteúdo de cada livro através do quiz, em vez de só exibir uma sinopse.

## Impacto
- `js/data.js`: array `BOOKS` ganhou os campos `resumo` (3 parágrafos) e `quiz` (2 perguntas) em todos os 18 livros — nenhum campo existente (`id`, `titulo`, `autor`, `nivel`, `tema`, `pitch`) foi alterado.
- Conquista `leu_10_livros` mudou de critério: antes contava `BOOKS_SEEN` (livros só *recomendados*), agora conta `BOOKS_COMPLETED` (livros de fato *lidos* com quiz) — mudança de comportamento documentada aqui e no `CHANGELOG.md`, já que é uma conquista pré-existente com critério mais rigoroso agora.
- Nova conquista `primeiro_certificado`.

## Dependências
Nenhuma.

## Critérios de aceite
- Todos os 18 livros têm resumo e quiz factualmente corretos sobre o livro real (verificado pelo Financial Specialist).
- Completar o quiz de um livro (independente da nota) marca o livro como lido e gera um certificado — sem "reprovação", diferente da trilha principal, já que o objetivo é incentivar leitura, não reter o usuário.
- XP/moedas do livro só são concedidos na primeira conclusão (mesmo padrão de guard já usado em `Trail.finishLesson`/`Business.finishLesson`).
- `node --check` limpo; fluxo completo (start → resumo → quiz com 1 erro e 1 acerto → certificado → repetição sem XP duplicado → conquistas) verificado por execução real do código.

## Etapas puladas e por quê
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo confirmado: estante visual + resumo + quiz + certificado, para os 18 livros já existentes — sem adicionar livros novos nem um sistema de avaliação/nota do usuário sobre os livros (fora de escopo). Próximo: Software Architect.

### 2. Software Architect
Decisão: estender `js/books.js` (não criar módulo novo) e reaproveitar o padrão de overlay de quiz já usado em `js/trail.js`/`js/business.js`/`js/energy.js` (mesmas classes CSS `.quiz-overlay`/`.quiz-box`/`.quiz-option`). Nova chave `STORAGE_KEYS.BOOKS_COMPLETED` (objeto `{ [bookId]: { data, acertos, total } }`), distinta de `BOOKS_SEEN` (que continua controlando só a rotação de recomendações). Próximo: UX/UI Designer.

### 3. UX/UI Designer
Nova seção "Parede de Certificados" abaixo da estante em `index.html`; `.book-card.done` (destaque verde) e `.certificate-card` (moldura dourada) adicionados a `css/style.css`; resumo do livro reaproveita `Polvin.renderStory()` (mesmo componente usado nas "aulas" da trilha). Próximo: Gamification Designer.

### 4. Gamification Designer
+20 XP e +10 moedas na primeira conclusão de cada livro (valor intermediário entre uma lição pequena e uma grande da trilha, já que ler um livro é um compromisso maior). Sem "reprovação" no quiz — decisão deliberada para não desincentivar a leitura. Próximo: Financial Specialist.

### 5. Financial Specialist
Escreveu resumo (3 parágrafos) e quiz (2 perguntas com gabarito e explicação) para os 18 livros, cobrindo desde clássicos de comportamento financeiro (Pai Rico Pai Pobre, Psicologia Financeira) até os mais técnicos de investimento (Graham, Fisher, Greenblatt) e os de economia/desigualdade (Piketty, Stiglitz, Furtado, Marx, FHC/Faletto) — cuidado especial para representar fielmente a tese real de cada obra, sem simplificar a ponto de distorcer. Próximo: Database Engineer.

### 6. Database Engineer
Nova chave `BOOKS_COMPLETED` segue o padrão chave-valor já usado (entra automaticamente no backup/sincronização, sem código extra). Próximo: Backend Engineer.

### 7. Backend Engineer
Implementado: `Books.getCompleted/isCompleted/finishBookFlow` em `js/books.js`; conquista `leu_10_livros` migrada de `BOOKS_SEEN` para `BOOKS_COMPLETED` (critério mais rigoroso, descrição atualizada em `data.js`); nova conquista `primeiro_certificado` em `js/achievements.js`. Próximo: Frontend Engineer.

### 8. Frontend Engineer
Implementado: `bookCardHtml` (estado "lido"), `renderCertificatesWall`/`certificateHtml`, fluxo de overlay (`startBookFlow` → `renderSummaryOverlay` → `renderQuizOverlay` → `answerQuizQuestion` → `finishBookFlow`) e o bloco HTML em `index.html`. Próximo: Cyber Security Specialist.

### 9. Cyber Security Specialist
Único ponto de atenção: o nome do usuário (`PROFILE.nome`) é interpolado no certificado — corrigido usando `escapeHtml()` (já existente em `js/polvin.js`, replicado aqui) antes de inserir no `innerHTML`, evitando um vetor de XSS caso o nome do perfil contenha HTML/script. Nenhum outro achado.

### 10. QA Engineer
Testado via Node (execução real do código): estrutura dos 18 livros (resumo de 3 parágrafos, quiz de 2 perguntas cada), fluxo completo com 1 resposta errada e 1 certa, concessão de XP/moedas só na primeira conclusão, metadata de acertos registrada corretamente, e as duas conquistas (`primeiro_certificado`, `leu_10_livros` com o novo critério de 10 livros *completados*, não só vistos).

### 11. Documentation Specialist
`CHANGELOG.md` e `ROADMAP.md` atualizados, incluindo a nota sobre a mudança de critério da conquista `leu_10_livros`.
