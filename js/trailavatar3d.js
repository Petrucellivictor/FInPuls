/* =========================================================================
   TRAILAVATAR3D.JS — Avatar navegável do PolvIn na trilha Aprender
   (RFC-037 Fase 3). Um canvas Three.js pequeno (~96×96 CSS px desktop /
   64×64 mobile), próprio e independente (contexto WebGL separado do de
   js/trailscene3d.js e do de js/citypolvin3d.js), grudado por cima do nó
   "atual" da trilha financeira/história — "anda" de um nó pro próximo
   quando uma lição é concluída, em vez de só marcar posição com um pino
   estático.

   ACOPLAMENTO — regra não-negociável desta RFC (critério de aceite 2,
   Software Architect seção 2 "Decisão 1"): este módulo NUNCA chama Trail.*
   ou Business.* (nem flatLessons(), nem getProgress(), nem levels()).
   A posição do avatar vem 100% de leitura de DOM já renderizado:
     document.querySelector("#trailContainer .trail-node.current .trail-node-ring")
   (fallback: o último ".trail-node.done"; se nenhum dos dois existir, o
   avatar se esconde). Isso é INTENCIONALMENTE mais desacoplado ainda do que
   js/trailmilestones.js (que lê Trail.* e Business.* diretamente, porque
   precisa refletir progresso) — o avatar só lê o resultado já pintado na
   tela, nunca uma função de progresso. Se você está prestes a adicionar uma
   chamada a Trail.flatLessons()/Trail.getProgress() aqui "pra simplificar",
   pare: isso cria uma segunda fonte de verdade de posição e viola o
   critério de aceite 2 pela porta dos fundos (risco já sinalizado
   explicitamente pelo Software Architect).

   Escopo do MVP (critério de aceite 5): só #trailContainer (trilha
   financeira/história unificada). #businessTrailContainer (Empreender)
   fica de fora por decisão explícita do Product Owner — este módulo nunca
   consulta esse container.

   Reaproveita a geometria do rig de js/polvinrig3d.js (PolvinRig3D.build),
   a mesma usada por js/citypolvin3d.js na Cidade Financeira — é o mesmo
   PolvIn, só que "vivendo" num contexto 3D próprio, sem tocar o rig da
   Cidade nem o de outra instância.

   Ciclo de vida: "pausar, não destruir" (mesmo padrão de TrailScene3D,
   RFC-036) — o WebGLRenderingContext é criado 1x, lazy, e nunca descartado;
   só o loop de requestAnimationFrame é pausado/retomado. Além do gate de
   aba (tab:changed "aprender" + visibilitychange) que TrailScene3D já usa,
   este módulo tem um terceiro gate que TrailScene3D não precisa:
   IntersectionObserver no nó-alvo — o loop só roda quando o nó atual está
   (ou perto de estar) visível na tela, que é o mecanismo central do
   orçamento de performance (Software Architect, "Orçamento de performance
   mobile", ~42 meshes combinados nos 2 contextos WebGL da aba Aprender).
   ========================================================================= */

