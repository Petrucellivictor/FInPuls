/* =========================================================================
   TRAILSCENE3D.JS — "Correnteza do Conhecimento" (RFC-036, Fase A).
   Cena 3D decorativa (Three.js) atrás da trilha Aprender/Empreender: fundo
   do mar estilizado, gemas do conhecimento, anéis dourados, bolhas e
   plâncton bioluminescente, animados por scroll via GSAP ScrollTrigger.

   ACOPLAMENTO: ZERO, por decisão de arquitetura (RFC-036, Software
   Architect + Cyber Security Specialist). Este módulo NUNCA lê/importa
   Trail.*, Business.*, Learn.*, nem qualquer STORAGE_KEYS.*, nem escuta
   course:updated/lesson:passed/xp:updated. Só reage a:
     - tab:changed (ativar/desativar a cena)
     - visibilitychange (pausar quando a aba do navegador está oculta)
     - clique em #academiaSubnav (só para ScrollTrigger.refresh() — troca
       de altura de documento ao alternar Trilha/Empreender dentro do
       mesmo painel, não é leitura de estado de progresso)
     - resize da janela
     - scroll nativo da página (via ScrollTrigger)
   É puramente decorativo: nenhum bug aqui pode tocar XP/energia/progresso.

   Ciclo de vida: "pausar, não destruir". O WebGLRenderingContext é criado
   1x (lazy, na primeira vez que a aba Aprender é aberta) e nunca é
   descartado ao trocar de aba — só o loop de requestAnimationFrame e o
   ScrollTrigger são pausados/retomados. Isso evita o custo de recriar um
   contexto WebGL a cada troca de aba (o navegador tem limite de contextos
   simultâneos por página).
   ========================================================================= */

