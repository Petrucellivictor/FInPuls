# RFC-026: Cidade Financeira — Personalização de Personagem (PolvIn 3D)

- **Status**: em andamento
- **Prioridade**: alta (usuário pediu para seguir com as próximas etapas do jogo da Cidade)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Financial Specialist, Database Engineer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
O PolvIn 3D dentro do jogo da Cidade (RFC-023) é hoje sempre renderizado com a aparência padrão — não reflete as cores/acessórios que o jogador já comprou e equipou no guarda-roupa (RFC-011, Fase 2B), que hoje só se aplicam ao avatar 2D usado no resto do app. O próprio RFC-023 já registrou essa lacuna: "Base pronta pra uma futura Personalização de Personagem (cor/acessório)". Esta RFC conecta os dois sistemas — sem inventar uma loja nova, sem duplicar compra.

## Objetivo
Fazer o PolvIn 3D da Cidade refletir a cor/acessório equipados no guarda-roupa (RFC-011), reaproveitando 100% o sistema de equipar/loja já existente.

## Motivação
Pedido direto do usuário ("continue com as próximas etapas do jogo"). É o único item da "visão de longo prazo" (RFC-021/022) com gancho estrutural já deixado por escrito (RFC-023) e conexão direta com uma feature já pronta (RFC-011) — risco baixo, esforço médio, aditivo, sem tocar mapa/motor Phaser/projeção.

## Benefícios
Reforça a identidade "é o mesmo PolvIn em todo o app"; dá uso real a compras já feitas no guarda-roupa; fecha uma dívida técnica registrada explicitamente pelo RFC-023.

## Impacto
- **`js/data.js`**: as 6 entradas `tipo: "cor"` de `SHOP_ITEMS` (RFC-011) ganham um campo novo `hex3d: { base, light }` (hex Three.js), ao lado do `filtro` CSS já existente — mesmo item, mais uma projeção de render (2D via `filtro`, 3D via `hex3d`), sem duplicar o item nem criar uma segunda lista de cores.
- **`js/citypolvin3d.js`**: `buildRig()` passa a guardar os 4 materiais "família roxo" (corpo, calota, tentáculo-base, tentáculo-ponta) como propriedades da própria instância (`this.bodyMat`/`this.capMat`/`this.tentacleMat`/`this.tipMat`) em vez de variáveis locais descartadas — pré-requisito técnico pra poder recolori-los depois de construídos, sem reconstruir a geometria. Dois métodos novos: `getEquippedColor()` (lê `STORAGE_KEYS.EQUIPPED` + `SHOP_ITEMS`, resolve o `hex3d` do item `cor` equipado, com fallback pro roxo padrão) e `applyEquippedColor()` (aplica `base`/`light` nos 4 materiais via `.color.set()`). `init()` ganha 1 listener novo (`equipped:updated`), registrado com o mesmo padrão defensivo (só roda 1x) já usado em `citygame.js` para `citylife:scenario`/`citylife:aposentadoria`.
- **`js/profile.js`** (adicionado após a etapa 4, Gamification Designer): o template de card de item da Loja ganha uma linha condicional (`item.tipo === "cor"`) com o texto "Veja seu PolvIn com essa cor também na Cidade 🏙️", reaproveitando a classe `text-soft` já usada na descrição — sem CSS novo, sem estado novo, visível nos 6 cards de cor sempre (comprado ou não).
- **Nenhum outro arquivo muda.** Sem novo `<script>` em `index.html` (nenhuma lib nova), sem `STORAGE_KEYS` novo (reaproveita `EQUIPPED` já lido por `polvin.js`/`profile.js` — `CityPolvin3D` passa a ser só mais um leitor da mesma chave).

## Dependências
RFC-011 (guarda-roupa — cores via filtro CSS, sistema de equipar), RFC-023 (PolvIn 3D — geometria procedural, Three.js), RFC-021/022 (motor de jogo, não deve ser afetado).

## Critérios de aceite
- Cor/acessório equipados no guarda-roupa (RFC-011) refletem visualmente no PolvIn 3D da Cidade, sem exigir compra duplicada.
- Nenhuma mudança de regra econômica ou de mecânica de jogo (ciclo semanal, aposentadoria) é afetada.
- Trocar de item no guarda-roupa atualiza o token 3D na próxima vez que a aba Cidade for aberta (tempo real dentro da sessão é nice-to-have, não obrigatório no MVP).
- Zero regressão no sombreamento toon/cel-shading e na sincronização de posição já existente (RFC-023).

