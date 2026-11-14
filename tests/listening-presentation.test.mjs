import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {listeningDestination, importedListeningPresentation} from '../src/lib/listening-presentation.mjs';
const spotify='https://open.spotify.com/episode/0123456789012345678901';
const apple='https://podcasts.apple.com/tw/podcast/example/id123?i=456';
const figure=href=>`<figure><figcaption><a href="${href}">收聽Podcast全集</a></figcaption></figure>`;
test('只搬移單集圖說連結，保留原文與來源證據並以單集識別去重',()=>{
 const body=`<div class="imported-original"><p>原文</p>${figure(spotify)}${figure(spotify+'?si=abc')}${figure(apple)}${figure('https://example.com/research.pdf')}<p><a href="${spotify}">一般引文不搬移</a></p></div>`;
 const result=importedListeningPresentation(body);
 assert.equal(result.links.length,2);assert.equal(result.links[0].label,'在 Spotify 收聽本集');
 assert.match(result.html,/data-original-podcast-link/);assert.match(result.html,/收聽Podcast全集/);
 assert.match(result.html,/<a href="https:\/\/example.com\/research.pdf">/);
 assert.match(result.html,/>一般引文不搬移<\/a>/);
 assert.equal(importedListeningPresentation(body,[{spotify_episode_url:spotify,apple_episode_url:apple}]).links.length,0);
 for(const href of ['javascript:alert(1)','https://open.spotify.com/show/0123456789012345678901','https://podcasts.apple.com/tw/podcast/test/id123','https://evil.test/episode/0123456789012345678901'])assert.equal(listeningDestination(href),null);
 assert.equal(importedListeningPresentation('## 一般Markdown').html,null);
});
test('兩篇文末有清楚單集入口且只有一個可點連結，研究來源不搬移；無聲音時整區省略',()=>{
 const audit=JSON.parse(readFileSync('docs/review/m5b-first-articles/source-verification.json','utf8'));
 for(const article of audit){
  const html=readFileSync(`dist/articles/${article.slug}/index.html`,'utf8');
  const header=html.split('</header>')[0];assert.doesNotMatch(header,/Vocus 原文|Instagram 貼文/);
  assert.match(html,/在其他平台閱讀/);
  const links=article.external_link_evidence.filter(e=>listeningDestination(e.url));
  if(!links.length){assert.doesNotMatch(html,/id="article-listening"/);continue;}
  assert.match(html,/聆聽這篇文章/);assert.doesNotMatch(html,/>原文附帶收聽連結</);
  for(const link of links){
   const escaped=link.url.replaceAll('&','&amp;');
   assert.equal(html.split(`href="${escaped}"`).length-1,1);
   assert.ok(html.includes(`data-original-podcast-link="${escaped}"`));
  }
  assert.doesNotMatch(html,/<a[^>]*>收聽Podcast全集<\/a>/);
  assert.doesNotMatch(html,/data-spotify-id|<iframe/);
 }
});
