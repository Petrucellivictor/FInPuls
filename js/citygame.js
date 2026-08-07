/* =========================================================================
   CITYGAME.JS — Cidade Financeira: motor de jogo 2D (RFC-021 Fase 5 +
   RFC-022 Fase 6). Phaser 3 via CDN (index.html), sem build step — mesmo
   padrão de qualquer outro <script> do projeto. Toda a lógica econômica
   (js/citylife.js, CityLife) fica 100% intocada: este módulo é só a
   apresentação — mapa, PolvIn jogável, câmera, e o painel de diálogo que
   hospeda cada fatia do CityLife quando o jogador entra numa construção.

   Fase 6 generaliza a fundação da Fase 5 (que tinha só o Banco hardcoded)
   pra uma lista de construções (BUILDINGS) — proximidade/balão/diálogo são
   genéricos, cada construção só define posição, desenho e o que abrir.

   RFC-023: o sprite 2D do PolvIn (this.player) fica invisível — a
   representação visual dele passa a ser o overlay 3D (js/citypolvin3d.js,
   CityPolvin3D), mantendo mapa/construções 100% 2D como o usuário pediu.

   RFC-024: o mar reage ao cenário econômico sorteado (evento
   "citylife:scenario" disparado por CityLife.avancarSemana(), mesmo padrão
   de market:updated/tab:changed) — recolore com transição suave pra
   `corAgua` do cenário e troca a partícula de clima (chuva/brilho/névoa).
   Ciclo dia/noite ambiente roda em paralelo, decorativo, sem ligação a
   nenhuma regra. Dívida técnica registrada (não bloqueante): o overlay de
   dia/noite só afeta o canvas do Phaser — o PolvIn 3D (canvas separado,
   Three.js) não escurece junto; sincronizar isso fica pra uma fase futura.

   RFC-025: updateAgeHud() mantém #cityGameAgeHud sincronizado com
   CityLife.idadeAtual() (chamado em create() e a cada "citylife:scenario",
   sem evento novo pra isso). Listener de "citylife:aposentadoria" em
   init() dispara celebrateRetirement() — brilho dourado no jogador +
   "punch" de câmera do Phaser, pulando o punch quando
   prefers-reduced-motion está ativo.
   ========================================================================= */