const TrailAvatar3D = {
  renderer: null,
  scene: null,
  camera: null,
  canvas: null,
  shadowEl: null,

  rig: null, // { anchor, facing, bounce, tiltRig, squashRig, tentacles } — PolvinRig3D.build()
  currentYaw: 0,
  walkYawTarget: 0,

  targetRing: null, // .trail-node-ring atualmente ancorado (só usado para detectar troca de elemento; nunca lido por Trail.*)
  lastTargetKey: null, // "<data-level>:<data-lesson>" do nó ancorado — variável de instância em memória, NUNCA STORAGE_KEYS
  lastPlacedPoint: null, // {x,y} do último ponto de ancoragem realmente pintado na tela

  walk: null, // { fromX, fromY, toX, toY, startTime, duration } — animação de "andar" em curso
  arrivalSquash: null, // { startTime, duration } — squash de chegada

  observedEl: null,
  intersectionObserver: null,
  intersecting: false,

  isAprenderTab: false,
  reducedMotion: false,
  rafId: null,
  startedAt: 0,
  resizeTimer: null,
  scrollScheduled: false,
  currentCanvasSize: 0,

  CANVAS_SIZE_DESKTOP: 96,
  CANVAS_SIZE_MOBILE: 64,
  MOBILE_QUERY: "(max-width: 640px)",
  WALK_DURATION_MS: 800, // dentro dos 700-900ms especificados pelo UX/UI Designer
  ARRIVAL_SQUASH_MS: 250,
  YAW_LERP: 0.18,
  AVATAR_GAP: 8, // distância padrão entre o topo do nó-alvo e a base do canvas (âncora)
  MIN_GAP_ABOVE_PREV: 6, // respiro mínimo entre o topo do canvas e o rótulo do nó anterior, quando comprimido

  /* ---------------------------------------------------------------------
     Ciclo de vida público
     --------------------------------------------------------------------- */

  init() {
    if (this.renderer || typeof THREE === "undefined" || typeof PolvinRig3D === "undefined") return;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "trail-avatar-3d-canvas";
    document.body.appendChild(this.canvas);

    this.shadowEl = document.createElement("div");
    this.shadowEl.className = "trail-avatar-shadow";
    document.body.appendChild(this.shadowEl);

    this.currentCanvasSize = this.canvasSize();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.currentCanvasSize, this.currentCanvasSize); // updateStyle=true (default): CSS px do canvas fica correto em qualquer devicePixelRatio

    this.scene = new THREE.Scene();

    // Câmera ortográfica (mesma técnica de CityPolvin3D — "sensação de
    // figurinha/adesivo"), mas enquadrada BEM mais de perto: aqui o avatar
    // É o assunto do canvas inteiro, não um elemento entre vários. viewSize
    // pequeno + deslocamento vertical do centro do frustum (verticalOffset)
    // fazem o corpo ocupar ~55-60% da altura do canvas com os "pés" (base
    // dos tentáculos) perto da borda inferior — "ancoragem embaixo, corpo
    // cresce pra cima", pedido pelo UX/UI Designer (Decisão 5). Valores de
    // partida para calibração empírica, confirmados visualmente em teste.
    const viewSize = 1.15;
    const verticalOffset = 0.85;
    this.camera = new THREE.OrthographicCamera(-viewSize, viewSize, viewSize, -viewSize, 0.1, 10);
    this.camera.position.set(0, verticalOffset, 3);
    this.camera.lookAt(0, verticalOffset, 0);

    this.scene.add(new THREE.AmbientLight(0x2d1b4e, 0.4));
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 0.9);
    dirLight.position.set(1.5, 2.2, 2);
    this.scene.add(dirLight);

    this.rig = PolvinRig3D.build(this.scene);
    this.reducedMotion = this.prefersReducedMotion();
  },

  /* Chamado quando o avatar passa a ser potencialmente relevante (aba
     Aprender visível E aba do navegador em primeiro plano). Cria a cena na
     1ª vez (lazy). Não decide sozinho se o loop de animação roda — isso
     depende também do IntersectionObserver (updateRunningState). */
  activate() {
    if (!this.renderer) this.init();
    if (!this.renderer) return; // THREE/PolvinRig3D ainda não disponíveis — desiste

    this.reducedMotion = this.prefersReducedMotion();
    this.syncTarget(false);
    this.updateRunningState();
  },

  /* Pausa o loop e esconde canvas/sombra — NÃO destrói o contexto WebGL
     (mesmo padrão "pausar, não destruir" de TrailScene3D). */
  deactivate() {
    this.stopLoop();
    this.setVisible(false);
  },

  syncActiveState() {
    if (this.isAprenderTab && !document.hidden) this.activate();
    else this.deactivate();
  },

  bindLifecycleEvents() {
    document.addEventListener("tab:changed", (e) => {
      this.isAprenderTab = e.detail.tabId === "aprender";
      this.syncActiveState();
    });

    document.addEventListener("visibilitychange", () => this.syncActiveState());

    // Único gatilho de "andar": nó-alvo mudou de fato desde a última vez
    // (comparado a lastTargetKey, variável de instância em memória).
    document.addEventListener("course:updated", () => {
      if (!this.renderer) return; // avatar nunca foi ativado nesta sessão — nada a fazer
      this.syncTarget(true);
      this.updateRunningState();
    });

    // Empreender/Trilha Principal alternam dentro do MESMO painel
    // #tab-aprender (clique de chip, não Tabs.go/tab:changed) — mesma
    // observação já registrada por TrailScene3D (RFC-036): precisa
    // resincronizar aqui também. Reler DOM depois do clique, nunca chamar
    // Business.*/Trail.*.
    const subnav = document.getElementById("academiaSubnav");
    if (subnav) {
      subnav.addEventListener("click", () => {
        requestAnimationFrame(() => {
          this.syncTarget(false);
          this.updateRunningState();
        });
      });
    }

    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.handleResize(), 120);
    });

    // Reposiciona (sem animar) durante o scroll — throttle via rAF, mesmo
    // padrão pedido pelo Software Architect.
    window.addEventListener(
      "scroll",
      () => {
        if (!this.renderer || this.scrollScheduled) return;
        this.scrollScheduled = true;
        requestAnimationFrame(() => {
          this.scrollScheduled = false;
          this.syncTarget(false);
        });
      },
      { passive: true }
    );
  },

  /* ---------------------------------------------------------------------
     Posicionamento — SÓ leitura de DOM (ver comentário de topo do arquivo)
     --------------------------------------------------------------------- */

  locateTargetRing() {
    const container = document.getElementById("trailContainer");
    if (!container) return null;
    const current = container.querySelector(".trail-node.current .trail-node-ring");
    if (current) return current;
    const doneNodes = container.querySelectorAll(".trail-node.done");
    if (!doneNodes.length) return null;
    return doneNodes[doneNodes.length - 1].querySelector(".trail-node-ring");
  },

  /* Chave estável só para detectar TROCA de nó-alvo (não é lida de Trail.*
     ou Business.* — vem dos atributos data-level/data-lesson que trail.js
     já escreve no HTML de cada .trail-node). */
  keyFor(nodeEl) {
    if (!nodeEl) return null;
    return `${nodeEl.dataset.level}:${nodeEl.dataset.lesson}`;
  },

  /* Reconsulta o nó-alvo no DOM e decide: reposicionar só (scroll/resize/
     resync sem mudança real) ou animar a caminhada (course:updated com
     troca de nó-alvo real, avatar já visível). Nunca chama Trail.* ou
     Business.*. */
  syncTarget(isCourseUpdate) {
    if (!this.renderer) return;

    const ringEl = this.locateTargetRing();
    if (!ringEl) {
      this.targetRing = null;
      this.lastTargetKey = null;
      this.lastPlacedPoint = null;
      this.setVisible(false);
      return;
    }

    const rect = ringEl.getBoundingClientRect();
    // Nó existe no DOM mas sem geometria real — container escondido (ex.:
    // subnav trocado para Empreender, #academiaTrilhaContent com .hidden).
    // Trata como "sem alvo" em vez de ancorar em (0,0).
    if (rect.width === 0 && rect.height === 0) {
      this.targetRing = null;
      this.lastTargetKey = null;
      this.setVisible(false);
      return;
    }

    const nodeEl = ringEl.closest(".trail-node");
    const key = this.keyFor(nodeEl);
    const changed = key !== this.lastTargetKey;

    if (ringEl !== this.targetRing) this.observeTarget(nodeEl || ringEl);
    this.targetRing = ringEl;
    if (nodeEl) nodeEl.classList.add("avatar-here"); // pino ▲ recua via CSS (Decisão 5, UX/UI Designer)

    const canRun = this.isAprenderTab && !document.hidden && this.intersecting;
    if (isCourseUpdate && changed && this.lastPlacedPoint && !this.reducedMotion && canRun) {
      this.startWalk(rect, nodeEl);
    } else {
      this.placeAt(rect, nodeEl);
      if (this.reducedMotion) this.renderStaticFrame();
    }
    this.lastTargetKey = key;
  },

  /* Nó imediatamente ACIMA do nó-alvo, na mesma coluna do grid (mesmo range
     horizontal de x), se existir — só para saber até onde o avatar pode
     crescer para cima sem cobrir o rótulo desse nó anterior. Escopado ao
     .trail-level do próprio nó-alvo (colisão só é relevante dentro do mesmo
     bloco zig-zag; entre níveis já há espaçamento de banner de sobra). Só
     leitura de DOM (mesma regra de acoplamento do topo do arquivo — nunca
     chama Trail.* ou Business.*). */
  closestNodeBottomAbove(ringRect, nodeEl) {
    const level = nodeEl && nodeEl.closest(".trail-level");
    if (!level) return -Infinity;
    const centerX = ringRect.left + ringRect.width / 2;
    let closest = -Infinity;
    level.querySelectorAll(".trail-node").forEach((otherEl) => {
      if (otherEl === nodeEl) return;
      const r = otherEl.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return; // não renderizado (nó fora da viewport ainda não montado, etc.)
      const sameColumn = centerX >= r.left - 4 && centerX <= r.right + 4;
      if (!sameColumn) return;
      // "acima" = termina no ou antes do topo do nó-alvo; guarda o mais próximo (maior bottom)
      if (r.bottom <= ringRect.top + 1 && r.bottom > closest) closest = r.bottom;
    });
    return closest;
  },

  /* Ponto de ancoragem vertical (canto INFERIOR do canvas, ver comentário de
     .trail-avatar-3d-canvas em css/style.css sobre translate(-50%,-100%)).
     Normalmente rect.top - AVATAR_GAP (comportamento original, inalterado
     no caso comum), mas comprimido para BAIXO — nunca para cima — quando o
     alcance do avatar (altura do canvas + gap) invadiria o rótulo do nó
     imediatamente acima na mesma coluna. Bug relatado pelo QA da Fase 3:
     em blocos empilhados verticalmente (conector reto, --tz-edge-h mobile
     de só 32px), o avatar de 64px + 8px de gap "alcançava" 72px para cima,
     cobrindo o "+N XP" do nó anterior em ~40% das transições mobile.
     Extensão direta da Decisão 5 do UX/UI Designer ("avatar nunca invade o
     PRÓPRIO label abaixo dele") para o label do nó ANTERIOR, acima —
     mesmo critério, mesma direção de raciocínio, agora nos dois sentidos.
     Não altera --tz-edge-h nem o tamanho do canvas (CANVAS_SIZE_MOBILE
     continua legível em todo o resto da trilha): só recalcula ONDE o
     avatar já-do-tamanho-certo pode ancorar, ponto a ponto, então nunca
     penaliza os ~60% dos casos que já tinham espaço de sobra (incluindo
     desktop, que o QA não testou exaustivamente — esta função roda ali
     também, sem custo extra relevante, como proteção adicional). */
  anchorY(rect, nodeEl) {
    const idealY = rect.top - this.AVATAR_GAP; // comportamento original
    const prevBottom = this.closestNodeBottomAbove(rect, nodeEl);
    if (prevBottom === -Infinity) return idealY; // nenhum nó acima na mesma coluna — nada a compensar
    const minTop = prevBottom + this.MIN_GAP_ABOVE_PREV; // topo do canvas nunca pode ficar acima disso
    const idealTop = idealY - this.currentCanvasSize;
    if (idealTop >= minTop) return idealY; // já tem espaço de sobra — sem compensação
    return minTop + this.currentCanvasSize; // comprime a âncora para baixo até caber
  },

  placeAt(rect, nodeEl) {
    const x = rect.left + rect.width / 2;
    const y = this.anchorY(rect, nodeEl);
    this.canvas.style.left = `${x}px`;
    this.canvas.style.top = `${y}px`;
    this.shadowEl.style.left = `${x}px`;
    this.shadowEl.style.top = `${y}px`;
    this.lastPlacedPoint = { x, y };
    this.setVisible(true);
  },

  startWalk(toRect, nodeEl) {
    const from = this.lastPlacedPoint;
    const toX = toRect.left + toRect.width / 2;
    const toY = this.anchorY(toRect, nodeEl);
    this.walk = { fromX: from.x, fromY: from.y, toX, toY, startTime: null, duration: this.WALK_DURATION_MS };
    this.walkYawTarget = Math.atan2(toX - from.x, toY - from.y); // mesma convenção dx/dy->yaw de CityPolvin3D.render
    this.arrivalSquash = null;
    this.setVisible(true);
    this.startLoop();
  },

  /* ---------------------------------------------------------------------
     Ativação por visibilidade (IntersectionObserver) — orçamento de perf
     --------------------------------------------------------------------- */

  observeTarget(el) {
    if (!("IntersectionObserver" in window)) {
      this.intersecting = true; // sem suporte: assume visível (mesmo fallback de Trail.observeReveal)
      return;
    }
    const isFirstObservation = !this.intersectionObserver;
    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.intersecting = entry.isIntersecting;
          });
          this.updateRunningState();
        },
        { threshold: 0, rootMargin: "200px 0px" } // "ou perto de estar visível" — Software Architect
      );
    } else if (this.observedEl) {
      this.intersectionObserver.unobserve(this.observedEl);
    }
    this.observedEl = el;
    /* IMPORTANTE: só reseta `intersecting` para false na 1ª observação desta
       sessão (sem nenhuma informação prévia). Trail.render() recria o DOM
       inteiro a cada course:updated — o "novo" nó-alvo é quase sempre o
       MESMO lugar de tela que o nó anterior (mesma posição de scroll), só
       um elemento DOM diferente. Resetar aqui incondicionalmente faria
       `intersecting` voltar a false bem no meio de syncTarget(), um
       instante ANTES da decisão "anima a caminhada ou só reposiciona" (a
       callback do IntersectionObserver é assíncrona — nunca chega a tempo
       de corrigir isso na mesma execução síncrona) — na prática, a
       animação de "andar" nunca dispararia numa conclusão de lição real.
       Mantendo o último valor conhecido, a decisão usa a informação mais
       recente disponível; o observer corrige (se preciso) no próximo
       frame. */
    if (isFirstObservation) this.intersecting = false;
    this.intersectionObserver.observe(el);
  },

  /* ---------------------------------------------------------------------
     Loop de animação
     --------------------------------------------------------------------- */

  updateRunningState() {
    if (!this.renderer) return;
    const shouldShow = this.isAprenderTab && !document.hidden && !!this.targetRing;
    this.setVisible(shouldShow);

    if (this.reducedMotion) {
      this.stopLoop();
      if (shouldShow) this.renderStaticFrame();
      return;
    }

    const shouldRun = shouldShow && this.intersecting;
    if (shouldRun || this.walk) this.startLoop();
    else this.stopLoop();
  },

  startLoop() {
    if (this.rafId) return;
    this.startedAt = 0;
    const tick = (now) => {
      const stillWanted = this.isAprenderTab && !document.hidden && !!this.targetRing && (this.intersecting || this.walk);
      if (!stillWanted) {
        this.rafId = null;
        return;
      }
      this.rafId = requestAnimationFrame(tick);
      this.renderFrame(now);
    };
    this.rafId = requestAnimationFrame(tick);
  },

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  // Aproximação padrão de cubic-bezier(0.34, 1.56, 0.64, 1) — "easeOutBack"
  // (UX/UI Designer, Decisão 1: "leve overshoot", sensação de salto animado).
  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const p = t - 1;
    return 1 + c3 * p * p * p + c1 * p * p;
  },

  renderFrame(now) {
    if (!this.startedAt) this.startedAt = now;
    const elapsed = now - this.startedAt;

    let moving = false;

    if (this.walk) {
      if (this.walk.startTime === null) this.walk.startTime = now;
      const t = Math.min((now - this.walk.startTime) / this.walk.duration, 1);
      const eased = this.easeOutBack(t);
      const x = this.walk.fromX + (this.walk.toX - this.walk.fromX) * eased;
      const y = this.walk.fromY + (this.walk.toY - this.walk.fromY) * eased;
      this.canvas.style.left = `${x}px`;
      this.canvas.style.top = `${y}px`;
      this.shadowEl.style.left = `${x}px`;
      this.shadowEl.style.top = `${y}px`;
      moving = true;
      if (t >= 1) {
        this.lastPlacedPoint = { x: this.walk.toX, y: this.walk.toY };
        this.walk = null;
        this.arrivalSquash = { startTime: now, duration: this.ARRIVAL_SQUASH_MS };
      }
    }

    // Yaw sempre persegue o alvo (direção de deslocamento durante a
    // caminhada; 0 — "encarando o jogador" — assim que ela termina), pelo
    // caminho mais curto. O próprio lerp exponencial faz o "retorno suave a
    // 0 em ~300ms" pedido pelo UX/UI Designer, sem precisar de um estado
    // de animação separado para isso.
    const desiredYaw = this.walk ? this.walkYawTarget : 0;
    this.currentYaw += this.shortestAngleDelta(desiredYaw, this.currentYaw) * this.YAW_LERP;
    this.rig.facing.rotation.y = this.currentYaw;

    // Squash de chegada (~250ms): scaleY cai a ~0.85 e volta a 1.
    let scaleY = 1;
    if (this.arrivalSquash) {
      const t = Math.min((now - this.arrivalSquash.startTime) / this.arrivalSquash.duration, 1);
      scaleY = 1 - Math.sin(t * Math.PI) * 0.15;
      if (t >= 1) this.arrivalSquash = null;
    }
    this.rig.squashRig.scale.set(1, scaleY, 1);
    this.rig.bounce.position.y = (1 - scaleY) * -0.4;

    // Gait dos tentáculos — mesma fórmula/valores já calibrados de
    // CityPolvin3D.render() (idle: speed 0.35/amp 5°; andando: speed 1/
    // amp 20°), reaproveitada aqui (não a mesma chamada de função, já que
    // este módulo tem seu próprio ciclo de render, mas a mesma matemática).
    const speed = moving ? 1 : 0.35;
    const amp = THREE.MathUtils.degToRad(moving ? 20 : 5);
    const t = elapsed / (moving ? 90 : 500);
    this.rig.tentacles.forEach((tent) => {
      tent.jointB.rotation.z = Math.sin(t * speed + tent.phase) * amp;
    });

    this.renderer.render(this.scene, this.camera);
  },

  /* prefers-reduced-motion: sem lerp de caminhada nem idle animado — snap
     direto pra posição atual (já feito por placeAt), 1 frame estático,
     mesmo espírito de TrailScene3D.renderStaticFrame(). */
  renderStaticFrame() {
    if (!this.renderer) return;
    this.currentYaw = 0;
    this.rig.facing.rotation.y = 0;
    this.rig.squashRig.scale.set(1, 1, 1);
    this.rig.bounce.position.y = 0;
    this.rig.tentacles.forEach((tent) => {
      tent.jointB.rotation.z = 0;
    });
    this.renderer.render(this.scene, this.camera);
  },

  /* ---------------------------------------------------------------------
     Resize
     --------------------------------------------------------------------- */

  canvasSize() {
    return window.matchMedia(this.MOBILE_QUERY).matches ? this.CANVAS_SIZE_MOBILE : this.CANVAS_SIZE_DESKTOP;
  },

  handleResize() {
    if (!this.renderer) return;
    const size = this.canvasSize();
    if (size !== this.currentCanvasSize) {
      this.currentCanvasSize = size;
      this.renderer.setSize(size, size);
    }
    this.syncTarget(false);
  },

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */

  setVisible(show) {
    if (!this.canvas) return;
    this.canvas.style.visibility = show ? "visible" : "hidden";
    this.shadowEl.style.visibility = show ? "visible" : "hidden";
  },

  // Reaproveita o mesmo critério que TrailScene3D.prefersReducedMotion()
  // já usa (RFC-036) — não duplica a lógica, só o mesmo padrão.
  prefersReducedMotion() {
    if (typeof Fx !== "undefined" && typeof Fx.prefersReducedMotion === "function") {
      return Fx.prefersReducedMotion();
    }
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  /* Normaliza a diferença de ângulo pro range [-π, π], pra girar sempre
     pelo caminho mais curto — mesma fórmula de CityPolvin3D.shortestAngleDelta()
     (PolvinRig3D não expõe isso: só constrói geometria, não anima). */
  shortestAngleDelta(target, current) {
    return Math.atan2(Math.sin(target - current), Math.cos(target - current));
  },
};

TrailAvatar3D.bindLifecycleEvents();
