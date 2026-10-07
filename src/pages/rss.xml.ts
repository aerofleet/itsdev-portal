import rss from '@astrojs/rss';
import {publishedArticles} from '../lib/content';
export async function GET(){return rss({title:'ITSDEV Engineering Fieldnotes',description:'직접 만든 서비스와 운영의 기록',site:'https://itsdev.kr',items:(await publishedArticles()).map(({id,data})=>({title:data.title,description:data.description,pubDate:data.pubDate,link:`/articles/${id}/`}))})}
