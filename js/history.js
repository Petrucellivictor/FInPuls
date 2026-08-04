/* =========================================================================
   HISTORY.JS — Trilha "Brasil: História & Economia"
   Segunda trilha gamificada dentro da aba Aprender: cada lição abre com um
   pequeno conto sobre moedas, ciclos econômicos, desigualdade e o papel do
   Estado no Brasil, antes do quiz. Usa o mesmo pool de XP da trilha
   financeira (Learn.addXp), mas progresso próprio.
   ========================================================================= */

const History = {
  activeQuiz: null,

  init() {
    document.querySelectorAll("#learnSubnav .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.goSection(chip.dataset.learn));
    });
    this.render();
  },

  goSection(section) {
    document.querySelectorAll("#learnSubnav .filter-chip").forEach((c) => c.classList.toggle("active", c.dataset.learn === section));
    document.getElementById("learnFinanceiraContent")?.classList.toggle("hidden", section !== "financeira");
    document.getElementById("learnHistoriaContent")?.classList.toggle("hidden", section !== "historia");
  },

  getProgress() {
    return Store.get(STORAGE_KEYS.HISTORY_PROGRESS, {});
  },

  totalLessons() {
    return HISTORY_COURSE.reduce((s, lvl) => s + lvl.licoes.length, 0);
  },

  completedLessons() {
    const progress = this.getProgress();
    return HISTORY_COURSE.reduce((s, lvl) => s + lvl.licoes.filter((l) => !!progress[l.id]).length, 0);
  },

  isLessonUnlocked(levelIdx, lessonIdx) {
    if (levelIdx === 0 && lessonIdx === 0) return true;
    const progress = this.getProgress();
    const flatLessons = [];
    HISTORY_COURSE.forEach((lvl) => lvl.licoes.forEach((les) => flatLessons.push(les.id)));
    const targetLesson = HISTORY_COURSE[levelIdx].licoes[lessonIdx];
    const flatIdx = flatLessons.indexOf(targetLesson.id);
    if (flatIdx === 0) return true;
    return !!progress[flatLessons[flatIdx - 1]];
  },

  render() {
    const container = document.getElementById("historyCourseContainer");
    if (!container) return;
    const progress = this.getProgress();

    container.innerHTML = HISTORY_COURSE.map((level, levelIdx) => {
      const lessonsHtml = level.licoes
        .map((lesson, lessonIdx) => {
          const done = !!progress[lesson.id];
          const unlocked = this.isLessonUnlocked(levelIdx, lessonIdx);
          const stateClass = done ? "done" : unlocked ? "" : "locked";
          const icon = done ? "✅" : unlocked ? "📜" : "🔒";
          return `
          <div class="lesson-node ${stateClass}" data-level="${levelIdx}" data-lesson="${lessonIdx}">
            <div class="lesson-icon">${icon}</div>
            <div class="lesson-title">${lesson.titulo}</div>
            <div class="lesson-xp">+${lesson.xp} XP</div>
          </div>`;
        })
        .join("");

      return `
        <div class="course-level">
          <div class="course-level-head">
            <span class="course-level-dot" style="background:${level.cor}"></span>
            <h3 style="margin:0">${level.titulo}</h3>
          </div>
          <div class="lessons-row">${lessonsHtml}</div>
        </div>`;
    }).join("");

    container.querySelectorAll(".lesson-node:not(.locked)").forEach((node) => {
      node.addEventListener("click", () => {
        this.startLesson(Number(node.dataset.level), Number(node.dataset.lesson));
      });
    });
  },

  startLesson(levelIdx, lessonIdx) {
    const lesson = HISTORY_COURSE[levelIdx].licoes[lessonIdx];
    this.activeQuiz = { lesson, qIndex: 0, correctCount: 0, answered: false };
    this.renderContoOverlay();
  },

  overlayEl() {
    let overlay = document.getElementById("historyQuizOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "historyQuizOverlay";
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
        <div class="story-text">${lesson.conto.map((p) => `<p>${p}</p>`).join("")}</div>
        <button class="btn btn-primary btn-block mt-16" id="storyContinueBtn">Continuar para o quiz</button>
      </div>
    `;
    document.getElementById("storyContinueBtn").addEventListener("click", () => this.renderQuizOverlay());
  },

  renderQuizOverlay() {
    const overlay = this.overlayEl();
    const { lesson, qIndex } = this.activeQuiz;
    const question = lesson.perguntas[qIndex];

    overlay.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-progress">${lesson.titulo} · Pergunta ${qIndex + 1} de ${lesson.perguntas.length}</div>
        <div class="quiz-question">${question.pergunta}</div>
        <div id="historyQuizOptions">
          ${question.opcoes.map((op, i) => `<button class="quiz-option" data-idx="${i}">${op}</button>`).join("")}
        </div>
        <div id="historyQuizFeedback"></div>
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

    document.querySelectorAll("#historyQuizOptions .quiz-option").forEach((btn, i) => {
      if (i === question.correta) btn.classList.add("correct");
      else if (i === idx && !correct) btn.classList.add("wrong");
    });

    document.getElementById("historyQuizFeedback").innerHTML = `
      <div class="quiz-feedback">${correct ? "✅ Correto!" : "❌ Não foi essa."} ${question.explicacao}</div>
      <button class="btn btn-primary btn-block mt-16" id="historyQuizNextBtn">
        ${qIndex + 1 < lesson.perguntas.length ? "Próxima pergunta" : "Concluir capítulo"}
      </button>
    `;
    document.getElementById("historyQuizNextBtn").addEventListener("click", () => this.nextQuestion());
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
    const { lesson, correctCount } = this.activeQuiz;
    const total = lesson.perguntas.length;
    const pct = Math.round((correctCount / total) * 100);
    const passed = pct >= 60;

    if (passed) {
      const progress = this.getProgress();
      const alreadyDone = !!progress[lesson.id];
      progress[lesson.id] = true;
      Store.set(STORAGE_KEYS.HISTORY_PROGRESS, progress);
      if (!alreadyDone) Learn.addXp(lesson.xp);
    }

    const overlay = document.getElementById("historyQuizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        <div class="quiz-result-emoji">${passed ? "🎉" : "🔁"}</div>
        <h2>${passed ? "Capítulo concluído!" : "Quase lá!"}</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas (${pct}%).</p>
        ${passed ? `<p><b>+${lesson.xp} XP</b> adicionados à sua conta.</p>` : `<p>Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!</p>`}
        <button class="btn btn-primary btn-block mt-16" id="historyQuizCloseBtn">${passed ? "Continuar" : "Tentar novamente"}</button>
      </div>
    `;
    if (passed && typeof Fx !== "undefined") Fx.confetti(overlay.querySelector(".quiz-box"));

    document.getElementById("historyQuizCloseBtn").addEventListener("click", () => {
      overlay.remove();
      this.activeQuiz = null;
      this.render();
      document.dispatchEvent(new CustomEvent("course:updated"));
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    });
  },
};