## Etapas puladas e por quê
Decisão do Orchestrator, a partir da recomendação registrada pelo Software Architect na seção 2:
- **Database Engineer**: sem mudança de schema/estrutura de dados — `hex3d` é um campo estático a mais dentro de um item já existente de `SHOP_ITEMS`, mesma chave `STORAGE_KEYS.EQUIPPED` de sempre. Mesmo padrão de dispensa já usado no RFC-011 para o mesmo tipo de mudança.
- **Financial Specialist**: zero conteúdo financeiro/educacional — mudança 100% visual/render, mesmo motivo de dispensa do RFC-023.
- **DevOps Engineer**: sem deploy, sem dependência nova (Three.js já carregado desde o RFC-023), sem variável de ambiente/segredo.

Gamification Designer e Cyber Security Specialist permanecem no fluxo (justificativa na seção 2).

## Registro por etapa

### 1. Product Owner
**Fase escolhida**: Character Customization do PolvIn 3D (cor/acessório), conectando à Fase 2B (RFC-011, guarda-roupa) — único item da "visão de longo prazo" com gancho estrutural já deixado por escrito (RFC-023: "Base pronta pra uma futura Personalização de Personagem"), aditivo, sem reescrever mapa/motor/projeção.

**User stories**:
- Como jogador, quero trocar a cor do meu PolvIn 3D dentro da Cidade, para expressar identidade sem depender só da aba Perfil.
- Como jogador, quero ver o acessório/cor que já comprei no guarda-roupa refletido no personagem 3D em tempo real, para sentir que é a mesma personagem em todo o app.
- Como jogador sem nenhum item comprado, quero ver o PolvIn 3D com a aparência padrão, sem quebra visual.

**Riscos levantados**: aplicar cor a uma geometria 3D (Three.js) não é trivial como era sobre um sprite 2D — pode exigir técnica diferente (material/cor do mesh), decisão do Software Architect; acessórios visuais 2D (chapéu, óculos) podem não ter equivalente geométrico 3D pronto, exigindo decisão de escopo do que é "portável" nesta fase vs. adiado.

**Fica de fora desta fase**: cenário isométrico animado (mudança de projeção, maior risco arquitetural entre os itens pendentes, sem valor de gameplay novo — merece RFC própria dedicada); NPCs com diálogo, Quest System, Audio Manager, World Events (cada um é um sistema novo por si só, sem gancho estrutural já pronto — merecem fase e decisão de escopo isoladas).

**Próximo agente responsável**: Software Architect.

### 2. Software Architect

**1. Escopo confirmado: só `tipo: "cor"` é portável nesta fase.** Revisei os 4 tipos de `SHOP_ITEMS` (`js/data.js`, RFC-011) contra o rig procedural de `js/citypolvin3d.js` (RFC-023) e decido, com autoridade técnica, o que entra e o que fica de fora — não deixo em aberto pro Frontend Engineer decidir sozinho no meio da implementação:
- **`cor` (6 itens, portável — única categoria desta RFC).** Hoje é um `filtro` CSS (`hue-rotate(...) saturate(...)`) aplicado sobre `Polvin-logo.png` inteira (`js/polvin.js:avatarHtml()`, linha `imgStyle`). Isso não existe em Three.js/WebGL — não há `<img>`, não há `filter` CSS pra aplicar sobre um mesh. O equivalente correto é recolorir o(s) `MeshToonMaterial.color` do corpo — troca de uniform, não de textura, custo desprezível (ver ponto 5).
- **`acessorio` (4 chapéus — hat_party/hat_grad/hat_top/hat_crown — NÃO portável nesta fase).** Decisão: fora de escopo, não adiada em aberto. Cada chapéu exigiria geometria procedural NOVA (cone/aba/copa), ancorada no topo da esfera-cabeça, que precisa acompanhar `tiltRig` (inclinação fixa) e `squashRig` (squash-and-stretch) sem destacar ou penetrar a cabeça durante a animação — é trabalho de modelagem/rigging, não de mapeamento de dado, e infla exatamente o tipo de escopo que o Product Owner já descartou explicitamente ("aditivo, sem... maior risco arquitetural"). Recomendo RFC própria futura ("PolvIn 3D — Acessórios Geométricos") se o produto quiser isso, reaproveitando a infraestrutura desta RFC (leitura de `EQUIPPED`, listener `equipped:updated`) — só trocando "recolorir material" por "anexar/remover um `THREE.Group` filho de `squashRig`".
- **`bandeira` e `moldura` (badge de emoji no canto + borda colorida ao redor da imagem — NÃO portável, e não por falta de tempo/fase, por incompatibilidade conceitual).** Ambos são elementos de "moldura de foto de perfil" (`border-color` num `<img>` quadrado; um emoji ancorado no canto desse quadrado) — não existe "canto" nem "borda" num personagem dentro de uma cena 3D com câmera ortográfica seguindo o jogador. Portar isso exigiria inventar um conceito visual novo (ex.: anel no chão, placa flutuante sempre de frente pra câmera) que não é "portar um item existente", é desenhar uma feature nova. Não recomendo perseguir isso nem nesta nem numa fase futura sob o rótulo "personalização" — se o produto quiser, é uma ideia nova, com RFC e nome próprios.
- **Óculos: não há o que portar — corrige uma premissa do brief.** O rig 3D já tem óculos geométricos fixos (2 toros + ponte, `darkMat`, RFC-023) e o PNG 2D também já vem com óculos desenhados — mas óculos **não é, e nunca foi, um item de `SHOP_ITEMS`** (não há `tipo: "oculos"` equipável). É parte fixa do personagem nas duas representações, sempre presente, não uma escolha do jogador. Não existe estado equipado pra ler aqui; nada a fazer.

