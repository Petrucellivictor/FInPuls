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
    /* COLS (5 desktop/tablet, 3 mobile) só muda quando a viewport cruza o
       breakpoint de 640px — não em todo evento de resize (custoso e
       desnecessário). RFC-035 Fase 2. */
    window.matchMedia("(max-width: 640px)").addEventListener("change", () => this.render());
  },

  /* ---------- Layout zig-zag horizontal (RFC-035 Fase 2) ---------- */

  cols() {
    return window.matchMedia("(max-width: 640px)").matches ? 3 : 5;
  },

  /* Posição (col, nodeRow) de uma lição dentro do nível, para qualquer
     tamanho de nível ou COLS: blocos de "COLS horizontal + 2 vertical",
     alternando direção a cada bloco (caminho em "S"). Ver algoritmo
     completo na RFC-035 Fase 2 — "Especificação do UX/UI Designer". */
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

  /* Monta o grid de um nível: template de colunas/linhas de .trail-nodes,
     o HTML de cada nó (via nodeHtmlFor) e o HTML dos conectores entre nós
     consecutivos. Compartilhado entre trail.js e business.js — mesmo
     algoritmo, mesma identidade visual nas duas trilhas (decisão explícita
     da RFC-035 Fase 2: não divergir). */
  gridHtml(states, cols, nodeHtmlFor) {
    const positions = states.map((_, i) => this.nodePosition(i, cols));
    const numNodeRows = states.length ? Math.max(...positions.map((p) => p.nodeRow)) + 1 : 0;
    const colTemplate = Array(cols).fill("var(--tz-node-w)").join(" var(--tz-edge-w) ");
    /* minmax(--tz-node-h, auto), não uma altura fixa: títulos de lição mais
       longos podem quebrar em 2-3 linhas dentro do nó (label com max-width
       120px), e uma trilha de linha fixa deixava esse conteúdo vazar por
       cima do próximo nó — testado ao vivo em CDP/Chrome headless, ver
       RFC-035 Fase 2, "Implementação — Frontend Engineer". minmax mantém
       150px como padrão (nenhuma mudança visual no caso comum) e só cresce
       quando algum nó daquela linha realmente precisa. */
    const rowTemplate = Array(numNodeRows).fill("minmax(var(--tz-node-h), auto)").join(" var(--tz-edge-h) ");

    const nodesHtml = states
      .map((state, i) => {
        const { col, nodeRow } = positions[i];
        return nodeHtmlFor(state, i, col * 2 + 1, nodeRow * 2 + 1);
      })
      .join("");

    /* O algoritmo de posicionamento nunca produz salto diagonal entre
       lições consecutivas — cada conector é estritamente horizontal (mesma
       nodeRow) ou vertical (mesma coluna). "done" = os dois nós do trecho
       já concluídos (trecho já percorrido); "current" = trecho que leva ao
       próximo nó a fazer (pulsa, indicando "é por aqui"). */
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

  /* Destravamento por CONTAGEM de lições concluídas na trilha inteira,
     não por "a lição imediatamente anterior nesta ordem está concluída".
     Motivo: levels()/flatLessons() intercalam COURSE e HISTORY_COURSE por
     índice numérico — inserir um nível novo no MEIO de qualquer um dos
     dois arrays desloca a posição de tudo que vem depois, então "a lição
     imediatamente anterior" deixa de ser a mesma lição que era antes da
     inserção. Progresso é lido por lesson.id (isDone), não por posição,
     então lições já concluídas continuam concluídas — mas o critério por
     posição relativa passava a exigir a lição nova (ainda não feita) antes
     de liberar qualquer coisa depois dela, re-travando a trilha inteira
     para quem já tinha avançado. Contagem total reduz drasticamente esse
     dano: para progresso 100% sequencial (sem inserção no meio), doneCount
     e "o prefixo contíguo concluído" são sempre o mesmo número, então nada
     muda no caso comum. Depois de uma inserção no meio, pode sobrar um gap
     pequeno bem na fronteira da inserção (comprovado em QA: até `doneCount`
     alcançar a nova posição), mas ele fecha assim que QUALQUER uma das
     lições novas é concluída — elas destravam juntas, não em sequência
     rígida entre si — em vez da cascata de dezenas de lições travadas que
     o bug original causava. */
  isUnlocked(flatIdx) {
    if (flatIdx === 0) return true;
    const doneCount = this.flatLessons().filter((e) => this.isDone(e)).length;
    return doneCount >= flatIdx;
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

    const xpLabel = document.getElementById("courseXpLabel");
    if (xpLabel) xpLabel.textContent = `${Learn.getXp()} XP`;

    this.observeReveal();
  },

  levelHtml(level, levelIdx, flat, next, cols) {
    const progress = this.getProgress(level.fonte);
    const doneCount = level.licoes.filter((l) => !!progress[l.id]).length;
    const pct = Math.round((doneCount / level.licoes.length) * 100);
    const isHistoria = level.fonte === "historia";
    const icone = isHistoria ? "🇧🇷" : "📈";
    const tag = isHistoria ? "Brasil: História & Economia" : "Trilha Financeira";

    const states = level.licoes.map((lesson) => {
      const flatIdx = flat.findIndex((e) => e.lesson.id === lesson.id && e.fonte === level.fonte);
      return {
        lesson,
        done: !!progress[lesson.id],
        unlocked: this.isUnlocked(flatIdx),
        isCurrent: !!next && next.lesson.id === lesson.id && next.fonte === level.fonte,
      };
    });

    const { colTemplate, rowTemplate, nodesHtml, edgesHtml } = this.gridHtml(states, cols, (state, lessonIdx, gridColumn, gridRow) => {
      const { lesson, done, unlocked, isCurrent } = state;
      const stateClass = done ? "done" : unlocked ? "" : "locked";
      const icon = done ? "✅" : unlocked ? (isHistoria ? "📜" : "📘") : "🔒";
      return `
        <div class="trail-node ${stateClass} ${isCurrent ? "current" : ""}" data-level="${levelIdx}" data-lesson="${lessonIdx}" title="${lesson.titulo}" style="--node-i:${lessonIdx}; grid-column:${gridColumn} / span 1; grid-row:${gridRow} / span 1;">
          <div class="trail-node-inner">
            <div class="trail-node-ring">
              <div class="trail-node-icon">${icon}</div>
            </div>
            <div class="trail-node-label">${lesson.titulo}</div>
            <div class="trail-node-xp">+${Events.applyMultiplier(lesson.xp)} XP</div>
          </div>
        </div>`;
    });

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
        <div class="trail-nodes" style="grid-template-columns:${colTemplate}; grid-template-rows:${rowTemplate};">${nodesHtml}${edgesHtml}</div>
      </div>`;
  },

  /* A aba "Aprender" começa com display:none (só fica visível quando o
     usuário clica na aba — ver Tabs.go), e o container pode ainda estar
     escondido quando isso é chamado pela primeira vez (App.init roda antes
     de qualquer clique). Um elemento escondido não tem geometria alguma,
     então o IntersectionObserver nunca dispara para ele — a lição ficava
     travada em opacity:0 (invisível) mesmo depois de a aba abrir. Por
     isso: se ainda estiver escondido, não tenta observar agora (quem
     chamou de novo ao abrir a aba resolve); só usa o observer quando o
     container já está de fato visível/com layout real. */
  observeReveal() {
    const container = document.getElementById("trailContainer");
    if (!container || container.getClientRects().length === 0) return;

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
      { threshold: 0.01 }
    );
    els.forEach((el) => obs.observe(el));
  },

  /* ---------- Fluxo da lição (conto opcional + quiz) ---------- */

  startLesson(levelIdx, lessonIdx) {
    if (!Energy.tryStart()) return;
    const level = this.levels()[levelIdx];
    const lesson = level.licoes[lessonIdx];
    this.activeQuiz = { level, lesson, qIndex: 0, correctCount: 0, correctStreak: 0, answered: false, onVariant: false, variantQuestion: null };
    if (lesson.conto || lesson.aula) {
      this.renderIntroOverlay();
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

  /* Tela didática antes do quiz — "conto" (história) ou "aula" (financeira),
     ambos um array de parágrafos contados pelo POLVIn com analogias do
     dia a dia, antes de qualquer pergunta. */
  renderIntroOverlay() {
    const overlay = this.overlayEl();
    const { lesson, level } = this.activeQuiz;
    const paragraphs = lesson.conto || lesson.aula;
    const isHistoria = level.fonte === "historia";
    overlay.innerHTML = `
      <div class="quiz-box story-box">
        <div class="quiz-progress">${isHistoria ? "📜" : "📘"} ${lesson.titulo}</div>
        <div id="trailStoryPolvin"></div>
        <button class="btn btn-primary btn-block mt-16" id="storyContinueBtn">Continuar para o quiz</button>
      </div>
    `;
    Polvin.renderStory(document.getElementById("trailStoryPolvin"), paragraphs, { title: isHistoria ? "POLVIn conta a história" : "POLVIn explica" });
    document.getElementById("storyContinueBtn").addEventListener("click", () => this.renderQuizOverlay());
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

    const { lesson, qIndex, onVariant, variantQuestion } = this.activeQuiz;
    const question = onVariant ? variantQuestion : lesson.perguntas[qIndex];
    const correct = idx === question.correta;
    if (correct) this.activeQuiz.correctCount++;
    this.activeQuiz.correctStreak = correct ? (this.activeQuiz.correctStreak || 0) + 1 : 0;
    Energy.registerAnswer(correct, this.activeQuiz.correctStreak);

    document.querySelectorAll("#trailQuizOptions .quiz-option").forEach((btn, i) => {
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

    document.getElementById("trailQuizFeedback").innerHTML = `
      <div class="quiz-feedback">${correct ? "✅ Correto!" : "❌ Não foi essa."} ${question.explicacao}</div>
      <button class="btn btn-primary btn-block mt-16" id="trailQuizNextBtn">${nextLabel}</button>
    `;
    document.getElementById("trailQuizNextBtn").addEventListener("click", () => {
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
    const { level, lesson, correctCount } = this.activeQuiz;
    const total = lesson.perguntas.length;
    const pct = Math.round((correctCount / total) * 100);
    const passed = pct >= 60;
    let alreadyDone = false;
    let storyToShow = null;
    let xpGanho = lesson.xp;

    if (passed) {
      const progress = this.getProgress(level.fonte);
      alreadyDone = !!progress[lesson.id];
      progress[lesson.id] = true;
      Store.set(this.progressKey(level.fonte), progress);
      /* XP, moedas e o registro no LESSON_LOG só valem na PRIMEIRA conclusão —
         sem esse guard, refazer a mesma lição infla o LESSON_LOG e engana a
         missão semanal "complete 3 lições" (que conta entradas no log, não
         lições distintas), concedendo recompensa sem trabalho novo real. */
      if (!alreadyDone) {
        xpGanho = Events.applyMultiplier(lesson.xp);
        Learn.addXp(xpGanho);
        Learn.addCoins(5);

        const log = Store.get(STORAGE_KEYS.LESSON_LOG, []);
        log.push({ lessonId: lesson.id, fonte: level.fonte, data: new Date().toISOString() });
        Store.set(STORAGE_KEYS.LESSON_LOG, log);

        /* Histórias interativas intercalam a trilha FINANCEIRA a cada 3
           lições novas concluídas — só na primeira vez (replay não conta
           progresso novo), e só para essa trilha (não a de História). */
        if (level.fonte === "financeira") storyToShow = this.maybePickStory();
      }
      document.dispatchEvent(new CustomEvent("lesson:passed"));
    }

    const celebrar = passed && !alreadyDone;
    const overlay = document.getElementById("trailQuizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        ${
          celebrar && typeof Polvin !== "undefined"
            ? `<div class="quiz-result-mascot">${Polvin.avatarHtml("md")}</div>`
            : `<div class="quiz-result-emoji">${passed ? "🎉" : "🔁"}</div>`
        }
        <h2>${passed ? (level.fonte === "historia" ? "Capítulo concluído!" : "Lição concluída!") : "Quase lá!"}</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas (${pct}%).</p>
        ${
          passed
            ? alreadyDone
              ? `<p class="text-soft">✅ Você já tinha concluído essa lição — revisar não dá XP de novo, mas ajuda a fixar o conteúdo!</p>`
              : `<p><b>+${xpGanho} XP</b> e <b>+5 moedas</b> adicionadas à sua conta.</p>`
            : `<p>Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!</p>`
        }
        <button class="btn btn-primary btn-block mt-16" id="trailQuizCloseBtn">${passed ? "Continuar" : "Tentar novamente"}</button>
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

    document.getElementById("trailQuizCloseBtn").addEventListener("click", () => {
      this.activeQuiz = null;
      if (storyToShow) {
        this.showInteractiveStory(storyToShow);
      } else {
        overlay.remove();
        this.render();
        document.dispatchEvent(new CustomEvent("course:updated"));
        if (typeof Achievements !== "undefined") Achievements.checkAll();
      }
    });
  },

  /* ---------- Histórias interativas (a cada 3 lições da trilha financeira) ---------- */

  /* Cicla pelo pool de INTERACTIVE_STORIES como Books.pickNext() já faz com
     os livros — nunca repete uma história até esgotar todas, e só dispara
     quando o total de lições financeiras concluídas é múltiplo de 3. */
  maybePickStory() {
    const doneCount = Object.keys(this.getProgress("financeira")).length;
    if (doneCount === 0 || doneCount % 3 !== 0) return null;

    let seen = Store.get(STORAGE_KEYS.STORIES_SEEN, []);
    let candidatos = INTERACTIVE_STORIES.filter((s) => !seen.includes(s.id));
    if (!candidatos.length) {
      seen = [];
      candidatos = INTERACTIVE_STORIES;
    }
    const escolhida = candidatos[0];
    seen.push(escolhida.id);
    Store.set(STORAGE_KEYS.STORIES_SEEN, seen);
    return escolhida;
  },

  showInteractiveStory(story) {
    const overlay = this.overlayEl();
    overlay.innerHTML = `
      <div class="quiz-box story-box">
        <div class="quiz-progress">📖 Uma história rápida</div>
        <div class="quiz-question">${story.situacao}</div>
        <div class="flex mt-16" style="flex-direction:column;gap:8px">
          ${story.opcoes.map((op, i) => `<button class="quiz-option" data-opt="${i}" style="--i:${i}">${op.texto}</button>`).join("")}
        </div>
      </div>
    `;
    overlay.querySelectorAll("[data-opt]").forEach((btn) => {
      btn.addEventListener("click", () => this.resolveInteractiveStory(story, Number(btn.dataset.opt)));
    });
  },

  resolveInteractiveStory(story, idx) {
    const opcao = story.opcoes[idx];
    const overlay = document.getElementById("trailQuizOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        <div class="quiz-result-emoji">📖</div>
        <p>${opcao.desfecho}</p>
        <div class="alert-box info mt-16">💡 ${story.licaoAprendida}</div>
        <button class="btn btn-primary btn-block mt-16" id="storyDoneBtn">Continuar</button>
      </div>
    `;
    document.getElementById("storyDoneBtn").addEventListener("click", () => {
      overlay.remove();
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
        <button class="btn btn-gold btn-sm" id="homeContinueBtn">Continuar (+${Events.applyMultiplier(next.lesson.xp)} XP)</button>
      </div>
    `;
    document.getElementById("homeContinueBtn").addEventListener("click", () => {
      Tabs.go("aprender");
    });
  },
};
