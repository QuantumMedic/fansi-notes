import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {publicSeries,seriesName,matchesSeries} from '../src/lib/taxonomy.mjs';
import {prepareSearch,matchesPrepared} from '../src/lib/search.mjs';
const audit=JSON.parse(readFileSync('docs/review/m5b-first-articles/source-verification.json','utf8'));
const html=p=>readFileSync(`dist/${p}/index.html`,'utf8');
const text=s=>s.replace(/<[^>]*>/g,'').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n])).replace(/\s/g,'');
test('三篇授權來源的完整文字逐字雜湊一致，無圖片或自動播放器',()=>{
 assert.equal(audit.length,3);
 for(const a of audit){
  const page=html(`articles/${a.slug}`);const body=page.match(/<div class="imported-original">([\s\S]*?)<\/div>/)?.[1];assert.ok(body);
  assert.equal(createHash('sha256').update(text(body)).digest('hex'),a.normalized_text_sha256,a.slug);
  assert.equal((body.match(/class="image-position"/g)||[]).length,a.image_positions);
  assert.doesNotMatch(body,/<img|<iframe|<script|<picture/);assert.doesNotMatch(page,/data-spotify-id|封面插畫示意/);
  assert.ok(page.includes(a.source));assert.ok(page.includes(a.title));assert.ok(page.includes('凡思筆記'));
 }
 const real=readdirSync('src/content/articles').filter(f=>/synthetic: false/.test(readFileSync(`src/content/articles/${f}`,'utf8')));assert.equal(real.length,3);
 assert.deepEqual(JSON.parse(readFileSync('src/data/podcast-work-map.json','utf8')),[]);
});
test('兩個前台系列不重複，文章與故事收錄longform與special並保留舊路由',()=>{
 assert.deepEqual(publicSeries.map(s=>s.name),['凡思維','文章與故事']);
 assert.equal(seriesName('special'),'文章與故事');assert.ok(matchesSeries('longform','stories'));assert.ok(matchesSeries('special','stories'));assert.ok(!matchesSeries('fansiwei','stories'));
 const stories=html('series/stories');assert.match(stories,/articles\/antifragile-life\//);assert.match(stories,/articles\/talking-shadow\//);assert.doesNotMatch(stories,/articles\/willpower-and-habits\//);
 const fansiwei=html('series/fansiwei');assert.match(fansiwei,/articles\/willpower-and-habits\//);assert.doesNotMatch(fansiwei,/articles\/talking-shadow\//);
 for(const old of ['longform','special']) assert.match(html(`series/${old}`),/http-equiv="refresh"[^>]*series\/stories\//);
 for(const page of ['articles','podcast'])assert.equal((html(page).match(/<option value="stories">/g)||[]).length,1);
 assert.doesNotMatch(html('articles/talking-shadow'),/特別篇/);assert.doesNotMatch(html('works'),/會說話的影子/);
});
test('合併系列可與正文搜尋及主要／次要主題交叉篩選',()=>{
 const r=prepareSearch('影子的邊界',['creation','psychology'],'special');assert.ok(matchesPrepared(r,{contentType:'stories',q:'邊界',topic:'psychology'}));assert.ok(!matchesPrepared(r,{contentType:'fansiwei'}));assert.ok(!matchesPrepared(r,{topic:'science'}));
});

import {existsSync} from 'node:fs';
import {showArticleSummary} from '../src/lib/article-presentation.mjs';
test('三個入口共用正式全文列表，固定系列不包含其他系列或聲音版本',()=>{
 for(const [path,count] of [['articles',3],['series/fansiwei',1],['series/stories',2]]) {
  const page=html(path);
  assert.match(page,/data-article-browser/);
  assert.equal((page.match(/data-result/g)||[]).length,count);
  assert.match(page,new RegExp(`共 ${count} 篇文章`));
  assert.doesNotMatch(page,/紙上花園|閱讀之窗|聲音版本|data-work-result/);
  assert.match(page,/id="sort"/);assert.match(page,/id="topic"/);assert.match(page,/id="query"/);
  if(path!=='articles')assert.doesNotMatch(page,/id="type"/);
 }
 for(const path of ['','topics/psychology','topics/literature',...audit.map(a=>`articles/${a.slug}`)]) {
  const page=path?html(path):readFileSync('dist/index.html','utf8');
  assert.doesNotMatch(page,/紙上花園|閱讀之窗|articles\/paper-garden|articles\/reading-window/);
 }
 assert.equal(existsSync('dist/articles/paper-garden/index.html'),false);
});
test('開頭摘錄僅用於卡片及SEO，獨立摘要可顯示；圖片標記保留但無可見工程文案',()=>{
 assert.equal(showArticleSummary('原文開頭','## 章節\n\n原文開頭與後續'),false);
 assert.equal(showArticleSummary('開頭','<h3>標題</h3><p>開頭文字</p>'),false);
 assert.equal(showArticleSummary('獨立摘要','<p>正文</p>'),true);
 assert.equal(showArticleSummary('開頭','<p>開頭</p>','independent'),true);
 assert.equal(showArticleSummary('任何摘錄','<p>正文</p>','excerpt'),false);
 for(const a of audit){
  const page=html(`articles/${a.slug}`);
  assert.doesNotMatch(page,/<p class="lede"|本次僅匯入文字/);
  assert.match(page,/<meta name="description" content="[^"]+/);
  assert.equal((page.match(/Vocus 原文/g)||[]).length,1);
  assert.ok(page.indexOf('Vocus 原文')<page.indexOf('class="reading article-body"'));
  assert.doesNotMatch(page,/Instagram 貼文|href="#related-podcast"|aria-label="相關 Podcast"/);
 }
});