**2. Conversão cor 2D → cor 3D: tabela nova, não reaproveita o `filtro` CSS.** Reaproveitar o valor de `hue-rotate` matematicamente seria repetir o erro que o próprio RFC-011 já registrou e corrigiu na etapa de QA: os ângulos calculados a partir de uma suposição de matiz-base bateram errado com o nome da cor (ex.: "Verde Esmeralda" saiu vermelho) e precisaram ser recalibrados visualmente depois de screenshot real. Decido não repetir esse método por analogia — cada cor ganha um par de hex Three.js definido diretamente (não derivado por fórmula), guardado como `hex3d: { base, light }` no próprio item de `SHOP_ITEMS` (não em `citypolvin3d.js`), pelo mesmo motivo que `filtro` (2D) e `cor` (hex da moldura) já vivem ali: colocar o dado de render junto da definição do item, não numa tabela paralela noutro arquivo que alguém pode esquecer de atualizar ao adicionar uma 7ª cor. **Nome do campo é `hex3d`, não `cor`** — `cor` já é usado pelos itens `moldura` pra outra coisa (hex da borda, ex. `frame_green: { cor: "#4FAE4A" }`) dentro do MESMO array `SHOP_ITEMS`; reusar o nome colidiria semanticamente.

`base`/`light` espelha exatamente o par que já existe hardcoded em `buildRig()` (`purple`/`purpleLight`) — corpo e tentáculo-base usam `base`, calota e tentáculo-ponta usam `light` (é a mesma relação de "luz de borda falsa" que a UX/UI Designer já definiu no RFC-023, só parametrizada). Valores iniciais (a validar visualmente pelo UX/UI Designer + recalibrar no QA, mesmo processo do RFC-011 — não são finais):

| item (`id`) | nome | `hex3d.base` | `hex3d.light` |
|---|---|---|---|
| `cor_esmeralda` | Verde Esmeralda | `0x3fae5a` | `0x74d68a` |
| `cor_oceano` | Azul Oceano | `0x3b82c4` | `0x74b3e0` |
| `cor_rosa` | Rosa Choque | `0xd94fb0` | `0xe98ad0` |
| `cor_fogo` | Vermelho Fogo | `0xd8452f` | `0xea7a5f` |
| `cor_dourada` | Dourado Lendário | `0xcf9a2e` | `0xe8c169` |
| `cor_neon` | Ciano Neon | `0x2fb8c4` | `0x7adde6` |

Sem cor equipada (ou `equipped.cor` apontando pra um id sem `hex3d` — defensivo, cobre o caso de uma cor nova ser adicionada em `data.js` sem o par 3D), `getEquippedColor()` cai no fallback `{ base: 0x6c4fcf, light: 0x8a70e0 }` — os mesmos `purple`/`purpleLight` que já existem hoje em `buildRig()`, garantindo a aparência padrão pro jogador sem nada comprado (critério de aceite do PO).

**Nota de atenção pro UX/UI Designer**: `cor_dourada.hex3d.base` (`0xcf9a2e`) fica próximo do `--gold` (`0xe8a33d`) já usado, sozinho, no broche do peito (`buildRig()`, "único acento de cor, não compete com o roxo" — RFC-023). Com "Dourado Lendário" equipado, o broche deixa de se destacar do corpo. Aceitável tematicamente (nome pede ouro), mas peço validação visual explícita — se ficar ilegível, a correção é ajustar o tom do broche nesse caso específico, não redesenhar a paleta toda.

