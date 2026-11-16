import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './helpers/comments-runtime.mjs';
import {handlePublic,verifyTurnstile} from '../services/comments/public.mjs';
import {handleAdmin} from '../services/comments/admin.mjs';
import {newReceipt} from '../src/lib/interaction-client.mjs';
import manifest from '../services/comments/generated/threads.json' with {type:'json'};
let rt;before(async()=>rt=await runtime());after(async()=>rt?.close());
const thread=Object.keys(manifest.threads)[0],origin='http://127.0.0.1:4335';let ip=0;
const request=(path,method='GET',body,headers={})=>new Request('http://127.0.0.1:8787'+path,{method,headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.'+(++ip),...headers},body:body?JSON.stringify(body):undefined});
const post=()=>{const r=newReceipt();return {id:r.id,delete_token:r.token,thread,nickname:'合成讀者',body:'本地留言測試',turnstile_token:'local-'+crypto.randomUUID()};};
const call=(p,m,b,h)=>handlePublic(request(p,m,b,h),rt.env,rt.verify);
const admin=async(p,m='GET',b,headers={},env=rt.env)=>handleAdmin(new Request('http://127.0.0.1:8788'+p,{method:m,headers:{Origin:'http://127.0.0.1:8788','Content-Type':'application/json','Cf-Access-Jwt-Assertion':await rt.sign(),...headers},body:b?JSON.stringify(b):undefined}),env,rt.keys);
test('D1真SQL：發表／公開讀取／私碼刪除，別人及ID不能刪，公有欄位不洩漏雜湊',async()=>{
 const b=post();assert.equal((await call('/v1/comments','POST',b)).status,201);
 const rows=await (await call('/v1/threads/'+encodeURIComponent(thread)+'/comments')).json();assert.ok(rows.comments.some(r=>r.id===b.id));assert.doesNotMatch(JSON.stringify(rows),/delete_hash|delete_token|request_hash/);
 assert.equal((await call('/v1/comments/'+b.id,'DELETE',null,{Authorization:'Bearer '+newReceipt().token})).status,403);
 assert.equal((await call('/v1/comments/'+b.id,'DELETE')).status,403);
 assert.equal((await call('/v1/comments/'+b.id,'DELETE',null,{Authorization:'Bearer '+b.delete_token})).status,200);
 const row=await rt.env.DB.prepare('SELECT * FROM comments WHERE id=?').bind(b.id).first();assert.equal(row.body,'');assert.equal(row.nickname,'');assert.equal(row.delete_hash,null);
});
test('回應遺失、雙擊併發及Turnstile重播：同請求只一筆、不同請求不能重用',async()=>{
 const b=post();const responses=await Promise.all([call('/v1/comments','POST',b),call('/v1/comments','POST',b)]);assert.ok(responses.some(r=>r.status===201));
 assert.equal((await call('/v1/comments','POST',b)).status,200);assert.equal((await rt.env.DB.prepare('SELECT count(*) n FROM comments WHERE id=?').bind(b.id).first()).n,1);
 assert.equal((await call('/v1/comments','POST',{...b,body:'changed'})).status,409);
 assert.equal((await call('/v1/comments','POST',{...post(),turnstile_token:b.turnstile_token})).status,403);
});
test('Access真JWT：有效簽章成功；缺設定、假header、錯Email／audience／過期拒絕',async()=>{
 assert.equal((await admin('/admin/')).status,200);
 for(const claims of [{email:'other@example.test'},{aud:'wrong'},{exp:1},{iss:'https://wrong.cloudflareaccess.com'}])assert.equal((await admin('/v1/admin/settings','GET',null,{'Cf-Access-Jwt-Assertion':await rt.sign(claims)})).status,403);
 assert.equal((await admin('/admin/','GET',null,{'Cf-Access-Jwt-Assertion':'eyJhbGciOiJub25lIn0.e30.'})).status,403);
 assert.equal((await admin('/v1/admin/settings','GET',null,{'Cf-Access-Jwt-Assertion':'','Cf-Access-Authenticated-User-Email':'author@example.test'})).status,401);
 assert.equal((await admin('/admin/','GET',null,{}, {...rt.env,ACCESS_AUD:''})).status,503);
 assert.equal((await admin('/v1/admin/settings','POST',{moderation:true,paused:false},{Origin:'https://evil.test'})).status,403);
 assert.equal((await call('/v1/admin/settings')).status,404);
});
test('審核、隱藏、暫停、作者回覆；刪父留言保留回覆、拒絕無效parent',async()=>{
 assert.equal((await admin('/v1/admin/settings','POST',{moderation:true,paused:false})).status,200);
 const b=post();assert.equal((await (await call('/v1/comments','POST',b)).json()).status,'pending');
 assert.ok(!(await (await call('/v1/threads/'+encodeURIComponent(thread)+'/comments')).json()).comments.some(x=>x.id===b.id));
 await admin('/v1/admin/comments/'+b.id,'POST',{action:'publish'});
 const reply={id:crypto.randomUUID(),parent_id:b.id,body:'合成作者回覆'};assert.equal((await admin('/v1/admin/reply','POST',reply)).status,201);
 assert.equal((await admin('/v1/admin/reply','POST',{...reply,id:crypto.randomUUID(),parent_id:reply.id})).status,400);
 await call('/v1/comments/'+b.id,'DELETE',null,{Authorization:'Bearer '+b.delete_token});
 assert.equal((await rt.env.DB.prepare('SELECT body FROM comments WHERE id=?').bind(reply.id).first()).body,reply.body);
 await admin('/v1/admin/comments/'+reply.id,'POST',{action:'hide'});
 const exported=await (await admin('/v1/admin/export')).json();assert.doesNotMatch(JSON.stringify(exported),/delete_hash|request_hash|delete_token/);
 await admin('/v1/admin/settings','POST',{moderation:false,paused:true});assert.equal((await call('/v1/comments','POST',post())).status,503);
 await admin('/v1/admin/settings','POST',{moderation:false,paused:false});
});
test('惡意輸入、未知串、跨origin、持久限流、失敗驗證及正式dummy拒絕',async()=>{
 assert.equal((await call('/v1/comments','POST',{...post(),thread:'article:unknown'})).status,404);
 assert.equal((await call('/v1/comments','POST',post(),{Origin:'https://evil.test'})).status,403);
 assert.equal((await call('/v1/comments','POST',{...post(),body:'x'.repeat(2001)})).status,400);
 assert.equal((await call('/v1/comments','POST',{...post(),body:'x'.repeat(17000)})).status,413);
 const malicious={...post(),nickname:"'; DROP TABLE comments;--",body:'<img src=x onerror=alert(1)>'};assert.equal((await call('/v1/comments','POST',malicious)).status,201);assert.equal((await rt.env.DB.prepare('SELECT body FROM comments WHERE id=?').bind(malicious.id).first()).body,malicious.body);
 for(let i=0;i<10;i++)await call('/v1/comments','POST',{...post(),turnstile_token:'invalid'},{'CF-Connecting-IP':'198.51.100.1'});
 assert.equal((await call('/v1/comments','POST',post(),{'CF-Connecting-IP':'198.51.100.1'})).status,429);
 assert.ok((await rt.env.DB.prepare('SELECT count(*) n FROM rate_limits').first()).n>0);
 assert.equal((await handlePublic(request('/v1/comments','POST',post()),{...rt.env,TURNSTILE_SECRET_KEY:'1x0000000000000000000000000000000AA'},rt.verify)).status,503);
});

test('Siteverify服務端 success／hostname／action 與持久token重播防護',async()=>{
 for(const data of [{success:false},{success:true,hostname:'evil.test',action:'comment'},{success:true,hostname:'127.0.0.1',action:'login'}])await assert.rejects(()=>verifyTurnstile('isolated-'+crypto.randomUUID(),rt.env,async()=>Response.json(data)));
 const token='isolated-'+crypto.randomUUID();const fetcher=async(url,options)=>{assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');assert.equal(options.body.get('response'),token);return Response.json({success:true,hostname:'127.0.0.1',action:'comment'});};
 await verifyTurnstile(token,rt.env,fetcher);await assert.rejects(()=>verifyTurnstile(token,rt.env,fetcher));
});

test('公開游標分頁有硬上限，未知串與reader假作者／跨串回覆拒絕',async()=>{
 const before=await rt.env.DB.prepare('SELECT count(*) n FROM comments').first();
 const b=post();assert.equal((await call('/v1/comments','POST',{...b,parent_id:crypto.randomUUID()})).status,400);
 assert.equal((await call('/v1/comments','POST',{...b,author:true,status:'published'})).status,201);
 assert.equal((await rt.env.DB.prepare('SELECT author FROM comments WHERE id=?').bind(b.id).first()).author,0);
 assert.equal((await call('/v1/threads/'+encodeURIComponent(thread)+'/comments?cursor=-1')).status,400);
 const other='article:'+crypto.randomUUID();assert.equal((await call('/v1/threads/'+encodeURIComponent(other)+'/comments')).status,404);
 assert.ok((await rt.env.DB.prepare('SELECT count(*) n FROM comments').first()).n>=before.n);
 const statements=Array.from({length:55},()=>rt.env.DB.prepare("INSERT INTO comments(id,thread,nickname,body,status,request_hash,created_at) VALUES(?,?,'合成','分頁','published','test',?)").bind(crypto.randomUUID(),thread,Date.now()));await rt.env.DB.batch(statements);
 const page=await (await call('/v1/threads/'+encodeURIComponent(thread)+'/comments?limit=500')).json();assert.equal(page.comments.length,50);assert.ok(page.next);const next=await (await call('/v1/threads/'+encodeURIComponent(thread)+'/comments?cursor='+page.next)).json();assert.ok(!next.comments.some(x=>page.comments.some(y=>y.id===x.id)));
});
