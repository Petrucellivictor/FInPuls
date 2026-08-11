/* =========================================================================
   TRAILTHEMES.JS — Temas visuais por bioma (RFC-037 Fase 2)
   Mapa estático de APRESENTAÇÃO sobre a trilha (Aprender/Empreender): qual
   "zona do oceano" cada nível já existente veste. Deliberadamente FORA de
   data.js (Software Architect, Decisão 2) — data.js descreve CONTEÚDO
   educativo; bioma é uma decisão visual sobre esse conteúdo, e as duas
   coisas mudam por motivos e ritmos diferentes.

   Chaveado por level.id (não por posição no array) — mesmo princípio de
   identidade que progressKey()/isDone() já usam. Um nível novo (Onda
   futura) sem entrada aqui cai no fallback DEFAULT, nunca quebra.

   ACOPLAMENTO: só leitura passiva, nunca importa/chama Trail ou Business
   — é dado estático puro, igual a ACHIEVEMENTS.

   5 biomas (UX/UI Designer, Decisão 2) — extensão da mesma metáfora que
   js/trailscene3d.js (RFC-036) já estabeleceu (o oceano onde o PolvIn
   vive, ficando mais fundo/mais escuro conforme o jogador avança):
     recife-raso        🐠 início/fundamentos, água clara
     aguas-calmas       🐢 estabilidade/previsibilidade
     correnteza-dourada 🐟 crescimento/oportunidade
     aguas-turbulentas  🐡 tensão/complexidade
     abismo-profundo    💎 profundidade/maestria (nível mais difícil)
   ========================================================================= */

const TRAIL_THEMES = {
  financeira: {
    nivel1: { biomaId: "recife-raso" }, // Fundamentos e Comportamento Financeiro
    nivel2: { biomaId: "aguas-calmas" }, // Renda Fixa
    nivel3: { biomaId: "correnteza-dourada" }, // Renda Variável
    nivel4: { biomaId: "abismo-profundo" }, // Diversificação e Risco
    nivel5: { biomaId: "aguas-turbulentas" }, // Avançado
    nivel6: { biomaId: "abismo-profundo" }, // Mercado Avançado (Pro)
  },
  historia: {
    hnivel1: { biomaId: "recife-raso" }, // Colônia
    hnivel_imperio: { biomaId: "correnteza-dourada" }, // Império
    hnivel2: { biomaId: "correnteza-dourada" }, // Café/Vargas
    hnivel_jk: { biomaId: "aguas-turbulentas" }, // Redemocratização/JK
    hnivel3: { biomaId: "abismo-profundo" }, // Ditadura
    hnivel4: { biomaId: "aguas-calmas" }, // Plano Real
  },
  empreender: {
    enivel1: { biomaId: "recife-raso" }, // Empreender x Ser Empresário
    enivel_modelo: { biomaId: "correnteza-dourada" }, // Modelo de negócio
    enivel2: { biomaId: "aguas-calmas" }, // MEI e Simples Nacional
    enivel3: { biomaId: "aguas-turbulentas" }, // Lucro Presumido e Lucro Real
    enivel4: { biomaId: "abismo-profundo" }, // Obrigações fiscais e contábeis
    enivel5: { biomaId: "aguas-turbulentas" }, // Gestão de Pessoas e Finanças
  },
  // Nível sem entrada mapeada ainda (Onda nova) — nunca quebra o layout.
  DEFAULT: { biomaId: "recife-raso" },

  /* Lookup síncrono e read-only usado por Trail.levelHtml()/Business.
     levelHtml() — mesma regra de fallback nos dois lugares, sem duplicar
     a lógica de "fonte || empreender" em cada chamador. */
  themeFor(fonte, levelId) {
    const bucket = this[fonte || "empreender"];
    return (bucket && bucket[levelId]) || this.DEFAULT;
  },
};