**Explicitamente fixos, nunca recoloridos pelo `cor` equipado**: contorno preto (`outlineMat`, `MeshBasicMaterial` preto puro — silhueta de cel-shading), olhos (`whiteMat` esclera branca + `darkMat` pupila), óculos (aros + ponte, também `darkMat`) e o broche (`gold`, material próprio). `darkMat` é reaproveitado hoje entre pupila E óculos (mesma instância, `buildRig()` linha do `darkMat = this.toonMat(purpleDark)`) — como nenhum dos dois muda com o `cor` equipado, essa reutilização não é um problema para esta RFC (não precisa ser desmembrada); só viraria um problema se uma fase futura quisesse recolorir óculos independente dos olhos, o que não é o caso aqui. Manter óculos/olhos/contorno fixos preserva a decisão de identidade do RFC-023 ("óculos são a marca mais reconhecível do personagem") — o jogador reconhece o PolvIn pela armação, não pela cor do corpo.

**3. Onde ler o equipado, e por que precisa ser um listener, não só leitura no `create()`.** Reaproveita 100% `Store.get(STORAGE_KEYS.EQUIPPED, {})` — a mesma chave que `js/polvin.js:getEquipped()` e `js/profile.js` já leem; `CityPolvin3D` não introduz um caminho de leitura novo, só mais um leitor. A pergunta do brief era se bastava ler 1x em `buildRig()`/`init()` (critério de aceite do PO aceita "atualiza na próxima vez que abrir a aba Cidade" como suficiente pro MVP). **Investiguei e não basta — o pressuposto por trás dessa frase não corresponde ao código real**: `js/app.js` chama `CityGame.init()` só `if (!CityGame.game)`, e `CityGame.init()` tem seu próprio guard (`if (this.game...) return`). Isso significa que `create()` — e, dentro dele, `CityPolvin3D.init()`/`buildRig()` — roda **exatamente uma vez por carregamento de página**, não uma vez por visita à aba Cidade. Trocar de cor no guarda-roupa e voltar pra aba Cidade, na mesma sessão, NUNCA re-executaria `buildRig()` — "próxima vez que abrir a aba" description, seguida à risca, equivaleria na prática a "só depois de recarregar a página inteira", o que é pior do que qualquer leitura do PO esperava. Por isso o listener em `equipped:updated` (já disparado por `Profile.toggleEquip()`/`Profile.equip()`, `js/profile.js`) não é luxo nem antecipação de nice-to-have — é o único jeito de cumprir o critério de aceite como escrito, dado o lifecycle singleton real do módulo. Registrado dentro de `CityPolvin3D.init()` (que só roda 1x, mesmo padrão defensivo que `citygame.js` já usa pra `citylife:scenario`/`citylife:aposentadoria`):
```js
document.addEventListener("equipped:updated", () => this.applyEquippedColor());
```
Nenhum evento novo — `equipped:updated` já existe e já é o sinal correto (dispara em toda compra/troca de equipamento, independente da categoria).

**4. `STORAGE_KEYS` novo: nenhum.** Confirmado — reaproveita `EQUIPPED` (`STORAGE_KEYS.EQUIPPED`, `js/storage.js`) sem alteração de shape. `CityPolvin3D` lê o mesmo objeto `{ cor?: id, acessorio?: id, bandeira?: id, moldura?: id }` que já existe, só olha a chave `cor`.

**5. Risco de performance: nenhum nesta RFC, ressalva pra futuras.** `applyEquippedColor()` faz só `material.color.set(hex)` em 4 materiais `MeshToonMaterial` já existentes — troca de uniform de cor, sem trocar textura/`gradientMap`, sem recompilar shader (não mexe em `defines` nem em flags como `vertexColors`), sem alocar/descartar geometria ou material novo. Custo é O(1), seguro pra chamar direto do listener sem debounce. Isso só se mantém verdade PORQUE o escopo desta RFC é estritamente recolorir materiais existentes — se uma fase futura de acessórios geométricos (chapéus, ponto 1) for aprovada, ela precisará decidir entre (a) pré-construir todos os `Group` de acessório em `buildRig()` e só alternar `.visible` (mais memória de geometria parada, zero custo de rebuild ao trocar) ou (b) construir/descartar geometria sob demanda (menos memória parada, custo pontual de `BufferGeometry`/`dispose()` a cada troca) — decisão que fica pra quando essa RFC futura existir, não antecipo aqui.

**Recomendação de etapas a pular nesta RFC** (registro pra quem consolidar a seção "Etapas puladas e por quê" — não decido sozinho, só sinalizo com justificativa):
- **Database Engineer**: sem mudança de schema/estrutura de dados — `hex3d` é um campo estático a mais dentro de um item já existente de `SHOP_ITEMS`, mesma chave `STORAGE_KEYS.EQUIPPED` de sempre. Idêntico motivo pelo qual o RFC-011 já pulou esta etapa pro mesmo tipo de mudança.
- **Financial Specialist**: zero conteúdo financeiro/educacional — mudança 100% visual/render, mesmo motivo do RFC-023.
- **DevOps Engineer**: sem deploy, sem dependência nova (Three.js já está carregado desde o RFC-023), sem variável de ambiente/segredo.
- **NÃO recomendo pular**: Gamification Designer (pode valer a pena avaliar se vale um pequeno momento de destaque/feedback na primeira vez que o jogador vê a cor aplicada no 3D — decisão da especialidade dele, não minha) nem Cyber Security Specialist (segue no fluxo só pra confirmar formalmente "sem superfície nova", como o RFC-011 também manteve essa etapa mesmo sabendo que o resultado provável era "nenhum risco").

