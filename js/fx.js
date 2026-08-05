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

  dailyBonusToast(streak, coinBonus) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast level-toast";
    toast.innerHTML = `<span class="emoji">🔥</span><div><b>Ofensiva de ${streak} dia${streak === 1 ? "" : "s"}!</b><br/>Bônus de login: +${coinBonus} moedas</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  energyToast(amount, combo) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast level-toast";
    toast.innerHTML = `<span class="emoji">⚡</span><div><b>+${amount} energia!</b><br/>Você acertou ${combo} perguntas seguidas.</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  /* Ondulação (ripple) a partir do ponto de clique — dá feedback tátil a
     botões e nós clicáveis. O elemento precisa de position:relative e
     overflow:hidden para conter o efeito. */
  ripple(el, event) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple-effect";
    const size = Math.max(rect.width, rect.height) * 1.4;
    span.style.width = span.style.height = size + "px";
    span.style.left = (event.clientX - rect.left - size / 2) + "px";
    span.style.top = (event.clientY - rect.top - size / 2) + "px";
    el.appendChild(span);
    setTimeout(() => span.remove(), 650);
  },

  /* Anima um número subindo de `from` até `to` dentro do elemento,
     usado no contador de XP para dar sensação de progresso "ao vivo". */
  countUp(el, from, to, duration = 650, suffix = " XP") {
    if (!el || from === to) {
      if (el) el.textContent = `${to}${suffix}`;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = `${val}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
};
