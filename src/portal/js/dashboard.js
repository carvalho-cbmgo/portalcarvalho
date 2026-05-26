(function(){
  const client = window.portalSupabase;
  const userBadge = document.getElementById('userBadge');
  const logoutBtn = document.getElementById('logoutBtn');
  const remuneracaoCard = document.querySelector('[data-system="remuneracao"]');

  async function load(){
    const { data: sessionData } = await client.auth.getSession();
    const session = sessionData.session;
    if (!session) { window.location.href = 'index.html'; return; }

    const email = session.user.email;
    userBadge.textContent = email || 'Usuário autenticado';

    const { data: perfil, error } = await client
      .from('portal_perfis')
      .select('ativo, acesso_remuneracao_cbmgo')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const liberado = !error && perfil && perfil.ativo && perfil.acesso_remuneracao_cbmgo;
    if (!liberado && remuneracaoCard) {
      remuneracaoCard.classList.add('locked');
      const link = remuneracaoCard.querySelector('a');
      link.textContent = 'Solicitar liberação';
      link.href = 'sem-acesso.html';
      link.classList.remove('primary');
    }
  }

  logoutBtn.addEventListener('click', async () => {
    await client.auth.signOut();
    window.location.href = 'index.html';
  });

  load();
})();
