/* =========================================================================
   SUPABASE-CONFIG.JS — Credenciais do projeto Supabase (opcional).

   Preencha as duas constantes abaixo com os dados do seu projeto, em
   Project Settings → API no painel do Supabase:
     - SUPABASE_URL      → "Project URL"      (ex.: https://xxxx.supabase.co)
     - SUPABASE_ANON_KEY → "anon public" key

   A anon key é feita para ser pública no navegador — quem protege os
   dados de verdade são as políticas de RLS (Row Level Security) do
   arquivo supabase/schema.sql, que garantem que cada pessoa só lê/escreve
   as próprias linhas.

   Se deixar os dois valores em branco, o Fin+ continua funcionando 100%
   normalmente no modo local (localStorage), exatamente como antes — a
   sincronização na nuvem só fica indisponível.
   ========================================================================= */

const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

const sb =
  typeof supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
