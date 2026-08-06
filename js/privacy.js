/* =========================================================================
   PRIVACY.JS — Política de Privacidade (LGPD) e modal de exibição.
   Texto reflete exatamente como o PolvIn funciona: 100% local, sem backend.
   ========================================================================= */

const Privacy = {
  init() {
    document.getElementById("privacyPolicyBtn")?.addEventListener("click", () => this.openModal());
  },

  closeModal() {
    document.getElementById("privacyModalOverlay")?.remove();
  },

  openModal() {
    this.closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "privacyModalOverlay";
    overlay.innerHTML = `
      <div class="modal-box">
        <button class="modal-close">✕</button>
        <h2>Política de Privacidade</h2>
        <p class="text-soft text-sm">Em conformidade com a LGPD (Lei nº 13.709/2018). Última atualização: 2026.</p>

        <h3>1. Não existe servidor nem banco de dados</h3>
        <p class="text-sm">O PolvIn é um site 100% estático (HTML/CSS/JavaScript), sem back-end e sem banco de dados próprio. Tudo o que você cadastra — perfil, transações, orçamentos, cofrinhos, investimentos, ações/FIIs, parcelamentos, ligas e progresso — é salvo apenas no <b>localStorage do seu navegador</b>, no seu próprio computador ou celular. Nenhum dado seu é enviado, replicado ou armazenado em nenhum servidor nosso, porque esse servidor simplesmente não existe.</p>

        <h3>2. Quando algo trafega pela internet</h3>
        <p class="text-sm">Duas exceções, nenhuma delas envolve seus dados financeiros pessoais:</p>
        <ul class="text-sm">
          <li><b>Login com Google</b> (opcional): a autenticação acontece direto com o Google; o PolvIn recebe só seu nome, e-mail e foto públicos para personalizar a saudação — nunca sua senha.</li>
          <li><b>Cotações de mercado</b>: o ticker e os indicadores buscam preços públicos (Banco Central do Brasil, AwesomeAPI, CoinGecko). São dados de mercado, sem nenhuma relação com sua identidade ou seus dados pessoais.</li>
        </ul>

        <h3>3. Que dados são tratados e para quê</h3>
        <p class="text-sm">Perfil (nível, objetivo, idade opcional), transações e orçamentos, cofrinhos e metas, carteira de investimentos e ações/FIIs, parcelamentos, progresso nas trilhas, XP/moedas/conquistas e ligas criadas por você. Tudo isso existe só para a própria ferramenta funcionar — calcular seus KPIs, montar sua trilha de aprendizado e mostrar seu progresso. Nada é usado para publicidade, venda a terceiros ou perfilamento externo, porque nada disso sai do seu navegador.</p>

        <h3>4. Cifra dos dados sensíveis</h3>
        <p class="text-sm">Na aba <b>Perfil → Segurança</b>, você pode ativar um cofre opcional que cifra (AES-256) perfil, transações, orçamentos, cofrinhos, investimentos, ações/FIIs, parcelamentos e ligas com uma senha local, para que uma cópia desses arquivos sem a senha não exponha os valores reais. Essa senha não é enviada a lugar nenhum e não pode ser recuperada por nós se for esquecida.</p>

        <h3>5. Seus direitos como titular dos dados</h3>
        <ul class="text-sm">
          <li><b>Acesso e portabilidade</b>: exporte todos os seus dados a qualquer momento em ⬇️ Exportar (JSON legível).</li>
          <li><b>Correção</b>: edite qualquer lançamento nas próprias telas, ou importe um backup corrigido em ⬆️ Importar.</li>
          <li><b>Eliminação</b>: apague tudo permanentemente em "Reiniciar", no topo da tela — a ação é local e imediata, já que não há cópia em nenhum outro lugar para apagar.</li>
          <li><b>Revogação de consentimento</b>: basta parar de usar o site e apagar os dados locais (Reiniciar, ou limpar os dados do site nas configurações do navegador).</li>
        </ul>

        <h3>6. Integridade dos dados</h3>
        <p class="text-sm">Como não há transmissão pela rede, o principal risco de integridade é local: acesso físico ao seu dispositivo desbloqueado, ou uma eventual falha de segurança no próprio navegador/dispositivo. O cofre de criptografia (seção 4) reduz o impacto de uma cópia dos arquivos sem a senha, e os backups exportados permitem restaurar o estado exato dos dados caso algo seja perdido localmente.</p>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector(".modal-close").addEventListener("click", () => this.closeModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal();
    });
  },
};
