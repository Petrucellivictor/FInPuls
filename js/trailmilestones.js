/* =========================================================================
   TRAILMILESTONES.JS — Detecção dos 2 marcos de celebração maior (RFC-037
   Fase 1): "nível completo" (todas as lições de UM level entry de
   Trail.levels()/Business.levels() atingem 100%) e "N lições" (a cada 5
   lições cumulativas concluídas na trilha). Único ouvinte de
   "course:updated" para este fim (Software Architect, Decisão 3).

   ACOPLAMENTO: só LEITURA de funções já públicas (Trail.flatLessons(),
   Trail.levels(), Trail.getProgress()/Business.getProgress()) — nunca
   escreve progresso, nunca introduz uma segunda fonte de verdade (critério
   de aceite 1/2 da RFC-037). O único dado próprio persistido aqui é
   STORAGE_KEYS.CELEBRATIONS_SEEN, que guarda só "até onde a celebração já
   avisou o usuário", nunca se uma lição foi feita.

   IDEMPOTENTE POR NATUREZA: "course:updated" dispara mesmo em caminhos que
   não representam progresso novo (quiz reprovado fechado, lição já feita
   sendo refeita) — check() sempre recomputa do zero e compara contra o
   marcador salvo, nunca assume "1 disparo = 1 lição nova".
   ========================================================================= */

const TrailMilestones = {
  // Cadência confirmada pelo Gamification Designer (RFC-037, seção 4,
  // item 1) — constante nomeada, nunca hardcoded em mais de 1 lugar.
  LICOES_MILESTONE_STEP: 5,

  /* Nível (fonte:id de Trail.levels()/Business.levels()) → ids de
     ACHIEVEMENTS cujo checker corresponde EXATAMENTE à conclusão daquele
     nível específico — usado só para coordenar com Achievements.notify()
     (critério de aceite 13), nunca para decidir se a celebração de "nível
     completo" dispara (isso já é 100% controlado por level.licoes vs.
     getProgress()). Mantido à mão (não derivado de Achievements.CHECKERS)
     — ver risco registrado na RFC-037/Software Architect: uma conquista
     nova de "nível completo" adicionada no futuro sem atualizar este mapa
     reintroduz o risco de notificação duplicada, silenciosamente.

     trilha_unificada_completa (exige COURSE E HISTORY_COURSE 100%) e
     primeiro_passo_empreendedor (dispara na 1ª lição, não na conclusão de
     um nível) são deliberadamente EXCLUÍDOS: não correspondem a um único
     level.id de forma inequívoca — ver registro do Frontend Engineer na
     RFC-037 para o raciocínio completo. */
  LEVEL_ACHIEVEMENT_MAP: {
    "financeira:nivel1": ["nivel1_completo"],
    "financeira:nivel2": ["renda_fixa_completa"],
    "financeira:nivel3": ["renda_variavel_completa"],
    "financeira:nivel6": ["trilha_completa"], // último nível de COURSE
    "historia:hnivel4": ["historiador"], // último nível de HISTORY_COURSE
    "empreender:enivel5": ["mestre_empreendedor"], // último nível de BUSINESS_COURSE
  },

  getAllMarkers() {
    return Store.get(STORAGE_KEYS.CELEBRATIONS_SEEN, {});
  },

  levelKey(level) {
    return `${level.fonte || "empreender"}:${level.id}`;
  },

  isLevelDone(level, getProgress) {
    const progress = getProgress(level.fonte);
    return level.licoes.length > 0 && level.licoes.every((l) => !!progress[l.id]);
  },

  /* escopo: "trilha" (Trail, financeira+história unificadas) ou
     "empreender" (Business) — marcadores independentes, mesma separação
     que COURSE_PROGRESS/HISTORY_PROGRESS/BUSINESS_PROGRESS já usam.
     getProgress(fonte) — Trail passa (fonte) => Trail.getProgress(fonte);
     Business ignora o parâmetro (uma trilha só). */
  check(escopo, flat, levels, getProgress) {
    const all = this.getAllMarkers();
    // Primeira execução deste escopo (marcador nunca persistido antes):
    // "sela" o estado atual sem celebrar retroativamente progresso feito
    // ANTES desta feature existir — sem isso, usuários com nível já
    // concluído há semanas veriam uma celebração "atrasada" na próxima
    // lição qualquer que fizessem, o que não é o marco real.
    const firstRun = !all[escopo];
    const marker = all[escopo] || { lastMilestoneCount: 0, completedLevels: [] };
    let dirty = firstRun;

    const doneCount = flat.filter((e) => !!getProgress(e.fonte)[e.lesson.id]).length;
    const milestone = Math.floor(doneCount / this.LICOES_MILESTONE_STEP) * this.LICOES_MILESTONE_STEP;
    if (milestone > marker.lastMilestoneCount && milestone > 0) {
      marker.lastMilestoneCount = milestone;
      dirty = true;
      if (!firstRun && typeof Fx !== "undefined") {
        Fx.milestoneCelebration({
          type: "licoes",
          titulo: "Sequência incrível!",
          subtitulo: `Você já completou ${milestone} lições nesta trilha.`,
        });
      }
    }

    levels.forEach((level) => {
      const key = this.levelKey(level);
      if (marker.completedLevels.includes(key)) return;
      if (!this.isLevelDone(level, getProgress)) return;

      marker.completedLevels.push(key);
      dirty = true;
      if (firstRun) return; // seed silencioso — ver comentário acima

      const achIds = this.LEVEL_ACHIEVEMENT_MAP[key] || [];
      const achievementMerge = achIds.length && typeof ACHIEVEMENTS !== "undefined" ? ACHIEVEMENTS.find((a) => a.id === achIds[0]) || null : null;
      if (achIds.length && typeof Achievements !== "undefined") {
        Achievements.suppressNotifyOnce(achIds);
      }

      if (typeof Fx !== "undefined") {
        const theme = typeof TRAIL_THEMES !== "undefined" ? TRAIL_THEMES.themeFor(level.fonte, level.id) : null;
        Fx.milestoneCelebration({
          type: "nivel",
          titulo: achievementMerge ? `${achievementMerge.titulo}!` : `${level.titulo} concluído!`,
          subtitulo: "Você terminou todas as lições deste nível.",
          achievementMerge,
          biomaId: theme ? theme.biomaId : null,
        });
      }
    });

    if (dirty) {
      all[escopo] = marker;
      Store.set(STORAGE_KEYS.CELEBRATIONS_SEEN, all);
    }
  },
};

document.addEventListener("course:updated", () => {
  if (typeof Trail !== "undefined") {
    TrailMilestones.check("trilha", Trail.flatLessons(), Trail.levels(), (fonte) => Trail.getProgress(fonte));
  }
  if (typeof Business !== "undefined") {
    TrailMilestones.check("empreender", Business.flatLessons(), Business.levels(), () => Business.getProgress());
  }
});
