import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';

const fixtureRoot=path.resolve('.codex/content-fixtures');
const output=path.resolve('.codex/content-dist');
const env={...process.env,ITSDEV_CONTENT_FIXTURES:'1'};
const run=(file,args,stdio='inherit')=>execFileSync(process.execPath,[file,...args],{env,stdio,windowsHide:true,maxBuffer:8*1024*1024});
const write=(id,data,body)=>fs.writeFileSync(path.join(fixtureRoot,`${id}.md`),`---\n${Object.entries(data).map(([key,value])=>`${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\n${body}\n`);
const sampleBody=`이 문서는 레이아웃과 콘텐츠 경로를 확인하는 검증용 문서입니다. 실제 운영 결과가 아닙니다.

## 문제
글이 늘어났을 때 목록, 분류, 상세 페이지가 같은 콘텐츠를 보여주는지 확인합니다. 제목·목차·코드·표가 작은 화면에서도 읽혀야 합니다.

## 환경과 선택
공개 콘텐츠와 분리된 로컬 검증 빌드입니다. 기본 dist에는 이 글을 넣지 않습니다.

### 대안 비교
본문 전체를 가로로 움직이지 않고 긴 코드와 표만 각 영역 안에서 스크롤하도록 구성합니다.

## 검증 조건
- 목표 KPI: 페이지 가로 넘침 0건, 12개 단위 페이지네이션, 초안 노출 0건.
- OKR 연결: 독자가 글을 읽고 관련 기록으로 이동할 수 있는 구조 확인.
- 평가셋: 공개 역할 14편, draft/sample/future 각 1편, desktop/mobile 조건.
- Before/After: 이 테스트 글에는 실제 서비스 성능 측정값이 없습니다.
- 합격 기준: 자동 탐색·메타데이터·제외 검사 전체 통과.

\`\`\`javascript
const intentionallyLongIdentifier = '${'content-boundary-'.repeat(22)}';
console.log(intentionallyLongIdentifier);
\`\`\`

| 조건 | 내용 | 기대 상태 | 검증 위치 | 예외 처리 | 합격 기준 |
| --- | --- | --- | --- | --- | --- |
| 코드 | 긴 코드와 식별자 | 영역 내부 스크롤 | 상세 본문 | 전체 페이지 확장 금지 | 가로 넘침 없음 |
| 표 | 넓은 데이터 표 | 키보드 접근 | 상세 본문 | 숨기지 않음 | 각 셀 내용 확인 |

긴 URL: https://example.invalid/${'long-url-segment-'.repeat(24)}

> 환경이 다르면 판단도 달라질 수 있습니다. 이 문구는 인용문 레이아웃 검사입니다.

## 한계
이 문서는 테스트 데이터입니다. 운영 검증·발행 실적·성과를 의미하지 않습니다.
`;
function generate(){
 fs.mkdirSync(fixtureRoot,{recursive:true});
 for(let i=1;i<=14;i++){
  const id=`qa-record-${String(i).padStart(2,'0')}`;
  write(id,{title:i===1?'[검증용] 정적 콘텐츠 포털에서 배포와 복구의 경계를 나누고 긴 제목과 코드, 표의 읽기 흐름을 확인하는 기록':`[검증용] 콘텐츠 경로 확인 기록 ${i}`,description:'목록·분류·상세·개정 이력을 확인하기 위한 로컬 테스트 콘텐츠입니다.',documentId:`QA-${String(i).padStart(3,'0')}`,pubDate:`2020-01-${String(i).padStart(2,'0')}`,category:i<=13?'infra':'backend',tags:['로컬 검증','콘텐츠 경계'],draft:false,sample:false,featured:i===1,articleType:'design',environment:['Astro static','로컬 Chromium · 격리된 검증 빌드'],evidenceStatus:'planned',...(i===1?{updatedDate:'2020-02-01',revisions:[{rev:'REV A',date:'2020-01-01',summary:'초안 표현 확인'},{rev:'REV B',date:'2020-02-01',summary:'긴 제목과 코드·표 배치 확인'}]}:{revisions:[]})},sampleBody);
 }
 const base={title:'비공개 검사 표식',description:'공개 산출물에 노출되면 실패',pubDate:'2020-01-01',category:'infra',tags:[],draft:false,evidenceStatus:'planned'};
 write('qa-hidden-draft',{...base,documentId:'QA-HIDDEN-DRAFT',draft:true},'QA_HIDDEN_DRAFT_TOKEN');
 write('qa-hidden-sample',{...base,documentId:'QA-HIDDEN-SAMPLE',sample:true},'QA_HIDDEN_SAMPLE_TOKEN');
 write('qa-hidden-future',{...base,documentId:'QA-HIDDEN-FUTURE',pubDate:'2999-01-01'},'QA_HIDDEN_FUTURE_TOKEN');
}
const build=()=>run('node_modules/astro/bin/astro.mjs',['build']);
const read=route=>fs.readFileSync(path.join(output,route),'utf8');
const nodes=html=>{const result=[];const visit=n=>{result.push(n);for(const c of n.childNodes||[])visit(c)};visit(parse(html));return result};
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
function verify(){
 for(const [route,count] of [['articles/index.html',12],['articles/2/index.html',2],['articles/category/infra/index.html',12],['articles/category/infra/2/index.html',1],['articles/category/backend/index.html',1]]){
  assert.equal(nodes(read(route)).filter(n=>(attrs(n).class||'').split(' ').includes('article-card')).length,count,route);
 }
 const sitemap=read('sitemap.xml');assert(sitemap.includes('/articles/2/'));assert(sitemap.includes('/articles/category/infra/2/'));
 assert.equal((read('rss.xml').match(/<item>/g)||[]).length,14);
 const page=read('articles/qa-record-01/index.html');assert(page.includes('REV A'));assert(page.includes('REV B'));assert(page.includes('og:type" content="article'));
 assert(!read('articles/qa-record-02/index.html').includes('개정 이력</h2>'));
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 for(const file of walk(output).filter(f=>/\.(html|xml)$/.test(f))){
  const text=fs.readFileSync(file,'utf8');assert(!text.includes('QA_HIDDEN_'),`Hidden content leaked: ${file}`);
  if(file.endsWith('.html')){
   const all=nodes(text),ids=all.map(n=>attrs(n).id).filter(Boolean);assert.equal(new Set(ids).size,ids.length,`Duplicate ids: ${file}`);
   assert(all.some(n=>n.tagName==='meta'&&attrs(n).name==='robots'&&attrs(n).content.includes('noindex')),`Fixture missing noindex: ${file}`);
  }
 }
 for(const id of ['qa-hidden-draft','qa-hidden-sample','qa-hidden-future'])assert(!fs.existsSync(path.join(output,'articles',id,'index.html')));
 console.log('Content build assertions passed: 14 records, 12+2 pagination, category 12+1, RSS/sitemap, revisions, noindex, draft/sample/future excluded.');
}
const action=process.argv[2]||'build';
if(action==='preview'){run('node_modules/astro/bin/astro.mjs',['preview','--host','127.0.0.1','--port','4323']);}
else if(action==='stop'){run('node_modules/astro/bin/astro.mjs',['preview','stop']);}
else {
 generate();build();verify();
 if(action==='test'){
  run('node_modules/@playwright/test/cli.js',['test','--config','playwright.content.config.ts']);
  // Fail the actual Astro build for an invalid identity; restore only this owned fixture.
  const file=path.join(fixtureRoot,'qa-record-02.md');const original=fs.readFileSync(file,'utf8');
  try{
   fs.writeFileSync(file,original.replace('QA-002','QA-001'));
   let rejected=false;
   try{run('node_modules/astro/bin/astro.mjs',['build'],'pipe')}catch(error){const log=String(error.stdout||'')+String(error.stderr||'');rejected=log.includes('Duplicate documentId');}
   assert(rejected,'Build must reject duplicate documentId');
   console.log('Duplicate documentId rejected by Astro build.');
  }finally{fs.writeFileSync(file,original);build();verify();}
 }
}
