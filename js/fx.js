/* =========================================================================
   FX.JS — Pequenos efeitos visuais compartilhados (confete, toast de
   subida de nível) usados pela trilha gamificada para tornar a interface
   mais animada e recompensadora.
   ========================================================================= */

const Fx = {
  CONFETTI_COLORS: ["#6C4FCF", "#4FAE4A", "#E8A33D", "#D9534F", "#3B6E8F"],

  confetti(container, count = 26) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = this.CONFETTI_COLORS[i % this.CONFETTI_COLORS.length];
      piece.style.animationDelay = Math.random() * 0.3 + "s";
      piece.style.setProperty("--rot", Math.floor(Math.random() * 360) + "deg");
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 1700);
    }
  },

  levelUpToast(tier) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast level-toast";
    toast.innerHTML = `<span class="emoji">${tier.emoji}</span><div><b>Subiu de nível!</b><br/>Agora você é: ${tier.titulo}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },
};