**Próximo agente responsável**: UX/UI Designer — validar/recalibrar os 6 pares `hex3d` (tabela acima são valores de partida, não finais) e decidir se cabe algum polimento visual na transição de cor (instantânea vs. um tween curto de `Color.lerp` ao trocar) dentro do canvas 3D da Cidade.

### 3. UX/UI Designer

**Método de validação.** `MeshToonMaterial` aqui usa um `gradientMap` de só 3 degraus (`buildGradientMap()`: `#4a4a4a` ~29%, `#b0b0b0` ~69%, `#ffffff` 100%) — ou seja, cada material aparece na tela em blocos chapados de sombra/meio-tom/luz, não um degradê suave. Validei os 6 pares olhando pra cada hex sob essas três multiplicações (não só o hex "puro" a 100% de luz), porque é assim que o cel-shading do RFC-023 realmente os exibe. Também comparei hue/saturação/luminosidade entre os 6 pares entre si (não só cada um contra seu próprio nome) pra garantir separação visual no conjunto, e contra o `filtro` CSS 2D de cada item em `data.js` (linha 9758-9763) como âncora do que o nome pretende comunicar.

**1. Avaliação item a item.**

- **`cor_esmeralda` (Verde Esmeralda) — aprovado sem alteração.** `0x3fae5a`/`0x74d68a` cai bem no verde-esmeraldeira (hue ≈135°), nem verde-limão nem verde-floresta escuro. Bate com o `filtro` 2D (`hue-rotate(243deg)`, que também produz um verde médio-saturado). Sem risco de confundir com nenhum outro dos 6.
- **`cor_rosa` (Rosa Choque) — aprovado sem alteração.** `0xd94fb0`/`0xe98ad0` é magenta-rosa vibrante (hue ≈318°), exatamente o registro "pra ninguém passar despercebido" do `desc`. Único item nessa faixa de hue — zero ambiguidade.
- **`cor_fogo` (Vermelho Fogo) — aprovado sem alteração.** `0xd8452f`/`0xea7a5f` é vermelho-alaranjado quente (hue ≈8°), lê como fogo/brasa, não como vermelho puro de sinal de trânsito nem rosa. Distinto de todos os outros 5.
- **`cor_oceano` (Azul Oceano) — recalibrado.** O valor do Architect (`0x3b82c4`/`0x74b3e0`) é um azul correto, mas raso demais pra "oceano" (lê mais como "azul de app corporativo") e, mais importante, fica com o canal B idêntico ao do `cor_neon` recalibrado abaixo (ambos B=196) — no degrau escuro do toon (×0.29) essa proximidade se acentua. Aprofundei o tom: **`base 0x2f74b8`, `light 0x6ba8dd`** — mesma família de azul, mas mais denso/saturado (hue ≈210°, mais "mar profundo" que "céu"), e agora com separação clara de luminosidade em relação ao ciano.
- **`cor_neon` (Ciano Neon) — recalibrado.** O valor do Architect (`0x2fb8c4`/`0x7adde6`, hue ≈185°) é tecnicamente ciano, mas com saturação/brilho moderados — não lê como "neon" (a palavra pede um tom quase fluorescente, eletrizante) e ficava a só 25° de hue do azul oceano original, perto demais pra diferenciar de relance num personagem pequeno na tela. Subi saturação e brilho: **`base 0x1fd6dc`, `light 0x74f0f2`** — agora um ciano bem mais vívido/elétrico, condizente com "neon" e com separação de luminosidade confortável em relação ao oceano (mais claro/saturado que o azul, que ficou mais denso).
- **`cor_dourada` (Dourado Lendário) — recalibrado (ver item 2 abaixo, motivo é o conflito com o broche, não o nome).**

