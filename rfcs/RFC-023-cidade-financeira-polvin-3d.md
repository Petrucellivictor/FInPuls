# RFC-023: Cidade Financeira — PolvIn 3D dentro do jogo 2D

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário: "continue com o jogo... aproveite para tornar a personagem PolvIn em 3D ao invés de ser um PNG, o resto do jogo pode continuar 2D")
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
O token jogável do PolvIn na Cidade Financeira hoje é `Polvin-logo.png` (uma imagem estática) redimensionada dentro do Phaser. O usuário pediu que especificamente o PERSONAGEM vire 3D — texturas de boa qualidade, estilo desenho animado — enquanto o resto do jogo (mapa, construções, câmera) continua 2D. Não existe nenhum modelo 3D do PolvIn hoje (nenhum arquivo `.glb`/`.gltf` no repo) — a peça precisa ser modelada proceduralmente (geometria gerada em código: esfera + tentáculos + olhos + óculos), não importada.

## Objetivo
Um PolvIn 3D, com sombreamento "toon" (cel-shading, não realista), visível sobre o mapa 2D existente, na mesma posição/escala/animação (squash-and-stretch, virar na direção do movimento) que o sprite antigo tinha — sem regressão de jogabilidade (clique pra mover, proximidade, câmera).

## Motivação
Pedido direto do usuário, no mesmo fio da Fase 5/6 (RFC-021/022): tornar a Cidade mais "jogo de verdade" — um personagem com volume/profundidade em vez de um ícone plano reforça exatamente esse objetivo.

## Decisão técnica (CTO/Software Architect)
(preenchida após consulta)

## Benefícios
PolvIn ganha presença visual muito maior que um PNG — luz/sombra reagem ao seu movimento, reforçando a identidade "jogo", não "app". Base reaproveitável: o mesmo rig 3D pode ganhar variação de cor/acessório quando a Fase de Personalização de Personagem (visão de longo prazo do usuário) for escopada.

## Impacto
- **`index.html`**: novo `<script>` do Three.js (CDN, UMD, mesmo padrão do Phaser) + novo módulo `js/citypolvin3d.js`.
- **`js/citypolvin3d.js`** (novo): módulo que modela o PolvIn em geometria 3D procedural, sombreamento toon, e expõe uma API pra `CityGame` posicionar/animar por frame.
- **`js/citygame.js`**: o sprite `Image` do PolvIn (`this.player`) para de ser desenhado (fica só como referência de posição/física/proximidade, invisível) — a representação visual passa a ser o overlay 3D, posicionado a cada frame na projeção 2D da posição real do jogador (mesma matemática de `camera.worldView` já usada pro balão de proximidade).
- **`css/style.css`**: estilos do canvas 3D overlay.

## Dependências
RFC-021 (fundação do motor de jogo), RFC-022 (múltiplas construções — nenhuma mudança nelas, só o token do jogador muda).

## Critérios de aceite
- PolvIn aparece com volume 3D visível (não plano), sombreado em estilo cel-shading/desenho animado, cores da identidade visual do PolvIn (roxo `--primary`/dourado `--gold`).
- Movimento, squash-and-stretch, giro na direção do movimento e câmera seguindo continuam funcionando sem regressão.
- Proximidade das 5 construções e abertura de diálogo continuam funcionando sem regressão (nada na Fase 5/6 depende da representação visual do jogador).
- Overlay 3D acompanha a posição de tela do PolvIn corretamente enquanto a câmera se move.
- Teste real (Playwright): jogo carrega sem erro de console, canvas 3D presente, posição do overlay muda ao mover o jogador.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: nenhuma mudança de dados persistidos, nenhuma superfície de ataque nova, sem deploy.
- **Financial Specialist/Gamification Designer**: mudança 100% visual, nenhuma regra econômica ou de recompensa muda.

## Registro por etapa

### 1. Product Owner
Escopo: só o token do jogador (PolvIn) vira 3D nesta fase — NPCs, construções e o mapa continuam 2D (a pedido explícito do usuário). Cor/estilo devem bater com a identidade já estabelecida (paleta `--primary`/`--gold`, "estilo desenho animado" = cel-shading, não fotorrealismo).

### 2. Software Architect

**1. Integração 3D-sobre-2D.** Confirmado: canvas Three.js separado, `position: absolute` sobre `#cityGameCanvas`, `WebGLRenderer({ alpha: true })`. Refinamento à proposta: o canvas 3D deve ter o MESMO tamanho de `scene.game.canvas` e ficar FIXO (não uma caixa pequena reposicionada via CSS a cada frame) — só o mesh se move dentro dele, via câmera ortográfica, reaproveitando a mesma conversão `relX/relY` que `positionPrompt()` já usa. Isso evita clipping do mesh durante squash-and-stretch/rotação e qualquer custo de reflow por frame. Precisa de `pointer-events: none` no canvas 3D (senão bloqueia o `pointerdown` que o Phaser usa pro clique-para-mover) e z-index entre o canvas do Phaser e `#cityGamePrompt`/`#cityGameDialogue` (balão e diálogo sempre por cima do personagem). Dois contextos WebGL simultâneos (Phaser + Three.js) não é risco real — o limite prático de navegadores é 8–16 contextos por página, e aqui são só 2. Risco real: se `CityGame` algum dia for recriado (troca de aba destrói/reconstrói o jogo), o contexto WebGL antigo do Three.js precisa ser liberado — `citypolvin3d.js` deve expor `destroy()` e seguir o mesmo guard de singleton que `CityGame.init()` já usa (`if (this.game...) return`).

