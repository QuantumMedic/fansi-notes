import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {planImport,writeStage} from '../scripts/import-batch.mjs';
import {article} from './fixtures/content.mjs';
import {prepareSearch,matchesPrepared} from '../src/lib/search.mjs';
import {validatePublications} from '../src/lib/publications.mjs';
const book=JSON.parse(readFileSync('src/data/publications.json','utf8'))[0];
const manifest=()=>({version:1,items:[{kind:'article',metadata:article(),body:'合成全文搜尋',public_authorization:true},{kind:'publication',metadata:book,public_authorization:true}]});
test('批次文章及小說完整驗證後才輸出；不覆寫、不接受路徑穿越與未授權',()=>{const root=mkdtempSync(join(tmpdir(),'m5a-import-'));try{const files=planImport(manifest());writeStage(files,join(root,'stage'));assert.ok(existsSync(join(root,'stage/articles/demo-test.md')));assert.ok(existsSync(join(root,'stage/publications.json')));assert.throws(()=>writeStage(files,join(root,'stage')));for(const change of [{public_authorization:false},{metadata:{...article(),slug:'../escape'}},{metadata:{...article(),synthetic:false}}]){const m=manifest();m.items[0]={...m.items[0],...change};assert.throws(()=>planImport(m));}const duplicate=manifest();duplicate.items.push(duplicate.items[0]);assert.throws(()=>planImport(duplicate));assert.throws(()=>planImport(manifest(),{existingIds:['demo-test']}));}finally{rmSync(root,{recursive:true,force:true})}});
test('主次主題、空白與全形搜尋；1000 筆預處理資料可重用',()=>{const rows=Array.from({length:1000},(_,i)=>prepareSearch(`合成 ＡＩ 正文 ${i}`,['science','psychology'],'fansiwei'));assert.equal(rows.filter(r=>matchesPrepared(r,{q:'ai 正文',topic:'psychology'})).length,1000);assert.equal(rows.filter(r=>matchesPrepared(r,{topic:'medicine'})).length,0);assert.equal(rows.filter(r=>matchesPrepared(r,{q:'   ',contentType:'longform'})).length,0);});
test('小說三軸獨立、舊混合分類拒絕',()=>{const row=validatePublications([{...book,publication_status:'published',work_form:'short',series:'合成系列'}])[0];assert.equal(row.work_form,'short');assert.equal(row.series,'合成系列');assert.throws(()=>validatePublications([{...book,publication_kind:'series'}]));});
test('SEO、RSS 排除 demo 與審閱；服務仍不傳送',()=>{for(const file of ['dist/sitemap.xml','dist/feed.xml']){const s=readFileSync(file,'utf8');assert.doesNotMatch(s,/demo-paper-city|paper-garden|review\/|reading-window/);}assert.match(readFileSync('dist/robots.txt','utf8'),/Disallow: \//);const html=readFileSync('dist/contact/index.html','utf8');assert.match(html,/fieldset disabled/);assert.doesNotMatch(html,/type="submit"|action="https:/);assert.match(html,/rel="canonical"/);});

 test('獨立文章無平台與Podcast；短篇全文須獨立核准且已公開',()=>{
 const independent=article({written_master:'website-original',platform_urls:{}});
 assert.equal(independent.written_master,'website-original');
 const text={approved:true,approved_by:'synthetic-fixture',approved_revision:'demo-full-v1',text:'合成短篇全文。'};
 assert.equal(validatePublications([{...book,work_form:'short',publication_status:'published',full_text:text}])[0].full_text.text,text.text);
 for(const change of [{work_form:'novel',publication_status:'published'},{work_form:'short',publication_status:'unpublished'},{work_form:'short',publication_status:'published',full_text:{...text,approved:false}}])assert.throws(()=>validatePublications([{...book,full_text:text,...change}]));
 assert.equal(validatePublications([book])[0].full_text,undefined);
 });
