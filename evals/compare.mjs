#!/usr/bin/env node
// compare.mjs — build a self-contained blind pairwise grading page.
// Usage: node evals/compare.mjs --brief <name> --runs <idA>,<idB>[,...] --out evals/compare/<name>.html [--root <evals dir>]
// Screenshots are copied to <out-without-.html>-assets/ under anonymous names, so the page and
// that folder can be zipped or published as-is. Arm names, run ids and cost live only in an
// encoded block that the Reveal button decodes.
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
if (!args.brief || !args.runs || !args.out) { console.error('usage: node evals/compare.mjs --brief <name> --runs a,b[,c] --out evals/compare/<name>.html'); process.exit(2); }
const root = resolve(args.root || here);
const ids = String(args.runs).split(',').map((s) => s.trim()).filter(Boolean);
if (ids.length < 2) { console.error('need at least two runs'); process.exit(2); }
const out = resolve(args.out);
const assetsName = basename(out).replace(/\.html$/, '') + '-assets';
const assetsDir = join(dirname(out), assetsName);
mkdirSync(assetsDir, { recursive: true });

const runs = ids.map((id, i) => {
  const dir = join(root, 'runs', id);
  const shots = join(dir, 'shots');
  if (!existsSync(shots)) { console.error(`no shots for run ${id} (expected ${shots}); run capture.mjs first`); process.exit(2); }
  let meta = {};
  try { meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')); } catch {}
  const label = 'R' + (i + 1);
  const names = readdirSync(shots).filter((f) => f.endsWith('.png'));
  // first route's step shots per viewport (everything except -full and contact sheets)
  const pick = (vp) => {
    const steps = names.filter((f) => f.startsWith(vp + '-') && /-\d\d\.png$/.test(f)).sort();
    const first = steps.length ? steps[0].replace(/-\d\d\.png$/, '') : null;
    return steps.filter((f) => first && f.startsWith(first + '-'));
  };
  const imgs = {};
  for (const vp of ['desktop', 'mobile']) {
    imgs[vp] = pick(vp).map((f, k) => {
      const anon = `${label.toLowerCase()}-${vp}-${String(k + 1).padStart(2, '0')}.png`;
      copyFileSync(join(shots, f), join(assetsDir, anon));
      return `${assetsName}/${anon}`;
    });
  }
  return { id, label, meta, imgs };
});

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pairs = [];
for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
  const flip = Math.random() < 0.5;
  pairs.push({ left: (flip ? runs[j] : runs[i]).label, right: (flip ? runs[i] : runs[j]).label });
}
shuffle(pairs);
pairs.forEach((p, i) => { p.id = 'p' + (i + 1); });

