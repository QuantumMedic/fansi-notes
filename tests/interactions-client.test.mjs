import {test} from 'node:test';import assert from 'node:assert/strict';
import {interactionConfig} from '../src/lib/interaction-config.mjs';
import {newReceipt,storeReceipt,readReceipts,sendContact} from '../src/lib/interaction-client.mjs';
import {analyticsAllowed,analyticsEvent,publicPagePath,platformOf} from '../src/lib/analytics.mjs';
import {makeThreads,resolveThread} from '../src/lib/comment-threads.mjs';
import {readFileSync} from 'node:fs';
import manifest from '../services/comments/generated/threads.json' with {type:'json'};
test('唯一討論resolver：配對共串、未配對GUID、冊別獨立、未知拒絕',()=>{
 const a={work_id:'a',title:'x',publication_status:'published'},b={work_id:'b',title:'y',website_approved:true};const m=makeThreads([a],[{guid:'g'},{guid:'u'}],[{guid:'g',work_id:'a',approved:true}],[b]);
 assert.equal(resolveThread(m,'podcast','g'),resolveThread(m,'article','a'));assert.equal(resolveThread(m,'podcast','u'),'podcast:u');assert.equal(resolveThread(m,'publication','b'),'publication:b');assert.equal(resolveThread(m,'article','unknown'),null);assert.equal(Object.keys(manifest.threads).length,64);assert.equal(Object.keys(manifest.aliases).length,25);
 const proposed=makeThreads([a],[{guid:'g'}],[{guid:'g',work_id:'a',approved:false}],[]);assert.equal(resolveThread(proposed,'podcast','g'),'podcast:g');
});
test('私碼CSPRNG、儲存拒絕有結果、恢復格式，不持久存留言正文',()=>{
 const a=newReceipt(),b=newReceipt();assert.match(a.token,/^[a-f0-9]{64}$/);assert.notEqual(a.token,b.token);
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};assert.equal(storeReceipt(storage,'thread',a),true);assert.deepEqual(readReceipts(storage,'thread'),[a]);assert.equal(storeReceipt({getItem(){throw Error();}},'thread',a),false);
});
test('服務獨立關閉、正式dummy與本地endpoint拒絕、Email另行批准',()=>{
 const none=interactionConfig();assert.equal(none.comments.enabled,false);assert.equal(none.contact.enabled,false);assert.equal(none.analytics.enabled,false);
 const dummy=interactionConfig({PUBLIC_COMMENTS_ENABLED:'true',PUBLIC_COMMENTS_API:'https://example.test',PUBLIC_TURNSTILE_SITE_KEY:'1x0000'});assert.equal(dummy.comments.enabled,false);
 assert.equal(interactionConfig({PUBLIC_CONTACT_ENABLED:'true',PUBLIC_FORMSPREE_ENDPOINT:'http://127.0.0.1:8789/success',PUBLIC_INTERACTIONS_LOCAL:'true'}).contact.enabled,false);
 assert.equal(interactionConfig({PUBLIC_CONTACT_EMAIL:'reader@example.test'}).contact.email,null);
 assert.equal(interactionConfig({PUBLIC_EMAIL_APPROVED:'true',PUBLIC_CONTACT_EMAIL:'reader@example.test'}).contact.email,'reader@example.test');
});
test('Formspree接受／額度／失敗／逾時不改輸入，無無限重寄',async()=>{
 const fields={email:'reader@example.test',message:'合成私人測試'},copy=JSON.stringify(fields);let calls=0;
 for(const status of [429,400,500]){const r=await sendContact('https://formspree.io/f/isolated',fields,{fetcher:async()=>{calls++;return Response.json({}, {status});}});assert.equal(r.ok,false);}
 assert.equal((await sendContact('https://formspree.io/f/isolated',fields,{fetcher:async()=>{throw Error('timeout');}})).ok,false);
 assert.equal((await sendContact('https://formspree.io/f/isolated',fields,{fetcher:async()=>Response.json({ok:true})})).ok,true);assert.equal(calls,3);assert.equal(JSON.stringify(fields),copy);
});
test('分析嚴格排除環境與私人輸入；平台點擊不冒稱收聽',()=>{
 const c={enabled:true,hosts:['example.test','localhost']};assert.equal(analyticsAllowed(c,{hostname:'localhost',pathname:'/fansi-notes/'}),false);assert.equal(analyticsAllowed(c,{hostname:'example.test',pathname:'/fansi-notes/review/x/'}),false);
 const e=analyticsEvent('outbound_spotify','a',['a']);assert.deepEqual(e,{path:'outbound_spotify/a',title:'outbound_spotify',event:true,referrer:''});assert.equal(analyticsEvent('email','secret',[]),null);assert.equal(analyticsEvent('contact_submitted','private@example.test',['a']),null);assert.equal(publicPagePath('/fansi-notes/about/?email=x'),null);assert.equal(platformOf('https://open.spotify.com/episode/x'),'spotify');
 const s=readFileSync('src/scripts/comments.ts','utf8');assert.doesNotMatch(s,/innerHTML|insertAdjacentHTML/);assert.match(s,/textContent/);
 const contact=readFileSync('src/components/ContactForm.astro','utf8');assert.match(contact,/if\(busy\|\|!form.reportValidity\(\)\)return/);assert.match(contact,/if\(result.ok\)\{form.reset/);
});

test('啟用預檢一次列缺項、不回傳secret值；正式模式不接受測試宣告',async()=>{
 const {preflight}=await import('../scripts/check_interaction_config.mjs');const s=preflight({},'staging');assert.equal(s.ready,false);for(const k of ['D1_DATABASE_ID','ACCESS_AUD','PUBLIC_FORMSPREE_ENDPOINT','PUBLIC_GOATCOUNTER_ENDPOINT'])assert.ok(s.missing.includes(k));
 const p=preflight({ENVIRONMENT:'production',TURNSTILE_SECRET_KEY:'dummy-private-value',ADMIN_EMAIL_ALLOWLIST:'*@gmail.com'},'production');assert.equal(p.ready,false);assert.ok(p.invalid.includes('ADMIN_EMAIL_ALLOWLIST'));assert.ok(p.invalid.includes('TURNSTILE_SECRET_KEY'));assert.ok(!JSON.stringify(p).includes('dummy-private-value'));
});
