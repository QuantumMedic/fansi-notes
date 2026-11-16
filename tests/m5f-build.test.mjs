import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
test('M5-F 全站路由、段落錨點、圖片alt、canonical與sitemap整合',()=>{
 const result=spawnSync('python3',['scripts/check_m5f_build.py'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+result.stderr);
 const report=JSON.parse(result.stdout);
 assert.ok(report.pages>=100);assert.ok(report.local_references>1000);
 assert.ok(report.images_with_alt>0);assert.ok(report.sitemap_entries>0);
 assert.deepEqual(report.failures,[]);
});

test('M5-F 首頁已上架內容不再標為待提供或未定版',()=>{assert.doesNotMatch(readFileSync('dist/index.html','utf8'),/正式書封與作品資料待提供|公開署名與簡介待確認|分層插畫示意|尚未定版/);});

test('M5-F 新增作品、改名與補平台不改既有討論串及GUID關係',async()=>{
 const {makeThreads,resolveThread}=await import('../src/lib/comment-threads.mjs');
 const a={work_id:'fixture-stable-a',title:'原名',slug:'stable-a',publication_status:'published'};
 const podcast=[{guid:'fixture-guid-a'},{guid:'fixture-guid-unpaired'}];
 const maps=[{guid:'fixture-guid-a',work_id:a.work_id,approved:true}];
 const before=makeThreads([a],podcast,maps,[]);
 const after=makeThreads([{...a,title:'新名稱',platform_urls:{vocus:'https://vocus.cc/article/fixture'}},{work_id:'fixture-new-b',title:'新增作品',slug:'new-b',publication_status:'published'}],podcast,maps,[]);
 for(const [kind,id] of [['article',a.work_id],['podcast','fixture-guid-a'],['podcast','fixture-guid-unpaired']]) assert.equal(resolveThread(after,kind,id),resolveThread(before,kind,id));
 assert.equal(Object.keys(after.threads).length,Object.keys(before.threads).length+1);
 assert.deepEqual(after.aliases,before.aliases);
 assert.equal(after.threads[resolveThread(after,'article',a.work_id)].title,'新名稱');
});