const TrailScene3D = {
  renderer: null,
  scene: null,
  camera: null,
  canvas: null,
  gradientMap: null,

  midGroup: null, // gemas + anéis (parallax médio)
  nearGroup: null, // bolhas + plâncton (parallax leve)
  bgMesh: null,
  bgTexture: null,
  gems: [],
  rings: [],
  bubbles: [],
  plankton: null,

  scrollTriggerInstance: null,
  rafId: null,
  active: false, // loop de animação rodando
  isAprenderTab: false,
  reducedMotion: false,
  progress: 0, // 0-1, scroll da página inteira
  startedAt: 0,
  lastFrameTime: 0,
  resizeTimer: null,

  // Paleta — só variáveis já usadas em css/style.css:root, sem cor nova.
  COLORS: {
    primaryLight: 0x8a70e0,
    primary: 0x6c4fcf,
    primaryDark: 0x2d1b4e,
    blue: 0x3b6e8f,
    gold: 0xe8a33d,
    goldDark: 0xc07f1f,
    green: 0x4fae4a,
  },

  /* ---------------------------------------------------------------------
     Ciclo de vida público
     --------------------------------------------------------------------- */

  init() {
    if (this.renderer || typeof THREE === "undefined") return;

    this.canvas = document.createElement("canvas");
    this.canvas.id = "trailScene3d";
    document.body.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.COLORS.primaryDark, 0.015);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);

    // Luz mínima — só o suficiente pro degradê de 3 tons do toon material
    // aparecer; não é uma cena "iluminada", é flat com leve volume.
    this.scene.add(new THREE.AmbientLight(this.COLORS.primaryLight, 0.6));
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 0.5);
    dirLight.position.set(2, 3, 4);
    this.scene.add(dirLight);

    this.gradientMap = this.buildGradientMap();

    this.midGroup = new THREE.Group();
    this.nearGroup = new THREE.Group();
    this.scene.add(this.midGroup, this.nearGroup);

    this.buildBackground();
    this.buildGems();
    this.buildRings();
    this.buildBubbles();
    this.buildPlankton();

    this.reducedMotion = this.prefersReducedMotion();
    this.setupScrollTrigger();

    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.handleResize(), 120);
    });
  },

  /* Chamado quando a cena passa a ser relevante (aba Aprender visível E
     aba do navegador em primeiro plano). Cria a cena na 1ª vez (lazy). */
  activate() {
    if (!this.renderer) this.init();
    if (!this.renderer) return; // THREE ainda não disponível — desiste

    this.canvas.style.visibility = "visible";

    if (this.reducedMotion) {
      this.renderStaticFrame();
      return;
    }

    if (this.scrollTriggerInstance) this.scrollTriggerInstance.enable();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();

    if (!this.active) {
      this.active = true;
      this.startLoop();
    }
  },

  /* Pausa o loop e o ScrollTrigger, mas NÃO destrói o contexto WebGL nem
     a cena. Esconde o canvas visualmente para não "vazar" a cena para
     outras abas (o elemento vive fora de qualquer .tab-panel). */
  deactivate() {
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollTriggerInstance) this.scrollTriggerInstance.disable();
    if (this.canvas) this.canvas.style.visibility = "hidden";
  },

  /* Alias simples, caso outro código prefira a forma booleana. */
  setActive(isActive) {
    if (isActive) this.activate();
    else this.deactivate();
  },

  /* ---------------------------------------------------------------------
     Orquestração de aba/visibilidade
     --------------------------------------------------------------------- */

  syncActiveState() {
    const shouldBeActive = this.isAprenderTab && !document.hidden;
    if (shouldBeActive) this.activate();
    else this.deactivate();
  },

  bindLifecycleEvents() {
    document.addEventListener("tab:changed", (e) => {
      this.isAprenderTab = e.detail.tabId === "aprender";
      this.syncActiveState();
    });

    document.addEventListener("visibilitychange", () => this.syncActiveState());

    // Empreender/Trilha Principal alternam dentro do MESMO painel #tab-aprender
    // (clique de chip, não Tabs.go/tab:changed) — a altura do documento pode
    // mudar sem disparar tab:changed, então o ScrollTrigger precisa recalcular
    // aqui também (nota do UX/UI Designer, RFC-036).
    const subnav = document.getElementById("academiaSubnav");
    if (subnav) {
      subnav.addEventListener("click", () => {
        requestAnimationFrame(() => {
          if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        });
      });
    }
  },

  /* ---------------------------------------------------------------------
     Construção da cena
     --------------------------------------------------------------------- */

  // Mesma técnica de cel-shading já validada em produção por
  // js/citypolvin3d.js (buildGradientMap/toonMat) — portada, não reinventada.
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

  // Fração da altura TOTAL da tela (medida a partir do topo do frustum,
  // Y positivo — câmera em z=8 olhando para -Z com up padrão (0,1,0), logo
  // +Y é "topo da tela") reservada ao cabeçalho "Academia PolvIn" e aos
  // chips #academiaSubnav, que não têm fundo opaco próprio (UX/UI Designer,
  // RFC-036 seção 3). Nenhum objeto "sólido" (gema/anel — opacidade 1.0/
  // 0.85) pode nascer aqui (achado 1 do QA, RFC-036 seção 7).
  TOP_EXCLUSION_FRACTION: 0.2,

  // Distância/tamanho visível no plano Z=depthZ, dada a câmera perspectiva
  // atual — usado para espalhar objetos dentro do frustum em cada camada.
  visibleHeightAtZ(depthZ) {
    const distance = Math.abs(this.camera.position.z - depthZ);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    return 2 * Math.tan(vFov / 2) * distance;
  },
  visibleWidthAtZ(depthZ) {
    return this.visibleHeightAtZ(depthZ) * this.camera.aspect;
  },

  // Menor dimensão visível (largura OU altura, o que for mais estreito) no
  // plano Z=depthZ. Usado para dimensionar objetos PROPORCIONALMENTE ao
  // frustum, em vez de raio absoluto fixo: em telas móveis estreitas
  // (retrato), visibleWidthAtZ encolhe bastante (ela depende do aspect
  // ratio; visibleHeightAtZ não), então um raio fixo passava a ocupar uma
  // fração enorme da largura da tela — confirmado visualmente em teste
  // manual (390×844, objetos cobrindo boa parte do cabeçalho). Usar o
  // mínimo entre largura/altura evita esse estouro em qualquer proporção
  // de tela (retrato estreito OU ultrawide).
  visibleMinDimAtZ(depthZ) {
    return Math.min(this.visibleWidthAtZ(depthZ), this.visibleHeightAtZ(depthZ));
  },

  // Sorteia uma posição Y dentro do frustum em depthZ, no mesmo range
  // vertical que cada build*() já usava (`halfHFraction`, ex. 0.42/0.38),
  // mas cortando o teto para fora da faixa reservada ao cabeçalho/subnav
  // (TOP_EXCLUSION_FRACTION). O fundo do range não muda — só o topo é
  // puxado para baixo, então a distribuição continua uniforme dentro da
  // área permitida (não é um clamp de valores já sorteados, que enviesaria
  // objetos para a borda do corte). `objectRadius` (opcional) recua o teto
  // mais um pouco para que a BORDA do objeto — não só o centro — fique fora
  // da faixa excluída (sem isso, um objeto grande com centro bem no limite
  // ainda entraria visualmente na área reservada pela metade do seu raio).
  randomSpawnY(depthZ, halfHFraction, objectRadius = 0) {
    const fullHeight = this.visibleHeightAtZ(depthZ);
    const minY = -halfHFraction * fullHeight;
    const maxY = (0.5 - this.TOP_EXCLUSION_FRACTION) * fullHeight - objectRadius;
    return minY + Math.random() * (maxY - minY);
  },

  // Plano de fundo oceânico: CanvasTexture com gradiente vertical de 4
  // paradas (variáveis de :root, nenhuma cor nova), repetida 3x na
  // vertical (RepeatWrapping) para o ciclo de "mergulho" funcionar em
  // trilhas de qualquer tamanho (2 a 35 lições).
  buildBackground() {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 256;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#8a70e0"); // --primary-light — superfície iluminada
    grad.addColorStop(0.34, "#6c4fcf"); // --primary — água intermediária
    grad.addColorStop(0.67, "#3b6e8f"); // --blue — transição fria
    grad.addColorStop(1, "#2d1b4e"); // --primary-dark — água profunda
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 256);

    this.bgTexture = new THREE.CanvasTexture(c);
    this.bgTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.bgTexture.wrapT = THREE.RepeatWrapping;
    this.bgTexture.repeat.set(1, 3);

    const mat = new THREE.MeshBasicMaterial({
      map: this.bgTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      fog: false,
    });
    this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    this.bgMesh.position.z = -14;
    this.resizeBackgroundPlane();
    this.scene.add(this.bgMesh);
  },

  resizeBackgroundPlane() {
    if (!this.bgMesh) return;
    // Margem de 15% pra nunca deixar borda visível durante resize/orientação.
    const w = this.visibleWidthAtZ(this.bgMesh.position.z) * 1.15;
    const h = this.visibleHeightAtZ(this.bgMesh.position.z) * 1.15;
    this.bgMesh.scale.set(w, h, 1);
  },

  // 8 "gemas do conhecimento" — icosaedros facetados, cicladas entre as 3
  // cores da marca (1 em cada 3 de cada cor).
  buildGems() {
    const colors = [this.COLORS.primary, this.COLORS.gold, this.COLORS.green];
    for (let i = 0; i < 8; i++) {
      const depthZ = -6 + Math.random() * 4; // camada "meio"
      // Raio proporcional à menor dimensão visível nesse Z (não um valor
      // absoluto fixo) — evita gemas desproporcionalmente grandes em telas
      // móveis estreitas (ver comentário de visibleMinDimAtZ).
      const radius = this.visibleMinDimAtZ(depthZ) * (0.05 + Math.random() * 0.05);
      const geo = new THREE.IcosahedronGeometry(radius, 0);
      const mesh = new THREE.Mesh(geo, this.toonMat(colors[i % 3]));

      const halfW = this.visibleWidthAtZ(depthZ) * 0.42;
      // Y usa randomSpawnY (não range simétrico) para excluir a faixa
      // superior reservada ao cabeçalho/subnav — achado 1 do QA (RFC-036
      // seção 7): gemas são o elemento "sólido" (opacidade 1.0) da cena.
      // `radius` é passado para que a BORDA da gema (não só o centro) fique
      // fora da faixa excluída.
      mesh.position.set((Math.random() * 2 - 1) * halfW, this.randomSpawnY(depthZ, 0.42, radius), depthZ);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      mesh.userData.spinSpeed = 0.05 + Math.random() * 0.08; // distinta por gema — não sincronizam

      this.midGroup.add(mesh);
      this.gems.push(mesh);
    }
  },

  // 3 anéis dourados — reforço temático de "moeda" sem repetir o
  // coin-burst 2D já existente em Fx.js.
  buildRings() {
    const colors = [this.COLORS.gold, this.COLORS.goldDark, this.COLORS.gold];
    for (let i = 0; i < 3; i++) {
      const depthZ = -5 + Math.random() * 3;
      const ringRadius = this.visibleMinDimAtZ(depthZ) * (0.06 + Math.random() * 0.03);
      const geo = new THREE.TorusGeometry(ringRadius, ringRadius * 0.11, 8, 24);
      const mesh = new THREE.Mesh(geo, this.toonMat(colors[i]));
      mesh.material.transparent = true;
      mesh.material.opacity = 0.85;

      const halfW = this.visibleWidthAtZ(depthZ) * 0.38;
      // Mesma exclusão de faixa superior das gemas — anéis são o outro
      // elemento "sólido" citado no achado 1 do QA (opacidade 0.85).
      // Raio efetivo = raio do anel + raio do tubo (borda externa real do
      // torus), mesma lógica de "borda, não só centro" das gemas.
      const outerRadius = ringRadius * 1.11;
      mesh.position.set((Math.random() * 2 - 1) * halfW, this.randomSpawnY(depthZ, 0.38, outerRadius), depthZ);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
      mesh.userData.spinSpeed = 0.04 + Math.random() * 0.06;

      this.midGroup.add(mesh);
      this.rings.push(mesh);
    }
  },

  // 6 bolhas ascendentes — contorno wireframe (mais "água" que "bola"),
  // sobem continuamente e reaparecem embaixo ao sair do topo (loop).
  buildBubbles() {
    for (let i = 0; i < 6; i++) {
      const depthZ = 1 + Math.random() * 3; // camada "próxima"
      const radius = this.visibleMinDimAtZ(depthZ) * (0.025 + Math.random() * 0.035);
      const geo = new THREE.SphereGeometry(radius, 8, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: this.COLORS.primaryLight,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        fog: false,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const halfW = this.visibleWidthAtZ(depthZ) * 0.4;
      const halfH = this.visibleHeightAtZ(depthZ) * 0.4;
      mesh.position.set((Math.random() * 2 - 1) * halfW, (Math.random() * 2 - 1) * halfH, depthZ);
      mesh.userData.riseSpeed = 0.12 + Math.random() * 0.18;

      this.nearGroup.add(mesh);
      this.bubbles.push(mesh);
    }
  },

  // Plâncton bioluminescente — 1 único THREE.Points (1 draw call), camada
  // mais próxima da câmera.
  buildPlankton() {
    const count = 350;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const depthZ = 3 + Math.random() * 3; // 3–6, camada "mais próxima"
      const halfW = this.visibleWidthAtZ(depthZ) * 0.45;
      const halfH = this.visibleHeightAtZ(depthZ) * 0.45;
      positions[i * 3] = (Math.random() * 2 - 1) * halfW;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * halfH;
      positions[i * 3 + 2] = depthZ;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // Tamanho do ponto também proporcional (referência: profundidade média
    // da camada, ~4.5) — mesmo motivo de visibleMinDimAtZ nas gemas/anéis.
    const pointSize = this.visibleMinDimAtZ(4.5) * 0.01;
    const mat = new THREE.PointsMaterial({
      color: this.COLORS.gold,
      size: pointSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      fog: false,
    });
    this.plankton = new THREE.Points(geo, mat);
    this.nearGroup.add(this.plankton);
  },

  /* ---------------------------------------------------------------------
     Scroll (GSAP ScrollTrigger) — só criado se reduced-motion estiver OFF.
     --------------------------------------------------------------------- */

  setupScrollTrigger() {
    if (this.reducedMotion) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);
    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        this.progress = self.progress;
      },
    });
  },

  /* ---------------------------------------------------------------------
     Loop de animação
     --------------------------------------------------------------------- */

  startLoop() {
    if (this.rafId) return;
    this.startedAt = 0;
    this.lastFrameTime = 0;
    const tick = (now) => {
      if (!this.active) {
        this.rafId = null;
        return;
      }
      this.rafId = requestAnimationFrame(tick);
      this.renderFrame(now);
    };
    this.rafId = requestAnimationFrame(tick);
  },

  renderFrame(now) {
    if (!this.startedAt) this.startedAt = now;
    if (!this.lastFrameTime) this.lastFrameTime = now;
    const elapsed = (now - this.startedAt) / 1000;
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    this.updateAmbient(elapsed, dt);
    this.applyParallax(this.progress);
    this.applyBackgroundOffset(this.progress);

    this.renderer.render(this.scene, this.camera);
  },

  // Movimento ambiente contínuo, independente do scroll: balanço leve de
  // câmera, rotação própria das gemas/anéis, bolhas subindo em loop.
  updateAmbient(elapsed, dt) {
    this.camera.position.x = Math.sin(elapsed * 0.3) * 0.3;
    this.camera.lookAt(0, 0, 0);

    this.gems.forEach((g) => {
      g.rotation.x += dt * g.userData.spinSpeed * 0.6;
      g.rotation.y += dt * g.userData.spinSpeed;
    });
    this.rings.forEach((r) => {
      r.rotation.z += dt * r.userData.spinSpeed;
    });
    this.bubbles.forEach((b) => {
      b.position.y += dt * b.userData.riseSpeed;
      const topBound = this.visibleHeightAtZ(b.position.z) / 2 + 1;
      if (b.position.y > topBound) {
        const halfW = this.visibleWidthAtZ(b.position.z) * 0.4;
        b.position.y = -topBound;
        b.position.x = (Math.random() * 2 - 1) * halfW;
      }
    });
  },

  // Parallax entre camadas: meio (gemas/anéis) x0.3, próxima (bolhas/
  // plâncton) x0.12 — fundo não se move em posição (só a textura desliza).
  applyParallax(progress) {
    const AMPLITUDE = 10;
    // "|| 0" normaliza -0 (progress=0 * negativo = -0 em IEEE754) para 0 —
    // sem efeito visual, só higiene (facilita leitura/depuração de estado).
    this.midGroup.position.y = -progress * AMPLITUDE * 0.3 || 0;
    this.nearGroup.position.y = -progress * AMPLITUDE * 0.12 || 0;
  },

  // "Mergulho": o offset da textura do plano de fundo cicla pelas 4
  // paradas de cor conforme o progresso de scroll da PÁGINA INTEIRA — não
  // lê nenhum elemento/estado da trilha (Trail.*/Business.*), só
  // window.scrollY via o progress calculado pelo ScrollTrigger.
  applyBackgroundOffset(progress) {
    if (!this.bgTexture) return;
    this.bgTexture.offset.y = -progress * 2 || 0; // "|| 0" normaliza -0, ver applyParallax
  },

  /* Frame único e estático (prefers-reduced-motion): progress=0, sem rAF,
     sem ScrollTrigger. Congela num quadro "pausado", não "quebrado" —
     gemas com rotação individual não alinhada (já randomizada na
     construção), bolhas já espalhadas (posição inicial randomizada). */
  renderStaticFrame() {
    if (!this.renderer) return;
    this.progress = 0;
    this.camera.position.x = 0;
    this.camera.lookAt(0, 0, 0);
    this.applyParallax(0);
    this.applyBackgroundOffset(0);
    this.renderer.render(this.scene, this.camera);
  },

  /* ---------------------------------------------------------------------
     Resize
     --------------------------------------------------------------------- */

  handleResize() {
    if (!this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.resizeBackgroundPlane();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    if (this.reducedMotion) this.renderStaticFrame();
  },

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */

  // Reaproveita a mesma media query que Fx.prefersReducedMotion() já usa
  // (RFC-036, UX/UI Designer) — não duplica a lógica, só reusa o mesmo
  // critério; Fx.js não faz parte da lista proibida (Trail/Business/Learn).
  prefersReducedMotion() {
    if (typeof Fx !== "undefined" && typeof Fx.prefersReducedMotion === "function") {
      return Fx.prefersReducedMotion();
    }
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
};

TrailScene3D.bindLifecycleEvents();
