import type { APIRoute } from 'astro';
import fs from 'node:fs';
export const GET: APIRoute = () => import.meta.env.DEV ? new Response(fs.readFileSync(new URL('../../docs/references/ITSDEV-Fieldnotes-Preview.html', import.meta.url),'utf8'), {headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow'}}) : new Response(null,{status:404});
