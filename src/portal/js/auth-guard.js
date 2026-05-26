(function(){
  const requiredPermission = document.currentScript?.dataset?.permission || 'acesso_remuneracao_cbmgo';

  async function deny(){
    window.location.replace('../sem-acesso.html');
  }

  async function boot(){
    const client = window.portalSupabase;
    if (!client) return deny();

    const { data: sessionData } = await client.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      window.location.replace('../index.html');
      return;
    }

    const { data: perfil, error } = await client
      .from('portal_perfis')
      .select('ativo,' + requiredPermission)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !perfil || !perfil.ativo || !perfil[requiredPermission]) return deny();

    document.documentElement.classList.add('portal-auth-ok');
  }

  boot();
})();