**2. Resolução do risco do broche.** Concordo com o diagnóstico do Architect: `0xcf9a2e` (proposta original) fica muito perto do `--gold` do broche fixo (`0xe8a33d`) — quase mesmo hue (≈36°) e luminosidade parecida. Decisão: **não mexer no broche** (ele é um elemento fixo de identidade, igual óculos/olhos/contorno — mexer nele condicionalmente ao item equipado criaria uma exceção de código pra um acento cosmético secundário, custo/benefício ruim pra um caso que o próprio design pode resolver só ajustando 2 hex). Em vez disso, recalibrei `cor_dourada` pra um dourado mais denso/antigo ("bronze-dourado"), não o amarelo-ouro chapado que colidia com o broche: **`base 0xb8842e`, `light 0xe6bd6a`**. Resultado: o corpo fica um dourado mais rico e escuro (mesmo hue ≈37°, mas ~13pp menos luminoso e menos saturado que o broche), e o broche — que continua no `0xe8a33d` mais claro/saturado — passa a se destacar como um acento *mais brilhante* sobre o corpo, não a desaparecer nele. Leitura temática também melhora: "Lendário" comunica mais como ouro-envelhecido/premium do que como amarelo-ouro básico — combina com ser o item mais caro da loja (100 moedas, o teto da categoria).

**3. Tabela final (validada/recalibrada — substitui integralmente a da seção 2 do Software Architect):**

| item (`id`) | nome | `hex3d.base` | `hex3d.light` | status |
|---|---|---|---|---|
| `cor_esmeralda` | Verde Esmeralda | `0x3fae5a` | `0x74d68a` | mantido |
| `cor_oceano` | Azul Oceano | `0x2f74b8` | `0x6ba8dd` | **recalibrado** (mais denso, separa do neon) |
| `cor_rosa` | Rosa Choque | `0xd94fb0` | `0xe98ad0` | mantido |
| `cor_fogo` | Vermelho Fogo | `0xd8452f` | `0xea7a5f` | mantido |
| `cor_dourada` | Dourado Lendário | `0xb8842e` | `0xe6bd6a` | **recalibrado** (evita colisão com o broche `0xe8a33d`) |
| `cor_neon` | Ciano Neon | `0x1fd6dc` | `0x74f0f2` | **recalibrado** (mais saturado/elétrico, separa do oceano) |

Fallback sem cor equipada continua `{ base: 0x6c4fcf, light: 0x8a70e0 }` (roxo padrão do `buildRig()`) — não mexi nele, não é um dos 6 itens da loja.

Checagem de separação no conjunto: ordenando os 6 por matiz (fogo ≈8° → dourada ≈37° → esmeralda ≈135° → neon ≈182° → oceano ≈210° → rosa ≈318°), os dois pares mais próximos entre si (fogo/dourada ≈30° de distância, neon/oceano ≈28°) continuam sendo os únicos pares "vizinhos" no círculo cromático — inevitável com só 6 cores nomeadas —, mas cada par vizinho tem diferença clara de saturação/luminosidade e de composição de canal (dourada é bem menos saturado e mais claro que fogo; oceano é mais denso/escuro que neon), então não são confundíveis mesmo no degrau escuro do toon shading.

**4. Transição de cor: instantânea, confirmo a escolha padrão do Software Architect — não vale um tween aqui.** Motivo prático, não só "simplicidade por si": o evento `equipped:updated` dispara a partir da troca de equipamento na aba Perfil (`Profile.toggleEquip()`/`Profile.equip()`), não dentro da aba Cidade — ou seja, no caminho normal descrito pelo critério de aceite do PO ("atualiza na próxima vez que a aba Cidade for aberta"), o jogador nunca está olhando pro canvas 3D no instante em que a cor muda. Um `Color.lerp` ao longo de frames só teria efeito visível se o jogador conseguisse ver o corpo mudando de cor em tempo real — o que exigiria as duas telas visíveis ao mesmo tempo, cenário que não existe na navegação por abas do PolvIn hoje. Investir num tween aqui seria animação que ninguém nunca vê — não é o mesmo tipo de "wow moment" que uma recompensa de XP (que acontece na tela em que o jogador já está olhando). `material.color.set()` direto, como implementado, está correto. **Nota pro Gamification Designer** (o Architect já sinalizou isso como decisão da especialidade dele, reforço aqui do ângulo de UX): se no futuro o fluxo de troca de cor ganhar uma prévia dentro da própria Cidade (ex.: um mini-preview 3D na aba Guarda-roupa), *aí sim* vale reaproveitar o padrão de `Fx` (um pulso de brilho tipo `Fx.successGlow`, não um lerp de cor cru) pra marcar a troca como um momento — não antecipo essa função agora porque não há tela nenhuma que a dispare hoje.

