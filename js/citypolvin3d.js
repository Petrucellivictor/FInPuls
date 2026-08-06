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

    this.gradientMap = this.buildGradientMap();
    this.buildRig();

    this.render0 = true;
  },

  buildGradientMap() {
    const c = document.createElement("canvas");
    c.width = 3;
    c.height = 1;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = "#b0b0b0";
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(2, 0, 1, 1);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  },

  toonMat(hex) {
    return new THREE.MeshToonMaterial({ color: hex, gradientMap: this.gradientMap });
  },

  buildRig() {
    // Hierarquia: anchor (posição de tela) > facing (yaw) > bounce (pulo do
    // squash) > tiltRig (inclinação fixa "vista de cima") > squashRig
    // (escala do squash-and-stretch) > malhas do personagem.
    this.anchor = new THREE.Group();
    this.facing = new THREE.Group();
    this.bounce = new THREE.Group();
    this.tiltRig = new THREE.Group();
    this.squashRig = new THREE.Group();

    this.tiltRig.rotation.x = -0.2;
    this.anchor.add(this.facing);
    this.facing.add(this.bounce);
    this.bounce.add(this.tiltRig);
    this.tiltRig.add(this.squashRig);
    this.scene.add(this.anchor);

    const purple = 0x6c4fcf;
    const purpleLight = 0x8a70e0;
    const purpleDark = 0x2d1b4e;
    const gold = 0xe8a33d;

    // Corpo (esfera única, corpo+cabeça, achatada em Y)
    const bodyGeo = new THREE.SphereGeometry(0.62, 24, 18);
    bodyGeo.scale(1, 0.85, 1);
    const body = new THREE.Mesh(bodyGeo, this.toonMat(purple));
    body.position.y = 0.55;
    this.squashRig.add(body);

    // Calota clara no topo (simula rim light, sem textura)
    const capGeo = new THREE.SphereGeometry(0.63, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.42);
    capGeo.scale(1, 0.85, 1);
    const cap = new THREE.Mesh(capGeo, this.toonMat(purpleLight));
    cap.position.y = 0.55;
    this.squashRig.add(cap);

    // Contorno preto (malha invertida, técnica clássica de cel-shading)
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outline = new THREE.Mesh(bodyGeo.clone(), outlineMat);
    outline.position.y = 0.55;
    outline.scale.set(1.06, 1.06, 1.06);
    this.squashRig.add(outline);

    // Broche dourado (único acento de cor, não compete com o roxo)
    const broche = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), this.toonMat(gold));
    broche.position.set(0, 0.5, 0.6);
    this.squashRig.add(broche);

    // Olhos
    const whiteMat = this.toonMat(0xffffff);
    const darkMat = this.toonMat(purpleDark);
    [-1, 1].forEach((xSign) => {
      const eye = new THREE.Group();
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), whiteMat);
      eye.add(sclera);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), darkMat);
      pupil.position.z = 0.07;
      eye.add(pupil);
      eye.position.set(xSign * 0.22, 0.75, 0.56);
      eye.rotation.x = THREE.MathUtils.degToRad(6);
      this.squashRig.add(eye);
    });

    // Óculos (2 aros + ponte) — a marca mais reconhecível do personagem.
    // Precisam ficar claramente NA FRENTE dos olhos e do contorno (senão
    // ficam escondidos dentro da cabeça) — daí o z bem maior que o dos olhos.
    [-1, 1].forEach((xSign) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 8, 20), darkMat);
      ring.position.set(xSign * 0.22, 0.75, 0.72);
      ring.rotation.x = THREE.MathUtils.degToRad(6);
      this.squashRig.add(ring);
    });
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), darkMat);
    bridge.position.set(0, 0.75, 0.72);
    bridge.rotation.z = Math.PI / 2;
    this.squashRig.add(bridge);

    // Tentáculos: 6, em leque na parte inferior-traseira do corpo — 2
    // centrais curtos (base visual) + 4 laterais longos (funcionam como
    // "pernas" ao andar). Cada um é uma cadeia de 2 segmentos articulados.
    const tentacleMat = this.toonMat(purple);
    const tipMat = this.toonMat(purpleLight);
    const specs = [
      { az: 95, long: true },
      { az: 135, long: true },
      { az: 170, long: false },
      { az: 190, long: false },
      { az: 225, long: true },
      { az: 265, long: true },
    ];
    specs.forEach((spec, i) => {
      const azRad = THREE.MathUtils.degToRad(spec.az);
      const root = new THREE.Group();
      root.position.set(Math.sin(azRad) * 0.42, 0.2, Math.cos(azRad) * 0.42);
      root.rotation.y = azRad;
      this.squashRig.add(root);

      const len1 = spec.long ? 0.4 : 0.24;
      const len2 = spec.long ? 0.3 : 0.18;

      const jointA = new THREE.Group();
      jointA.rotation.x = THREE.MathUtils.degToRad(60);
      root.add(jointA);
      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, len1, 8), tentacleMat);
      seg1.position.y = -len1 / 2;
      jointA.add(seg1);

      const jointB = new THREE.Group();
      jointB.position.y = -len1;
      jointA.add(jointB);
      const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, len2, 8), tipMat);
      seg2.position.y = -len2 / 2;
      jointB.add(seg2);

      this.tentacles.push({ jointB, phase: i * (Math.PI / 2) });
    });
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
