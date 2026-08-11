/* =========================================================================
   BUSINESS.JS — Trilha "Empreender"
   Segunda trilha independente da Academia PolvIn (não intercalada com a
   trilha financeira/história): mini aulas + quiz sobre a diferença entre
   empreender e ser empresário, regimes tributários (MEI, Simples,
   Presumido, Real), obrigações fiscais/contábeis e gestão de pessoas e
   finanças. Reaproveita o mesmo visual em "caminho sinuoso" (classes
   .trail-*) e o mesmo mecanismo de aula+quiz da trilha de história.
   Conteúdo educativo — não é consultoria contábil, tributária ou
   trabalhista; valores de limites/alíquotas mudam por lei.
   ========================================================================= */

const Business = {
  activeQuiz: null,
  _levels: null,
  _flat: null,

  init() {
    document.querySelectorAll("#academiaSubnav .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.goSection(chip.dataset.academia));
    });
    this.render();
    /* Mesmo mecanismo de trail.js: COLS (5 desktop/tablet, 3 mobile) só
       muda quando a viewport cruza o breakpoint de 640px. RFC-035 Fase 2 —
       a trilha Empreender adota o mesmo layout, sem divergência. */
    window.matchMedia("(max-width: 640px)").addEventListener("change", () => this.render());
  },

  /* ---------- Layout zig-zag horizontal (RFC-035 Fase 2) ----------
     Mesmo algoritmo de js/trail.js (ver comentários lá para detalhes) —
     duplicado aqui em vez de extraído para um módulo compartilhado por
     seguir o padrão já existente no projeto (trail.js/business.js já
     duplicam isUnlocked/render/levelHtml/observeReveal e o fluxo de
     quiz inteiro, sem um módulo comum entre as duas trilhas). */

  cols() {
    return window.matchMedia("(max-width: 640px)").matches ? 3 : 5;
  },

  nodePosition(i, cols) {
    const rowsPerBlock = cols + 2;
    const block = Math.floor(i / rowsPerBlock);
    const pos = i % rowsPerBlock;
    const dir = block % 2 === 0 ? 1 : -1;
    let col, nodeRow;
    if (pos < cols) {
      col = dir === 1 ? pos : cols - 1 - pos;
      nodeRow = block * 3;
    } else {
      col = dir === 1 ? cols - 1 : 0;
      nodeRow = block * 3 + (pos - cols + 1);
    }
    return { col, nodeRow };
  },

  gridHtml(states, cols, nodeHtmlFor) {
    const positions = states.map((_, i) => this.nodePosition(i, cols));
    const numNodeRows = states.length ? Math.max(...positions.map((p) => p.nodeRow)) + 1 : 0;
    const colTemplate = Array(cols).fill("var(--tz-node-w)").join(" var(--tz-edge-w) ");
    /* minmax(--tz-node-h, auto) — mesmo ajuste de js/trail.js (ver comentário
       lá): evita que um título de lição longo (2-3 linhas) vaze por cima do
       próximo nó quando a linha tem altura fixa. */
    const rowTemplate = Array(numNodeRows).fill("minmax(var(--tz-node-h), auto)").join(" var(--tz-edge-h) ");

    const nodesHtml = states
      .map((state, i) => {
        const { col, nodeRow } = positions[i];
        return nodeHtmlFor(state, i, col * 2 + 1, nodeRow * 2 + 1);
      })
      .join("");

    const edgesHtml = positions
      .slice(0, -1)
      .map((prevPos, i) => {
        const currPos = positions[i + 1];
        const prevState = states[i];
        const currState = states[i + 1];
        const edgeClass = prevState.done && currState.done ? "done" : prevState.done && currState.isCurrent ? "current" : "";
        if (prevPos.nodeRow === currPos.nodeRow) {
          const gridColumn = Math.min(prevPos.col, currPos.col) * 2 + 2;
          const gridRow = prevPos.nodeRow * 2 + 1;
          return `<div class="trail-edge horizontal ${edgeClass}" style="grid-column:${gridColumn} / span 1; grid-row:${gridRow} / span 1;"></div>`;
        }
        const gridColumn = prevPos.col * 2 + 1;
        const gridRow = Math.min(prevPos.nodeRow, currPos.nodeRow) * 2 + 2;
        return `<div class="trail-edge vertical ${edgeClass}" style="grid-column:${gridColumn} / span 1; grid-row:${gridRow} / span 1;"></div>`;
      })
      .join("");

    return { colTemplate, rowTemplate, nodesHtml, edgesHtml };
  },

  goSection(section) {
    document.querySelectorAll("#academiaSubnav .filter-chip").forEach((c) => c.classList.toggle("active", c.dataset.academia === section));
    document.getElementById("academiaTrilhaContent")?.classList.toggle("hidden", section !== "trilha");
    document.getElementById("academiaEmpreenderContent")?.classList.toggle("hidden", section !== "empreender");
    // Uma das duas seções acabou de virar visível — reobserva agora que tem geometria real.
    if (typeof Trail !== "undefined") Trail.observeReveal();
    this.observeReveal(document.getElementById("businessTrailContainer"));
  },

  /* RFC-035 Fase 3B — insere os nós de revisão de BUSINESS_REVIEWS dentro de
     um clone de cada nível de BUSINESS_COURSE, ancorado por id (nunca por
     posição): para cada lição, se refLessonIds[6] de alguma revisão bate com
     o id dela, a revisão entra logo depois no array `licoes` clonado. Tanto
     o nível (`{ ...lvl }`) quanto `licoes` (montado via push num array novo)
     são clones — BUSINESS_COURSE nunca é mutado por esta função (risco 1 da
     seção 12/Software Architect da RFC-035: um shallow clone do nível NÃO
     clona o array aninhado, então clonar só o objeto não seria suficiente). */
  levels() {
    if (this._levels) return this._levels;
    const withReviews = BUSINESS_COURSE.map((lvl) => {
      const licoes = [];
      lvl.licoes.forEach((lesson) => {
        licoes.push(lesson);
        const review = BUSINESS_REVIEWS.find((r) => r.refLessonIds[6] === lesson.id);
        if (review) licoes.push(review);
      });
      return { ...lvl, licoes };
    });
    this._levels = withReviews;
    return withReviews;
  },

  flatLessons() {
    if (this._flat) return this._flat;
    const flat = [];
    this.levels().forEach((level, levelIdx) => {
      level.licoes.forEach((lesson, lessonIdx) => {
        flat.push({ lesson, level, levelIdx, lessonIdx });
      });
    });
    this._flat = flat;
    return flat;
  },

  getProgress() {
    return Store.get(STORAGE_KEYS.BUSINESS_PROGRESS, {});
  },

  isDone(entry) {
    return !!this.getProgress()[entry.lesson.id];
  },

  /* Mesmo fix de causa raiz aplicado em js/trail.js (ver comentário lá):
     destravar por CONTAGEM de lições concluídas na trilha inteira, não
     por "a lição imediatamente anterior nesta posição está concluída".
     BUSINESS_COURSE é um único array sequencial (sem intercalação), mas
     sofre do mesmo problema: se uma Onda futura inserir um nível novo no
     MEIO do array (em vez de só anexar ao final, como até agora), a
     posição de todo o conteúdo depois do ponto de inserção muda, e o
     critério por posição relativa re-travaria lições já alcançáveis para
     quem já tinha progresso. Contagem total é equivalente ao critério
     antigo enquanto o conteúdo só for anexado ao final (o caso de hoje) e
     correta também no caso de inserção no meio. */
  isUnlocked(flatIdx) {
    if (flatIdx === 0) return true;
    const doneCount = this.flatLessons().filter((e) => this.isDone(e)).length;
    return doneCount >= flatIdx;
  },

  nextEntry() {
    return this.flatLessons().find((e) => !this.isDone(e)) || null;
  },

  render() {
    const container = document.getElementById("businessTrailContainer");
    if (!container) return;
    const cols = this.cols();
    const flat = this.flatLessons();
    const next = this.nextEntry();
    const doneTotal = flat.filter((e) => this.isDone(e)).length;
    const overallPct = flat.length ? Math.round((doneTotal / flat.length) * 100) : 0;

    container.innerHTML = `
      <div class="trail">
        <div class="trail-progress-bar"><div class="trail-progress-fill" style="--target-pct:${overallPct}%"></div></div>
        ${this.levels()
          .map((level, levelIdx) => this.levelHtml(level, levelIdx, flat, next, cols))
          .join("")}
      </div>
    `;

    container.querySelectorAll(".trail-node:not(.locked)").forEach((node) => {
      node.addEventListener("click", (e) => {
        /* Ripple precisa do wrapper .trail-node-inner (overflow:hidden), não
           de .trail-node — ver comentário em css/style.css sobre o pino do
           nó atual (RFC-035 Fase 2). */
        if (typeof Fx !== "undefined") Fx.ripple(node.querySelector(".trail-node-inner") || node, e);
        this.startLesson(Number(node.dataset.level), Number(node.dataset.lesson));
      });
    });

    this.observeReveal(container);
  },

  levelHtml(level, levelIdx, flat, next, cols) {
    const progress = this.getProgress();
    const doneCount = level.licoes.filter((l) => !!progress[l.id]).length;
    const pct = Math.round((doneCount / level.licoes.length) * 100);

    const states = level.licoes.map((lesson) => {
      const flatIdx = flat.findIndex((e) => e.lesson.id === lesson.id);
      return {
        lesson,
        done: !!progress[lesson.id],
        unlocked: this.isUnlocked(flatIdx),
        isCurrent: !!next && next.lesson.id === lesson.id,
      };
    });

    const { colTemplate, rowTemplate, nodesHtml, edgesHtml } = this.gridHtml(states, cols, (state, lessonIdx, gridColumn, gridRow) => {
      const { lesson, done, unlocked, isCurrent } = state;
      const stateClass = done ? "done" : unlocked ? "" : "locked";
      /* RFC-035 Fase 3B (UX/UI Designer, seção 15) — o ícone do anel só troca
         para 🔁 nos estados em que já varia por conteúdo (desbloqueado/
         atual); bloqueado continua 🔒 e concluído continua ✅, sem exceção. */
      const isRevisao = lesson.tipo === "revisao";
      const icon = done ? "✅" : unlocked ? (isRevisao ? "🔁" : "💼") : "🔒";
      return `
        <div class="trail-node ${stateClass} ${isCurrent ? "current" : ""} ${isRevisao ? "revisao" : ""}" data-level="${levelIdx}" data-lesson="${lessonIdx}" title="${lesson.titulo}" style="--node-i:${lessonIdx}; grid-column:${gridColumn} / span 1; grid-row:${gridRow} / span 1;">
          <div class="trail-node-inner">
            <div class="trail-node-ring"><div class="trail-node-icon">${icon}</div></div>
            <div class="trail-node-label">${lesson.titulo}</div>
            <div class="trail-node-xp">+${Events.applyMultiplier(lesson.xp)} XP</div>
            ${isRevisao ? `<div class="trail-node-tag">🔁 Revisão</div>` : ""}
          </div>
        </div>`;
    });

    const theme = TRAIL_THEMES.themeFor(level.fonte, level.id); // RFC-037 Fase 2 — tema visual por bioma
    return `
      <div class="trail-level" style="--level-color:${level.cor}" data-bioma="${theme.biomaId}">
        <div class="trail-level-banner">
          <div class="trail-level-ring" style="--pct:${pct}"><span>${doneCount}/${level.licoes.length}</span></div>
          <div class="trail-level-info">
            <div class="trail-level-tag">💼 Empreender</div>
            <h3>${level.titulo}</h3>
          </div>
        </div>
        <div class="trail-nodes" style="grid-template-columns:${colTemplate}; grid-template-rows:${rowTemplate};">${nodesHtml}${edgesHtml}</div>
      </div>`;
  },

  /* Mesma ressalva de trail.js: o container pode estar escondido (aba
     "Aprender" ainda não aberta, ou subaba "Empreender" ainda não
     selecionada) quando isso é chamado — um elemento sem geometria nunca
     dispara o IntersectionObserver. Se ainda estiver escondido, não
     observa agora; quem reabrir a seção (goSection) chama de novo. */
  observeReveal(container) {
    if (!container || container.getClientRects().length === 0) return;

    const els = container.querySelectorAll(".trail-level:not(.visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01 }
    );
    els.forEach((el) => obs.observe(el));
  },

  /* ---------- Fluxo da lição (aula didática + quiz) ---------- */

  startLesson(levelIdx, lessonIdx) {
    if (!Energy.tryStart()) return;
    const level = this.levels()[levelIdx];
    const lesson = level.licoes[lessonIdx];
    this.activeQuiz = { level, lesson, qIndex: 0, correctCount: 0, correctStreak: 0, answered: false, onVariant: false, variantQuestion: null };
    this.renderAulaOverlay();
  },

  overlayEl() {
    let overlay = document.getElementById("businessQuizOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "businessQuizOverlay";
      overlay.className = "quiz-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  },

  renderAulaOverlay() {
    const overlay = this.overlayEl();
    const { lesson } = this.activeQuiz;
    overlay.innerHTML = `
      <div class="quiz-box story-box">
        <div class="quiz-progress">💼 ${lesson.titulo}</div>
        <div id="businessAulaPolvin"></div>
        <button class="btn btn-primary btn-block mt-16" id="businessContinueBtn">Continuar para o quiz</button>
      </div>
    `;
    Polvin.renderStory(document.getElementById("businessAulaPolvin"), lesson.aula, { title: "POLVIn explica" });
    document.getElementById("businessContinueBtn").addEventListener("click", () => this.renderQuizOverlay());
  },

  renderQuizOverlay() {
    const overlay = this.overlayEl();
    const { lesson, qIndex, onVariant, variantQuestion } = this.activeQuiz;
    const question = onVariant ? variantQuestion : lesson.perguntas[qIndex];

    const dotsHtml = lesson.perguntas
      .map((_, i) => `<span class="quiz-dot ${i < qIndex ? "done" : i === qIndex ? "active" : ""}"></span>`)
      .join("");

    overlay.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-progress">${lesson.titulo}</div>
        <div class="quiz-dots">${dotsHtml}</div>
        ${onVariant ? `<div class="alert-box info text-sm">🔁 Vamos reforçar esse mesmo conceito com outro exemplo:</div>` : ""}
        <div class="quiz-question">${question.pergunta}</div>
        <div id="businessQuizOptions">
          ${question.opcoes.map((op, i) => `<button class="quiz-option" data-idx="${i}" style="--i:${i}">${op}</button>`).join("")}
        </div>
        <div id="businessQuizFeedback"></div>
      </div>
    `;
    overlay.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => this.answerQuestion(Number(btn.dataset.idx)));
    });
  },

  answerQuestion(idx) {
    if (this.activeQuiz.answered) return;
    this.activeQuiz.answered = true;

    const { lesson, qIndex, onVariant, variantQuestion } = this.activeQuiz;
    const question = onVariant ? variantQuestion : lesson.perguntas[qIndex];
    const correct = idx === question.correta;
    if (correct) this.activeQuiz.correctCount++;
    this.activeQuiz.correctStreak = correct ? (this.activeQuiz.correctStreak || 0) + 1 : 0;
    Energy.registerAnswer(correct, this.activeQuiz.correctStreak);

    document.querySelectorAll("#businessQuizOptions .quiz-option").forEach((btn, i) => {
      if (i === question.correta) btn.classList.add("correct");
      else if (i === idx && !correct) btn.classList.add("wrong");
      else btn.classList.add("faded");
    });

    const original = lesson.perguntas[qIndex];
    const offerVariant = !onVariant && !correct && !!original.variante;
    const nextLabel = offerVariant
      ? "Tentar de novo com outro exemplo"
      : qIndex + 1 < lesson.perguntas.length
      ? "Próxima pergunta"
      : "Concluir lição";

    document.getElementById("businessQuizFeedback").innerHTML = `
      <div class="quiz-feedback">${correct ? "✅ Correto!" : "❌ Não foi essa."} ${question.explicacao}</div>
      <button class="btn btn-primary btn-block mt-16" id="businessQuizNextBtn">${nextLabel}</button>
    `;
    document.getElementById("businessQuizNextBtn").addEventListener("click", () => {
      if (offerVariant) {
        this.activeQuiz.onVariant = true;
        this.activeQuiz.variantQuestion = original.variante;
        this.activeQuiz.answered = false;
        this.renderQuizOverlay();
      } else {
        this.nextQuestion();
      }
    });
  },

  nextQuestion() {
    this.activeQuiz.onVariant = false;
    this.activeQuiz.variantQuestion = null;
    this.activeQuiz.qIndex++;
    this.activeQuiz.answered = false;
    if (this.activeQuiz.qIndex >= this.activeQuiz.lesson.perguntas.length) {
      this.finishLesson();
      return;
    }
    this.renderQuizOverlay();
  },

  finishLesson() {
    const { lesson, correctCount } = this.activeQuiz;
    const total = lesson.perguntas.length;
    const pct = Math.round((correctCount / total) * 100);
    const passed = pct >= 60;
    let alreadyDone = false;
    let xpGanho = lesson.xp;

    if (passed) {
      const progress = this.getProgress();
      alreadyDone = !!progress[lesson.id];
      progress[lesson.id] = true;
      Store.set(STORAGE_KEYS.BUSINESS_PROGRESS, progress);
      /* XP, moedas e o registro no LESSON_LOG só valem na PRIMEIRA conclusão —
         sem esse guard, refazer a mesma lição infla o LESSON_LOG e engana a
         missão semanal "complete 3 lições" (que conta entradas no log, não
         lições distintas), concedendo recompensa sem trabalho novo real. */
      if (!alreadyDone) {
        xpGanho = Events.applyMultiplier(lesson.xp);
        Learn.addXp(xpGanho);
        Learn.addCoins(5);

        const log = Store.get(STORAGE_KEYS.LESSON_LOG, []);
        log.push({ lessonId: lesson.id, fonte: "empreender", data: new Date().toISOString() });
        Store.set(STORAGE_KEYS.LESSON_LOG, log);
      }
      document.dispatchEvent(new CustomEvent("lesson:passed"));
    }

    const celebrar = passed && !alreadyDone;
    /* RFC-035 Fase 3B (Gamification Designer, seção 13, item 4) — reaproveita
       100% do fluxo visual de conclusão (confete, glow, xpPop, mascote,
       moedas); só o título e 1 linha extra de subtexto mudam para uma
       revisão, e o subtexto só aparece no caminho passed && !alreadyDone. */
    const isRevisao = lesson.tipo === "revisao";
    const overlay = document.getElementById("businessQuizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        ${
          celebrar && typeof Polvin !== "undefined"
            ? `<div class="quiz-result-mascot">${Polvin.avatarHtml("md")}</div>`
            : `<div class="quiz-result-emoji">${passed ? "🎉" : "🔁"}</div>`
        }
        <h2>${passed ? (isRevisao ? "Revisão dominada!" : "Lição concluída!") : "Quase lá!"}</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas (${pct}%).</p>
        ${celebrar && isRevisao ? `<p class="text-soft">Você reforçou o que já tinha aprendido — é isso que faz o conhecimento ficar de verdade.</p>` : ""}
        ${
          passed
            ? alreadyDone
              ? `<p class="text-soft">✅ Você já tinha concluído essa lição — revisar não dá XP de novo, mas ajuda a fixar o conteúdo!</p>`
              : `<p><b>+${xpGanho} XP</b> e <b>+5 moedas</b> adicionadas à sua conta.</p>`
            : `<p>Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!</p>`
        }
        <button class="btn btn-primary btn-block mt-16" id="businessQuizCloseBtn">${passed ? "Continuar" : "Tentar novamente"}</button>
      </div>
    `;
    if (celebrar && typeof Fx !== "undefined") {
      const box = overlay.querySelector(".quiz-box");
      Fx.confetti(box);
      Fx.successGlow(box);
      Fx.xpPop(`+${xpGanho} XP`, box);
      Fx.mascotCelebrate(box);
      const coinsHeaderEl = document.getElementById("headerCoins");
      if (coinsHeaderEl) Fx.coinBurst(box, coinsHeaderEl);
    }

    document.getElementById("businessQuizCloseBtn").addEventListener("click", () => {
      overlay.remove();
      this.activeQuiz = null;
      this.render();
      document.dispatchEvent(new CustomEvent("course:updated"));
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    });
  },
};
