/* =========================================================================
   BOOKS.JS — Biblioteca Fin+ / Estante de livros
   Recomendações reais de livros, do zero ao avançado. A "recomendação de
   agora" nunca repete um livro já sugerido até esgotar a lista completa
   (BOOKS_SEEN), quando então o ciclo recomeça — isso é independente de
   "completar" um livro (BOOKS_COMPLETED), que exige ler o resumo e fazer
   o quiz, ganhando XP/moedas (só na primeira vez) e um certificado.
   ========================================================================= */

const Books = {
  filtroAtivo: "todos",
  activeFlow: null,

  init() {
    document.querySelectorAll("#booksFiltros .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        this.filtroAtivo = chip.dataset.nivel;
        document.querySelectorAll("#booksFiltros .filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderGrid();
      });
    });
    this.renderRecommendation();
    this.renderGrid();
    this.renderCertificatesWall();
  },

  getSeen() {
    return Store.get(STORAGE_KEYS.BOOKS_SEEN, []);
  },

  getCompleted() {
    return Store.get(STORAGE_KEYS.BOOKS_COMPLETED, {});
  },

  isCompleted(id) {
    return !!this.getCompleted()[id];
  },

  pickNext() {
    let seen = this.getSeen();
    let candidatos = BOOKS.filter((b) => !seen.includes(b.id));
    if (!candidatos.length) {
      seen = [];
      candidatos = BOOKS;
    }
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    const nivel = profile ? profile.nivel : null;
    const escolhido = candidatos.find((b) => b.nivel === nivel) || candidatos[0];
    seen.push(escolhido.id);
    Store.set(STORAGE_KEYS.BOOKS_SEEN, seen);
    return escolhido;
  },

  currentRecommendation() {
    const seen = this.getSeen();
    if (seen.length) {
      const last = BOOKS.find((b) => b.id === seen[seen.length - 1]);
      if (last) return last;
    }
    return this.pickNext();
  },

  nivelLabel(n) {
    return { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" }[n] || n;
  },

  badgeClass(n) {
    return { iniciante: "badge-fixa", intermediario: "badge-ref", avancado: "badge-variavel" }[n] || "badge-fixa";
  },

  bookCardHtml(b, destaque) {
    const done = this.isCompleted(b.id);
    return `
      <div class="card book-card ${destaque ? "highlighted" : ""} ${done ? "done" : ""}" data-book="${b.id}" style="cursor:pointer">
        <div class="flex-between">
          <span class="badge ${this.badgeClass(b.nivel)}">${this.nivelLabel(b.nivel)}</span>
          <span class="text-soft text-sm">${done ? "✅ Lido" : b.tema}</span>
        </div>
        <h3 class="mt-8">${b.titulo}</h3>
        <div class="text-soft text-sm">${b.autor}</div>
        <p class="text-sm mt-8">${b.pitch}</p>
        <div class="text-sm mt-8" style="${done ? "color:var(--green-dark)" : "color:var(--ink-soft)"}">${done ? "🏅 Certificado conquistado" : "👉 Ler resumo + fazer quiz"}</div>
      </div>`;
  },

  renderRecommendation() {
    const container = document.getElementById("bookRecommendation");
    if (!container) return;
    const book = this.currentRecommendation();
    container.innerHTML = `
      <div class="text-soft text-sm">📖 Recomendado para você agora</div>
      ${this.bookCardHtml(book, true)}
      <button class="btn btn-outline btn-sm mt-8" id="bookNextBtn">🔄 Sugerir outro livro</button>
    `;
    document.getElementById("bookNextBtn").addEventListener("click", () => {
      this.pickNext();
      this.renderRecommendation();
      if (typeof Achievements !== "undefined") Achievements.checkAll();
    });
    container.querySelector("[data-book]")?.addEventListener("click", (e) => {
      if (e.target.closest("#bookNextBtn")) return;
      this.startBookFlow(book.id);
    });
  },

  renderGrid() {
    const grid = document.getElementById("booksGrid");
    if (!grid) return;
    const items = this.filtroAtivo === "todos" ? BOOKS : BOOKS.filter((b) => b.nivel === this.filtroAtivo);
    grid.innerHTML = items.map((b) => this.bookCardHtml(b, false)).join("");
    grid.querySelectorAll("[data-book]").forEach((card) => {
      card.addEventListener("click", () => this.startBookFlow(card.dataset.book));
    });

    const label = document.getElementById("booksCompletedLabel");
    if (label) label.textContent = `${Object.keys(this.getCompleted()).length}/${BOOKS.length} lidos`;
  },

  renderCertificatesWall() {
    const wall = document.getElementById("certificatesWall");
    if (!wall) return;
    const completed = this.getCompleted();
    const done = BOOKS.filter((b) => completed[b.id]);
    if (!done.length) {
      wall.innerHTML = `<div class="card empty-state" style="grid-column:1/-1"><span class="emoji">🏅</span>Nenhum certificado ainda — leia um livro na estante acima para ganhar o primeiro!</div>`;
      return;
    }
    wall.innerHTML = done.map((b) => this.certificateHtml(b, completed[b.id])).join("");
  },

  certificateHtml(b, meta) {
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    const nome = profile && profile.nome ? profile.nome : "Você";
    const dataStr = meta && meta.data ? new Date(meta.data).toLocaleDateString("pt-BR") : "";
    return `
      <div class="card certificate-card">
        <div class="certificate-seal">🏅</div>
        <div class="text-soft text-sm">Certificado de leitura</div>
        <h4 style="margin:6px 0 2px">${b.titulo}</h4>
        <div class="text-soft text-sm">${b.autor}</div>
        <div class="text-sm mt-8">Concedido a <b>${this.escapeHtml(nome)}</b></div>
        <div class="text-soft" style="font-size:11px">${dataStr}</div>
      </div>`;
  },

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  /* ---------- Fluxo de leitura: resumo (contado pelo POLVIn) → quiz → certificado ---------- */

  overlayEl() {
    let overlay = document.getElementById("bookFlowOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "bookFlowOverlay";
      overlay.className = "quiz-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  },

  startBookFlow(bookId) {
    const book = BOOKS.find((b) => b.id === bookId);
    if (!book) return;
    this.activeFlow = { book, qIndex: 0, correctCount: 0 };
    this.renderSummaryOverlay();
  },

  renderSummaryOverlay() {
    const overlay = this.overlayEl();
    const { book } = this.activeFlow;
    overlay.innerHTML = `
      <div class="quiz-box story-box">
        <div class="quiz-progress">📖 ${book.titulo}</div>
        <div id="bookSummaryPolvin"></div>
        <button class="btn btn-primary btn-block mt-16" id="bookQuizStartBtn">Fazer o quiz</button>
      </div>
    `;
    Polvin.renderStory(document.getElementById("bookSummaryPolvin"), book.resumo, { title: "POLVIn resume o livro" });
    document.getElementById("bookQuizStartBtn").addEventListener("click", () => this.renderQuizOverlay());
  },

  renderQuizOverlay() {
    const overlay = this.overlayEl();
    const { book, qIndex } = this.activeFlow;
    const question = book.quiz[qIndex];
    const dotsHtml = book.quiz.map((_, i) => `<span class="quiz-dot ${i < qIndex ? "done" : i === qIndex ? "active" : ""}"></span>`).join("");
    overlay.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-progress">${book.titulo}</div>
        <div class="quiz-dots">${dotsHtml}</div>
        <div class="quiz-question">${question.pergunta}</div>
        <div id="bookQuizOptions">
          ${question.opcoes.map((op, i) => `<button class="quiz-option" data-idx="${i}" style="--i:${i}">${op}</button>`).join("")}
        </div>
        <div id="bookQuizFeedback"></div>
      </div>
    `;
    overlay.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => this.answerQuizQuestion(Number(btn.dataset.idx)));
    });
  },

  answerQuizQuestion(idx) {
    if (this.activeFlow.answered) return;
    this.activeFlow.answered = true;
    const { book, qIndex } = this.activeFlow;
    const question = book.quiz[qIndex];
    const correct = idx === question.correta;
    if (correct) this.activeFlow.correctCount++;

    document.querySelectorAll("#bookQuizOptions .quiz-option").forEach((btn, i) => {
      if (i === question.correta) btn.classList.add("correct");
      else if (i === idx && !correct) btn.classList.add("wrong");
      else btn.classList.add("faded");
    });

    const nextLabel = qIndex + 1 < book.quiz.length ? "Próxima pergunta" : "Ver certificado";
    document.getElementById("bookQuizFeedback").innerHTML = `
      <div class="quiz-feedback">${correct ? "✅ Correto!" : "❌ Não foi essa."} ${question.explicacao}</div>
      <button class="btn btn-primary btn-block mt-16" id="bookQuizNextBtn">${nextLabel}</button>
    `;
    document.getElementById("bookQuizNextBtn").addEventListener("click", () => {
      this.activeFlow.qIndex++;
      this.activeFlow.answered = false;
      if (this.activeFlow.qIndex >= book.quiz.length) this.finishBookFlow();
      else this.renderQuizOverlay();
    });
  },

  /* Diferente da trilha: não existe reprovação — completar o quiz (não
     necessariamente acertar tudo) já é suficiente para o certificado, já
     que o objetivo aqui é incentivar a leitura, não reter o usuário numa
     lição obrigatória. XP/moedas, porém, só valem na primeira vez (mesmo
     guard já usado em Trail.finishLesson/Business.finishLesson). */
  finishBookFlow() {
    const { book, correctCount } = this.activeFlow;
    const total = book.quiz.length;
    const completed = this.getCompleted();
    const alreadyDone = !!completed[book.id];
    completed[book.id] = { data: new Date().toISOString(), acertos: correctCount, total };
    Store.set(STORAGE_KEYS.BOOKS_COMPLETED, completed);
    if (!alreadyDone) {
      Learn.addXp(20);
      Learn.addCoins(10);
    }

    const overlay = document.getElementById("bookFlowOverlay");
    overlay.innerHTML = `
      <div class="quiz-box" style="text-align:center">
        <div class="quiz-result-emoji">🏅</div>
        <h2>Certificado conquistado!</h2>
        <p class="text-soft">Você acertou ${correctCount} de ${total} perguntas sobre "${book.titulo}".</p>
        ${alreadyDone ? `<p class="text-soft">Você já tinha esse certificado — revisar não dá XP de novo.</p>` : `<p><b>+20 XP</b> e <b>+10 moedas</b> adicionadas à sua conta.</p>`}
        <button class="btn btn-primary btn-block mt-16" id="bookFlowCloseBtn">Ver minha parede de certificados</button>
      </div>
    `;
    if (typeof Fx !== "undefined") Fx.confetti(overlay.querySelector(".quiz-box"));

    document.getElementById("bookFlowCloseBtn").addEventListener("click", () => {
      overlay.remove();
      this.activeFlow = null;
      this.renderGrid();
      this.renderCertificatesWall();
      document.dispatchEvent(new CustomEvent("course:updated"));
      if (typeof Achievements !== "undefined") Achievements.checkAll();
      document.getElementById("certificatesWall")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  },
};
