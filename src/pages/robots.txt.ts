import {indexing} from '../lib/indexing.mjs';
export function GET({site}:{site:URL}) {
 const base=import.meta.env.BASE_URL.replace(/\/$/,'')+'/';
 return new Response(indexing(import.meta.env)?`User-agent: *\nAllow: ${base}\nSitemap: ${new URL(base+'sitemap.xml',site).href}\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}});
}