**5. Elementos fixos — contraste confirmado contra os 6 novos tons de corpo.** `outlineMat` (`0x000000`, `MeshBasicMaterial` preto puro, técnica de silhueta por malha invertida) contrasta contra qualquer cor de corpo por definição — não depende de luminosidade relativa, é sempre a borda mais escura da cena. `whiteMat` (esclera, `0xffffff`) se mantém a superfície mais clara do personagem contra os 6 tons, inclusive contra os dois "light" mais claros da tabela (`cor_neon.light` `0x74f0f2` e `cor_dourada.light` `0xe6bd6a`) — testei especificamente esses dois por serem os mais próximos de branco entre os 6, e ainda ficam 15-20pp abaixo da luminosidade do branco puro. `darkMat` (`purpleDark`, `0x2d1b4e`, compartilhado entre pupila e aros/ponte dos óculos) é intencionalmente quase preto com leve matiz roxo — permanece o elemento mais escuro depois do contorno mesmo contra o degrau mais escuro do toon (corpo × ~29%) nos 6 tons recalibrados; a maior aproximação teórica seria `cor_dourada` no degrau escuro (`0xb8842e` × 0.29 ≈ `0x352712`, ainda nitidamente marrom-escuro vs. o roxo-quase-preto do `darkMat`, hues diferentes o bastante pra não se fundirem). Broche (`0xe8a33d`, fixo) resolvido no item 2. Nenhum ajuste nos elementos fixos é necessário — a decisão de identidade do RFC-023 ("óculos são a marca mais reconhecível, olhos/contorno nunca mudam") se sustenta contra as 6 cores novas sem exceção.

**Próximo agente responsável**: Gamification Designer — avaliar se cabe um pequeno momento de destaque/feedback (fora do escopo desta RFC recolorir em tempo real, ver item 4) na primeira vez que o jogador vê a cor equipada refletida no 3D, e confirmar que a mecânica de guarda-roupa/loja (RFC-011) não precisa de nenhum ajuste de incentivo por causa dessa nova superfície de exibição.

### 4. Gamification Designer

**Levantamento prévio**: conferi `js/profile.js` (`buy()`, `toggleEquip()`) e `js/achievements.js` — hoje **não existe nenhum toast/modal/celebração** em lugar nenhum do app para compra, equipar item ou desbloquear conquista. O único feedback é estado silencioso (botão vira "Equipado ✓", card de conquista muda de cinza pra colorido). Isso muda a pergunta do brief: não se trata de "duplicar uma celebração existente" (ela não existe), e sim de decidir se vale criar a *primeira* celebração do app especificamente para este caso.

**1. Momento de destaque na primeira vez que a cor aparece no 3D: NÃO recomendo.** Decisão fechada.

Criar a primeira celebração do app justamente para uma recor de mesh num submenu opcional seria inconsistente com a linguagem já estabelecida (reforço via estado persistente visível, nunca via interrupção pontual), e exigiria infraestrutura nova (toast/overlay + estado "já visto" por cor, provavelmente uma chave nova em `STORAGE_KEYS`) para um payoff pequeno — o jogador já decidiu comprar e equipar deliberadamente na Loja; não há "gancho de surpresa" a recompensar aqui. O valor de retenção de um cosmético vem do reforço ambiente repetido (ver a cor toda vez que abre a Cidade), que já acontece de graça com `applyEquippedColor()`. Nota de escopo: a pergunta do UX/UI Designer sobre "transição instantânea vs. tween de `Color.lerp`" é polimento visual, não celebração — um tween suave é bem-vindo esteticamente; só recuso banner/mascote/som/confete.

**2. Esta feature reforça engajamento/retenção mensurável? Não artificialmente — resposta honesta: não é uma alavanca nova, e está tudo bem.** É polish visual que fecha a promessa "é o mesmo PolvIn em todo o app", mas não cria gatilho novo de abrir o app/terminar lição/manter streak. Não proponho XP, moeda, conquista ou missão nova amarrada a "ver a cor no 3D" — recompensar só "olhar pra algo que você já comprou" giraria perto de XP de graça sem esforço real. Efeito indireto real mas de segunda ordem: ter uma 2ª superfície onde a cor aparece pode tornar a compra de cores mais atrativa frente a outros itens da Loja, incentivando indiretamente lições/desafios/missões que geram moedas — não recomendo instrumentar métrica nova só pra validar isso, é baixo demais pra justificar tracking dedicado.

**3. Conexão Loja → Cidade via copy: SIM, recomendo — decisão fechada, sem estado novo.** É uma feature "invisível por padrão" — o jogador só descobre o reflexo 3D se notar por acaso na aba Cidade. Proposta de copy, só nos 6 cards de `tipo: "cor"` (não em `acessorio`/`bandeira`/`moldura`, não portáveis nesta fase — não criar expectativa errada):

> "Veja seu PolvIn com essa cor também na Cidade 🏙️"

