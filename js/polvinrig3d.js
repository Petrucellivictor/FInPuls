/* =========================================================================
   POLVINRIG3D.JS — Rig 3D compartilhado do PolvIn (RFC-037 Fase 3).

   Extração LITERAL (não reescrita) do corpo de CityPolvin3D.buildRig()
   (RFC-023, js/citypolvin3d.js) — mesma geometria procedural, mesmas
   posições/ângulos/cores, mesma hierarquia de grupos. Motivo da extração:
   o rig é identidade visual de marca (o mesmo PolvIn precisa parecer o
   mesmo PolvIn na Cidade Financeira e na trilha Aprender), diferente do
   algoritmo de grid da trilha (que o projeto duplica deliberadamente entre
   trail.js/business.js por ser layout ligado a dados independentes de cada
   trilha — ver comentário em business.js linha 30-34). Duplicar ~116 linhas
   de geometria interligada criaria risco real de o personagem "divergir
   visualmente" entre os dois lugares a cada ajuste futuro.

   Consumido por:
     - js/citypolvin3d.js (RFC-023, Cidade Financeira) — refatorado para
       delegar aqui, API pública 100% preservada.
     - js/trailavatar3d.js (RFC-037 Fase 3, avatar navegável da trilha).

   PolvinRig3D não guarda estado entre chamadas: cada build(scene) cria seu
   próprio gradientMap local e não depende de nenhuma propriedade de
   instância (`this.algumaCoisa`) além dos métodos utilitários abaixo — os
   dois consumidores acima chamam build() com scenes/contextos WebGL
   totalmente independentes, sem risco de um clobber o estado do outro.
   ========================================================================= */

const PolvinRig3D = {
  // Idêntico ao já duplicado em citypolvin3d.js/trailscene3d.js hoje — não
  // duplica pela 3ª vez, mas também não os altera (ambos continuam com sua
  // própria cópia, estável e já validada em produção).
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

  // Diferente de CityPolvin3D.toonMat(hex)/TrailScene3D.toonMat(hex) (que
  // usam `this.gradientMap` implícito): aqui o gradientMap é parâmetro
  // explícito, exatamente para não depender de estado de instância
  // compartilhado entre os dois consumidores (ver comentário de topo).
  toonMat(gradientMap, hex) {
    return new THREE.MeshToonMaterial({ color: hex, gradientMap });
  },

  /* Extração literal de CityPolvin3D.buildRig() (RFC-023, linhas 86-202),
     parametrizada para receber a `scene` de destino em vez de usar
     `this.scene`. Retorna a MESMA hierarquia/nomes de grupo que já existem
     em produção: { anchor, facing, bounce, tiltRig, squashRig, tentacles }.
     Hierarquia: anchor (posição de tela) > facing (yaw) > bounce (pulo do
     squash) > tiltRig (inclinação fixa "vista de cima") > squashRig (escala
     do squash-and-stretch) > malhas do personagem. */
  build(scene) {
    const gradientMap = this.buildGradientMap();
    const toon = (hex) => this.toonMat(gradientMap, hex);

    const anchor = new THREE.Group();
    const facing = new THREE.Group();
    const bounce = new THREE.Group();
    const tiltRig = new THREE.Group();
    const squashRig = new THREE.Group();

    tiltRig.rotation.x = -0.2;
    anchor.add(facing);
    facing.add(bounce);
    bounce.add(tiltRig);
    tiltRig.add(squashRig);
    scene.add(anchor);

    const purple = 0x6c4fcf;
    const purpleLight = 0x8a70e0;
    const purpleDark = 0x2d1b4e;
    const gold = 0xe8a33d;

    // Corpo (esfera única, corpo+cabeça, achatada em Y)
    const bodyGeo = new THREE.SphereGeometry(0.62, 24, 18);
    bodyGeo.scale(1, 0.85, 1);
    const body = new THREE.Mesh(bodyGeo, toon(purple));
    body.position.y = 0.55;
    squashRig.add(body);

    // Calota clara no topo (simula rim light, sem textura)
    const capGeo = new THREE.SphereGeometry(0.63, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.42);
    capGeo.scale(1, 0.85, 1);
    const cap = new THREE.Mesh(capGeo, toon(purpleLight));
    cap.position.y = 0.55;
    squashRig.add(cap);

    // Contorno preto (malha invertida, técnica clássica de cel-shading)
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outline = new THREE.Mesh(bodyGeo.clone(), outlineMat);
    outline.position.y = 0.55;
    outline.scale.set(1.06, 1.06, 1.06);
    squashRig.add(outline);

    // Broche dourado (único acento de cor, não compete com o roxo)
    const broche = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), toon(gold));
    broche.position.set(0, 0.5, 0.6);
    squashRig.add(broche);

    // Olhos
    const whiteMat = toon(0xffffff);
    const darkMat = toon(purpleDark);
    [-1, 1].forEach((xSign) => {
      const eye = new THREE.Group();
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), whiteMat);
      eye.add(sclera);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), darkMat);
      pupil.position.z = 0.07;
      eye.add(pupil);
      eye.position.set(xSign * 0.22, 0.75, 0.56);
      eye.rotation.x = THREE.MathUtils.degToRad(6);
      squashRig.add(eye);
    });

    // Óculos (2 aros + ponte) — a marca mais reconhecível do personagem.
    // Precisam ficar claramente NA FRENTE dos olhos e do contorno (senão
    // ficam escondidos dentro da cabeça) — daí o z bem maior que o dos olhos.
    [-1, 1].forEach((xSign) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 8, 20), darkMat);
      ring.position.set(xSign * 0.22, 0.75, 0.72);
      ring.rotation.x = THREE.MathUtils.degToRad(6);
      squashRig.add(ring);
    });
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), darkMat);
    bridge.position.set(0, 0.75, 0.72);
    bridge.rotation.z = Math.PI / 2;
    squashRig.add(bridge);

    // Tentáculos: 6, em leque na parte inferior-traseira do corpo — 2
    // centrais curtos (base visual) + 4 laterais longos (funcionam como
    // "pernas" ao andar). Cada um é uma cadeia de 2 segmentos articulados.
    const tentacleMat = toon(purple);
    const tipMat = toon(purpleLight);
    const specs = [
      { az: 95, long: true },
      { az: 135, long: true },
      { az: 170, long: false },
      { az: 190, long: false },
      { az: 225, long: true },
      { az: 265, long: true },
    ];
    const tentacles = [];
    specs.forEach((spec, i) => {
      const azRad = THREE.MathUtils.degToRad(spec.az);
      const root = new THREE.Group();
      root.position.set(Math.sin(azRad) * 0.42, 0.2, Math.cos(azRad) * 0.42);
      root.rotation.y = azRad;
      squashRig.add(root);

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

      tentacles.push({ jointB, phase: i * (Math.PI / 2) });
    });

    return { anchor, facing, bounce, tiltRig, squashRig, tentacles };
  },
};
