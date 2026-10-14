import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { parse } from 'parse5';
const root=path.resolve('dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root), failures=[];
const assert=(ok,message)=>{if(!ok)failures.push(message)};
for(const record of JSON.parse(fs.readFileSync('.codex/source-manifest.json','utf8').replace(/^\uFEFF/,''))){
 const bytes=fs.readFileSync(path.join('docs/references',record.name));
 assert(createHash('sha256').update(bytes).digest('hex').toUpperCase()===record.sha256,`Source changed: ${record.name}`);
}
const html=new Map();
for(const file of files.filter(f=>f.endsWith('.html'))){
 const text=fs.readFileSync(file,'utf8');
 // Astro omits non-200 endpoint responses; tolerate an empty response file only.
 if(!text.trim()){assert(file.endsWith('design-preview.html'),'Unexpected empty HTML');continue}
 const nodes=[];const visit=n=>{nodes.push(n);for(const c of n.childNodes||[])visit(c)};visit(parse(text));
 const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
 const ids=nodes.map(n=>attrs(n).id).filter(Boolean);
 assert(new Set(ids).size===ids.length,`Duplicate DOM id: ${file}`);
 assert(nodes.filter(n=>n.tagName==='h1').length===1,`Expected one H1: ${file}`);
 assert(nodes.some(n=>n.tagName==='html'&&attrs(n).lang==='ko'),`Missing ko language: ${file}`);
 const route_=('/'+path.relative(root,file).replaceAll('\\','/')).replace(/index\.html$/,'');
 const isContent=/^\/(articles|services|about)\//.test(route_);
 assert(!text.includes('ITSDEV-TEMPLATE-001')&&!text.includes('문서번호 예시')&&!text.includes('디자인 샘플'),`Draft/sample exposed: ${file}`);
 if(!isContent)assert(!text.includes('QA-001')&&!text.includes('QA_HIDDEN_')&&!text.includes('qa-record-'),`Test fixture exposed: ${file}`);
 assert(nodes.some(n=>n.tagName==='link'&&attrs(n).rel==='canonical'),`Missing canonical: ${file}`);
 const meta=Object.fromEntries(nodes.filter(n=>n.tagName==='meta').map(n=>{const a=attrs(n);return [a.property||a.name,a.content]}));
 assert(meta['og:image']==='https://itsdev.kr/images/fieldnotes-og.png',`Missing social image: ${file}`);
 assert(meta['og:image:width']==='1200'&&meta['og:image:height']==='630'&&meta['og:image:alt'],`Incomplete image metadata: ${file}`);
 assert(meta['twitter:card']==='summary_large_image'&&meta['twitter:image']===meta['og:image'],`Incomplete Twitter card: ${file}`);
 html.set(file,{nodes,attrs,ids});
}
let links=0;
for(const [file,{nodes,attrs}] of html){
 const route='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');
 for(const n of nodes.filter(n=>n.tagName==='a'||n.tagName==='link'||n.tagName==='script'||n.tagName==='img')){
  const a=attrs(n),href=a.href||a.src;if(!href||/^(https?:|mailto:|data:)/.test(href))continue;
  const url=new URL(href,'https://itsdev.kr'+route);
  let target=path.join(root,decodeURIComponent(url.pathname));
  if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
  assert(fs.existsSync(target),`Broken link: ${route} -> ${href}`);
  if(url.hash&&html.has(target))assert(html.get(target).ids.includes(decodeURIComponent(url.hash.slice(1))),`Broken anchor: ${route} -> ${href}`);
  links++;
 }
}
const size=ext=>files.filter(f=>f.endsWith(ext)).reduce((sum,f)=>sum+gzipSync(fs.readFileSync(f)).length,0);
const inlineScripts=new Set([...html.values()].flatMap(({nodes})=>nodes.filter(n=>n.tagName==='script').map(n=>(n.childNodes||[]).map(c=>c.value||'').join('')).filter(Boolean)));
const js=size('.js')+[...inlineScripts].reduce((sum,s)=>sum+gzipSync(s).length,0),css=size('.css');
assert(js<=8192,`JS budget exceeded: ${js}`);assert(css<=18432,`CSS budget exceeded: ${css}`);
for(const name of ['404.html','rss.xml','sitemap.xml','robots.txt','ads.txt','_headers','_redirects'])assert(fs.existsSync(path.join(root,name)),`Missing asset: ${name}`);
const feed=fs.readFileSync(path.join(root,'rss.xml'),'utf8');
const card=fs.readFileSync(path.join(root,'images/fieldnotes-og.png'));
assert(card.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&card.readUInt32BE(16)===1200&&card.readUInt32BE(20)===630,'Social card must be a 1200 × 630 PNG');
assert(card.length<=300000,`Social card exceeds 300 KB: ${card.length}`);
assert(!feed.includes('editorial-template'),'Draft in RSS');
const report={checkedAt:new Date().toISOString(),pages:html.size,internalLinks:links,cssGzipBytes:css,jsGzipBytes:js,sourceHashes:8,failures};
fs.writeFileSync('.codex/verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exit(1);
