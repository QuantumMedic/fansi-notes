import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validatePublications,publicationStatus,legacyReadingUrl} from '../src/lib/publications.mjs';
import {authorSchema} from '../src/lib/author-schema.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const input=json('docs/review/m5e/PUBLICATION_DISPLAY_INPUT.json');
const books=validatePublications(json('src/data/publications.json'));
const html=slug=>readFileSync(`dist/works/${slug}/index.html`,'utf8');
const clean=s=>s.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
test('M5-E 七筆展示忠於輸入；26入口、6封面、順序與無全文授權',()=>{
 assert.equal(books.length,7);assert.equal(books.flatMap(b=>b.links).length,26);assert.equal(books.filter(b=>b.cover).length,6);
 for(const [i,b] of books.entries()){
  const source=input.publications[i];
  for(const key of ['work_id','slug','title','author','summary','description','endorsements','publication_status','completion_status','display_order'])assert.deepEqual(b[key],source[key],`${b.work_id} ${key}`);
  assert.equal(b.cover,source.cover.source_url||undefined);
  assert.equal(b.synthetic,false);assert.equal(b.full_text,undefined);assert.equal(b.excerpt,undefined);assert.equal(b.world,undefined);
  assert.deepEqual(b.links,source.links.map(({label,url,group,scope})=>({label,url,group,scope})));
  const page=html(b.slug),text=clean(page);
  for(const paragraph of b.description)assert.ok(text.includes(paragraph));
  for(const e of b.endorsements){assert.ok(text.includes(e.quote));assert.ok(text.includes(e.by));assert.ok(page.includes(e.source_url.replaceAll('&','&amp;')));}
  for(const l of b.links)assert.ok(page.includes(`href="${l.url}"`));
  assert.doesNotMatch(page,/class="fiction-fulltext"|授權短篇全文|作品世界|合成測試/);
  if(b.endorsements.length>2)assert.match(page,/<details[^>]*>\s*<summary/);
  else assert.doesNotMatch(page,/閱讀其餘/);
  for(const sibling of books.filter(x=>x.series&&x.series===b.series))assert.ok(page.includes(`/fansi-notes/works/${sibling.slug}/`));
 }
});
test('M5-E 狀態、整部作品說明、分組與已知平台例外不造資料',()=>{
 const heart=books.find(b=>b.work_id==='publication-heart-reflection'),short=books.at(-1);
 assert.equal(publicationStatus(heart),'網路發表・已完結');assert.equal(publicationStatus(short),'公開短篇');
 for(const b of [heart,short]){assert.equal(b.publisher,undefined);assert.equal(b.edition_isbn,undefined);assert.doesNotMatch(html(b.slug),/紙本購書|電子書|推薦摘句/);}
 for(const b of books.filter(b=>b.series==='智慧奇點')){assert.match(html(b.slug),/整部作品介紹/);assert.match(html(b.slug),/整部作品推薦/);assert.doesNotMatch(html(b.slug),/紙本購書/);assert.ok(b.links.some(l=>l.url.endsWith('/26481')&&l.scope==='whole_work'));}
 assert.equal(short.links[0].url,legacyReadingUrl);
 assert.throws(()=>validatePublications([{...short,work_id:'wrong-work'}]));
 assert.throws(()=>validatePublications([{...short,links:[{...short.links[0],url:'http://example.com/'}]}]));
 const expectedBooks = {
   'publication-tianqi-1': [['print','0010823413'],['ebook','E050049457']],
   'publication-tianqi-2': [['print','0010827312'],['ebook','E050051653']],
   'publication-tianqi-3': [['print','0010864898'],['ebook','E050073570']],
   'publication-singularity-1': [['ebook','E050240249']],
   'publication-singularity-2': [['ebook','E050240250']]
 };
 for(const [workId,products] of Object.entries(expectedBooks)){
   const book=books.find(b=>b.work_id===workId);
   for(const [group,id] of products){
     const matches=book.links.filter(l=>new URL(l.url).host==='www.books.com.tw'&&new URL(l.url).pathname==='/products/'+id);
     assert.equal(matches.length,1,workId+' '+id);
     assert.equal(matches[0].group,group);
   }
 }
 assert.ok(books.every(b=>b.links.every(l=>!l.url.includes('readmoo.com'))));
 assert.ok(input.external_exceptions.some(e=>e.id==='books-direct'&&e.status==='resolved_author_supplied_eight_direct_links'));
 assert.ok(input.external_exceptions.some(e=>e.id==='readmoo-direct'&&e.status==='not_fully_verified'));
});
test('M5-E 作者資料共用、照片原檔、base path與未核准保護',()=>{
 const a=authorSchema.parse(json('src/data/author.json'));
 for(const key of ['name','label','bio','short_bio'])assert.equal(a[key],input.author[key]);
 assert.deepEqual(a.social_links,input.author.social_links);
 assert.equal(createHash('sha256').update(readFileSync(input.author.photo.repository_path)).digest('hex'),input.author.photo.sha256);
 assert.throws(()=>authorSchema.parse({...a,approved:false}));
 assert.throws(()=>authorSchema.parse({...a,photo:'../private.jpg'}));
 const about=readFileSync('dist/about/index.html','utf8'),home=readFileSync('dist/index.html','utf8');
 assert.ok(clean(about).includes(a.bio));assert.ok(clean(home).includes(a.short_bio));
 assert.match(about,/src="\/fansi-notes\/images\/author\/jiang-zongfan.avif"/);
 for(const page of [about,home])assert.doesNotMatch(page,/署名待確認|封面示意|開發預覽|demo-paper-city/);
 assert.equal(existsSync('dist/works/demo-paper-city/index.html'),false);
 assert.match(home,/noindex,nofollow/);
});
test('M5-E 原有書架 reduced-motion 與圖片比例、失敗回退保持',()=>{
 const shelf=readFileSync('src/components/Bookshelf.astro','utf8');
 assert.match(shelf,/@media \(prefers-reduced-motion: reduce\)/);
 assert.match(shelf,/transition: none !important/);assert.match(shelf,/transform: none !important/);
 const cover=readFileSync('src/components/BookCover.astro','utf8');
 assert.match(cover,/object-fit: contain/);assert.match(cover,/referrerpolicy="no-referrer"/);
 assert.match(cover,/addEventListener\('error',fallback/);assert.match(cover,/img.complete && !img.naturalWidth/);
 const page=html('publication-data-storm');assert.doesNotMatch(page,/<img[^>]+data-publication-image/);assert.match(page,/文字作品標籤/);
});
