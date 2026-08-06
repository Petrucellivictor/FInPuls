/* =========================================================================
   CITYGAME.JS — Cidade Financeira: motor de jogo 2D (RFC-021, Fase 5).
   Phaser 3 via CDN (index.html), sem build step — mesmo padrão de qualquer
   outro <script> do projeto. Toda a lógica econômica (js/citylife.js,
   CityLife) fica 100% intocada: este módulo é só a apresentação nova —
   mapa, PolvIn jogável, câmera, e o painel de diálogo que hospeda o ciclo
   semanal do CityLife quando o jogador entra no Banco.

   Fundação mínima (Fase 5): 1 construção interativa (Banco). Concessionária/
   Universidade/Imobiliária/Escritório entram em fases seguintes, reusando
   exatamente o mesmo padrão proximidade → balão → diálogo já provado aqui.
   ========================================================================= */

const CityGame = {
  WORLD_W: 1200,
  WORLD_H: 480,
  VIEW_W: 800,
  VIEW_H: 420,
  BANK_POS: { x: 980, y: 260 },
  PROXIMITY_RADIUS: 100,
  MOVE_SPEED: 260, // px/s, em coordenadas do mundo

  game: null,
  player: null,
  targetPos: null,
  nearBank: false,
  dialogueOpen: false,

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
    for (let i = 0; i < 10; i++) {
      const bx = Math.random() * this.WORLD_W;
      const by = 360 + Math.random() * 100;
      const bubble = scene.add.circle(bx, by, 3 + Math.random() * 4, 0xffffff, 0.5);
      scene.tweens.add({ targets: bubble, y: by - 120, alpha: 0, duration: 3000 + Math.random() * 2500, repeat: -1, delay: Math.random() * 3000 });
    }

    // Banco — desenhado via Graphics (sem tileset): parede, telhado, janela com glow
    const { x: bx, y: by } = this.BANK_POS;
    const bank = scene.add.graphics();
    bank.fillStyle(0xf4f1ea, 1);
    bank.fillRect(bx - 50, by - 15, 100, 75);
    bank.fillStyle(0x6c4fcf, 1);
    bank.fillTriangle(bx - 60, by - 15, bx + 60, by - 15, bx, by - 60);
    const janela = scene.add.circle(bx, by + 22, 13, 0xd4a94c, 1);
    scene.tweens.add({ targets: janela, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
    scene.add.text(bx - 34, by + 66, "🏦 Banco", { fontSize: "14px", fontStyle: "bold", color: "#3a2f56" });

    // PolvIn jogável
    this.player = scene.add.image(180, 260, "polvin").setDisplaySize(58, 58);
    this.playerBaseScale = this.player.scaleX; // preserva a proporção do displaySize — ver update()
    scene.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    scene.input.on("pointerdown", (pointer) => {
      if (this.dialogueOpen) return;
      const p = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.targetPos = { x: p.x, y: p.y };
    });
  },

  update(scene, time, delta) {
    const player = this.player;
    if (this.targetPos && player) {
      const dx = this.targetPos.x - player.x;
      const dy = this.targetPos.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        const step = this.MOVE_SPEED * (delta / 1000);
        const ratio = Math.min(1, step / dist);
        player.x += dx * ratio;
        player.y += dy * ratio;
        const bounce = 1 - 0.08 * Math.abs(Math.sin(time / 90));
        player.setScale(this.playerBaseScale, this.playerBaseScale * bounce);
        player.rotation = Math.atan2(dy, dx) * 0.12;
      } else {
        this.targetPos = null;
        player.setScale(this.playerBaseScale, this.playerBaseScale);
        player.rotation = 0;
      }
    }

    if (!player) return;
    const distBank = Math.hypot(this.BANK_POS.x - player.x, this.BANK_POS.y - player.y);
    const isNear = distBank < this.PROXIMITY_RADIUS;
    if (isNear !== this.nearBank) {
      this.nearBank = isNear;
      this.renderPrompt();
    }
    if (isNear && !this.dialogueOpen) this.positionPrompt(scene);
  },

  /* O balão de proximidade é HTML (reaproveita .polvin-bubble-style via CSS
     própria), não Phaser Graphics — mais simples que redesenhar a forma do
     balão a mão, e mais fácil de manter texto/emoji. */
  renderPrompt() {
    const el = document.getElementById("cityGamePrompt");
    if (!el) return;
    if (this.nearBank && !this.dialogueOpen) {
      el.innerHTML = "🏦 Entrar no Banco";
      el.classList.remove("hidden");
      el.onclick = () => this.openBanco();
    } else {
      el.classList.add("hidden");
    }
  },

  positionPrompt(scene) {
    const el = document.getElementById("cityGamePrompt");
    const canvasEl = scene.game.canvas;
    if (!el || !canvasEl) return;
    const cam = scene.cameras.main;
    const relX = (this.BANK_POS.x - cam.worldView.x) / cam.worldView.width;
    const relY = (this.BANK_POS.y - 65 - cam.worldView.y) / cam.worldView.height;
    el.style.left = `${relX * canvasEl.clientWidth}px`;
    el.style.top = `${relY * canvasEl.clientHeight}px`;
  },

  /* ---------- Diálogo do Banco (hospeda o ciclo semanal real do CityLife) ---------- */

  openBanco() {
    this.dialogueOpen = true;
    document.getElementById("cityGamePrompt")?.classList.add("hidden");
    const scene = this.scene;
    if (scene) scene.cameras.main.pan(this.BANK_POS.x, this.BANK_POS.y - 40, 350, "Sine.easeInOut");

    const panel = document.getElementById("cityGameDialogue");
    if (!panel) return;
    panel.classList.remove("hidden");
    panel.innerHTML = `<button class="btn btn-outline btn-sm close-dialogue">✕ Saída</button><div id="cityGameBancoConteudo"></div>`;
    panel.querySelector(".close-dialogue").addEventListener("click", () => this.closeBanco());

    if (typeof CityLife !== "undefined") {
      CityLife.renderCicloInto(document.getElementById("cityGameBancoConteudo"));
    }
  },

  closeBanco() {
    this.dialogueOpen = false;
    const panel = document.getElementById("cityGameDialogue");
    if (panel) panel.classList.add("hidden");
    if (this.scene) this.scene.cameras.main.pan(this.player.x, this.player.y, 350, "Sine.easeInOut");
  },
};
