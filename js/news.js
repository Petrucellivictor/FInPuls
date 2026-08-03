/* =========================================================================
   NEWS.JS — Notícias com impacto na economia brasileira
   Este módulo usa uma curadoria estática como base funcional imediata.
   Para plugar uma fonte 100% ao vivo, basta implementar `fetchLiveNews()`
   apontando para uma News API (ex.: newsapi.org) com uma chave própria —
   a estrutura de renderização já está pronta para consumir esse formato.
   ========================================================================= */

const News = {
  // Curadoria ilustrativa — atualize periodicamente ou substitua por uma API real.
  items: [
    {
      data: "Semana atual",
      tag: "Juros",
      titulo: "Decisões do Copom continuam no radar dos investidores",
      resumo:
        "Mudanças na taxa Selic afetam diretamente a rentabilidade da renda fixa (CDB, Tesouro Direto) e o custo do crédito para famílias e empresas.",
    },
    {
      data: "Semana atual",
      tag: "Inflação",
      titulo: "IPCA continua sendo o principal termômetro do poder de compra",
      resumo:
        "Acompanhar a inflação mensal ajuda a entender se seus investimentos estão realmente fazendo seu dinheiro crescer em termos reais.",
    },
    {
      data: "Semana atual",
      tag: "Câmbio",
      titulo: "Dólar reage a cenário fiscal e movimentos do mercado internacional",
      resumo:
        "Oscilações do dólar impactam viagens, produtos importados e o valor de investimentos internacionais e de algumas empresas exportadoras.",
    },
    {
      data: "Mês atual",
      tag: "Emprego",
      titulo: "Mercado de trabalho influencia diretamente o consumo das famílias",
      resumo:
        "Dados de emprego e renda ajudam a entender o momento certo para reforçar a reserva de emergência antes de assumir mais riscos.",
    },
    {
      data: "Mês atual",
      tag: "Fiscal",
      titulo: "Contas públicas seguem no radar de investidores de renda fixa",
      resumo: "O resultado fiscal do governo influencia a percepção de risco do país e, por consequência, os juros pagos pelo Tesouro Direto.",
    },
  ],

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById("newsCard");
    container.innerHTML = `
      <div class="alert-box info">ℹ️ Curadoria educativa sobre temas que geralmente impactam a economia brasileira. Para notícias 100% ao vivo, conecte uma API de notícias na função <span class="mono">fetchLiveNews()</span> em <span class="mono">js/news.js</span>.</div>
      ${this.items
        .map(
          (n) => `
        <div class="news-item">
          <div class="flex-between">
            <span class="news-date">${n.data}</span>
            <span class="news-tag">${n.tag}</span>
          </div>
          <h4>${n.titulo}</h4>
          <p>${n.resumo}</p>
        </div>`
        )
        .join("")}
    `;
  },

  /* Placeholder para integração futura com uma API real de notícias. */
  async fetchLiveNews(apiKey) {
    // Exemplo de implementação futura:
    // const res = await fetch(`https://newsapi.org/v2/top-headlines?category=business&country=br&apiKey=${apiKey}`);
    // const json = await res.json();
    // this.items = json.articles.map(a => ({ data: a.publishedAt, tag: "Economia", titulo: a.title, resumo: a.description }));
    // this.render();
  },
};
