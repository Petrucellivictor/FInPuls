/* =========================================================================
   SUPABASE-CONFIG.JS — Credenciais do projeto Supabase (opcional).

   Preencha as duas constantes abaixo com os dados do seu projeto, em
   Project Settings → API no painel do Supabase:
     - SUPABASE_URL      → "Project URL"        (ex.: https://xxxx.supabase.co)
     - SUPABASE_ANON_KEY → a chave PÚBLICA:
         · projetos novos: "sb_publishable_..." (aba "API Keys")
         · projetos antigos: "anon public" (JWT longo, aba "Legacy API Keys")

   Essa chave pública é feita para ficar no navegador — quem protege os
   dados de verdade são as políticas de RLS (Row Level Security) do
   arquivo supabase/schema.sql, que garantem que cada pessoa só lê/escreve
   as próprias linhas.

   NUNCA use aqui a chave secreta ("sb_secret_..." ou, em projetos
   antigos, "service_role"): ela tem acesso total ao banco e ignora o
   RLS — colocá-la no navegador equivale a publicar a senha mestra do
   banco de dados.

   Desde a migração para nuvem obrigatória (RFC-027), estes dois valores
   NÃO são mais opcionais: se ficarem em branco, `Cloud.isAvailable()`
   retorna false e o app inteiro fica bloqueado atrás da tela terminal
   `#cloudUnavailableScreen` (js/app.js, `ensureCloudAvailable()`) — não
   existe mais um modo 100% local como caminho de produção.
   ========================================================================= */

const SUPABASE_URL = "https://nfqwjmzzsuycmseyjwrr.supabase.co"; // Project Settings → API
const SUPABASE_ANON_KEY = "sb_publishable_-iqp9-voacIiyxNz3AGYAw_gDCHjAXM"; // chave publishable/anon — segura para o navegador

/* NUNCA cole aqui uma chave "sb_secret_..." (ou a antiga "service_role").
   Essa chave tem acesso total ao banco, ignorando o RLS — se for exposta
   no navegador, qualquer visitante consegue ler/alterar os dados de
   qualquer usuário. Se você colou uma chave secreta aqui antes, gere uma
   nova em Project Settings → API Keys → Secret keys → Regenerate. */

const sb =
  typeof supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
