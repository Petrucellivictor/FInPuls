/* =========================================================================
   TRAIL.JS — Trilha única e intercalada: educação financeira alternando
   com "Brasil: História & Economia". Os dois conteúdos (COURSE e
   HISTORY_COURSE, definidos em data.js) continuam com progresso e XP
   próprios de lição, mas são apresentados como UM único caminho
   sequencial — a lição N+1 só destrava depois da lição N, independente
   de qual das duas trilhas ela pertence.
   ========================================================================= */

const Trail = {
  activeQuiz: null,
  _levels: null,
  _flat: null,

  init() {
    this.render();
  },

  /* ---------- Estrutura unificada (financeira + história, alternadas) ---------- */

  levels() {
    if (this._levels) return this._levels;
    const financeira = COURSE.map((lvl) => ({ ...lvl, fonte: "financeira" }));
    const historia = HISTORY_COURSE.map((lvl) => ({ ...lvl, fonte: "historia" }));
    const unificado = [];
    const max = Math.max(financeira.length, historia.length);
    for (let i = 0; i < max; i++) {
      if (financeira[i]) unificado.push(financeira[i]);
      if (historia[i]) unificado.push(historia[i]);
    }
    this._levels = unificado;
    return unificado;
  },

  flatLessons() {
    if (this._flat) return this._flat;
    const flat = [];
    this.levels().forEach((level, levelIdx) => {
      level.licoes.forEach((lesson, lessonIdx) => {
        flat.push({ lesson, level, levelIdx, lessonIdx, fonte: level.fonte });
      });
    });
    this._flat = flat;
    return flat;
  },

  progressKey(fonte) {
    return fonte === "historia" ? STORAGE_KEYS.HISTORY_PROGRESS : STORAGE_KEYS.COURSE_PROGRESS;
  },

  getProgress(fonte) {
    return Store.get(this.progressKey(fonte), {});
  },

  isDone(entry) {
    return !!this.getProgress(entry.fonte)[entry.lesson.id];
  },

  isUnlocked(flatIdx) {
    if (flatIdx === 0) return true;
    return this.isDone(this.flatLessons()[flatIdx - 1]);
  },

  nextEntry() {
    return this.flatLessons().find((e) => !this.isDone(e)) || null;
  },

  totalXpDisponivel() {
    return this.flatLessons().reduce((s, e) => s + e.lesson.xp, 0);
  },

  /* ---------- Renderização da trilha (caminho sinuoso) ---------- */

  render() {
    const container = document.getElementById("trailContainer");
    if (!container) return;
    const flat = this.flatLessons();
    const next = this.nextEntry();
    const doneTotal = flat.filter((e) => this.isDone(e)).length;
    const overallPct = flat.length ? Math.round((doneTotal / flat.length) * 100) : 0;

    container.innerHTML = `
      <div class="trail">
        <div class="trail-spine"></div>
        <div class="trail-spine-fill" style="--target-pct:${overallPct}%"></div>
        ${this.levels()
          .map((level, levelIdx) => this.levelHtml(level, levelIdx, flat, next))
          .join("")}
      </div>
    `;

    container.querySelectorAll(".trail-node:not(.locked)").forEach((node) => {
      node.addEventListener("click", (e) => {
        if (typeof Fx !== "undefined") Fx.ripple(node, e);
        this.startLesson(Number(node.dataset.level), Number(node.dataset.lesson));
      });
    });

    const xpLabel = document.getElementById("courseXpLabel");
    if (xpLabel) xpLabel.textContent = `${Learn.getXp()} XP`;

    this.observeReveal();
  },

  levelHtml(level, levelIdx, flat, next) {
    const progress = this.getProgress(level.fonte);
    const doneCount = level.licoes.filter((l) => !!progress[l.id]).length;
    const pct = Math.round((doneCount / level.licoes.length) * 100);
    const isHistoria = level.fonte === "historia";
    const icone = isHistoria ? "🇧🇷" : "📈";
    const tag = isHistoria ? "Brasil: História & Economia" : "Trilha Financeira";

    const nodesHtml = level.licoes
      .map((lesson, lessonIdx) => {
        const flatIdx = flat.findIndex((e) => e.lesson.id === lesson.id && e.fonte === level.fonte);
        const done = !!progress[lesson.id];
        const unlocked = this.isUnlocked(flatIdx);
        const isCurrent = !!next && next.lesson.id === lesson.id && next.fonte === level.fonte;
        const stateClass = done ? "done" : unlocked ? "" : "locked";
        const icon = done ? "✅" : unlocked ? (isHistoria ? "📜" : "📘") : "🔒";
        return `
        <div class="trail-node ${stateClass} ${isCurrent ? "current" : ""}" data-level="${levelIdx}" data-lesson="${lessonIdx}" title="${lesson.titulo}">
          <div class="trail-node-ring">
            <div class="trail-node-icon">${icon}</div>
          </div>
          <div class="trail-node-label">${lesson.titulo}</div>
          <div class="trail-node-xp">+${lesson.xp} XP</div>
        </div>`;
      })
      .join("");

    return `
      <div class="trail-level ${isHistoria ? "historia" : "financeira"}" style="--level-color:${level.cor}">
        <div class="trail-level-banner">
          <div class="trail-level-ring" style="--pct:${pct}">
            <span>${doneCount}/${level.licoes.length}</span>
          </div>
          <div class="trail-level-info">
            <div class="trail-level-tag">${icone} ${tag}</div>
            <h3>${level.titulo}</h3>
          </div>
        </div>
        <div class="trail-nodes">${nodesHtml}</div>
      </div>`;
  },

  observeReveal() {
    const els = document.querySelectorAll(".trail-level:not(.visible)");
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
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
  },

  /* ---------- Fluxo da lição (conto opcional + quiz) ---------- */

  startLesson(levelIdx, lessonIdx) {
    const level = this.levels()[levelIdx];
    const lesson = level.licoes[lessonIdx];
    this.activeQuiz = { level, lesson, qIndex: 0, correctCount: 0, answered: false };
    if (level.fonte === "historia" && lesson.conto) {
      this.renderContoOverlay();
    } else {
      this.renderQuizOverlay();
    }
  },

  overlayEl() {
    let overlay = document.getElementById("trailQuizOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "trailQuizOverlay";
      overlay.className = "quiz-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  },

  renderContoOverlay() {
    const overlay = this.overlayEl();
    const { lesson } = this.activeQuiz;
    overlay.innerHTML = `
      <div class="quiz-box story-box">
        <div class="quiz-progress">📜 ${lesson.titulo}</div>
        <div id="trailStoryPolvin"></div>
        <button class="btn btn-primary btn-block mt-16" id="storyContinueBtn">Continuar para o quiz</button>
      </div>
    `;
    Polvin.renderStory(document.getElementById("trailStoryPolvin"), lesson.conto, { title: "POLVIn conta a história" });
    document.getElementById("storyContinueBtn").addEventListener("click", () => this.renderQuizOverlay());
  },

  renderQuizOverlay() {
    const overlay = this.overlayEl();
    const { lesson, qIndex } = this.activeQuiz;
    const question = lesson.perguntas[qIndex];
    const total = lesson.perguntas.length;

    const dotsHtml = lesson.perguntas
      .map((_, i) => `<span class="quiz-dot ${i < qIndex ? "done" : i === qIndex ? "active" : ""}"></span>`)
      .join("");

    overlay.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-progress">${lesson.titulo}</div>
        <div class="quiz-dots">${dotsHtml}</div>
        <div class="quiz-question">${question.pergunta}</div>
        <div id="trailQuizOptions">
          ${question.opcoes.map((op, i) => `<button class="quiz-option" data-idx="${i}" style="--i:${i}">${op}</button>`).join("")}
        </div>
        <div id="trailQuizFeedback"></div>
      </div>
    `;
    overlay.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => this.answerQuestion(Number(btn.dataset.idx)));
    });
  },

  answerQuestion(idx) {
    if (this.activeQuiz.answered) return;
    this.activeQuiz.answered = true;

    const { lesson, qIndex } = this.activeQuiz;
    const question = lesson.perguntas[qIndex];
    const correct = idx === question.correta;
    if (correct) this.activeQuiz.correctCount++;

    document.querySelectorAll("#trailQuizOptions .quiz-option").forEach((btn, i) => {
      if (i === question.correta) btn.classList.add("correct");
      else if (i === idx && !correct) btn.classList.add("wrong");
      else btn.classList.add("faded");
    });

    document.getElementById("trailQuizFeedback").innerHTML = `
      <div class="quiz-feedback">${correct ? "✅ Correto!" : "❌ Não foi essa."} ${question.explicacao}</div>
      <button class="btn btn-primary btn-block mt-16" id="trailQuizNextBtn">
        ${qIndex + 1 < lesson.perguntas.length ? "Próxima pergunta" : "Concluir lição"}
      </button>
    `;
    document.getElementById("trailQuizNextBtn").addEventListener("click", () => this.nextQuestion());
  },

  nextQuestion() {
    this.activeQuiz.qIndex++;
    this.activeQuiz.answered = false;
    if (this.activeQuiz.qIndex >= this.activeQuiz.lesson.perguntas.length) {
      this.finishLesson();
      return;
    }
    this.renderQuizOverlay();
  },

  finishLesson() {
    const { level, lesson, correctCount } = this.activeQuiz;
    const total = lesson.perguntas.length;
    const pct = Math.round((correctCount / total) * 100);
    const passed = pct >= 60;

    if (passed) {
      const progress = this.getProgress(level.fonte);
      const alreadyDone = !!progress[lesson.id];
      progress[lesson.id] = true;
      Store.set(this.progressKey(level.fonte), progress);
      if (!alreadyDone) {
        Learn.addXp(lesson.xp);
        Learn.addCoins(5);
      }

      const log = Store.get(STORAGE_KEYS.LESSON_LOG, []);
      log.push({ lessonId: lesson.id, fonte: level.fonte, data: new Date().toISOString() });
      Store.set(STORAGE_KEYS.LESSON_LOG, log);
      document.dispatchEvent(new CustomEvent("lesson:passed"));
    }

    const overlay = document.getElementById("trailQuizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        <div class="quiz-result-emoji">${passed ? "🎉" : "🔁"}</div>
        <h2>${passed ? (level.fonte === "historia" ? "Capítulo concluído!" : "Lição concluída!") : "Quase lá!"}</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas (${pct}%).</p>
        ${passed ? `<p><b>+${lesson.xp} XP</b> adicionados à sua conta.</p>` : `<p>Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!</p>`}
        <button class="btn btn-primary btn-block mt-16" id="trailQuizCloseBtn">${passed ? "Continuar" : "Tentar novamente"}</button>
      </div>
    `;
    if (passed && typeof Fx !== "undefined") Fx.confetti(overlay.querySelector(".quiz-box"));

    document.getElementById("trailQuizCloseBtn").addEventListener("click", () => {
      overlay.remove();
      this.activeQuiz = null;
      this.render();
      document.dispatchEvent(new CustomEvent("course:updated"));
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    });
  },

  /* Resumo curto usado no dashboard (Início) */
  renderHomeSnippet() {
    const target = document.getElementById("homeCourseSnippet");
    if (!target) return;
    const next = this.nextEntry();

    if (!next) {
      target.innerHTML = `<div class="alert-box info">🏆 Você concluiu toda a trilha disponível! Fique de olho em novas fases.</div>`;
      return;
    }

    const icone = next.fonte === "historia" ? "🇧🇷" : "📈";
    target.innerHTML = `
      <div class="flex-between">
        <div>
          <div class="text-soft text-sm">${icone} ${next.level.titulo}</div>
          <b>${next.lesson.titulo}</b>
        </div>
        <button class="btn btn-gold btn-sm" id="homeContinueBtn">Continuar (+${next.lesson.xp} XP)</button>
      </div>
    `;
    document.getElementById("homeContinueBtn").addEventListener("click", () => {
      Tabs.go("aprender");
    });
  },
};
