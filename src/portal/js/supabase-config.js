(function(){
  const env = window.PORTAL_ENV || {};
  const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "https://SEU-PROJETO.supabase.co";
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "SUA_CHAVE_ANON_PUBLICA_DO_SUPABASE";

  if (!window.supabase) {
    console.error("Biblioteca Supabase não carregada.");
    return;
  }

  if (SUPABASE_URL.includes("SEU-PROJETO") || SUPABASE_ANON_KEY.includes("SUA_CHAVE")) {
    console.warn("Configure SUPABASE_URL/SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) nas variáveis de ambiente ou em portal/js/env.js.");
  }

  window.portalSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
