/* =========================================================================
   ONBOARDING.JS — Diagnóstico inicial (até 5 perguntas de alternativa)
   Calcula: nível do usuário (iniciante/intermediário/avançado) e objetivo
   principal, usados para personalizar toda a experiência.
   ========================================================================= */

const Onboarding = {
  currentIndex: -1, // -1 = tela de boas-vindas
  answers: [],
  introData: null,

  init() {
    const profile = Store.get(STORAGE_KEYS.PROFILE, null);
    if (!profile) {
      this.show();
    }
    document.getElementById("redoOnboardingBtn")?.addEventListener("click", () => this.show());
    document.getElementById("resetBtn")?.addEventListener("click", () => {
      if (confirm("Isso vai limpar todos os seus dados salvos (perfil, transações e progresso). Continuar?")) {
        Store.clearAll();
        location.reload();
      }
    });
  },

  show() {
    this.currentIndex = -1;
    this.answers = [];
    this.introData = null;
    document.getElementById("onboarding").classList.remove("hidden");
    this.renderWelcome();
  },

  hide() {
    document.getElementById("onboarding").classList.add("hidden");
  },

  renderWelcome() {
    const card = document.getElementById("onboardingCard");
    card.innerHTML = `
      <div class="onboarding-welcome">
        <img src="assets/polvin.svg" alt="POLVIn, o mascote do Fin+" class="mascot-img mascot-lg" />
        <h2>Oi! Eu sou o POLVIn 👋</h2>
        <p class="text-soft">Antes de começar, vamos conhecer um pouco sobre você e fazer ${ONBOARDING_QUESTIONS.length} perguntas rápidas para entender seu nível e personalizar sua trilha — do zero ao avançado.</p>
        <button class="btn btn-primary btn-block mt-16" id="startOnboardingBtn">Começar diagnóstico</button>
      </div>
    `;
    document.getElementById("startOnboardingBtn").addEventListener("click", () => this.renderIntro());
  },

  /* ---------- Etapa "Sobre você" (idade, situação, renda, objetivo) ---------- */
  renderIntro() {
    const card = document.getElementById("onboardingCard");
    card.innerHTML = `
      <div class="text-soft text-sm">Antes das perguntas de perfil</div>
      <div class="onboarding-question">Um pouco sobre você</div>
      <div class="field">
        <label for="introIdade">Sua idade</label>
        <input type="number" id="introIdade" min="1" max="120" placeholder="Ex: 28" />
      </div>
      <div class="field">
        <label for="introSituacao">Situação atual</label>
        <select id="introSituacao">${WORK_SITUATIONS.map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
      </div>
      <div class="field">
        <label for="introRenda">Faixa de renda mensal</label>
        <select id="introRenda">${INCOME_RANGES.map((r) => `<option value="${r}">${r}</option>`).join("")}</select>
      </div>
      <div class="field">
        <label>Qual é o seu principal objetivo agora?</label>
        <div class="life-goals-grid" id="introObjetivoGrid">
          ${LIFE_GOALS.map((g) => `<button class="life-goal-btn" data-id="${g.id}"><span class="emoji">${g.emoji}</span>${g.label}</button>`).join("")}
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-16" id="introContinueBtn">Continuar</button>
    `;

    let objetivoSelecionado = null;
    card.querySelectorAll(".life-goal-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".life-goal-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        objetivoSelecionado = btn.dataset.id;
      });
    });

    document.getElementById("introContinueBtn").addEventListener("click", () => {
      if (!objetivoSelecionado) {
        alert("Escolha um objetivo principal para continuar.");
        return;
      }
      this.introData = {
        idade: parseInt(document.getElementById("introIdade").value) || null,
        situacao: document.getElementById("introSituacao").value,
        renda: document.getElementById("introRenda").value,
        objetivo: objetivoSelecionado,
      };
      this.next();
    });
  },

  next() {
    this.currentIndex++;
    if (this.currentIndex >= ONBOARDING_QUESTIONS.length) {
      this.finish();
      return;
    }
    this.renderQuestion();
  },

  renderQuestion() {
    const q = ONBOARDING_QUESTIONS[this.currentIndex];
    const card = document.getElementById("onboardingCard");

    const progressHtml = ONBOARDING_QUESTIONS.map((_, i) =>
      `<span class="${i <= this.currentIndex ? "done" : ""}"></span>`
    ).join("");

    card.innerHTML = `
      <div class="onboarding-progress">${progressHtml}</div>
      <div class="text-soft text-sm">Pergunta ${this.currentIndex + 1} de ${ONBOARDING_QUESTIONS.length}</div>
      <div class="onboarding-question">${q.pergunta}</div>
      <div class="onboarding-options">
        ${q.opcoes.map((op, i) => `<button class="onboarding-option" data-idx="${i}">${op.texto}</button>`).join("")}
      </div>
    `;

    card.querySelectorAll(".onboarding-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const opt = q.opcoes[Number(btn.dataset.idx)];
        this.answers.push({ questionId: q.id, ...opt });
        this.next();
      });
    });
  },

  finish() {
    const totalPontos = this.answers.reduce((sum, a) => sum + a.pontos, 0);
    let nivel = "iniciante";
    if (totalPontos >= 15) nivel = "avancado";
    else if (totalPontos >= 9) nivel = "intermediario";

    // objetivo principal = tag da resposta da pergunta 2 (motivo de investir)
    const objetivoAnswer = this.answers[1];
    const objetivo = objetivoAnswer ? objetivoAnswer.tag : "geral";

    const profile = {
      nivel,
      pontos: totalPontos,
      objetivo,
      respostas: this.answers,
      pessoal: this.introData,
      criadoEm: new Date().toISOString(),
    };
    Store.set(STORAGE_KEYS.PROFILE, profile);

    this.renderResult(profile);
  },

  renderResult(profile) {
    const card = document.getElementById("onboardingCard");
    const nivelLabels = {
      iniciante: { emoji: "🌱", nome: "Iniciante", desc: "Vamos começar pelos fundamentos: orçamento, reserva de emergência e os primeiros investimentos seguros." },
      intermediario: { emoji: "📈", nome: "Intermediário", desc: "Você já tem uma base. Vamos aprofundar em renda fixa, diversificação e os primeiros passos na renda variável." },
      avancado: { emoji: "🚀", nome: "Avançado", desc: "Você já entende o mercado. Vamos direto às estratégias avançadas, análise fundamentalista e alocação de risco." },
    };
    const info = nivelLabels[profile.nivel];
    const goalInfo = profile.pessoal && GOAL_TEMPLATES[profile.pessoal.objetivo];
    const goalLabel = profile.pessoal && LIFE_GOALS.find((g) => g.id === profile.pessoal.objetivo);

    card.innerHTML = `
      <div class="onboarding-result">
        <img src="assets/polvin.svg" alt="POLVIn" class="mascot-img mascot-md" />
        <div class="onboarding-emoji" style="margin-top:-8px">${info.emoji}</div>
        <h2>Perfil: ${info.nome}</h2>
        <p class="text-soft">${info.desc}</p>
        ${
          goalInfo
            ? `<div class="alert-box info" style="text-align:left">🎯 Seu objetivo agora é <b>${goalLabel.emoji} ${goalLabel.label}</b>. Já criamos um cofrinho <b>"${goalInfo.emoji} ${goalInfo.nome}"</b> com meta de ${goalInfo.metaSugerida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} na aba Carteira — ajuste o valor quando quiser.</div>`
            : ""
        }
        <button class="btn btn-primary btn-block mt-16" id="finishOnboardingBtn">Entrar no Fin+</button>
      </div>
    `;
    document.getElementById("finishOnboardingBtn").addEventListener("click", () => {
      this.hide();
      if (profile.pessoal && profile.pessoal.objetivo) {
        Goals.ensureTemplateGoal(profile.pessoal.objetivo);
      }
      document.dispatchEvent(new CustomEvent("profile:updated"));
    });
  },
};
