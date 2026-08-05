/* =========================================================================
   BUSINESS.JS — Trilha "Empreender"
   Segunda trilha independente da Academia Fin+ (não intercalada com a
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
  _flat: null,

  init() {
    document.querySelectorAll("#academiaSubnav .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.goSection(chip.dataset.academia));
    });
    this.render();
  },

  goSection(section) {
    document.querySelectorAll("#academiaSubnav .filter-chip").forEach((c) => c.classList.toggle("active", c.dataset.academia === section));
    document.getElementById("academiaTrilhaContent")?.classList.toggle("hidden", section !== "trilha");
    document.getElementById("academiaEmpreenderContent")?.classList.toggle("hidden", section !== "empreender");
    // Uma das duas seções acabou de virar visível — reobserva agora que tem geometria real.
    if (typeof Trail !== "undefined") Trail.observeReveal();
    this.observeReveal(document.getElementById("businessTrailContainer"));
  },

  flatLessons() {
    if (this._flat) return this._flat;
    const flat = [];
    BUSINESS_COURSE.forEach((level, levelIdx) => {
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

  isUnlocked(flatIdx) {
    if (flatIdx === 0) return true;
    return this.isDone(this.flatLessons()[flatIdx - 1]);
  },

  nextEntry() {
    return this.flatLessons().find((e) => !this.isDone(e)) || null;
  },

  render() {
    const container = document.getElementById("businessTrailContainer");
    if (!container) return;
    const flat = this.flatLessons();
    const next = this.nextEntry();
    const doneTotal = flat.filter((e) => this.isDone(e)).length;
    const overallPct = flat.length ? Math.round((doneTotal / flat.length) * 100) : 0;

    container.innerHTML = `
      <div class="trail">
        <div class="trail-spine"></div>
        <div class="trail-spine-fill" style="--target-pct:${overallPct}%"></div>
        ${BUSINESS_COURSE.map((level, levelIdx) => this.levelHtml(level, levelIdx, flat, next)).join("")}
      </div>
    `;

    container.querySelectorAll(".trail-node:not(.locked)").forEach((node) => {
      node.addEventListener("click", (e) => {
        if (typeof Fx !== "undefined") Fx.ripple(node, e);
        this.startLesson(Number(node.dataset.level), Number(node.dataset.lesson));
      });
    });

    this.observeReveal(container);
  },

  levelHtml(level, levelIdx, flat, next) {
    const progress = this.getProgress();
    const doneCount = level.licoes.filter((l) => !!progress[l.id]).length;
    const pct = Math.round((doneCount / level.licoes.length) * 100);

    const nodesHtml = level.licoes
      .map((lesson, lessonIdx) => {
        const flatIdx = flat.findIndex((e) => e.lesson.id === lesson.id);
        const done = !!progress[lesson.id];
        const unlocked = this.isUnlocked(flatIdx);
        const isCurrent = !!next && next.lesson.id === lesson.id;
        const stateClass = done ? "done" : unlocked ? "" : "locked";
        const icon = done ? "✅" : unlocked ? "💼" : "🔒";
        return `
        <div class="trail-node ${stateClass} ${isCurrent ? "current" : ""}" data-level="${levelIdx}" data-lesson="${lessonIdx}" title="${lesson.titulo}">
          <div class="trail-node-ring"><div class="trail-node-icon">${icon}</div></div>
          <div class="trail-node-label">${lesson.titulo}</div>
          <div class="trail-node-xp">+${Events.applyMultiplier(lesson.xp)} XP</div>
        </div>`;
      })
      .join("");

    return `
      <div class="trail-level" style="--level-color:${level.cor}">
        <div class="trail-level-banner">
          <div class="trail-level-ring" style="--pct:${pct}"><span>${doneCount}/${level.licoes.length}</span></div>
          <div class="trail-level-info">
            <div class="trail-level-tag">💼 Empreender</div>
            <h3>${level.titulo}</h3>
          </div>
        </div>
        <div class="trail-nodes">${nodesHtml}</div>
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
    const level = BUSINESS_COURSE[levelIdx];
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

    const overlay = document.getElementById("businessQuizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        <div class="quiz-result-emoji">${passed ? "🎉" : "🔁"}</div>
        <h2>${passed ? "Lição concluída!" : "Quase lá!"}</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas (${pct}%).</p>
        ${
          passed
            ? alreadyDone
              ? `<p class="text-soft">✅ Você já tinha concluído essa lição — revisar não dá XP de novo, mas ajuda a fixar o conteúdo!</p>`
              : `<p><b>+${xpGanho} XP</b> adicionados à sua conta.</p>`
            : `<p>Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!</p>`
        }
        <button class="btn btn-primary btn-block mt-16" id="businessQuizCloseBtn">${passed ? "Continuar" : "Tentar novamente"}</button>
      </div>
    `;
    if (passed && typeof Fx !== "undefined") Fx.confetti(overlay.querySelector(".quiz-box"));

    document.getElementById("businessQuizCloseBtn").addEventListener("click", () => {
      overlay.remove();
      this.activeQuiz = null;
      this.render();
      document.dispatchEvent(new CustomEvent("course:updated"));
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    });
  },
};
