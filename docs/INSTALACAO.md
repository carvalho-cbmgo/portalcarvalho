# Instalação do Portal Carvalho

## 1. Enviar ao GitHub

Na pasta extraída:

```bash
git init
git branch -M main
git add .
git commit -m "Inicializa Portal Carvalho"
git remote add origin https://github.com/carvalho-cbmgo/portalcarvalho.git
git push -u origin main
```

## 2. Supabase

1. Crie um projeto no Supabase.
2. Em **Authentication**, habilite login por e-mail/senha e/ou magic link.
3. Execute `sql/supabase_portal.sql` no SQL Editor.
4. Crie o usuário em Authentication.
5. Libere o acesso:

```sql
update public.portal_perfis
set acesso_remuneracao_cbmgo = true
where email = 'email@dominio.com';
```

## 3. Hospedagem

### Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Variáveis:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `REMUNERACAO_REF=auto`

### Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Variáveis iguais às da Vercel.
