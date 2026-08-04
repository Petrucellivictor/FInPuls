/* =========================================================================
   TOOLTIP.JS — Dica rápida "explique como para uma criança de 10 anos"
   junto de ferramentas e termos técnicos (calculadoras, indicadores).
   Funciona no hover (mouse) e também no toque (mobile), via um único
   balão compartilhado posicionado perto do gatilho clicado/focado.
   ========================================================================= */

const Tooltip = {
  bubble: null,
  current: null,

  init() {
    if (this.bubble) return;
    this.bubble = document.createElement("div");
    this.bubble.className = "tip-bubble";
    document.body.appendChild(this.bubble);

    document.addEventListener("mouseover", (e) => {
      const trigger = e.target.closest(".tip-trigger");
      if (trigger) this.show(trigger);
    });
    document.addEventListener("mouseout", (e) => {
      const trigger = e.target.closest(".tip-trigger");
      if (trigger) this.hide();
    });
    document.addEventListener("focusin", (e) => {
      const trigger = e.target.closest(".tip-trigger");
      if (trigger) this.show(trigger);
    });
    document.addEventListener("focusout", (e) => {
      const trigger = e.target.closest(".tip-trigger");
      if (trigger) this.hide();
    });
    document.addEventListener(
      "click",
      (e) => {
        const trigger = e.target.closest(".tip-trigger");
        if (trigger) {
          e.preventDefault();
          // Se já estava aberto por hover/foco (não por um clique anterior),
          // um clique deve só confirmar que fique visível — não fechar. Só
          // alterna para fechar num SEGUNDO clique deliberado no mesmo
          // gatilho (importante no toque, onde o clique sintético às vezes
          // chega depois de um "mouseover" de compatibilidade do navegador).
          if (this.openedByClick && this.current === trigger) this.hide();
          else {
            this.show(trigger);
            this.openedByClick = true;
          }
          return;
        }
        this.hide();
      },
      true
    );
    window.addEventListener("scroll", () => this.hide(), true);
  },

  show(trigger) {
    this.current = trigger;
    this.bubble.textContent = trigger.dataset.tip || "";
    this.bubble.classList.add("show");
    const rect = trigger.getBoundingClientRect();
    const bubbleRect = this.bubble.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - bubbleRect.width / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - bubbleRect.width - 10));
    let top = rect.bottom + 8;
    if (top + bubbleRect.height > window.innerHeight - 10) top = rect.top - bubbleRect.height - 8;
    this.bubble.style.left = left + "px";
    this.bubble.style.top = top + "px";
  },

  hide() {
    this.bubble.classList.remove("show");
    this.current = null;
    this.openedByClick = false;
  },

  /* Uso: `Tooltip.icon("Explicação simples aqui")` dentro de qualquer
     template HTML — gera um "?" pequeno, com foco por teclado incluso. */
  icon(text) {
    const div = document.createElement("div");
    div.textContent = text;
    // innerHTML já escapa &/</>, mas não aspas — precisamos escapá-las à
    // parte porque o texto vai dentro de um atributo HTML (data-tip="...").
    const safe = div.innerHTML.replace(/"/g, "&quot;");
    return `<span class="tip-trigger" tabindex="0" role="button" aria-label="Ajuda: ${safe}" data-tip="${safe}">?</span>`;
  },
};