**2. Fonte da verdade da posição.** Confirmado: `this.player` continua sendo o `Phaser.Image` existente, só `.setVisible(false)`. Zero mudança em movimento, câmera (`startFollow`) ou cálculo de proximidade — todo esse código permanece intocado e continua sendo a única fonte de verdade. `citypolvin3d.js` só LÊ `CityGame.player.x/y` a cada frame; nunca escreve nele.

**3. Timing de carregamento.** A ordem síncrona de `<script>` já resolve — scripts sem `async`/`defer` bloqueiam e executam em ordem de documento, é a mesma garantia que já existe hoje entre Phaser e `citygame.js`, independente da velocidade de conexão. Única guarda necessária: replicar o padrão defensivo já usado (`typeof Phaser === "undefined"` em `init()`) — `citypolvin3d.js` deve checar `typeof THREE === "undefined"` e desistir silenciosamente (sem travar o resto do jogo) só pro caso patológico do CDN falhar por completo, não pra race condition.

**4. Ciclo de render.** Sem RAF próprio. `CityGame.update(scene, time, delta)` deve chamar `CityPolvin3D.render(player.x, player.y, bounceScale, rotation)` como última linha do método. Um clock único evita jitter entre a posição 2D (Phaser) e a projeção 3D (Three.js) — dois RAFs independentes podem drifar entre si e ficar visivelmente dessincronizados durante movimento rápido. Também reaproveita o lifecycle que o Phaser já controla (pause, resize, destroy), sem precisar coordenar start/stop de um segundo loop.

**5. Nome/local do módulo.** Confirmado `js/citypolvin3d.js` (mesma família `city*`: `city.js`, `citylife.js`, `citygame.js`). Ordem em `index.html`: Phaser (já existe) → Three.js CDN (novo, `https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js`) → `js/citypolvin3d.js` (novo) → `js/citygame.js` (existente, passa a depender do módulo novo — por isso precisa vir depois).

**Risco estrutural adicional:** `citypolvin3d.js` não pode cachear `clientWidth`/`clientHeight` do canvas — deve reler `scene.game.canvas.clientWidth/clientHeight` a cada frame de render, porque `Phaser.Scale.FIT` redimensiona o canvas conforme o viewport (mesmo motivo pelo qual `positionPrompt()` já lê isso a cada chamada, nunca em cache).

**Próximo agente responsável:** UX/UI Designer (estilo cel-shading, paleta, proporções do rig).

### 3. UX/UI Designer
Referência conferida: `Polvin-logo.png` (polvo roxo, óculos redondos, olhos grandes, tentáculos, render 3D toy-like já existente em outras partes do app) e a assinatura de movimento já existente em `js/citygame.js` (bounce `1-0.08*|sin(time/90)|`, rotação `atan2(dy,dx)*0.12`, sprite 58×58px) — o rig 3D deve herdar essa mesma assinatura, não inventar uma nova.

**1. Proporções/silhueta.** 1 esfera única (corpo+cabeça fundidos, sem pescoço, como no PNG), achatada em Y (~0.85) pra ficar "bulbosa". 6 tentáculos (o logo mostra 6 visíveis), em leque de ~200-220° na parte inferior-traseira do corpo (nunca 360°, senão o corpo desaparece na vista de cima/3-quarter da câmera do jogo): 2 centrais curtos voltados pra frente-baixo (base visual) + 4 laterais (2 de cada lado) mais longos e curvados, funcionando como "pernas" ao andar.

**2. Paleta** (variáveis já confirmadas: `--primary:#6c4fcf`, `--primary-light:#8a70e0`, `--primary-dark:#2d1b4e`, `--gold:#e8a33d`). Corpo: base `--primary`, calota superior em `--primary-light` (simula rim light, sem textura — 2 materiais ou vertex color). Tentáculos: mesma cor do corpo, ventosas em `--primary-light` sobre base `--primary-dark`. Óculos: aro em `--primary-dark`. Olhos: esclera branca, pupila `--primary-dark` grande e arredondada + catchlight branco fixo. `--gold` reservado pra 1 único acento pequeno (broche/botão central no corpo) — não competir com o roxo.

**3. Sombreamento toon.** `gradientMap` de 3 bandas (dark/mid/light) com `magFilter: THREE.NearestFilter` (corte nítido, não degradê). Luz: 1 `DirectionalLight` branca levemente quente (`0xfff4e0`, intensidade ~0.9), alta e frontal-lateral; `AmbientLight` em `--primary-dark` baixa (~0.4) pra sombra nunca ficar preta (fica "roxa de marca"). Recomendação forte: contorno preto fino via malha invertida (`scale ~1.03`, `side: THREE.BackSide`) — é o toque que mais reforça "desenho animado".

