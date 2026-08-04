/* =========================================================================
   TABS.JS — Navegação entre as abas da aplicação
   ========================================================================= */

const Tabs = {
  init() {
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.go(btn.dataset.tab));
    });
  },

  go(tabId) {
    document.querySelectorAll(".tab-btn").forEach((b) => {
      const isActive = b.dataset.tab === tabId;
      b.classList.toggle("active", isActive);
      if (isActive) b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("hidden", p.id !== `tab-${tabId}`);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    // Notifica módulos que podem precisar re-renderizar ao abrir a aba
    document.dispatchEvent(new CustomEvent("tab:changed", { detail: { tabId } }));
  },
};
