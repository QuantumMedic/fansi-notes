import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
test('M1 路由全部輸出，原型禁止索引',()=>{for(const p of ['','articles/','articles/paper-garden/','articles/reading-window/','podcast/','works/','about/','contact/','privacy/','topics/','topics/thinking/','topics/reading/']){const html=readFileSync(`dist/${p}index.html`,'utf8');assert.match(html,/lang="zh-TW"/);assert.match(html,/noindex,nofollow/)}assert.ok(existsSync('dist/404.html'))});
test('所有本機連結及資產遵守 Pages base 且目的地存在',()=>{for(const file of walk('dist').filter(f=>f.endsWith('.html'))){const html=readFileSync(file,'utf8');for(const [,href]of html.matchAll(/(?:href|src|action)="([^"#]+)"/g)){if(/^(https:|data:)/.test(href))continue;assert.ok(href.startsWith('/fansi-notes/'),`${file}: ${href}`);const path=decodeURI(href.split(/[?#]/)[0].replace('/fansi-notes/',''));assert.ok(existsSync(`dist/${path}`)||existsSync(`dist/${path}/index.html`),href)}}});
test('內容目錄僅有已列明的合成資料，無外部連結／私人稿件',()=>{const files=walk('src/content');assert.equal(files.length,2);for(const file of files){const text=readFileSync(file,'utf8');assert.match(text,/synthetic: true/);assert.match(text,/publication_status: demo/);assert.match(text,/work_id: demo-/);assert.doesNotMatch(text,/https?:|podcast_master|三個傻瓜|說不完的故事|奧德賽|25 號宇宙/)} });
test('CI 沒有部署、排程或寫入權限',()=>{const ci=readFileSync('.github/workflows/ci.yml','utf8');assert.doesNotMatch(ci,/deploy-pages|pages: write|schedule:|contents: write/)});
