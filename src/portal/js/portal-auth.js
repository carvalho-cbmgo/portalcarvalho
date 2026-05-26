(function(){
  const client = window.portalSupabase;
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('authMessage');
  const magicBtn = document.getElementById('sendMagicLink');

  function setMsg(text, type){
    msg.textContent = text || '';
    msg.className = 'auth-message' + (type ? ' ' + type : '');
  }

  async function redirectIfLogged(){
    const { data } = await client.auth.getSession();
    if (data.session) window.location.href = 'dashboard.html';
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    setMsg('Validando acesso...');
    const email = form.email.value.trim();
    const password = form.password.value;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return setMsg('Não foi possível entrar. Verifique e-mail e senha.', 'error');
    setMsg('Acesso autorizado. Redirecionando...', 'success');
    window.location.href = 'dashboard.html';
  });

  magicBtn.addEventListener('click', async () => {
    const email = form.email.value.trim();
    if (!email) return setMsg('Informe o e-mail para receber o link mágico.', 'error');
    setMsg('Enviando link mágico...');
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/dashboard.html' } });
    if (error) return setMsg('Não foi possível enviar o link mágico.', 'error');
    setMsg('Link enviado. Verifique sua caixa de e-mail.', 'success');
  });

  redirectIfLogged();
})();
