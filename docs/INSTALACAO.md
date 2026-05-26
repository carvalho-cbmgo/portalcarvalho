# Instalacao do Portal Carvalho

## 1. Enviar ao GitHub

Na pasta extraida:

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
4. Crie o usuario em Authentication.
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
- Variaveis:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `REMUNERACAO_REF=auto`
  - Aliases tambem aceitos:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Variaveis iguais as da Vercel.
