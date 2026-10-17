import {publishedArticles,categories} from '../lib/content';
import {paginateRecords} from '../lib/pagination';
const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export async function GET(){
 const articles=await publishedArticles();
 const paths=['/','/services/','/services/djc/','/services/withbuddy/','/about/','/contact/','/privacy/','/terms/',...paginateRecords(articles,'/articles/').map(p=>p.url.current),...Object.keys(categories).flatMap(c=>paginateRecords(articles.filter(a=>a.data.category===c),`/articles/category/${c}/`).map(p=>p.url.current)),...articles.filter(e=>!e.data.canonical || e.data.canonical===`https://itsdev.kr/articles/${e.id}/`).map(e=>`/articles/${e.id}/`)];
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${escape(new URL(p,'https://itsdev.kr').href)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
