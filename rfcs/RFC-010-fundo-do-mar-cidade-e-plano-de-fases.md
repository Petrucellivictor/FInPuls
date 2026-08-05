# RFC-010: Cidade Financeira — Fundo do Mar (Fase 2A) + plano de fases do redesign completo

- **Status**: concluída (Fase 2A)
- **Prioridade**: alta (pedido direto do usuário, com referência visual)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
O usuário pediu duas coisas na mesma mensagem, de escopo muito diferente: (1) a aba Cidade Financeira virar um cenário 2D de fundo do mar, estilo desenho animado (referência: Bob Esponja/Procurando Nemo), com animação, interação e uma mecânica nova de "comprar terrenos/casas/bens"; (2) **o site inteiro** redesenhado com a mesma filosofia de identidade (RFC-008), de forma única, profissional, "gamer" e intuitiva — incluindo o POLVIn ganhar customização estilo o jogo POU (cor, skins, acessórios, bens).

Isso é maior que qualquer RFC anterior desta sessão. Esta RFC cobre a Fase 2A (Cidade) de ponta a ponta, e formaliza um **plano de fases** para o resto — não tenta redesenhar ~20 abas de uma vez, pelo mesmo motivo já registrado no RFC-008: um redesenho gigante sem teste real por etapa é o tipo de risco que este processo existe pra evitar.

## Objetivo
Entregar a Cidade Financeira como uma experiência temática completa e nova (não só um retoque visual), e deixar registrado, com a mesma disciplina de RFC/Etapa já usada no projeto, o que vem a seguir e em que ordem.

## Motivação
Pedido direto do usuário, com imagem de referência e instrução explícita para eu, "como CEO", estruturar e elaborar isso com o time.

## Plano de fases (Product Owner)

| Fase | Escopo | Status |
| --- | --- | --- |
| **2A** | Cidade Financeira: cenário 2D de fundo do mar (bolhas, coral, areia, peixes, POLVIn guia), as 13 construções existentes reposicionadas num "mapa" temático em vez de grade, e uma **loja de decorações** nova (mecânica de compra com moedas, cosmética, não afeta progresso) | **Esta RFC** |
| **2B** | Customização do POLVIn estilo POU: cor (via filtro CSS, sem gerar arte nova), e reorganizar o que já existe de acessórios/bandeiras/molduras num painel de "guarda-roupa" dedicado | Próxima RFC |
| **2C, 2D, ...** | Redesign das demais abas (Investimentos, Simulador, Carteira, Ações & FIIs, Desafios, Mercado, Notícias, Educação, Avançado, Biblioteca), uma ou poucas por vez | Futuras RFCs, não escopadas ainda |

Justificativa de não fazer tudo de uma vez: cada fase de identidade visual desta sessão (RFC-008 Fase 1, e agora esta) já é, individualmente, do tamanho de várias features normais somadas. Tentar as ~20 abas juntas eliminaria a verificação real (Node/vm + Playwright) que pegou bugs reais em toda RFC anterior — o risco não compensa a velocidade.

## Benefícios
A Cidade Financeira deixa de ser uma grade de cards genérica (o tipo de coisa que a filosofia de design de RFC-008 explicitamente pede pra evitar) e vira a superfície mais "jogo" do app inteiro — condizente com a mascote ser um polvo. A loja de decorações dá um uso novo e opcional pras moedas, sem inflar a economia de XP nem duplicar a lógica de desbloqueio por conquista já testada.

## Impacto
- `js/data.js`: `CITY_DECORATIONS` novo (6 itens cosméticos compráveis com moedas). `CITY_BUILDINGS` ganha `x`/`y` não é necessário — decidido usar layout em fileira (ver Software Architect) em vez de coordenadas absolutas.
- `js/storage.js`: `STORAGE_KEYS.CITY_DECORATIONS_OWNED` novo.
- `js/city.js`: reescrito — cenário do fundo do mar (bolhas/peixes/coral gerados), construções em fileira horizontal com scroll (zigue-zague vertical, mesmo espírito do `.trail-node`), modal de detalhe ao clicar (construído ou "conquista bloqueada" com a dica da conquista correspondente), loja de decorações com compra via `Learn.spendCoins`.
- `index.html`: painel `#tab-cidade` reestruturado.
- `css/style.css`: nova seção "CIDADE FINANCEIRA — FUNDO DO MAR" com o cenário, animações (bolha subindo, peixe nadando, coral balançando) e os cards de construção/decoração redesenhados.

## Dependências
Nenhuma. Reaproveita 100% do sistema de conquistas (RFC-005) sem alterá-lo.

## Critérios de aceite
- As 13 construções continuam desbloqueando exatamente pelas mesmas conquistas de antes (nenhuma regressão no RFC-005).
- A loja de decorações debita moedas reais (`Learn.spendCoins`), nunca deixa comprar sem saldo, e uma decoração comprada nunca desaparece nem é comprada em duplicidade.
- Cenário roda com animações reais (não estático) e é utilizável em mobile (320px) sem overflow horizontal da página (só do próprio cenário, que é a intenção).
- `node --check` limpo em todos os arquivos JS tocados; teste visual real (Playwright) em pelo menos 2 larguras.
- Este documento registra explicitamente o plano de fases 2B/2C+ — não implementado agora, não esquecido.

