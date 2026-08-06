/* =========================================================================
   BRAPI-CONFIG.JS — Token da brapi.dev (opcional), para cotação em tempo
   real de ações/FIIs individuais na aba Ações & FIIs.

   Sem token, 4 tickers de teste já funcionam automaticamente, sem nenhum
   cadastro: PETR4, MGLU3, VALE3, ITUB4. Para os demais tickers, crie uma
   conta gratuita em https://brapi.dev/ (plano Gratuito: 15.000 requisições
   por mês) e cole o token abaixo.

   Esse token fica necessariamente visível no navegador (o PolvIn não tem
   servidor para escondê-lo) — a API só devolve cotações públicas, então o
   único risco é outra pessoa consumir a sua cota gratuita, não exposição
   de dados sensíveis. Se a cota se esgotar ou o token for inválido, o app
   volta a pedir a cotação por entrada manual, sem quebrar nada.

   Se deixar em branco, o PolvIn continua funcionando 100% normalmente —
   só os 4 tickers de teste atualizam sozinhos, o resto continua manual.
   ========================================================================= */

const BRAPI_TOKEN = ""; // cole aqui o token gratuito de https://brapi.dev/dashboard