const CityGame = {
  WORLD_W: 1750,
  WORLD_H: 480,
  VIEW_W: 800,
  VIEW_H: 420,
  PROXIMITY_RADIUS: 100,
  MOVE_SPEED: 260, // px/s, em coordenadas do mundo

  SEA_TRANSITION_MS: 1500,
  DAYNIGHT_CYCLE_MS: 270000, // ciclo completo (dia/entardecer/noite/amanhecer), ~67.5s por fase
  DAYNIGHT_CROSSFADE_MS: 17500, // crossfade entre fases, dentro dos 15-20s pedidos pelo UX/UI
  DAYNIGHT_PHASES: [
    { color: 0x87ceeb, alpha: 0 }, // dia — sem tint perceptível
    { color: 0xe8a33d, alpha: 0.28 }, // entardecer (--gold)
    { color: 0x1a1440, alpha: 0.45 }, // noite
    { color: 0x8a70e0, alpha: 0.22 }, // amanhecer (--primary-light)
  ],

  game: null,
  player: null,
  playerBaseScale: 1,
  targetPos: null,
  nearBuilding: null,
  dialogueOpen: false,
  seaGraphics: null,
  seaColorCurrent: 0x3f8fa6,
  seaColorFrom: null,
  seaColorTo: null,
  seaColorProgress: 1,
  seaTransitioning: false,
  pendingSeaColorInt: null,
  dayNightOverlay: null,
  dayNightPhaseColors: null,
  weatherObjects: [],
  windowTweens: [],
  _maxDayNightAlpha: 0.45,
  _lastNightIntensityApplied: -1,

  /* Cada construção só descreve posição, desenho e o que abrir — a
     proximidade/balão/diálogo são genéricos (create()/update() abaixo),
     não há mais nenhum caso especial por construção fora desta lista. */
  BUILDINGS: [
    {
      id: "banco",
      x: 980,
      y: 260,
      promptText: "🏦 Entrar no Banco",
      borderColor: "#6c4fcf",
      draw(scene, b) { CityGame.drawBanco(scene, b); },
      open(container) { CityLife.renderCicloInto(container); },
    },
    {
      id: "universidade",
      x: 280,
      y: 250,
      promptText: "🎓 Entrar na Universidade",
      borderColor: "#2f7a68",
      draw(scene, b) { CityGame.drawUniversidade(scene, b); },
      open(container) { CityLife.renderEducacaoInto(container); },
    },
    {
      id: "concessionaria",
      x: 560,
      y: 270,
      promptText: "🚗 Entrar na Concessionária",
      borderColor: "#d1603d",
      draw(scene, b) { CityGame.drawConcessionaria(scene, b); },
      open(container) { CityLife.renderVeiculosInto(container); },
    },
    {
      id: "imobiliaria",
      x: 1260,
      y: 250,
      promptText: "🏠 Entrar na Imobiliária",
      borderColor: "#b33b3b",
      draw(scene, b) { CityGame.drawImobiliaria(scene, b); },
      open(container) { CityLife.renderImoveisInto(container); },
    },
    {
      id: "escritorio",
      x: 1540,
      y: 270,
      promptText: "💼 Entrar no Escritório",
      borderColor: "#4a6fa5",
      draw(scene, b) { CityGame.drawEscritorio(scene, b); },
      open(container) { CityLife.renderTrabalhoInto(container); },
    },
  ],

  init() {
    if (this.game || typeof Phaser === "undefined") return;
    if (!document.getElementById("cityGameCanvas")) return;

    const self = this;
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "cityGameCanvas",
      width: this.VIEW_W,
      height: this.VIEW_H,
      backgroundColor: "#3F8FA6",
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: {
        preload: function () { self.preload(this); },
        create: function () { self.create(this); },
        update: function (time, delta) { self.update(this, time, delta); },
      },
    });

    // Registrado aqui (não em create()) porque init() só roda 1 vez —
    // create() é recriado se o Phaser.Game algum dia for reiniciado.
    document.addEventListener("citylife:scenario", (e) => this.onScenarioChanged(e.detail.cenarioId));
    // RFC-025: dispara 1x, exatamente na semana em que avancarSemana()
    // detecta a aposentadoria — mesmo padrão do listener acima.
    document.addEventListener("citylife:aposentadoria", (e) => this.onAposentadoria(e.detail.idade));
  },

  preload(scene) {
    scene.load.image("polvin", "Polvin-logo.png");
  },

  create(scene) {
    this.scene = scene;
    scene.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    // Areia
    scene.add.rectangle(0, 0, this.WORLD_W, this.WORLD_H, 0xefe6d5).setOrigin(0, 0);

    // Mar com borda ondulada (mesmo motivo do fundo-do-mar já usado em js/city.js).
    // Cor inicial vem do último cenário econômico resolvido (RFC-024) — se
    // nenhuma semana foi jogada ainda, usa o azul padrão de sempre.
    this.seaGraphics = scene.add.graphics();
    const state = typeof CityLife !== "undefined" ? CityLife.getState() : null;
    const initialScenario = state?.ultimoCenarioId ? WEEKLY_ECONOMIC_SCENARIOS.find((s) => s.id === state.ultimoCenarioId) : null;
    this.seaColorCurrent = initialScenario ? Phaser.Display.Color.HexStringToColor(initialScenario.corAgua).color : 0x3f8fa6;
    this.drawSeaPath(scene, this.seaColorCurrent);
    if (initialScenario) this.buildWeather(scene, initialScenario.id);
    this.updateAgeHud(); // RFC-025 — mesmo bloco que já lê CityLife.getState() acima

    // Tint ambiente de dia/noite — decorativo, contínuo, não ligado a
    // nenhuma regra de jogo. Fica por cima de tudo dentro do canvas do
    // Phaser (balão/diálogo são HTML, fora do canvas, não são afetados).
    this.dayNightOverlay = scene.add.rectangle(0, 0, this.WORLD_W, this.WORLD_H, this.DAYNIGHT_PHASES[0].color, 0).setOrigin(0, 0).setDepth(9999);
    // Cores das 4 fases construídas 1x aqui (não a cada frame) — update()
    // só interpola entre elas.
    this.dayNightPhaseColors = this.DAYNIGHT_PHASES.map((p) => Phaser.Display.Color.ValueToColor(p.color));
    this._maxDayNightAlpha = Math.max(...this.DAYNIGHT_PHASES.map((p) => p.alpha));
    this._lastNightIntensityApplied = -1;

    // Bolhas subindo do mar (decorativo, dá profundidade)
    for (let i = 0; i < 14; i++) {
      const bx = Math.random() * this.WORLD_W;
      const by = 360 + Math.random() * 100;
      const bubble = scene.add.circle(bx, by, 3 + Math.random() * 4, 0xffffff, 0.5);
      scene.tweens.add({ targets: bubble, y: by - 120, alpha: 0, duration: 3000 + Math.random() * 2500, repeat: -1, delay: Math.random() * 3000 });
    }

    // Zerado aqui (não só no topo do objeto) porque create() reconstrói o
    // mapa do zero — evita acumular referências de tweens de uma instância
    // anterior do Phaser.Game caso ele algum dia seja reiniciado.
    this.windowTweens = [];
    this.BUILDINGS.forEach((b) => b.draw(scene, b));

    // PolvIn jogável — a partir do RFC-023, a representação visual é o
    // overlay 3D (CityPolvin3D); este sprite 2D continua existindo só como
    // alvo de câmera/física/proximidade (invisível, nunca desenhado).
    this.player = scene.add.image(180, 260, "polvin").setDisplaySize(58, 58).setVisible(false);
    this.playerBaseScale = this.player.scaleX; // preserva a proporção do displaySize — ver update()
    scene.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    if (typeof CityPolvin3D !== "undefined") CityPolvin3D.init(document.getElementById("cityGameCanvas"), this.VIEW_W, this.VIEW_H);

    scene.input.on("pointerdown", (pointer) => {
      if (this.dialogueOpen) return;
      const p = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.targetPos = { x: p.x, y: p.y };
    });
  },

  /* Path do mar (borda ondulada) extraído de create() pra ser reutilizável —
     chamado 1x na criação e repetido a cada frame durante a transição de
     cor entre cenários econômicos (RFC-024). Sempre limpa antes de
     redesenhar: this.seaGraphics é um único Graphics reaproveitado. */
  drawSeaPath(scene, colorInt) {
    const g = this.seaGraphics;
    if (!g) return;
    g.clear();
    g.fillStyle(colorInt, 1);
    g.beginPath();
    g.moveTo(0, 340);
    for (let x = 0; x <= this.WORLD_W; x += 30) g.lineTo(x, 340 + Math.sin(x / 55) * 12);
    g.lineTo(this.WORLD_W, this.WORLD_H);
    g.lineTo(0, this.WORLD_H);
    g.closePath();
    g.fillPath();
  },

  /* Handler de "citylife:scenario" (disparado por CityLife.avancarSemana()).
     Só arma o estado da transição — a interpolação real acontece no
     update(), frame a frame, enquanto seaTransitioning ficar true. */
  onScenarioChanged(cenarioId) {
    if (typeof Phaser === "undefined" || !this.scene || !this.seaGraphics) return;
    const cenario = WEEKLY_ECONOMIC_SCENARIOS.find((s) => s.id === cenarioId);
    if (!cenario) return;

    const novaCorInt = Phaser.Display.Color.HexStringToColor(cenario.corAgua).color;
    // Construídos 1x aqui (não no update()) — a partir da cor atual, que
    // pode já estar no meio de uma transição anterior (blend contínuo em
    // vez de "pulo" se o jogador avançar semanas rapidamente).
    this.seaColorFrom = Phaser.Display.Color.ValueToColor(this.seaColorCurrent);
    this.seaColorTo = Phaser.Display.Color.ValueToColor(novaCorInt);
    this.seaColorProgress = 0;
    this.seaTransitioning = true;

    this.buildWeather(this.scene, cenarioId);

    // RFC-025: mantém o HUD de idade sincronizado — citylife:scenario já
    // dispara toda semana (inclusive na semana da aposentadoria), então é
    // o gancho natural, sem evento novo só pra isso. Adiado para o próximo
    // tick (setTimeout 0): CityLife.avancarSemana() dispara este evento
    // ANTES de persistir a semana/estado novos (this.setState() só roda
    // depois, no fim de avancarSemana()) — ler CityLife.getState() aqui
    // dentro, de forma síncrona, pegaria o estado da semana ANTERIOR. Um
    // requestAnimationFrame/setTimeout(0) empurra a leitura pra depois que
    // avancarSemana() termina de rodar (ele é 100% síncrono).
    setTimeout(() => this.updateAgeHud(), 0);
  },

  /* Partículas de clima por categoria de cenário (RFC-024, specs exatas do
     UX/UI Designer). Sempre destrói o conjunto anterior antes de criar o
     novo — evita leak de tweens/objetos ao trocar de cenário repetidas
     vezes. "neutro" (e qualquer id desconhecido) não cria nada extra. */
  buildWeather(scene, cenarioId) {
    if (this.weatherObjects.length) {
      scene.tweens.killTweensOf(this.weatherObjects);
      this.weatherObjects.forEach((obj) => obj.destroy());
    }
    this.weatherObjects = [];

    if (cenarioId === "boom") {
      // Brilho solar na água: ~20 pontinhos dourados cintilando no lugar,
      // só na faixa do mar.
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * this.WORLD_W;
        const y = 340 + Math.random() * 80; // faixa do mar, y 340-420
        const dot = scene.add.circle(x, y, 2 + Math.random(), 0xffe9b8, 1).setAlpha(0.2);
        scene.tweens.add({
          targets: dot,
          alpha: 0.9,
          duration: 600 + Math.random() * 800,
          delay: Math.random() * 1000,
          yoyo: true,
          repeat: -1,
        });
        this.weatherObjects.push(dot);
      }
    } else if (cenarioId === "crise") {
      // Chuva: ~40 linhas finas em ângulo, cobrindo o mapa todo, queda
      // contínua (não só sobre o mar — chuva só na água pareceria bug).
      const angleRad = Phaser.Math.DegToRad(15);
      const length = 18;
      const dx = Math.sin(angleRad) * length;
      const dy = Math.cos(angleRad) * length;
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * this.WORLD_W;
        const alpha = 0.4 + Math.random() * 0.1;
        const line = scene.add.line(x, -20, 0, 0, dx, dy, 0x8fa8b8, alpha);
        line.setLineWidth(1);
        scene.tweens.add({
          targets: line,
          y: this.WORLD_H + 20,
          duration: 700 + Math.random() * 200,
          delay: Math.random() * 2000,
          repeat: -1,
        });
        this.weatherObjects.push(line);
      }
    } else if (cenarioId === "inflacao_alta") {
      // Névoa quente: 6-8 nuvens grandes e muito translúcidas, perto do
      // mar/horizonte (não sobre a areia, senão prejudica leitura de
      // prompts/NPCs), drift horizontal lentíssimo + leve oscilação vertical.
      const count = 6 + Math.floor(Math.random() * 3); // 6, 7 ou 8
      for (let i = 0; i < count; i++) {
        const startX = -80 - Math.random() * 100;
        const y = 300 + Math.random() * 80; // perto do horizonte (mar começa em y=340)
        const radius = 40 + Math.random() * 30;
        const alpha = 0.06 + Math.random() * 0.06;
        const cloud = scene.add.circle(startX, y, radius, 0x8a7a5c, alpha);
        const driftMs = 40000 + Math.random() * 20000; // 40-60s pra atravessar o mapa
        scene.tweens.add({ targets: cloud, x: this.WORLD_W + 80, duration: driftMs, delay: Math.random() * 10000, repeat: -1 });
        scene.tweens.add({
          targets: cloud,
          y: y - 10 - Math.random() * 6,
          duration: 6000 + Math.random() * 3000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        this.weatherObjects.push(cloud);
      }
    }
    // "neutro": nenhum objeto extra — weatherObjects já foi esvaziado acima.
  },

  /* Converte um ponto do mundo pra fração 0..1 da viewport da câmera —
     mesma matemática usada por positionPrompt() e, desde o RFC-023, pelo
     overlay 3D do PolvIn (CityPolvin3D.setScreenPosition). */
  relPos(scene, x, y) {
    const cam = scene.cameras.main;
    return {
      relX: (x - cam.worldView.x) / cam.worldView.width,
      relY: (y - cam.worldView.y) / cam.worldView.height,
    };
  },

  update(scene, time, delta) {
    this.updateSeaTransition(scene, delta);
    this.updateDayNight(time);

    const player = this.player;
    let moving = false;
    let dx = 0;
    let dy = 0;
    let bounce = 1;
    if (this.targetPos && player) {
      dx = this.targetPos.x - player.x;
      dy = this.targetPos.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        moving = true;
        const step = this.MOVE_SPEED * (delta / 1000);
        const ratio = Math.min(1, step / dist);
        player.x += dx * ratio;
        player.y += dy * ratio;
        bounce = 1 - 0.08 * Math.abs(Math.sin(time / 90));
      } else {
        this.targetPos = null;
      }
    }

    if (!player) return;

    if (typeof CityPolvin3D !== "undefined") {
      const { relX, relY } = this.relPos(scene, player.x, player.y);
      CityPolvin3D.render({ relX, relY, scaleY: bounce, moving, dx, dy, elapsed: time });
    }

    // A construção mais próxima (dentro do raio) ganha o balão — evita
    // ambiguidade se o jogador ficar perto de 2 construções ao mesmo tempo.
    let nearest = null;
    let nearestDist = Infinity;
    this.BUILDINGS.forEach((b) => {
      const d = Math.hypot(b.x - player.x, b.y - player.y);
      if (d < this.PROXIMITY_RADIUS && d < nearestDist) {
        nearest = b;
        nearestDist = d;
      }
    });
    if (nearest !== this.nearBuilding) {
      this.nearBuilding = nearest;
      this.renderPrompt();
    }
    if (this.nearBuilding && !this.dialogueOpen) this.positionPrompt(scene, this.nearBuilding);
  },

  /* ---------- Clima e ciclo dia/noite (RFC-024) ---------- */

  /* Só faz trabalho enquanto durar a transição entre a cor antiga e a nova
     do mar (a maior parte do tempo entre avanços de semana este bloco não
     roda nada, conforme a mitigação de perf do Software Architect). */
  updateSeaTransition(scene, delta) {
    if (!this.seaTransitioning) return;

    this.seaColorProgress += delta / this.SEA_TRANSITION_MS;
    const t = Math.min(this.seaColorProgress, 1);
    const corMar = Phaser.Display.Color.Interpolate.ColorWithColor(this.seaColorFrom, this.seaColorTo, 100, t * 100);
    const corMarInt = Phaser.Display.Color.GetColor(corMar.r, corMar.g, corMar.b);
    this.seaColorCurrent = corMarInt;
    this.drawSeaPath(scene, corMarInt);

    if (t >= 1) {
      // Fixa a cor final exata (evita erro de arredondamento acumulado da
      // interpolação) e encerra a transição.
      this.seaColorCurrent = this.seaColorTo.color;
      this.drawSeaPath(scene, this.seaColorCurrent);
      this.seaTransitioning = false;
    }
  },

  /* O(1) por frame, incondicional (não precisa de dirty-check: é só
     setFillStyle/alpha, sem reconstruir nenhum path). 4 fases fixas
     (dia/entardecer/noite/amanhecer) com crossfade de cor E alpha entre a
     fase atual e a próxima. */
  updateDayNight(time) {
    const phases = this.DAYNIGHT_PHASES;
    const phaseCount = phases.length;
    const phaseDurationMs = this.DAYNIGHT_CYCLE_MS / phaseCount;
    const cyclePos = time % this.DAYNIGHT_CYCLE_MS;
    const phaseIndex = Math.floor(cyclePos / phaseDurationMs);
    const nextPhaseIndex = (phaseIndex + 1) % phaseCount;
    const posInPhase = cyclePos - phaseIndex * phaseDurationMs;
    const timeUntilNextPhase = phaseDurationMs - posInPhase;
    const blend = timeUntilNextPhase <= this.DAYNIGHT_CROSSFADE_MS ? 1 - timeUntilNextPhase / this.DAYNIGHT_CROSSFADE_MS : 0;

    const faseAtual = phases[phaseIndex];
    const faseProxima = phases[nextPhaseIndex];
    const corInterpolada = Phaser.Display.Color.Interpolate.ColorWithColor(
      this.dayNightPhaseColors[phaseIndex],
      this.dayNightPhaseColors[nextPhaseIndex],
      100,
      blend * 100
    );
    const corInt = Phaser.Display.Color.GetColor(corInterpolada.r, corInterpolada.g, corInterpolada.b);
    const alphaInterpolado = faseAtual.alpha + (faseProxima.alpha - faseAtual.alpha) * blend;

    if (this.dayNightOverlay) this.dayNightOverlay.setFillStyle(corInt, alphaInterpolado);

    // Intensidade noturna (0..1) derivada do próprio alpha do overlay —
    // reaproveita o cálculo acima em vez de recalcular a fase de novo.
    const nightIntensity = Phaser.Math.Clamp(alphaInterpolado / this._maxDayNightAlpha, 0, 1);
    this.applyNightIntensityToWindows(nightIntensity);
  },

  /* Detalhe noturno das janelas (Banco/Escritório): reaproveita os MESMOS
     tweens de pulso já criados em drawBanco/drawEscritorio — só eleva o
     piso do alpha (Tween.updateTo) conforme a noite avança, sem criar tween
     novo. Dirty-check evita chamar updateTo() em todo frame por um ganho
     visual imperceptível. */
  applyNightIntensityToWindows(intensity) {
    if (Math.abs(intensity - this._lastNightIntensityApplied) < 0.02) return;
    this._lastNightIntensityApplied = intensity;

    this.windowTweens.forEach(({ tween, baseMin }) => {
      const novoMinimo = baseMin + (0.72 - baseMin) * intensity;
      tween.updateTo("alpha", novoMinimo, false);
    });
  },

  /* ---------- Desenho das construções (Phaser.Graphics puro, sem tileset/assets novos) ---------- */

  drawBanco(scene, b) {
    const { x, y } = b;
    const g = scene.add.graphics();
    g.fillStyle(0xf4f1ea, 1);
    g.fillRect(x - 50, y - 15, 100, 75);
    g.fillStyle(0x6c4fcf, 1);
    g.fillTriangle(x - 60, y - 15, x + 60, y - 15, x, y - 60);
    const janela = scene.add.circle(x, y + 22, 13, 0xd4a94c, 1);
    const janelaTween = scene.tweens.add({ targets: janela, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
    this.windowTweens.push({ tween: janelaTween, baseMin: 0.45 });
    scene.add.text(x - 34, y + 66, "🏦 Banco", { fontSize: "14px", fontStyle: "bold", color: "#3a2f56" });
  },

  drawUniversidade(scene, b) {
    const { x, y } = b;
    const g = scene.add.graphics();
    g.fillStyle(0xf4f1ea, 1);
    g.fillRect(x - 45, y - 40, 90, 100);
    g.fillStyle(0xd4a94c, 1);
    g.fillRect(x - 35, y - 40, 8, 100);
    g.fillRect(x + 27, y - 40, 8, 100);
    scene.add.ellipse(x, y - 40, 84, 56, 0x2f7a68);
    const emblema = scene.add.text(x - 10, y - 82, "🎓", { fontSize: "20px" });
    scene.tweens.add({ targets: emblema, y: emblema.y - 6, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    scene.add.text(x - 52, y + 66, "🎓 Universidade", { fontSize: "14px", fontStyle: "bold", color: "#2f5c50" });
  },

  drawConcessionaria(scene, b) {
    const { x, y } = b;
    const g = scene.add.graphics();
    g.fillStyle(0xcfd6d9, 1);
    g.fillRect(x - 60, y + 10, 120, 55);
    g.fillStyle(0xd1603d, 1);
    g.fillRect(x - 60, y + 4, 120, 8);
    g.fillStyle(0x3f8fa6, 0.55);
    g.fillRect(x - 45, y + 22, 90, 30);
    scene.add.text(x - 11, y + 26, "🚗", { fontSize: "20px" });
    const holofote = scene.add.triangle(x, y + 8, -6, 0, 6, 0, 0, -40, 0xfff2c2, 0.35);
    scene.tweens.add({ targets: holofote, rotation: Math.PI * 2, duration: 4000, repeat: -1, ease: "Linear" });
    scene.add.text(x - 62, y + 76, "🚗 Concessionária", { fontSize: "14px", fontStyle: "bold", color: "#7a3a24" });
  },

  drawImobiliaria(scene, b) {
    const { x, y } = b;
    const g = scene.add.graphics();
    g.fillStyle(0xd9927a, 1);
    g.fillRect(x - 38, y, 76, 55);
    g.fillStyle(0x5c4433, 1);
    g.fillTriangle(x - 44, y, x + 44, y, x, y - 30);
    g.fillRect(x + 30, y - 34, 6, 10);
    const placa = scene.add.rectangle(x + 52, y + 20, 26, 16, 0xffffff).setStrokeStyle(2, 0xb33b3b);
    placa.setOrigin(0.5, 0);
    scene.tweens.add({ targets: placa, angle: 6, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    scene.add.text(x - 52, y + 70, "🏠 Imobiliária", { fontSize: "14px", fontStyle: "bold", color: "#7a3a24" });
  },

  drawEscritorio(scene, b) {
    const { x, y } = b;
    const g = scene.add.graphics();
    g.fillStyle(0x4a6fa5, 1);
    g.fillRect(x - 30, y - 90, 60, 150);
    g.fillStyle(0x2b2b3d, 1);
    g.fillRect(x - 30, y - 90, 60, 6);
    const rows = 5;
    const cols = 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = x - 16 + c * 22;
        const wy = y - 78 + r * 26;
        const janela = scene.add.rectangle(wx, wy, 10, 14, 0xd4a94c);
        const janelaTween = scene.tweens.add({ targets: janela, alpha: 0.25, duration: 800, delay: (r * cols + c) * 180, yoyo: true, repeat: -1 });
        this.windowTweens.push({ tween: janelaTween, baseMin: 0.25 });
      }
    }
    scene.add.text(x - 40, y + 66, "💼 Escritório", { fontSize: "14px", fontStyle: "bold", color: "#22304a" });
  },

  /* O balão de proximidade é HTML (não Phaser Graphics) — mais simples que
     redesenhar a forma do balão a mão, e mais fácil de manter texto/emoji. */
  renderPrompt() {
    const el = document.getElementById("cityGamePrompt");
    if (!el) return;
    if (this.nearBuilding && !this.dialogueOpen) {
      el.innerHTML = this.nearBuilding.promptText;
      el.classList.remove("hidden");
      el.onclick = () => this.openBuilding(this.nearBuilding);
    } else {
      el.classList.add("hidden");
    }
  },

  positionPrompt(scene, building) {
    const el = document.getElementById("cityGamePrompt");
    const canvasEl = scene.game.canvas;
    if (!el || !canvasEl) return;
    const { relX, relY } = this.relPos(scene, building.x, building.y - 65);
    el.style.left = `${relX * canvasEl.clientWidth}px`;
    el.style.top = `${relY * canvasEl.clientHeight}px`;
  },

  /* ---------- Diálogo (hospeda a fatia correspondente do CityLife) ---------- */

  openBuilding(building) {
    this.dialogueOpen = true;
    document.getElementById("cityGamePrompt")?.classList.add("hidden");
    const scene = this.scene;
    if (scene) scene.cameras.main.pan(building.x, building.y - 40, 350, "Sine.easeInOut");

    const panel = document.getElementById("cityGameDialogue");
    if (!panel) return;
    panel.classList.remove("hidden");
    panel.style.borderTopColor = building.borderColor;
    panel.innerHTML = `<button class="btn btn-outline btn-sm close-dialogue">✕ Saída</button><div id="cityGameDialogueContent"></div>`;
    panel.querySelector(".close-dialogue").addEventListener("click", () => this.closeDialogue());

    if (typeof CityLife !== "undefined") {
      const content = document.getElementById("cityGameDialogueContent");
      building.open(content);
      // RFC-025: cobre o caso de reabrir o Banco já aposentado (o outro
      // caso — virar aposentado em tempo real — é coberto por
      // onAposentadoria()). Só o Banco mostra o Relatório de Fim de
      // Temporada; nas outras construções a checagem de state.aposentado
      // dentro de celebrateReportIfRetired() só olha o container, então
      // restringimos por building.id pra não tentar "comemorar" um painel
      // que não é o relatório.
      if (building.id === "banco") this.celebrateReportIfRetired(content);
    }
  },

  closeDialogue() {
    this.dialogueOpen = false;
    const panel = document.getElementById("cityGameDialogue");
    if (panel) panel.classList.add("hidden");
    if (this.scene) this.scene.cameras.main.pan(this.player.x, this.player.y, 350, "Sine.easeInOut");
    if (typeof CityLife !== "undefined") CityLife.clearActiveContainer();
  },

  /* ---------- Aposentadoria / Relatório de Fim de Temporada (RFC-025) ---------- */

  _lastAgeHudIdade: undefined,

  /* Mantém #cityGameAgeHud (fora do diálogo, sobre o canvas do Phaser)
     sincronizado com CityLife.getState() — chamado 1x em create() e de
     novo em onScenarioChanged() (ver comentário lá sobre o setTimeout).
     Dispara Fx.ageHudPulse() só quando o número de anos muda de fato,
     nunca a cada chamada (senão viraria ruído visual a cada avanço de
     semana). */
  updateAgeHud() {
    const el = document.getElementById("cityGameAgeHud");
    if (!el || typeof CityLife === "undefined") return;
    const state = CityLife.getState();
    const idade = CityLife.idadeAtual(state);
    const aposentado = state.aposentado;
    const totalAnos = CityLife.IDADE_APOSENTADORIA - CityLife.IDADE_INICIAL;
    const pct = aposentado ? 100 : CityLife.clamp(Math.round(((idade - CityLife.IDADE_INICIAL) / totalAnos) * 100), 0, 100);

    el.classList.toggle("aposentado", aposentado);
    el.innerHTML = `
      <div class="city-game-age-ring" style="--pct:${pct}">
        <span class="n">${aposentado ? "🏖️" : idade}</span>
      </div>
      <div class="city-game-age-text">
        <span class="lbl">idade</span>
        <span class="sub">${aposentado ? "aposentado(a)" : `${CityLife.IDADE_APOSENTADORIA - idade} p/ aposentar`}</span>
      </div>
    `;

    const anoMudou = this._lastAgeHudIdade !== undefined && this._lastAgeHudIdade !== idade;
    this._lastAgeHudIdade = idade;
    if (anoMudou && typeof Fx !== "undefined") Fx.ageHudPulse(el.querySelector(".city-game-age-ring"));
  },

  /* Handler de "citylife:aposentadoria" (disparado 1x por
     CityLife.avancarSemana(), no exato momento em que a idade cruza
     IDADE_APOSENTADORIA). Dispara a celebração no mapa (câmera/partícula,
     imediata) e agenda a celebração do painel do Banco (confete/troféu/
     POLVIn) pro próximo tick — ver celebrateReportIfRetired(). */
  onAposentadoria() {
    this.updateAgeHud();
    this.celebrateRetirement();
    // CityLife.avancarSemana() ainda está no meio da própria execução
    // síncrona quando este listener roda (o dispatch do evento acontece
    // ANTES de _refreshActive() re-renderizar o painel do Banco com o
    // Relatório de Fim de Temporada) — adia pro próximo tick pra garantir
    // que o HTML do relatório (badge/#cityLifePolvin/kpi-row) já esteja no
    // DOM antes de procurar esses elementos.
    setTimeout(() => this.celebrateReportIfRetired(), 0);
  },

  /* Reação visual no mapa 2D: brilho dourado em burst na posição do
     jogador (mesma técnica de partícula do clima "Boom" do RFC-024, só
     que em burst em vez de loop contínuo) + "punch" de câmera (zoom in/
     out via API nativa do Phaser, nenhuma dependência nova). O brilho é
     pequeno/estacionário e roda mesmo com prefers-reduced-motion; só o
     "punch" de câmera (risco real de desconforto) é pulado nesse caso. */
  celebrateRetirement() {
    const scene = this.scene;
    if (!scene || !this.player) return;

    const px = this.player.x;
    const py = this.player.y;
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 18;
      const dot = scene.add.circle(px, py, 2 + Math.random(), 0xffe9b8, 1);
      scene.tweens.add({
        targets: dot,
        x: px + Math.cos(angle) * dist,
        y: py + Math.sin(angle) * dist - 30 - Math.random() * 20,
        alpha: 0,
        duration: 2200 + Math.random() * 500,
        delay: Math.random() * 300,
        ease: "Sine.easeOut",
        onComplete: () => dot.destroy(),
      });
    }

    const reducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      scene.cameras.main.zoomTo(1.12, 700, "Sine.easeInOut");
      scene.time.delayedCall(700, () => scene.cameras.main.zoomTo(1, 700, "Sine.easeInOut"));
    }
  },

  /* Orquestra a celebração dentro do painel do Banco (confete/troféu/
     POLVIn + o glow/contagem do KPI de patrimônio) sempre que o Relatório
     de Fim de Temporada estiver de fato renderizado no DOM — cobre tanto
     a transição em tempo real (via onAposentadoria(), com o atraso de 1
     tick já explicado ali) quanto reabrir o Banco depois de já aposentado
     (via openBuilding()). Fica em CityGame, não em CityLife: efeitos Fx/DOM de
     apresentação são responsabilidade do Frontend Engineer — js/citylife.js
     só devolve HTML puro (RFC-025, seção 7 do Backend Engineer), os
     ids/classes que essa celebração usa (`.city-life-final-badge`,
     `#cityLifePolvin`, `.grid-3.kpi-row`) já estão no markup pra isso ser
     plugado por fora. */
  celebrateReportIfRetired(container) {
    if (typeof CityLife === "undefined" || typeof Fx === "undefined") return;
    const box = container || document.getElementById("cityGameDialogueContent");
    if (!box) return;
    const state = CityLife.getState();
    if (!state.aposentado) return;

    this.applyFinalKpiStyling(box, state);
    Fx.retirementCelebration(box);
  },

  /* Ajustes condicionais de copy/estilo no KPI de patrimônio/emprego, só
     no estado aposentado (RFC-025, seção 3 do UX/UI Designer) — o
     Backend Engineer deixou renderKpisHtml() em js/citylife.js sem essa
     lógica de propósito, atribuída ao Frontend Engineer. Localiza os
     cards pelo texto do rótulo (não por índice) pra não depender da
     ordem exata em que renderKpisHtml() monta o HTML. */
  applyFinalKpiStyling(container, state) {
    const topRow = container.querySelector(".grid-3.kpi-row");
    if (!topRow) return;
    topRow.querySelectorAll(".kpi").forEach((card) => {
      const labelEl = card.querySelector(".label");
      if (!labelEl) return;
      if (labelEl.textContent === "Patrimônio simulado") {
        if (card.classList.contains("kpi-final-glow")) return; // já aplicado — evita re-contar o número a cada re-render
        card.classList.add("kpi-final-glow");
        labelEl.textContent = "🏆 Patrimônio final";
        const valueEl = card.querySelector(".value");
        if (valueEl && typeof Fx.countUp === "function") Fx.countUp(valueEl, 0, state.patrimonio, 1400, "", (n) => CityLife.fmt(n));
      } else if (labelEl.textContent === "Emprego atual") {
        labelEl.textContent = "Última carreira";
      }
    });
  },
};
