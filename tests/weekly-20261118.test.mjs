import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {splitArticle,hash} from '../scripts/weekly-sync.mjs';
import {importedListeningPresentation} from '../src/lib/listening-presentation.mjs';
const article=splitArticle(readFileSync('src/content/articles/three-idiots-seventeen-years-later.md','utf8'));
const read=p=>JSON.parse(readFileSync(p));
const episodes=read('src/data/podcast.json').filter(e=>e.guid==='e3a6f416-b462-403a-857d-50dd72648617');
test('核准三個傻瓜原文hash、分類、書音共作及來源',()=>{
 assert.equal(hash(article.body),read('src/data/written-master-provenance.json')[article.metadata.work_id].sha256);
 assert.deepEqual(article.metadata.topics,['screen','philosophy']);assert.equal(article.metadata.content_type,'longform');assert.equal(episodes.length,1);
 assert.equal(read('src/data/podcast-work-map.json').filter(m=>m.guid===episodes[0].guid&&m.work_id===article.metadata.work_id&&m.approved).length,1);
 assert.equal(article.metadata.platform_urls.vocus_url,'https://vocus.cc/article/6afbad5bfd89780001804ea8');
});
test('已核准單集的原文錯誤href只在呈現層收合；未配對不得推定',()=>{
 const rendered=importedListeningPresentation(article.body,episodes);
 assert.equal((rendered.html.match(/<p hidden data-original-podcast-link=/g)||[]).length,2);
 assert.ok(article.body.includes('href="https://"'));
 assert.equal((importedListeningPresentation(article.body,[]).html.match(/<p hidden data-original-podcast-link=/g)||[]).length,0);
});
