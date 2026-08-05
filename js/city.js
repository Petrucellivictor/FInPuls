/* =========================================================================
   CITY.JS — Cidade Financeira: meta-jogo visual onde marcos de progresso
   (conquistas já existentes) constroem terrenos na cidade do jogador.
   Não guarda estado próprio — deriva 100% de Achievements.getUnlocked()
   e do mapeamento id→construção em CITY_BUILDINGS (data.js).
   ========================================================================= */

const City = {
  render() {
    const container = document.getElementById("cityGrid");
    if (!container) return;

    const unlocked = Achievements.getUnlocked();
    const builtCount = CITY_BUILDINGS.filter((b) => unlocked.includes(b.id)).length;

    container.innerHTML = CITY_BUILDINGS.map((b) => {
      const done = unlocked.includes(b.id);
      const achievement = ACHIEVEMENTS.find((a) => a.id === b.id);
      const hint = done ? b.descricaoConstruida : achievement ? achievement.descricao : "";
      return `
      <div class="city-plot ${done ? "built" : "locked"}" title="${hint}">
        <div class="city-plot-emoji">${done ? b.emoji : "🔲"}</div>
        <div class="city-plot-nome">${done ? b.nome : "???"}</div>
      </div>`;
    }).join("");

    const label = document.getElementById("cityProgressLabel");
    if (label) label.textContent = `${builtCount}/${CITY_BUILDINGS.length} construções`;

    const bar = document.getElementById("cityProgressBar");
    if (bar) bar.style.width = `${Math.round((builtCount / CITY_BUILDINGS.length) * 100)}%`;
  },

  init() {
    this.render();
  },
};