## Etapas puladas e por quê
- **Database Engineer**: padrão chave-valor simples de `STORAGE_KEYS`, mesma decisão de sempre — sem necessidade de revisão própria.
- **Financial Specialist**: decorações são cosméticas, sem conteúdo financeiro novo.
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Ver "Plano de fases" acima. Decisão adicional: a mecânica de "comprar terrenos/casas" pedida pelo usuário **não substitui** o desbloqueio por conquista das 13 construções principais (isso quebraria o RFC-005 e deixaria a cidade compravel com dinheiro, esvaziando o propósito de "marco de progresso real") — em vez disso, é uma camada cosmética nova e paralela (decorações), preservando o que já funciona. Próximo: Software Architect.

### 2. Software Architect
Decisão de layout: em vez de posicionar as 13 construções em coordenadas absolutas (x/y fixos), o que quebra facilmente em telas estreitas, o cenário usa uma fileira horizontal roláve com deslocamento vertical alternado (mesmo princípio do zigue-zague de `.trail-node`, já testado em produção) — mais seguro pra responsividade do que coordenadas por porcentagem, e ainda assim quebra a rigidez de "grade". Elementos decorativos (bolhas, peixes, coral) são absolutamente posicionados DENTRO do próprio contêiner de scroll, então "viajam com o cenário" em vez de ficarem fixos na viewport. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Referência da imagem adaptada pra 2D (conforme o próprio usuário sugeriu) usando só CSS/SVG/emoji — sem geração de arte nova, mesma restrição de "sem asset pesado novo" já em uso (RFC-008). Construções continuam emoji (padrão de iconografia do projeto), mas ganham uma "concha"/rocha temática ao redor em vez do card branco genérico anterior; bloqueadas ficam como uma concha fechada. POLVIn (`Polvin.avatarHtml`) fica de guia num canto, boiando (reaproveita a animação `polvinFloat` já existente), com uma fala via `Polvin.renderBubble` dando um resumo/dica.

### 4. Gamification Designer
Loja de decorações: preços de 15 a 50 moedas (faixa parecida com os acessórios mais baratos da Loja do Perfil), sem XP nenhum envolvido — é um "sink" de moedas puramente cosmético, que dá propósito extra pra moeda sem tocar a progressão real. Nomes/temas das decorações reforçam a metáfora (Baú do Tesouro, Navio Naufragado, Farol) em vez de serem genéricos.

### 5. Backend Engineer
Implementado: `CITY_DECORATIONS` em `data.js`, `STORAGE_KEYS.CITY_DECORATIONS_OWNED`, lógica de compra em `js/city.js` (`buyDecoration`) usando `Learn.spendCoins` (mesmo guard contra saldo insuficiente já usado na Loja do Perfil).

### 6. Frontend Engineer
Implementado: cenário do fundo do mar completo (bolhas/peixes/coral animados via CSS), construções em fileira com zigue-zague, modal de detalhe ao clicar, seção de loja de decorações, todo o CSS novo.

### 7. Cyber Security Specialist
Sem superfície de risco nova — mesmo padrão de interpolação de dados estáticos (`data.js`) já auditado em RFCs anteriores, nenhuma entrada de usuário livre.

### 8. QA Engineer
Testado via execução real do código (Node/vm, harness com `Learn`/`Achievements`/`Polvin` reais, não mocks superficiais):
- As 13 `CITY_BUILDINGS` continuam com `id` real em `ACHIEVEMENTS` — nenhuma regressão do RFC-005.
- Sem nenhuma conquista desbloqueada, o cenário mostra "???"/🔒 em todos os 13 slots, a areia (`.city-sand`) e o guia do POLVIn aparecem, e o label mostra "0/13".
- Desbloqueando `primeira_licao` e `streak_7` via `Achievements.getUnlocked()`, o cenário mostra "Casa"/"Banco" reais, label "2/13", barra em 15%.
- Loja de decorações: 6 itens, botão de compra com `disabled` quando o saldo é insuficiente, `City.buyDecoration()` sem moedas dispara o alerta e **não** adiciona a decoração; com moedas suficientes, debita o valor exato (`Learn.spendCoins`), adiciona a decoração, e uma segunda tentativa de comprar a MESMA decoração não debita de novo (guard contra duplicidade).
- Decoração comprada aparece na cena (emoji correto) na renderização seguinte.
- **Teste visual real** (Playwright + Chromium, 2 larguras — 390px e 1280px): cenário renderiza com gradiente do oceano, areia ondulada, bolhas/peixes/coral animados, construções em zigue-zague, guia do POLVIn com fala; clicar numa construção desbloqueada abre o modal de detalhe com o conteúdo real (nome + descrição); comprar uma decoração de verdade no navegador debita as moedas do header (120→105) e a decoração aparece marcada como "✅ Adquirida" na loja e como sprite na cena — **zero erros de console/página** nas duas larguras. Sem overflow horizontal da página em nenhuma das duas (o único scroll horizontal é o do próprio cenário, intencional).
- `node --check` limpo em `js/city.js`, `js/data.js`, `js/storage.js`, `js/app.js`, `js/achievements.js`.

### 9. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados (v1.29.0) registrando a Fase 2A concluída e o plano de Fases 2B/2C+ ainda por vir.
