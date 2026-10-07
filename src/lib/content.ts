import { getCollection } from 'astro:content';
export const categories={infra:'인프라',backend:'백엔드',ai:'AI',log:'프로젝트 기록'};
export async function publishedArticles(){
 const all=await getCollection('articles');
 const ids=new Set<string>();
 for(const entry of all){
  if(ids.has(entry.data.documentId))throw new Error(`Duplicate documentId: ${entry.data.documentId}`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)||/^\d+$/.test(entry.id)||entry.id==='category')throw new Error(`Article slug must be a non-numeric kebab-case name: ${entry.id}`);
  ids.add(entry.data.documentId);
 }
 return all.filter(e=>!e.data.draft&&!e.data.sample&&e.data.pubDate.valueOf()<=Date.now()).sort((a,b)=>b.data.pubDate.valueOf()-a.data.pubDate.valueOf()||a.id.localeCompare(b.id));
}
