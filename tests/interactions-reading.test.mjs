import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './helpers/comments-runtime.mjs';
import {seedLocal} from '../scripts/seed-local-comments.mjs';
import manifest from '../services/comments/generated/threads.json' with {type:'json'};
import {handlePublic} from '../services/comments/public.mjs';
import {handleAdmin} from '../services/comments/admin.mjs';
test('13主留言、分批回覆、定位、私人狀態及可重跑seed',async()=>{
 const rt=await runtime();try{
 const {thread,receipt}=await seedLocal(rt.env.DB,manifest);await seedLocal(rt.env.DB,manifest);
 const get=async q=>handlePublic(new Request('https://test.invalid/v1/threads/'+encodeURIComponent(thread)+'/comments'+q),rt.env);
 const a=await (await get('')).json();assert.equal(a.total,13);assert.equal(a.comments.length,10);assert.equal(a.comments[0].id,receipt.id);assert.equal(a.comments[0].replies.comments.length,1);
 const b=await (await get('?cursor='+a.next)).json();assert.equal(b.comments.length,3);assert.equal(b.next,null);assert.equal(new Set([...a.comments,...b.comments].map(x=>x.id)).size,13);
 const late=b.comments[1];assert.equal((await (await get('?focus='+late.id)).json()).comments[0].id,late.id);
 assert.equal((await get('?focus=invalid')).status,400);
 const hidden='00000000-0000-4000-8000-000000000014';assert.equal((await get('?focus='+hidden)).status,404);assert.equal((await get('?reply='+hidden)).status,404);
 const admin=async(path,body)=>handleAdmin(new Request('https://admin.test/v1/admin/'+path,{method:body?'POST':'GET',headers:{Origin:'https://admin.test','Content-Type':'application/json','Cf-Access-Jwt-Assertion':await rt.sign()},body:body?JSON.stringify(body):undefined}),rt.env,rt.keys);
 let counts=await (await admin('counts')).json();assert.equal(counts.unread,14);assert.equal(counts.pending,1);assert.equal(counts.unanswered,9);
 await admin('comments/'+late.id,{action:'read'});counts=await (await admin('counts')).json();assert.equal(counts.unread,13);
 const target=a.comments[4];await admin('reply',{id:crypto.randomUUID(),parent_id:target.id,body:'測試回覆'});counts=await (await admin('counts')).json();assert.equal(counts.unanswered,8);
 await admin('comments/'+receipt.id,{action:'delete'});const deleted=(await (await get('?focus='+receipt.id)).json()).comments[0];assert.equal(deleted.body,'');assert.equal(deleted.replies.comments.length,1);
 for(let i=0;i<14;i++)await admin('reply',{id:crypto.randomUUID(),parent_id:late.id,body:'有限回覆'+i});const focused=(await (await get('?focus='+late.id)).json()).comments[0];assert.equal(focused.replies.comments.length,10);assert.ok(focused.replies.next);const more=await (await get('?reply='+late.id+'&cursor='+focused.replies.next)).json();assert.ok(more.comments.length<=10);assert.equal(new Set([...focused.replies.comments,...more.comments].map(x=>x.id)).size,15);
 }finally{await rt.close();}
});

import {readFileSync} from 'node:fs';
import {interactionConfig} from '../src/lib/interaction-config.mjs';
test('公開UI取消私碼操作、管理設定及訪客作者身分分離',()=>{
 const component=readFileSync('src/components/Comments.astro','utf8'),client=readFileSync('src/scripts/comments.ts','utf8');
 assert.doesNotMatch(component,/data-restore|data-receipts|data-saved|保存管理碼/);
 assert.match(client,/r.author===1/);assert.match(client,/receipts.find/);assert.match(client,/shown.set/);assert.match(client,/離開本頁後可能無法自行刪除/);
 assert.equal(interactionConfig({PUBLIC_COMMENTS_ADMIN_URL:'http://127.0.0.1:8788/admin/'}).adminUrl,'');
 assert.equal(interactionConfig({PUBLIC_COMMENTS_ADMIN_URL:'https://admin.test/admin/?token=bad'}).adminUrl,'');
 assert.equal(interactionConfig({PUBLIC_COMMENTS_ADMIN_URL:'https://admin.test/admin/'}).adminUrl,'https://admin.test/admin/');
 const html=readFileSync('dist/articles/antifragile-life/index.html','utf8');assert.doesNotMatch(html,/示範讀者13|合成作者回覆 4|127.0.0.1:8788|自己的留言管理碼/);
});
