/* =========================================================================
   LEARN.JS — Trilha gamificada "Do Zero ao Avançado"
   Estrutura: Nível > Lição > Perguntas. Lições concluídas destravam a
   próxima; XP acumulado sobe o "nível de jogador" mostrado no cabeçalho.
   ========================================================================= */

const Learn = {
  activeQuiz: null,

  init() {
    this.render();
  },

  getProgress() {
    return Store.get(STORAGE_KEYS.COURSE_PROGRESS, {}); // { lessonId: true }
  },

  getXp() {
    return Store.get(STORAGE_KEYS.XP, 0);
  },

  addXp(amount) {
    const xp = this.getXp() + amount;
    Store.set(STORAGE_KEYS.XP, xp);
    this.bumpStreak();
    document.dispatchEvent(new CustomEvent("xp:updated"));
    return xp;
  },

  bumpStreak() {
    const streak = Store.get(STORAGE_KEYS.STREAK, { dias: 0, ultimoDia: null });
    const hoje = new Date().toDateString();
    if (streak.ultimoDia === hoje) return; // já contou hoje
    const ontem = new Date(Date.now() - 86400000).toDateString();
    streak.dias = streak.ultimoDia === ontem ? streak.dias + 1 : 1;
    streak.ultimoDia = hoje;
    Store.set(STORAGE_KEYS.STREAK, streak);
  },

  playerLevel() {
    const xp = this.getXp();
    // cada 100xp = 1 nível de jogador
    return Math.floor(xp / 100) + 1;
  },

  isLessonUnlocked(levelIdx, lessonIdx) {
    if (levelIdx === 0 && lessonIdx === 0) return true;
    const progress = this.getProgress();
    // desbloqueia se a lição anterior (na mesma trilha linear) foi concluída
    const flatLessons = [];
    COURSE.forEach((lvl) => lvl.licoes.forEach((les) => flatLessons.push(les.id)));
    const targetLesson = COURSE[levelIdx].licoes[lessonIdx];
    const flatIdx = flatLessons.indexOf(targetLesson.id);
    if (flatIdx === 0) return true;
    const previousId = flatLessons[flatIdx - 1];
    return !!progress[previousId];
  },

  render() {
    const container = document.getElementById("courseContainer");
    const progress = this.getProgress();

    container.innerHTML = COURSE.map((level, levelIdx) => {
      const lessonsHtml = level.licoes
        .map((lesson, lessonIdx) => {
          const done = !!progress[lesson.id];
          const unlocked = this.isLessonUnlocked(levelIdx, lessonIdx);
          const stateClass = done ? "done" : unlocked ? "" : "locked";
          const icon = done ? "✅" : unlocked ? "📘" : "🔒";
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
        this.startQuiz(Number(node.dataset.level), Number(node.dataset.lesson));
      });
    });

    document.getElementById("courseXpLabel").textContent = `${this.getXp()} XP`;
  },

  startQuiz(levelIdx, lessonIdx) {
    const lesson = COURSE[levelIdx].licoes[lessonIdx];
    this.activeQuiz = {
      lesson,
      qIndex: 0,
      correctCount: 0,
      answered: false,
    };
    this.renderQuizOverlay();
  },

  renderQuizOverlay() {
    let overlay = document.getElementById("quizOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "quizOverlay";
      overlay.className = "quiz-overlay";
      document.body.appendChild(overlay);
    }

    const { lesson, qIndex } = this.activeQuiz;
    const question = lesson.perguntas[qIndex];

    overlay.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-progress">${lesson.titulo} · Pergunta ${qIndex + 1} de ${lesson.perguntas.length}</div>
        <div class="quiz-question">${question.pergunta}</div>
        <div id="quizOptions">
          ${question.opcoes.map((op, i) => `<button class="quiz-option" data-idx="${i}">${op}</button>`).join("")}
        </div>
        <div id="quizFeedback"></div>
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

    document.querySelectorAll("#quizOptions .quiz-option").forEach((btn, i) => {
      if (i === question.correta) btn.classList.add("correct");
      else if (i === idx && !correct) btn.classList.add("wrong");
    });

    document.getElementById("quizFeedback").innerHTML = `
      <div class="quiz-feedback">
        ${correct ? "✅ Correto!" : "❌ Não foi essa."} ${question.explicacao}
      </div>
      <button class="btn btn-primary btn-block mt-16" id="quizNextBtn">
        ${qIndex + 1 < lesson.perguntas.length ? "Próxima pergunta" : "Concluir lição"}
      </button>
    `;

    document.getElementById("quizNextBtn").addEventListener("click", () => this.nextQuestion());
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
      Store.set(STORAGE_KEYS.COURSE_PROGRESS, progress);
      if (!alreadyDone) this.addXp(lesson.xp);

      const log = Store.get(STORAGE_KEYS.LESSON_LOG, []);
      log.push({ lessonId: lesson.id, data: new Date().toISOString() });
      Store.set(STORAGE_KEYS.LESSON_LOG, log);
      document.dispatchEvent(new CustomEvent("lesson:passed"));
    }

    const overlay = document.getElementById("quizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        <div class="quiz-result-emoji">${passed ? "🎉" : "🔁"}</div>
        <h2>${passed ? "Lição concluída!" : "Quase lá!"}</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas (${pct}%).</p>
        ${passed ? `<p><b>+${lesson.xp} XP</b> adicionados à sua conta.</p>` : `<p>Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!</p>`}
        <button class="btn btn-primary btn-block mt-16" id="quizCloseBtn">${passed ? "Continuar" : "Tentar novamente"}</button>
      </div>
    `;

    document.getElementById("quizCloseBtn").addEventListener("click", () => {
      overlay.remove();
      this.activeQuiz = null;
      this.render();
      document.dispatchEvent(new CustomEvent("course:updated"));
      if (!passed) {
        // permite tentar de novo imediatamente
      }
    });
  },

  /* Resumo curto usado no dashboard (Home) */
  renderHomeSnippet() {
    const target = document.getElementById("homeCourseSnippet");
    if (!target) return;
    const progress = this.getProgress();

    let nextLesson = null;
    for (const level of COURSE) {
      for (const lesson of level.licoes) {
        if (!progress[lesson.id]) {
          nextLesson = { level, lesson };
          break;
        }
      }
      if (nextLesson) break;
    }

    if (!nextLesson) {
      target.innerHTML = `<div class="alert-box info">🏆 Você concluiu toda a trilha disponível! Fique de olho em novas fases.</div>`;
      return;
    }

    target.innerHTML = `
      <div class="flex-between">
        <div>
          <div class="text-soft text-sm">${nextLesson.level.titulo}</div>
          <b>${nextLesson.lesson.titulo}</b>
        </div>
        <button class="btn btn-gold btn-sm" id="homeContinueBtn">Continuar (+${nextLesson.lesson.xp} XP)</button>
      </div>
    `;
    document.getElementById("homeContinueBtn").addEventListener("click", () => {
      Tabs.go("aprender");
    });
  },
};