const pub = { brief: args.brief, runs: runs.map((r) => ({ label: r.label, imgs: r.imgs })), pairs };
const secret = runs.map((r) => ({
  label: r.label, run: r.id, arm: r.meta.arm || null, model: r.meta.model || null,
  wall_clock_s: r.meta.wall_clock_s ?? null, tokens: r.meta.tokens || null,
  verdict: r.meta.qa?.verdict || null, status: r.meta.status || null,
}));
const enc = Buffer.from(JSON.stringify(secret), 'utf8').toString('base64');
const esc = (s) => String(s).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blind comparison: ${String(args.brief).replace(/[<>&"]/g, '')}</title>
<style>
:root{--bg:#f6f5f2;--fg:#1b1b1a;--mut:#65635e;--card:#fff;--line:#d9d6cf;--acc:#1f5eff;--on:#fff;--ok:#0f7b3f}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121212;--fg:#ececea;--mut:#9a9893;--card:#1b1b1a;--line:#333230;--acc:#7da2ff;--on:#0b0b0b;--ok:#5ad08a}}
:root[data-theme=dark]{--bg:#121212;--fg:#ececea;--mut:#9a9893;--card:#1b1b1a;--line:#333230;--acc:#7da2ff;--on:#0b0b0b;--ok:#5ad08a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
header h1{font-size:16px;margin:0 auto 0 0}
button{font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:6px 12px;cursor:pointer;min-height:36px}
button[aria-pressed=true]{background:var(--acc);color:var(--on);border-color:var(--acc)}
button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
main{padding:16px;max-width:1500px;margin:0 auto}
.pair{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;margin:0 0 20px}
.pair h2{font-size:14px;margin:0 0 8px;color:var(--mut);font-weight:600}
.views{display:flex;gap:6px;margin-bottom:8px}
.sides{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.side{min-width:0}.side b{display:block;font-size:13px;margin-bottom:4px}
.scroll{height:68vh;overflow:auto;border:1px solid var(--line);border-radius:6px;background:var(--bg)}
.scroll img{display:block;width:100%;height:auto}
.mobile .scroll img{max-width:390px;margin:0 auto}
.axes{display:grid;gap:6px;margin-top:10px}
.axis{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.axis span{width:90px;font-weight:600;font-size:13px}
.axis button{flex:1 1 70px}
.rev{display:none}.revealed .rev{display:block}
table{border-collapse:collapse;width:100%;font-size:13px}th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left}
.panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;margin:0 0 20px;overflow-x:auto}
.note{color:var(--mut);font-size:13px}
@media (max-width:640px){main{padding:10px}.axis span{width:100%}.scroll{height:56vh}}
</style></head><body>
<header><h1>Blind comparison · ${String(args.brief).replace(/[<>&"]/g, '')}</h1>
<span class="note" id="prog"></span>
<button id="theme" type="button">Theme</button><button id="exp" type="button">Export JSON</button><button id="rev" type="button">Reveal</button></header>
<main><p class="note">Pick left, right or tie on each axis. Sides are randomised and runs are anonymous. Reveal only after you have finished and exported.</p>
<div id="reveal" class="panel rev" aria-live="polite"></div>
<div id="pairs"></div></main>
<script>
const DATA=${esc(JSON.stringify(pub))};
const SECRET="${enc}";
const AXES=[['design','Design'],['usability','Usability'],['creativity','Creativity'],['content','Content']];
const KEY='blind-'+DATA.brief;
let res={};try{res=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(res))}catch(e){}};
const byLabel=Object.fromEntries(DATA.runs.map(r=>[r.label,r]));
const root=document.getElementById('pairs');
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function pairNode(p){
  const card=el('section','pair');card.id=p.id;card.append(el('h2','',p.id.replace('p','Pair ')+' of '+DATA.pairs.length));
  const views=el('div','views');const sides=el('div','sides');
  const scrollers={};
  function build(vp){
    sides.innerHTML='';sides.className='sides '+vp;scrollers.list=[];
    ['left','right'].forEach(side=>{
      const s=el('div','side');s.append(el('b','',side==='left'?'Left':'Right'));
      const sc=el('div','scroll');sc.tabIndex=0;
      (byLabel[p[side]].imgs[vp]||[]).forEach(src=>{const i=new Image();i.src=src;i.alt=side+' '+vp+' screenshot';i.loading='lazy';sc.append(i)});
      s.append(sc);sides.append(s);scrollers.list.push(sc);
    });
    let lock=false;
    scrollers.list.forEach((a,i)=>a.addEventListener('scroll',()=>{if(lock)return;lock=true;const b=scrollers.list[1-i];
      const r=a.scrollTop/Math.max(1,a.scrollHeight-a.clientHeight);b.scrollTop=r*(b.scrollHeight-b.clientHeight);requestAnimationFrame(()=>lock=false)}));
  }
  ['desktop','mobile'].forEach((vp,i)=>{const b=el('button','',vp==='desktop'?'Desktop 1440':'Mobile 390');b.type='button';b.setAttribute('aria-pressed',i===0);
    b.onclick=()=>{views.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');build(vp)};views.append(b)});
  build('desktop');
  const axes=el('div','axes');
  AXES.forEach(([k,name])=>{const row=el('div','axis');row.append(el('span','',name));
    [['left','Left'],['tie','Tie'],['right','Right']].forEach(([v,t])=>{const b=el('button','',t);b.type='button';
      const cur=()=>res[p.id]&&res[p.id][k]===v;b.setAttribute('aria-pressed',!!cur());
      b.onclick=()=>{(res[p.id]=res[p.id]||{})[k]=v;save();row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');prog()};row.append(b)});
    axes.append(row)});
  card.append(views,sides,axes);return card;
}
DATA.pairs.forEach(p=>root.append(pairNode(p)));
function prog(){let n=0;DATA.pairs.forEach(p=>AXES.forEach(([k])=>{if(res[p.id]&&res[p.id][k])n++}));document.getElementById('prog').textContent=n+' / '+DATA.pairs.length*AXES.length+' judgements'}
prog();
function exportData(){
  const out={brief:DATA.brief,exported:new Date().toISOString(),results:DATA.pairs.map(p=>({pair:p.id,left:p.left,right:p.right,choices:res[p.id]||{}})),key:JSON.parse(atob(SECRET)).map(r=>({label:r.label,run:r.run,arm:r.arm}))};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));a.download='results-'+DATA.brief+'.json';a.click();
}
document.getElementById('exp').onclick=exportData;
document.getElementById('theme').onclick=()=>{const d=document.documentElement;const dark=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark'};
document.getElementById('rev').onclick=()=>{
  const S=JSON.parse(atob(SECRET));const m=Object.fromEntries(S.map(r=>[r.label,r]));
  const tally={};S.forEach(r=>{const a=r.arm||r.run;tally[a]=tally[a]||{runs:0,score:0,n:0,ax:{}};tally[a].runs++;AXES.forEach(([k])=>tally[a].ax[k]={s:0,n:0})});
  DATA.pairs.forEach(p=>AXES.forEach(([k])=>{const c=res[p.id]&&res[p.id][k];if(!c)return;
    const L=m[p.left].arm||m[p.left].run,R=m[p.right].arm||m[p.right].run;
    const sl=c==='left'?1:c==='tie'?.5:0;
    [[L,sl],[R,1-sl]].forEach(([a,s])=>{tally[a].score+=s;tally[a].n++;tally[a].ax[k].s+=s;tally[a].ax[k].n++})}));
  const pct=(s,n)=>n?Math.round(100*s/n)+'% ('+n+')':'-';
  const box=document.getElementById('reveal');document.body.classList.add('revealed');box.innerHTML='';
  box.append(el('h2','','Win rate per arm (win = 1, tie = 0.5, over judgements)'));
  const t=document.createElement('table');t.innerHTML='<tr><th>Arm</th><th>Overall</th>'+AXES.map(a=>'<th>'+a[1]+'</th>').join('')+'</tr>';
  Object.entries(tally).forEach(([a,v])=>{const tr=document.createElement('tr');tr.innerHTML='<td></td><td>'+pct(v.score,v.n)+'</td>'+AXES.map(([k])=>'<td>'+pct(v.ax[k].s,v.ax[k].n)+'</td>').join('');tr.firstChild.textContent=a;t.append(tr)});
  box.append(t,el('h2','','Runs: cost and gates'));
  const u=document.createElement('table');u.innerHTML='<tr><th>Label</th><th>Run</th><th>Arm</th><th>Tokens in / out / cache</th><th>Wall-clock</th><th>Gates</th></tr>';
  S.forEach(r=>{const tk=r.tokens?[r.tokens.input,r.tokens.output,(r.tokens.cache_read||0)+(r.tokens.cache_write||0)].map(x=>x==null?'-':x.toLocaleString()).join(' / '):'-';
    const tr=document.createElement('tr');[r.label,r.run,r.arm||'-',tk,r.wall_clock_s!=null?Math.round(r.wall_clock_s/60)+' min':'-',r.verdict||'-'].forEach(x=>{const td=document.createElement('td');td.textContent=x;tr.append(td)});u.append(tr)});
  box.append(u);box.scrollIntoView();
};
</script></body></html>`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out} (${runs.length} runs, ${pairs.length} pairs, assets in ${assetsName}/)`);