Onde: linha extra dentro do card do item, reaproveitando a classe `text-soft` já usada na descrição (`js/profile.js`, template de card do item — sem CSS novo). Mostrar em todos os 6 cards, comprados ou não (incentivo de compra + lembrete de descoberta). Não uso um estado "já visto" (evitaria uma chave nova em `STORAGE_KEYS` só pra isso) — versão evergreen, custo de implementação quase zero, nunca "gasta".

**Impacto declarado**: esta recomendação adiciona `js/profile.js` à lista de arquivos tocados por esta RFC (além de `js/data.js`/`js/citypolvin3d.js` já listados pelo Software Architect) — é só uma linha de copy condicional (`item.tipo === "cor"`) dentro do template de card já existente, sem lógica/evento/`STORAGE_KEYS` novos.

**Próximo agente responsável**: Backend/Frontend Engineer (Financial Specialist e Database Engineer seguem pulados, conforme registrado em "Etapas puladas e por quê").

### 5. Financial Specialist

### 6. Database Engineer

### 7. Backend Engineer

**Escopo desta etapa**: só `js/data.js` (modelagem de dados dos itens de loja) — a leitura/aplicação de `hex3d` em `js/citypolvin3d.js` (`getEquippedColor()`/`applyEquippedColor()`) e a linha de copy em `js/profile.js` ficam com o Frontend Engineer, conforme a divisão já registrada pelo Software Architect (seção 2) e Gamification Designer (seção 4).

**O que foi feito**: adicionado o campo `hex3d: { base, light }` aos 6 itens `tipo: "cor"` de `SHOP_ITEMS` (`js/data.js`, linhas 9758-9763), usando os valores FINAIS recalibrados pelo UX/UI Designer na seção 3 — não os valores de partida do Software Architect na seção 2:

| id | `hex3d.base` | `hex3d.light` |
|---|---|---|
| `cor_esmeralda` | `0x3fae5a` | `0x74d68a` |
| `cor_oceano` | `0x2f74b8` (recalibrado) | `0x6ba8dd` (recalibrado) |
| `cor_rosa` | `0xd94fb0` | `0xe98ad0` |
| `cor_fogo` | `0xd8452f` | `0xea7a5f` |
| `cor_dourada` | `0xb8842e` (recalibrado) | `0xe6bd6a` (recalibrado) |
| `cor_neon` | `0x1fd6dc` (recalibrado) | `0x74f0f2` (recalibrado) |

O campo `filtro` (CSS 2D, RFC-011) foi mantido intacto em todos os 6 itens — `hex3d` é uma projeção de render adicional para o mesmo item, não uma substituição. Nenhum outro item do array (`acessorio`, `bandeira`, `moldura`) recebeu `hex3d`, conforme a decisão do Software Architect de que só `tipo: "cor"` é portável nesta fase (chapéus/bandeiras/molduras não têm equivalente geométrico 3D e ficam fora de escopo — ver seção 2).

**Sem mudança de schema/`STORAGE_KEYS`**: confirmado — `hex3d` é só um campo estático a mais dentro de um item já existente de `SHOP_ITEMS`; nenhuma chave nova, nenhum novo caminho de leitura/escrita de dado (`Store`/`Cloud` continuam intocados). É por isso que Database Engineer segue pulado nesta RFC (registrado em "Etapas puladas e por quê").

**Verificação manual**: Node não está disponível neste ambiente (confirmado em RFCs anteriores), então a validação de sintaxe foi feita por leitura cuidadosa do `git diff` — cada uma das 6 linhas alteradas mantém chaves/vírgulas balanceadas (`{ id: ..., hex3d: { base: 0x..., light: 0x... } }`), a vírgula de fechamento de cada objeto antes do `}` do array final (`];`, linha 9764) foi preservada, e o diff mostra exatamente 6 linhas modificadas — nenhuma linha adicionada/removida fora do intervalo 9758-9763, nenhum outro item do array tocado. `git diff js/data.js` conferido, saída limpa (ver abaixo).

```
6 linhas alteradas em js/data.js (9758–9763), 0 inserções/remoções de linha,
0 mudanças fora do bloco `tipo: "cor"` de SHOP_ITEMS.
```

**Próximo agente responsável**: Frontend Engineer — implementar `getEquippedColor()`/`applyEquippedColor()` em `js/citypolvin3d.js` (incluindo o refactor de `buildRig()` para guardar `this.bodyMat`/`this.capMat`/`this.tentacleMat`/`this.tipMat`, e o listener `equipped:updated` em `init()`) e a linha de copy condicional em `js/profile.js`, conforme especificado nas seções 2 e 4.

### 8. Frontend Engineer

### 9. Cyber Security Specialist

### 10. QA Engineer

### 11. Documentation Specialist