**4. Animação.** Andando: tentáculos laterais oscilam em senoide defasada ~90° entre vizinhos, amplitude 18-22°, mesmo timing `time/90` do bounce 2D atual. Parado: balanço ambiente assíncrono, 4-6°, período 2-3s. Squash-and-stretch é identidade de marca — mantém, mas soma um bounce de posição vertical (±0.05) sincronizado ao scaleY (reaproveita `1-0.08*|sin(time/90)|`), senão o squash sem deslocamento parece "esmagando no lugar" em 3D. Rotação Z do sprite 2D é substituída por yaw real em Y do corpo todo, com lerp até o ângulo-alvo em ~150-200ms (suave, não instantâneo). Cabeça não gira independente nesta fase.

**5. Óculos/olhos.** 2 toros finos (tubo ≈1/6 do raio do aro) + 1 cilindro fino como ponte — leitura mais fiel e barata do aro redondo do PNG. Posicionar no terço superior-frontal, próximos entre si, inclinados ~5-8° pra baixo no eixo X local (faz o PolvIn parecer "olhar com carinho" pro jogador/chão, coerente com a câmera de cima). Olhos fixos voltados pra frente-baixo, sem rastreamento nesta fase.

**Próximo agente responsável:** Frontend Engineer.

### 4. Frontend Engineer
Implementado `js/citypolvin3d.js` (módulo `CityPolvin3D`) seguindo as decisões acima: canvas Three.js fixo do mesmo tamanho do canvas do Phaser, câmera ortográfica frontal (não inclinada — a "vista de cima" vem da inclinação fixa do rig, `tiltRig.rotation.x=-0.2`, não da câmera, pra manter a matemática de posicionamento de tela simples), hierarquia `anchor > facing > bounce > tiltRig > squashRig > malhas`. `js/citygame.js`: `this.player.setVisible(false)` no sprite 2D (continua sendo alvo de câmera/proximidade, só não é desenhado), `relPos()` extraído como helper compartilhado (usado por `positionPrompt` e pelo novo overlay 3D), `CityPolvin3D.render(...)` chamado como última linha de `update()`. `index.html`: Three.js 0.150.0 (CDN, UMD) antes de `citypolvin3d.js`, antes de `citygame.js`. `css/style.css`: `.city-game-polvin3d` com `z-index:1` (acima do canvas do Phaser, que não é posicionado) e `.city-game-prompt` ganhou `z-index:2` (garante que o balão continua por cima do personagem).

**2 bugs reais pegos na verificação visual (não só nas asserções) e corrigidos antes do commit:**
- **Escala**: o primeiro render saiu enorme (ocupando quase o canvas inteiro) — o `viewSize` da câmera ortográfica (1.15) não tinha nenhuma relação com o tamanho real da geometria do rig (~1.6 unidades de altura). Corrigido calculando `viewSize=5` a partir da altura real do rig, pra ocupar ~16% da altura do canvas (perto do antigo sprite 58/420px).
- **Óculos invisíveis**: o aro dos óculos (`z=0.52`) ficava atrás da frente do olho (`z=0.59`) e dentro do contorno preto (`z=0.657`) — literalmente escondido dentro da cabeça. Corrigido movendo os aros/ponte pra `z=0.72` (claramente na frente do rosto) e engrossando o tubo do toro (0.022→0.028) pra continuar legível na escala pequena do jogo. Confirmado por screenshot com zoom (câmera temporária, só pra inspeção, sem alterar o código de produção) e depois na escala real do jogo.

### 5. QA Engineer
Testado via Playwright real: `THREE` carregado sem erro; 2 canvases presentes dentro de `#cityGameCanvas` (Phaser + PolvIn3D); sprite 2D do PolvIn confirmado invisível (`CityGame.player.visible === false`); `CityPolvin3D` inicializado com os 6 tentáculos esperados; overlay 3D acompanha a posição de tela ao mover o jogador (posição do `anchor` muda); yaw gira na direção do movimento. Regressão: as 5 construções (Banco/Universidade/Concessionária/Imobiliária/Escritório) continuam abrindo balão + diálogo normalmente — RFC-023 não tocou em nenhuma lógica de jogo, só a representação visual do jogador. Zero erro de console/página. Confirmado visualmente por screenshot, em zoom (inspeção de detalhe do modelo) e na escala real do jogo, que o PolvIn 3D é reconhecível (óculos, olhos, cor de marca) e o cel-shading está visivelmente aplicado (não é um render realista).

### 6. Documentation Specialist
`CHANGELOG.md`/`ROADMAP.md` atualizados registrando o pivot visual (só o personagem virou 3D, mapa/construções continuam 2D por decisão explícita do usuário) e a base reaproveitável pra uma futura Fase de Personalização de Personagem (cor/acessório no mesmo rig).
