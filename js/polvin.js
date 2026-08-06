/* =========================================================================
   POLVIN.JS — O mascote como personagem interativo
   - Avatar com a arte 3D real do POLVIn (Polvin-logo.png), flutuando em 3D
     via CSS (perspective + rotate + translateZ), com acessórios/bandeiras/
     molduras da Loja sobrepostos como selos (ver js/profile.js).
   - "Fala" com efeito de máquina de escrever + leitura em voz alta via
     Web Speech API nativa do navegador (sem nenhuma API externa/paga).
   - Assistente flutuante "Pergunte ao POLVIn": busca por palavras-chave
     na base de conhecimento do site (ASSISTANT_FAQ + glossário +
     investimentos + livros). NÃO é uma IA generativa — é transparente
     sobre isso na primeira mensagem do chat.
   ========================================================================= */

const Polvin = {
  _index: null,

  STOPWORDS: new Set([
    "que", "para", "com", "uma", "um", "dos", "das", "como", "mais", "seu", "sua", "seus", "suas",
    "ele", "ela", "eles", "elas", "isso", "essa", "esse", "este", "esta", "estes", "estas",
    "meu", "minha", "meus", "minhas", "voce", "sou", "sao", "tem", "tem", "foi", "ser",
    "nao", "mas", "por", "pra", "num", "numa", "nos", "nas", "dele", "dela",
    "qual", "quais", "onde", "quando", "porque", "porque", "aos", "das", "aquilo", "aquele", "aquela",
  ]),

  init() {
    this.initAssistant();
    document.addEventListener("equipped:updated", () => {
      const fab = document.getElementById("polvinFab");
      if (fab) fab.innerHTML = this.avatarHtml("sm");
    });
  },

  /* ---------- Avatar (arte 3D real do POLVIn + acessórios equipados) ---------- */

  getEquipped() {
    return Store.get(STORAGE_KEYS.EQUIPPED, {});
  },

  avatarHtml(size) {
    const equipped = this.getEquipped();
    const acessorio = equipped.acessorio && SHOP_ITEMS.find((i) => i.id === equipped.acessorio);
    const bandeira = equipped.bandeira && SHOP_ITEMS.find((i) => i.id === equipped.bandeira);
    const moldura = equipped.moldura && SHOP_ITEMS.find((i) => i.id === equipped.moldura);
    const cor = equipped.cor && SHOP_ITEMS.find((i) => i.id === equipped.cor);

    const imgStyle = [moldura ? `border-color:${moldura.cor}` : "", cor ? `filter:${cor.filtro}` : ""].filter(Boolean).join(";");

    return `
      <div class="polvin-3d polvin-${size || "md"}">
        <div class="polvin-3d-inner">
          <img src="Polvin-logo.png" alt="POLVIn" class="polvin-avatar-img" style="${imgStyle}" />
          ${acessorio ? `<span class="polvin-accessory-hat">${acessorio.emoji}</span>` : ""}
          ${bandeira ? `<span class="polvin-accessory-flag">${bandeira.emoji}</span>` : ""}
        </div>
      </div>`;
  },

  /* ---------- Fala: máquina de escrever + voz nativa do navegador ---------- */

  typewrite(el, text, avatarEl, speed) {
    if (!el) return;
    el.textContent = "";
    if (avatarEl) avatarEl.classList.add("talking");
    let i = 0;
    const step = () => {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(step, speed || 16);
      } else if (avatarEl) {
        avatarEl.classList.remove("talking");
      }
    };
    step();
  },

  pickPtBrVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("pt")) || null;
  },

  speak(text, avatarEl) {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não tem suporte a leitura em voz alta (Web Speech API).");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = this.pickPtBrVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice ? voice.lang : "pt-BR";
    utter.rate = 1;
    if (avatarEl) {
      utter.onstart = () => avatarEl.classList.add("talking");
      utter.onend = () => avatarEl.classList.remove("talking");
      utter.onerror = () => avatarEl.classList.remove("talking");
    }
    window.speechSynthesis.speak(utter);
  },

  /* Renderiza avatar + balão de fala num container, com efeito de digitação
     e um botão opcional "Ouvir" (Web Speech API). Reusado em várias telas. */
  renderBubble(container, text, opts) {
    if (!container) return;
    const options = opts || {};
    const size = options.size || "md";
    const withListen = options.withListen !== false;
    const title = options.title || "POLVIn";

    container.innerHTML = `
      <div class="polvin-bubble-row">
        ${this.avatarHtml(size)}
        <div class="polvin-bubble">
          <b class="polvin-bubble-title">${title}</b>
          <p class="polvin-bubble-text"></p>
          ${withListen ? `<button class="btn btn-outline btn-sm polvin-listen-btn">🔊 Ouvir</button>` : ""}
        </div>
      </div>
    `;

    const avatarEl = container.querySelector(".polvin-3d");
    const textEl = container.querySelector(".polvin-bubble-text");
    this.typewrite(textEl, text, avatarEl);

    const listenBtn = container.querySelector(".polvin-listen-btn");
    if (listenBtn) listenBtn.addEventListener("click", () => this.speak(text, avatarEl));
  },

  /* Igual a renderBubble, mas para textos com vários parágrafos (o conto da
     trilha de história): o POLVIn "conta" um parágrafo por vez. */
  renderStory(container, paragraphs, opts) {
    if (!container) return;
    const options = opts || {};
    const size = options.size || "md";
    const withListen = options.withListen !== false;
    const fullText = paragraphs.join(" ");

    container.innerHTML = `
      <div class="polvin-bubble-row">
        ${this.avatarHtml(size)}
        <div class="polvin-bubble">
          <b class="polvin-bubble-title">${options.title || "POLVIn conta a história"}</b>
          <div class="story-text" id="polvinStoryText"></div>
          ${withListen ? `<button class="btn btn-outline btn-sm polvin-listen-btn">🔊 Ouvir a história completa</button>` : ""}
        </div>
      </div>
    `;

    const avatarEl = container.querySelector(".polvin-3d");
    const target = container.querySelector(".story-text");
    let idx = 0;
    const next = () => {
      if (idx >= paragraphs.length) return;
      const p = document.createElement("p");
      target.appendChild(p);
      const text = paragraphs[idx];
      this.typewrite(p, text, avatarEl, 14);
      idx++;
      setTimeout(next, text.length * 14 + 260);
    };
    next();

    const listenBtn = container.querySelector(".polvin-listen-btn");
    if (listenBtn) listenBtn.addEventListener("click", () => this.speak(fullText, avatarEl));
  },

  /* ---------- Base de conhecimento (busca por palavras-chave) ---------- */

  normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  },

  buildIndex() {
    if (this._index) return this._index;
    const index = [];

    ASSISTANT_FAQ.forEach((f) => {
      index.push({
        texto: f.resposta,
        palavras: this.normalize(f.gatilhos.join(" ") + " " + f.resposta),
        peso: this.normalize(f.gatilhos.join(" ")),
      });
    });
    GLOSSARY.forEach((g) => {
      index.push({
        texto: `${g.termo}: ${g.definicao}`,
        palavras: this.normalize(g.termo + " " + g.definicao),
        peso: this.normalize(g.termo),
      });
    });
    INVESTMENTS.forEach((inv) => {
      index.push({
        texto: `${inv.nome}: ${inv.descricao} Indicado para: ${inv.indicadoPara}.`,
        palavras: this.normalize(inv.nome + " " + inv.descricao + " " + inv.indicadoPara),
        peso: this.normalize(inv.nome),
      });
    });
    BOOKS.forEach((b) => {
      index.push({
        texto: `"${b.titulo}" (${b.autor}) — ${b.pitch}`,
        palavras: this.normalize(b.titulo + " " + b.autor + " " + b.tema + " " + b.pitch),
        peso: this.normalize(b.titulo + " " + b.tema),
      });
    });

    this._index = index;
    return index;
  },

  search(query) {
    const tokens = this.normalize(query)
      .split(/\W+/)
      .filter((t) => t.length > 2 && !this.STOPWORDS.has(t));
    if (!tokens.length) return null;

    let best = null;
    let bestScore = 0;
    this.buildIndex().forEach((entry) => {
      let score = 0;
      tokens.forEach((t) => {
        if (entry.peso.includes(t)) score += 2;
        else if (entry.palavras.includes(t)) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    return bestScore >= 2 ? best.texto : null;
  },

  answer(query) {
    return this.search(query) || ASSISTANT_FALLBACKS[Math.floor(Math.random() * ASSISTANT_FALLBACKS.length)];
  },

  /* ---------- Widget flutuante "Pergunte ao POLVIn" ---------- */

  initAssistant() {
    if (document.getElementById("polvinFab")) return;
    const fab = document.createElement("button");
    fab.className = "polvin-fab";
    fab.id = "polvinFab";
    fab.title = "Pergunte ao POLVIn";
    fab.innerHTML = this.avatarHtml("sm");
    document.body.appendChild(fab);
    fab.addEventListener("click", () => this.toggleChat());
  },

  toggleChat() {
    const existing = document.getElementById("polvinChatPanel");
    if (existing) {
      existing.remove();
      return;
    }
    this.openChat();
  },

  openChat() {
    const panel = document.createElement("div");
    panel.id = "polvinChatPanel";
    panel.className = "polvin-chat-panel";
    panel.innerHTML = `
      <div class="polvin-chat-header">
        ${this.avatarHtml("sm")}
        <div class="polvin-chat-header-info">
          <b>POLVIn</b>
          <div class="text-soft text-sm">Tire suas dúvidas sobre o app</div>
        </div>
        <button class="polvin-chat-close" id="polvinChatClose">✕</button>
      </div>
      <div class="polvin-chat-messages" id="polvinChatMessages"></div>
      <div class="polvin-chat-input-row">
        <input type="text" id="polvinChatInput" placeholder="Digite sua dúvida..." />
        <button class="btn btn-primary btn-sm" id="polvinChatSendBtn">➤</button>
      </div>
    `;
    document.body.appendChild(panel);

    document.getElementById("polvinChatClose").addEventListener("click", () => panel.remove());
    const input = document.getElementById("polvinChatInput");
    const send = () => this.handleUserMessage(input.value);
    document.getElementById("polvinChatSendBtn").addEventListener("click", send);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });

    this.pushMessage(
      "polvin",
      "Oi! Sou o POLVIn 🐙 Pode perguntar sobre qualquer aba, funcionalidade ou termo financeiro do PolvIn. Um aviso importante: eu busco respostas dentro do conteúdo do próprio site — ainda não sou uma IA generativa de verdade!"
    );
    setTimeout(() => input.focus(), 150);
  },

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  pushMessage(who, text) {
    const messages = document.getElementById("polvinChatMessages");
    if (!messages) return;
    const row = document.createElement("div");
    row.className = `polvin-msg ${who}`;
    if (who === "polvin") {
      row.innerHTML = `${this.avatarHtml("xs")}<div class="polvin-msg-bubble"><p></p></div>`;
      messages.appendChild(row);
      this.typewrite(row.querySelector("p"), text, row.querySelector(".polvin-3d"), 12);
    } else {
      row.innerHTML = `<div class="polvin-msg-bubble">${this.escapeHtml(text)}</div>`;
      messages.appendChild(row);
    }
    messages.scrollTop = messages.scrollHeight;
  },

  handleUserMessage(rawText) {
    const text = (rawText || "").trim();
    if (!text) return;
    this.pushMessage("user", text);
    document.getElementById("polvinChatInput").value = "";
    setTimeout(() => this.pushMessage("polvin", this.answer(text)), 350);

    const asked = Store.get(STORAGE_KEYS.POLVIN_QUESTIONS_ASKED, 0) + 1;
    Store.set(STORAGE_KEYS.POLVIN_QUESTIONS_ASKED, asked);
    const log = Store.get(STORAGE_KEYS.POLVIN_LOG, []);
    log.push({ data: new Date().toISOString() });
    Store.set(STORAGE_KEYS.POLVIN_LOG, log);
    if (typeof Achievements !== "undefined") Achievements.checkAll();
    if (typeof Engagement !== "undefined") Engagement.checkAwards();
  },
};
