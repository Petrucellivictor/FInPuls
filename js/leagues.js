/* =========================================================================
   LEAGUES.JS — Aba Desafios: seu placar e Ligas locais.
   IMPORTANTE: o Fin+ não tem servidor, então não existe um ranking global
   automático entre instalações diferentes. As "Ligas" são um placar local
   e manual — você cria a liga, adiciona os nomes dos amigos e atualiza a
   pontuação deles de vez em quando (comparando o que cada um vê no
   próprio Fin+). A SUA linha é sempre automática (sua pontuação real).
   ========================================================================= */

const Leagues = {
  init() {
    document.getElementById("leagueCreateBtn")?.addEventListener("click", () => this.createLeague());
    this.renderScoreboard();
    this.renderMedalTiers();
    this.renderLeagues();
    document.addEventListener("xp:updated", () => {
      this.renderScoreboard();
      this.renderMedalTiers();
    });
    document.addEventListener("coins:updated", () => {
      this.renderScoreboard();
      this.renderMedalTiers();
    });
  },

  renderMedalTiers() {
    const container = document.getElementById("medalTiersRow");
    if (!container) return;
    const score = Learn.totalScore();
    container.innerHTML = MEDAL_TIERS.map((tier) => {
      const reached = score >= tier.min;
      return `
        <div class="medal-tile ${reached ? "reached" : ""}">
          <div class="medal-emoji">${tier.emoji}</div>
          <div class="medal-name">${tier.nome}</div>
          <div class="text-soft" style="font-size:11px">${tier.min.toLocaleString("pt-BR")}+ pts</div>
        </div>`;
    }).join("");
  },

  getLeagues() {
    return Store.get(STORAGE_KEYS.LEAGUES, []);
  },
  setLeagues(list) {
    Store.set(STORAGE_KEYS.LEAGUES, list);
  },

  createLeague() {
    const input = document.getElementById("leagueNomeInput");
    const nome = input.value.trim();
    if (!nome) {
      alert("Dê um nome para a liga.");
      return;
    }
    const leagues = this.getLeagues();
    leagues.push({ id: Date.now().toString(), nome, criadaEm: new Date().toISOString(), participantes: [] });
    this.setLeagues(leagues);
    input.value = "";
    this.renderLeagues();
  },

  removeLeague(id) {
    if (!confirm("Remover esta liga?")) return;
    this.setLeagues(this.getLeagues().filter((l) => l.id !== id));
    this.renderLeagues();
  },

  addParticipant(leagueId) {
    const input = document.querySelector(`[data-participant-input="${leagueId}"]`);
    const nome = input.value.trim();
    if (!nome) {
      alert("Informe o nome do amigo.");
      return;
    }
    const leagues = this.getLeagues();
    const league = leagues.find((l) => l.id === leagueId);
    league.participantes.push({ id: Date.now().toString(), nome, pontos: 0 });
    this.setLeagues(leagues);
    input.value = "";
    this.renderLeagues();
  },

  updateScore(leagueId, participantId, pontos) {
    const leagues = this.getLeagues();
    const league = leagues.find((l) => l.id === leagueId);
    const p = league.participantes.find((p) => p.id === participantId);
    if (p) p.pontos = pontos;
    this.setLeagues(leagues);
    this.renderLeagues();
  },

  removeParticipant(leagueId, participantId) {
    const leagues = this.getLeagues();
    const league = leagues.find((l) => l.id === leagueId);
    league.participantes = league.participantes.filter((p) => p.id !== participantId);
    this.setLeagues(leagues);
    this.renderLeagues();
  },

  renderScoreboard() {
    const container = document.getElementById("myScoreboard");
    if (!container) return;
    const score = Learn.totalScore();
    const medal = medalForScore(score);
    const nextMedal = MEDAL_TIERS.find((t) => t.min > score);
    container.innerHTML = `
      <div class="grid grid-2 kpi-row">
        <div class="card kpi"><div class="label">Sua pontuação total</div><div class="value">${medal.emoji} ${score.toLocaleString("pt-BR")}</div></div>
        <div class="card kpi"><div class="label">Medalha atual</div><div class="value">${medal.nome}</div></div>
      </div>
      ${nextMedal ? `<p class="text-sm text-soft">Faltam <b>${(nextMedal.min - score).toLocaleString("pt-BR")}</b> pontos para a medalha ${nextMedal.nome} ${nextMedal.emoji}.</p>` : ""}
    `;
  },

  renderLeagues() {
    const container = document.getElementById("leaguesList");
    if (!container) return;
    const leagues = this.getLeagues();
    const myScore = Learn.totalScore();
    const acc = Store.get(STORAGE_KEYS.ACCOUNT, null);
    const myName = acc ? acc.nome.split(" ")[0] : "Você";

    if (!leagues.length) {
      container.innerHTML = `<div class="empty-state"><span class="emoji">🏳️</span>Nenhuma liga criada ainda. Crie uma acima e desafie seus amigos!</div>`;
      return;
    }

    container.innerHTML = leagues
      .map((league) => {
        const todos = [{ id: "__you__", nome: `${myName} (você)`, pontos: myScore, isYou: true }, ...league.participantes];
        todos.sort((a, b) => b.pontos - a.pontos);

        return `
        <div class="card league-card mt-16">
          <div class="flex-between">
            <h3 style="margin:0">🏆 ${league.nome}</h3>
            <button class="btn btn-outline btn-sm" data-remove-league="${league.id}">Remover liga</button>
          </div>
          <div class="table-scroll"><table class="compare-table mt-8">
            <thead><tr><th>#</th><th>Participante</th><th>Pontos</th><th></th></tr></thead>
            <tbody>
              ${todos
                .map(
                  (p, i) => `
                <tr class="${i === 0 ? "row-best" : ""}">
                  <td>${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                  <td>${p.nome}</td>
                  <td class="mono">
                    ${
                      p.isYou
                        ? p.pontos.toLocaleString("pt-BR")
                        : `<input type="number" class="league-score-input" value="${p.pontos}" data-league="${league.id}" data-participant="${p.id}" min="0" style="width:90px;padding:4px 6px" />`
                    }
                  </td>
                  <td>${p.isYou ? "" : `<button class="del-btn" data-remove-participant="${league.id}:${p.id}" title="Remover">✕</button>`}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table></div>
          <div class="flex gap-8 mt-8">
            <input type="text" placeholder="Nome do amigo" data-participant-input="${league.id}" style="flex:1" />
            <button class="btn btn-primary btn-sm" data-add-participant="${league.id}">Adicionar amigo</button>
          </div>
          <p class="text-sm text-soft mt-8">Atualize a pontuação de cada amigo de vez em quando, comparando com a pontuação que ele vê na própria aba Perfil dele.</p>
        </div>`;
      })
      .join("");

    container.querySelectorAll("[data-remove-league]").forEach((btn) => btn.addEventListener("click", () => this.removeLeague(btn.dataset.removeLeague)));
    container.querySelectorAll("[data-add-participant]").forEach((btn) => btn.addEventListener("click", () => this.addParticipant(btn.dataset.addParticipant)));
    container.querySelectorAll(".league-score-input").forEach((input) => {
      input.addEventListener("change", () => this.updateScore(input.dataset.league, input.dataset.participant, parseInt(input.value) || 0));
    });
    container.querySelectorAll("[data-remove-participant]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [leagueId, participantId] = btn.dataset.removeParticipant.split(":");
        this.removeParticipant(leagueId, participantId);
      });
    });
  },
};
