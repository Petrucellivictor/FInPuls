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
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
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
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `<span class="emoji">🔥</span><div><b>Ofensiva de ${streak} dia${streak === 1 ? "" : "s"}!</b><br/>Bônus de login: +${coinBonus} moedas</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  /* Aviso leve do POLVIn (streak em risco, perto de subir de nível, etc.) —
     texto já vem com o emoji 🐙 embutido em Engagement.checkPolvinNotice(). */
  polvinNoticeToast(message) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast level-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `<div>${message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 5500);
  },

  energyToast(amount, combo) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast level-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
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

  /* =======================================================================
     BIBLIOTECA DE ANIMAÇÕES REUTILIZÁVEL — ver .claude/agents/ux-ui-
     design-lead.md ("Biblioteca de animações"). Cada função aqui dispara
     uma classe/keyframe nomeada em css/style.css — nunca reinventar o
     mesmo efeito tela a tela, sempre chamar a função existente.
     ======================================================================= */

  /* Moedas voando de `fromEl` até `toEl` (ex.: do card de conclusão de
     lição até o contador de moedas do header) via Web Animations API —
     cada moeda percorre um arco (sobe, depois desce até o destino), sem
     depender de nenhuma lib externa. */
  coinBurst(fromEl, toEl, count = 6) {
    if (!fromEl || !toEl || typeof fromEl.getBoundingClientRect !== "function") return;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const originX = fromRect.left + fromRect.width / 2;
    const originY = fromRect.top + fromRect.height / 2;
    const dx = toRect.left + toRect.width / 2 - originX;
    const dy = toRect.top + toRect.height / 2 - originY;

    for (let i = 0; i < count; i++) {
      const coin = document.createElement("span");
      coin.className = "fx-coin";
      coin.textContent = "🪙";
      coin.style.left = `${originX}px`;
      coin.style.top = `${originY}px`;
      document.body.appendChild(coin);

      const spread = (Math.random() - 0.5) * 40;
      const midX = dx * (0.35 + Math.random() * 0.2) + spread;
      const midY = dy * 0.25 - 70 - Math.random() * 40;
      const anim = coin.animate(
        [
          { transform: "translate(0px, 0px) scale(0.5) rotate(0deg)", opacity: 0 },
          { transform: `translate(${midX}px, ${midY}px) scale(1) rotate(180deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.4) rotate(360deg)`, opacity: 0 },
        ],
        { duration: 700, delay: i * 60, easing: "cubic-bezier(0.22, 0.8, 0.25, 1)", fill: "forwards" }
      );
      anim.onfinish = () => coin.remove();
    }
  },

  /* "+X XP"/"+X moedas" flutuando e desaparecendo a partir de um elemento
     de referência (o botão que acabou de conceder a recompensa, por ex.). */
  xpPop(text, atEl) {
    if (!atEl) return;
    const rect = atEl.getBoundingClientRect();
    const pop = document.createElement("div");
    pop.className = "fx-xp-pop";
    pop.textContent = text;
    pop.style.left = `${rect.left + rect.width / 2}px`;
    pop.style.top = `${rect.top}px`;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1150);
  },

  /* Pulso de brilho verde num elemento (ex.: um card que acabou de ser
     concluído/aprovado). Reforça reflow para permitir replays seguidos
     da mesma animação no mesmo elemento. */
  successGlow(el) {
    if (!el) return;
    el.classList.remove("fx-success-glow");
    void el.offsetWidth;
    el.classList.add("fx-success-glow");
  },

  /* "Pop" de desbloqueio de conquista/emblema: escala com leve rotação
     + um brilho (shine) atravessando o card uma vez. */
  badgeUnlock(el) {
    if (!el) return;
    el.classList.remove("fx-badge-unlock");
    void el.offsetWidth;
    el.classList.add("fx-badge-unlock");
  },

  /* Entrada suave de tela/painel (usado pela troca de abas) — evita o
     "pop" seco de um painel simplesmente aparecer com display:block. */
  screenEnter(el) {
    if (!el) return;
    el.classList.remove("fx-screen-enter");
    void el.offsetWidth;
    el.classList.add("fx-screen-enter");
  },

  /* HTML de um loading "orbital" (3 pontos girando em torbita, cores da
     marca) para usar em qualquer lugar que hoje mostra só "Carregando...". */
  loadingOrbitHtml() {
    return `<div class="fx-loading-orbit"><span></span><span></span><span></span></div>`;
  },

  /* Faz o POLVIn "comemorar" (pulinho + giro leve) — procura um
     `.polvin-3d` dentro de `containerEl` (ou o próprio elemento, se já
     for um). Usado sempre que uma recompensa real é concedida, nunca
     numa tela que só repete algo já feito antes. */
  mascotCelebrate(containerEl) {
    if (!containerEl) return;
    const avatarEl = containerEl.classList && containerEl.classList.contains("polvin-3d")
      ? containerEl
      : containerEl.querySelector(".polvin-3d");
    if (!avatarEl) return;
    avatarEl.classList.remove("celebrating");
    void avatarEl.offsetWidth;
    avatarEl.classList.add("celebrating");
    setTimeout(() => avatarEl.classList.remove("celebrating"), 750);
  },
};
