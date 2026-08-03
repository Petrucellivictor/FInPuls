/* =========================================================================
   BOOKS.JS — Biblioteca Fin+
   Recomendações reais de livros, do zero ao avançado. A "recomendação de
   agora" nunca repete um livro já sugerido até esgotar a lista completa,
   quando então o ciclo recomeça.
   ========================================================================= */

const Books = {
  filtroAtivo: "todos",

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
  },

  getSeen() {
    return Store.get(STORAGE_KEYS.BOOKS_SEEN, []);
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
    return `
      <div class="card book-card ${destaque ? "highlighted" : ""}">
        <div class="flex-between">
          <span class="badge ${this.badgeClass(b.nivel)}">${this.nivelLabel(b.nivel)}</span>
          <span class="text-soft text-sm">${b.tema}</span>
        </div>
        <h3 class="mt-8">${b.titulo}</h3>
        <div class="text-soft text-sm">${b.autor}</div>
        <p class="text-sm mt-8">${b.pitch}</p>
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
  },

  renderGrid() {
    const grid = document.getElementById("booksGrid");
    if (!grid) return;
    const items = this.filtroAtivo === "todos" ? BOOKS : BOOKS.filter((b) => b.nivel === this.filtroAtivo);
    grid.innerHTML = items.map((b) => this.bookCardHtml(b, false)).join("");
  },
};
