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
   ========================================================================= */

const CityGame = {
  WORLD_W: 1750,
  WORLD_H: 480,
  VIEW_W: 800,
  VIEW_H: 420,
  PROXIMITY_RADIUS: 100,
  MOVE_SPEED: 260, // px/s, em coordenadas do mundo

  game: null,
  player: null,
  playerBaseScale: 1,
  targetPos: null,
  nearBuilding: null,
  dialogueOpen: false,

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
  },

  preload(scene) {
    scene.load.image("polvin", "Polvin-logo.png");
  },

  create(scene) {
    this.scene = scene;
    scene.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    // Areia
    scene.add.rectangle(0, 0, this.WORLD_W, this.WORLD_H, 0xefe6d5).setOrigin(0, 0);

    // Mar com borda ondulada (mesmo motivo do fundo-do-mar já usado em js/city.js)
    const sea = scene.add.graphics();
    sea.fillStyle(0x3f8fa6, 1);
    sea.beginPath();
    sea.moveTo(0, 340);
    for (let x = 0; x <= this.WORLD_W; x += 30) sea.lineTo(x, 340 + Math.sin(x / 55) * 12);
    sea.lineTo(this.WORLD_W, this.WORLD_H);
    sea.lineTo(0, this.WORLD_H);
    sea.closePath();
    sea.fillPath();

    // Bolhas subindo do mar (decorativo, dá profundidade)
    for (let i = 0; i < 14; i++) {
      const bx = Math.random() * this.WORLD_W;
      const by = 360 + Math.random() * 100;
      const bubble = scene.add.circle(bx, by, 3 + Math.random() * 4, 0xffffff, 0.5);
      scene.tweens.add({ targets: bubble, y: by - 120, alpha: 0, duration: 3000 + Math.random() * 2500, repeat: -1, delay: Math.random() * 3000 });
    }

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

  /* ---------- Desenho das construções (Phaser.Graphics puro, sem tileset/assets novos) ---------- */

  drawBanco(scene, b) {
    const { x, y } = b;
    const g = scene.add.graphics();
    g.fillStyle(0xf4f1ea, 1);
    g.fillRect(x - 50, y - 15, 100, 75);
    g.fillStyle(0x6c4fcf, 1);
    g.fillTriangle(x - 60, y - 15, x + 60, y - 15, x, y - 60);
    const janela = scene.add.circle(x, y + 22, 13, 0xd4a94c, 1);
    scene.tweens.add({ targets: janela, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
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
        scene.tweens.add({ targets: janela, alpha: 0.25, duration: 800, delay: (r * cols + c) * 180, yoyo: true, repeat: -1 });
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

    if (typeof CityLife !== "undefined") building.open(document.getElementById("cityGameDialogueContent"));
  },

  closeDialogue() {
    this.dialogueOpen = false;
    const panel = document.getElementById("cityGameDialogue");
    if (panel) panel.classList.add("hidden");
    if (this.scene) this.scene.cameras.main.pan(this.player.x, this.player.y, 350, "Sine.easeInOut");
    if (typeof CityLife !== "undefined") CityLife.clearActiveContainer();
  },
};
