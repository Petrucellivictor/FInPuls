/* =========================================================================
   CITYPOLVIN3D.JS — Cidade Financeira: o PolvIn jogável em 3D (RFC-023).
   Three.js via CDN (UMD, mesmo padrão do Phaser), sem build step, sem
   nenhum asset .glb/.gltf — o personagem é modelado por geometria
   procedural (esfera + tentáculos articulados + olhos + óculos) com
   sombreamento toon (cel-shading), decidido com o UX/UI Designer.

   Este módulo só LÊ a posição/estado que o CityGame já calcula (nunca
   escreve em CityGame.player) — desenha um canvas 3D separado, absoluto,
   por cima do canvas do Phaser (mapa/construções continuam 100% 2D),
   posicionando o rig na projeção de tela da posição real do jogador.
   Câmera do overlay é frontal e ortográfica só pra simplificar essa
   projeção — a sensação de "vista de cima" vem da inclinação fixa do
   próprio rig, não da câmera.

   RFC-037 Fase 3 (Software Architect, Decisão 1): a geometria do rig
   (antes construída inline aqui, buildGradientMap/toonMat/buildRig) foi
   extraída literalmente para js/polvinrig3d.js (PolvinRig3D), reaproveitada
   também por js/trailavatar3d.js (avatar navegável da trilha Aprender) —
   o mesmo PolvIn precisa parecer o mesmo PolvIn nos dois lugares. init()
   passou a delegar a PolvinRig3D.buildGradientMap()/build(scene), mas toda
   a API pública deste módulo (init, render, setScreenPosition,
   shortestAngleDelta) permanece com assinatura e comportamento observável
   100% idênticos — zero mudança de comportamento para quem já consome este
   módulo (js/citygame.js).
   ========================================================================= */

const CityPolvin3D = {
  renderer: null,
  scene: null,
  camera: null,
  canvas: null,

  anchor: null, // segue a posição de tela (x,y) do jogador
  facing: null, // yaw (direção pra onde o PolvIn está olhando)
  bounce: null, // bounce vertical do squash-and-stretch
  tiltRig: null, // inclinação fixa (vista de cima) + escala do squash
  squashRig: null,

  tentacles: [], // { jointB, phase, amp }
  currentYaw: 0,

  init(hostEl, width, height) {
    if (this.renderer || typeof THREE === "undefined") return;
    if (!hostEl) return;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "city-game-polvin3d";
    hostEl.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();
    const aspect = width / height;
    // Metade da altura visível, em unidades do mundo 3D — o rig (corpo +
    // tentáculos) mede ~1.6 unidades de altura total; viewSize=5 faz ele
    // ocupar ~16% da altura do canvas (perto do antigo sprite 58/420px).
    const viewSize = 5;
    this.camera = new THREE.OrthographicCamera(-viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 10);
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0x2d1b4e, 0.4));
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 0.9);
    dirLight.position.set(1.5, 2.2, 2);
    this.scene.add(dirLight);

    // RFC-037 Fase 3 — geometria do rig delegada a PolvinRig3D (extração
    // literal do que antes vivia inline aqui, ver comentário de topo do
    // arquivo). Mesma hierarquia de grupos, mesmos nomes, nenhuma mudança
    // de comportamento observável.
    this.gradientMap = PolvinRig3D.buildGradientMap();
    const rig = PolvinRig3D.build(this.scene);
    this.anchor = rig.anchor;
    this.facing = rig.facing;
    this.bounce = rig.bounce;
    this.tiltRig = rig.tiltRig;
    this.squashRig = rig.squashRig;
    this.tentacles = rig.tentacles;

    this.render0 = true;
  },

  setScreenPosition(relX, relY) {
    if (!this.anchor) return;
    const halfW = (this.camera.right - this.camera.left) / 2;
    const halfH = (this.camera.top - this.camera.bottom) / 2;
    this.anchor.position.x = (relX - 0.5) * 2 * halfW;
    this.anchor.position.y = (0.5 - relY) * 2 * halfH;
  },

  /* Normaliza a diferença de ângulo pro range [-π, π], pra girar sempre
     pelo caminho mais curto (evita o personagem "rodopiar" ao cruzar o
     limite de -180/180 graus). */
  shortestAngleDelta(target, current) {
    return Math.atan2(Math.sin(target - current), Math.cos(target - current));
  },

  /* opts: { relX, relY, scaleY, moving, dx, dy, elapsed } — tudo já
     calculado pelo CityGame a partir da posição real do jogador; este
     módulo só projeta esses números em transformações 3D. */
  render(opts) {
    if (!this.renderer) return;

    this.setScreenPosition(opts.relX, opts.relY);

    if (opts.moving && (opts.dx || opts.dy)) {
      const targetYaw = Math.atan2(opts.dx, opts.dy);
      this.currentYaw += this.shortestAngleDelta(targetYaw, this.currentYaw) * 0.15;
    }
    this.facing.rotation.y = this.currentYaw;

    const scaleY = opts.scaleY || 1;
    this.squashRig.scale.set(1, scaleY, 1);
    this.bounce.position.y = (1 - scaleY) * -0.4;

    const speed = opts.moving ? 1 : 0.35;
    const amp = THREE.MathUtils.degToRad(opts.moving ? 20 : 5);
    const t = opts.elapsed / (opts.moving ? 90 : 500);
    this.tentacles.forEach((tent) => {
      tent.jointB.rotation.z = Math.sin(t * speed + tent.phase) * amp;
    });

    this.renderer.render(this.scene, this.camera);
  },
};
