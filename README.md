# Portal Carvalho

Portal central com login único para reunir os sistemas do ecossistema Carvalho.

## Módulos iniciais

- **Remuneração CBMGO**: importado automaticamente da branch mais recente `v-*` do repositório `militaresgo/remuneracao` durante o build.

## Stack

- Frontend estático em HTML, CSS e JavaScript.
- Login e permissões com Supabase Auth + Supabase Postgres.
- Build automático copiando o módulo Remuneração CBMGO para `/remuneracao/` e injetando validação de acesso.

## Como usar localmente

```bash
npm install
npm run build
npm run preview
```

Depois abra o endereço exibido pelo `serve`.

## Variáveis de ambiente

Configure no Vercel/Cloudflare Pages/Netlify:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
REMUNERACAO_REF=auto
```

Tambem sao aceitos estes aliases (ex.: Vercel/Next.js):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL_DO_SUPABASE
```

Use `REMUNERACAO_REF=auto` para buscar automaticamente a branch `v-*` mais alta do repositório `militaresgo/remuneracao`. Para travar uma versão específica, use por exemplo:

```env
REMUNERACAO_REF=v-16
```

## Banco de dados

Execute o script `sql/supabase_portal.sql` no SQL Editor do Supabase.

Para liberar um usuário para acessar a Remuneração CBMGO:

```sql
update public.portal_perfis
set acesso_remuneracao_cbmgo = true
where email = 'email@dominio.com';
```

## Publicação recomendada

### Vercel

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `dist`

### Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
