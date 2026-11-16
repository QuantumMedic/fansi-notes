import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {popularity} from '../src/lib/popularity.mjs';
import {compareBrowse} from '../src/lib/browse-sort.mjs';
import {importedListeningPresentation} from '../src/lib/listening-presentation.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const ig=json('docs/review/m5d/inputs/ig_links_and_order_PUBLIC.json');
const podcast=json('docs/review/m5d/inputs/podcast_order_PUBLIC.json');
const redirects=json('src/data/listening-redirects.json');
const files=readdirSync('src/content/articles').map(f=>readFileSync(`src/content/articles/${f}`,'utf8'));
const metadata=files.map(s=>s.split('---',2)[1]);
test('48固定ID精確接線：47主貼文、2相關貼文、47排名；空值不造數據',()=>{
 assert.equal(ig.rows.length,48);
 assert.equal(ig.rows.filter(r=>r.primary_instagram_url).length,47);
 assert.equal(ig.rows.flatMap(r=>r.related_instagram_urls).length,2);
 for(const r of ig.rows){
  const front=metadata.find(m=>m.includes(`work_id: "${r.work_id}"`));assert.ok(front,r.work_id);
  const links=JSON.parse(front.match(/^platform_urls: (.+)$/m)[1]);
  assert.equal(links.instagram_url??null,r.primary_instagram_url);
  assert.deepEqual(links.related_instagram_urls??[],r.related_instagram_urls);
  assert.equal(popularity.articles.find(p=>p.id===r.work_id).rank,json('docs/review/m5d/final/approved-baseline.json').popularity.articles.find(p=>p.id===r.work_id).rank);
  const slug=JSON.parse(front.match(/^slug: (.+)$/m)[1]);const html=readFileSync(`dist/articles/${slug}/index.html`,'utf8');
  const footer=html.slice(html.indexOf('aria-labelledby="reading-platforms-title"'));
  for(const href of [r.primary_instagram_url,...r.related_instagram_urls].filter(Boolean))assert.equal(footer.split(`href="${href}"`).length-1,1);
 }
 assert.ok(popularity.articles.every(r=>r.snapshot_at===null));
});
test('25 GUID順位精準對應；未知作品最後，並非製造讚數／播放數',()=>{
 const episodes=json('src/data/podcast.json');assert.equal(popularity.podcast.length,25);
 for(const r of podcast.rows){assert.ok(episodes.some(e=>e.guid===r.guid));assert.equal(popularity.podcast.find(p=>p.id===r.guid).rank,r.popularity_rank);}
 const sorted=popularity.articles.map(r=>({...r,date:0})).sort((a,b)=>compareBrowse(a,b,'popular'));
 assert.equal(sorted.at(-1).id,'vocus-6764e586fd89780001056594');assert.equal(sorted.at(-1).rank,null);
 const mappings=json('src/data/podcast-work-map.json');
 assert.equal(mappings.length,25);
 assert.equal(new Set(mappings.map(m=>m.guid)).size,mappings.length);
 assert.ok(mappings.every(m=>m.approved===true));
});
test('四個短網址以精確轉址證據接線與去重，不改原文、不推測未知連結',()=>{
 for(const r of redirects){
  const body=`<div class="imported-original"><p><a href="${r.source_url}">收聽Podcast</a></p><div><a href="${r.source_url}">歡迎收聽完整Podcast</a></div></div>`;
  const result=importedListeningPresentation(body);assert.equal(result.links.length,2);
  assert.deepEqual(new Set(result.links.map(l=>l.href)),new Set([r.spotify_episode_url,r.apple_episode_url]));
  assert.ok(!result.html.includes(`href="${r.source_url}"`));assert.ok(result.html.includes(`data-original-podcast-link="${r.source_url}"`));
  assert.equal(importedListeningPresentation(body,[r]).links.length,0);
 }
 const unknown='<div class="imported-original"><p><a href="https://spotifycreators-web.app.link/e/unknown">Podcast</a></p></div>';
 assert.equal(importedListeningPresentation(unknown).html,unknown);
});
