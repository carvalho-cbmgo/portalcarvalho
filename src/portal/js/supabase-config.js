(function(){
  const env = window.PORTAL_ENV || {};
  const SUPABASE_URL = env.SUPABASE_URL || "https://SEU-PROJETO.supabase.co";
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || "SUA_CHAVE_ANON_PUBLICA_DO_SUPABASE";

  if (!window.supabase) {
    console.error("Biblioteca Supabase não carregada.");
    return;
  }

  if (SUPABASE_URL.includes("SEU-PROJETO") || SUPABASE_ANON_KEY.includes("SUA_CHAVE")) {
    console.warn("Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente ou em portal/js/env.js.");
  }

  window.portalSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
