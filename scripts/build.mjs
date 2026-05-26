import { mkdir, rm, cp, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const tmp = path.join(root, '.tmp-remuneracao');
const repoZip = path.join(root, '.tmp-remuneracao.zip');
const DEFAULT_SUPABASE_URL = 'https://jlilckqpgxoirbyrhdwb.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_cxbWuYatVqqLOgmM1CCmzQ_KnFgovTL';

async function getJson(url){
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'portalcarvalho-build' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

async function download(url, file){
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'portalcarvalho-build' } }, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) return download(res.headers.location, file).then(resolve, reject);
      if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      const chunks=[];
      res.on('data', c => chunks.push(c));
      res.on('end', async()=>{ await writeFile(file, Buffer.concat(chunks)); resolve(); });
    }).on('error', reject);
  });
}

function semverBranchValue(name){
  const m = /^v-(\d+)$/.exec(name);
  return m ? Number(m[1]) : -1;
}

async function resolveRemuneracaoRef(){
  const envRef = process.env.REMUNERACAO_REF || 'auto';
  if (envRef !== 'auto') return envRef;
  const branches = await getJson('https://api.github.com/repos/militaresgo/remuneracao/branches?per_page=100');
  const best = branches.map(b => b.name).sort((a,b)=> semverBranchValue(b)-semverBranchValue(a))[0];
  return best || 'main';
}

async function unzip(zipPath, outDir){
  try { await execFileAsync('unzip', ['-q', zipPath, '-d', outDir]); }
  catch { await execFileAsync('python', ['-m', 'zipfile', '-e', zipPath, outDir]); }
}

function resolveSupabaseUrl(){
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  );
}

function resolveSupabaseKey(){
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_KEY
  );
}

async function injectGuard(remDir){
  const indexPath = path.join(remDir, 'index.html');
  if (!existsSync(indexPath)) return;
  let html = await readFile(indexPath, 'utf8');
  const guard = `\n  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n  <script src="../portal/js/env.js"></script>\n  <script src="../portal/js/supabase-config.js"></script>\n  <script src="../portal/js/auth-guard.js" data-permission="acesso_remuneracao_cbmgo"></script>\n`;
  const returnButtonStyle = `\n  <style id="portal-return-style">\n    .portal-header-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}\n    .portal-header-row h1{margin:0}\n    .portal-return-btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:10px;border:1px solid #1e40af;background:linear-gradient(180deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.35);color:#fff;text-decoration:none;font-weight:700;font-size:.95rem;white-space:nowrap;transition:transform .15s ease,box-shadow .2s ease,filter .2s ease}\n    .portal-return-btn:hover{transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 12px 22px rgba(37,99,235,.42)}\n    .portal-return-btn:active{transform:translateY(0)}\n    @media (max-width:900px){.portal-header-row{align-items:flex-start}.portal-return-btn{width:100%}}\n  </style>\n`;

  if (!html.includes('auth-guard.js')) {
    html = html.replace('</head>', `${guard}</head>`);
  }

  const hasReturnButton = html.includes('Retornar ao Painel Carvalho');
  if (!hasReturnButton) {
    const withOpenRow = html.replace(/<h1\b[^>]*>/, match => `<div class="portal-header-row">${match}`);
    if (withOpenRow !== html) {
      html = withOpenRow.replace('</h1>', '</h1><a class="portal-return-btn" href="../dashboard.html">Retornar ao Painel Carvalho</a></div>');
    }
  }

  if (!html.includes('portal-return-style')) {
    html = html.replace('</head>', `${returnButtonStyle}</head>`);
  }

  if (!html.includes('Este sistema exige JavaScript para validar o acesso.')) {
    html = html.replace('<body>', '<body><noscript>Este sistema exige JavaScript para validar o acesso.</noscript>');
  }

  await writeFile(indexPath, html, 'utf8');
}

async function main(){
  await rm(dist, { recursive:true, force:true });
  await rm(tmp, { recursive:true, force:true });
  await mkdir(dist, { recursive:true });
  await cp(path.join(root, 'src'), dist, { recursive:true });

  const envJs = `window.PORTAL_ENV = {\n  SUPABASE_URL: ${JSON.stringify(resolveSupabaseUrl())},\n  SUPABASE_ANON_KEY: ${JSON.stringify(resolveSupabaseKey())}\n};\n`;
  await writeFile(path.join(dist, 'portal/js/env.js'), envJs, 'utf8');

  const ref = await resolveRemuneracaoRef();
  console.log(`Importando Remuneração CBMGO de militaresgo/remuneracao@${ref}`);
  const zipUrl = `https://github.com/militaresgo/remuneracao/archive/refs/heads/${encodeURIComponent(ref)}.zip`;
  await download(zipUrl, repoZip);
  await mkdir(tmp, { recursive:true });
  await unzip(repoZip, tmp);
  const dirs = await readdir(tmp);
  const extracted = path.join(tmp, dirs[0]);
  const remDest = path.join(dist, 'remuneracao');
  await cp(extracted, remDest, { recursive:true });
  await injectGuard(remDest);
  await rm(tmp, { recursive:true, force:true });
  await rm(repoZip, { force:true });
  console.log('Build concluído em dist/');
}

main().catch(err => { console.error(err); process.exit(1); });
