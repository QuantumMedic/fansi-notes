import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runtime} from './helpers/comments-runtime.mjs';
import {windowTime,verificationPublic,verificationAdmin,verificationSite,closeExpiredWindow,publicRoute} from '../services/comments/verification-window.mjs';
const now=Date.now();
const flags={PRODUCTION_SERVICES_ACTIVE:'false',VERIFICATION_ENABLED:'true',VERIFICATION_START:String(now-1000),VERIFICATION_END:String(now+3600000)};
async function setup(){const r=await runtime();Object.assign(r.env,flags,{ENVIRONMENT:'production'});await r.env.DB.exec('CREATE TABLE verification_window(id INTEGER PRIMARY KEY,active INTEGER,expires INTEGER)');await r.env.DB.prepare('INSERT INTO verification_window VALUES(1,1,?)').bind(Number(flags.VERIFICATION_END)).run();return r;}
const req=(path,token,method='GET',body)=>new Request('https://isolated.example.test'+path,{method,headers:{...(token?{'Cf-Access-Jwt-Assertion':token}:{}),Origin:'https://isolated.example.test','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
test('verification lease is explicit, bounded, expired/invalid fail closed without production activation',()=>{
 assert.doesNotThrow(()=>windowTime(flags));
 for(const change of [{VERIFICATION_ENABLED:'false'},{PRODUCTION_SERVICES_ACTIVE:'true'},{VERIFICATION_START:'NaN'},{VERIFICATION_END:String(now-1)},{VERIFICATION_END:String(now+5*3600000)},{VERIFICATION_START:String(now+1000)}])assert.throws(()=>windowTime({...flags,...change}));
});
test('private public binding still requires signed exact-author JWT; all admin routes remain authenticated',async()=>{
 const r=await setup();try{r.env.ALLOWED_ORIGINS='https://isolated.example.test';
 for(const token of [undefined,'forged',await r.sign({email:'visitor@example.test'}),await r.sign({aud:'wrong'}),await r.sign({exp:1})]){
  assert([401,403].includes((await verificationPublic(req('/health',token),r.env,r.keys)).status));
  for(const path of ['/admin/','/v1/admin/comments','/v1/admin/export','/v1/admin/settings'])assert([401,403].includes((await verificationAdmin(req(path,token),r.env,r.keys)).status));
 }
 const jwt=await r.sign();assert.equal((await verificationPublic(req('/health',jwt),r.env,r.keys)).status,200);
 assert.equal((await verificationAdmin(req('/admin/',jwt),r.env,r.keys)).status,200);
 assert.equal((await verificationPublic(req('/v1/admin/comments',jwt),r.env,r.keys)).status,404);
 await r.env.DB.prepare('UPDATE verification_window SET active=0').run();assert.equal((await verificationPublic(req('/health',jwt),r.env,r.keys)).status,503);
 }finally{await r.close();}
});
test('gateway verifies each request, uses only fixed service binding routes and strips arbitrary headers',async()=>{
 const r=await runtime();try{let called=0;const env={...r.env,...flags,ASSETS:{fetch:async()=>new Response('safe')},COMMENTS:{fetch:async q=>{called++;assert.equal(q.redirect,'manual');assert.equal(q.headers.get('x-enable'),null);assert.equal(q.headers.get('Origin'),'https://isolated.example.test');return new Response('bound');}}};
 assert.equal((await verificationSite(req('/health'),env,r.keys)).status,401);assert.equal(called,0);
 const jwt=await r.sign();assert.equal((await verificationSite(req('/health',jwt),env,r.keys)).status,200);assert.equal(called,1);
 assert.equal((await verificationSite(req('/health',jwt),{...env,COMMENTS:{fetch:async()=>new Response(null,{status:302,headers:{Location:'https://unrelated.example.test'}})}},r.keys)).status,502);
 for(const path of ['/v1/admin/export','/admin/','https://evil.test','/anything'])assert.equal((await verificationSite(req(path,jwt),env,r.keys)).status,404);
 const asset=await verificationSite(req('/fansi-notes/articles/',jwt),env,r.keys);assert.equal(asset.headers.get('X-Robots-Tag'),'noindex, nofollow');
 assert.equal(publicRoute('/v1/comments','PUT'),false);assert.equal(publicRoute('/v1/comments','POST'),true);
 assert.equal((await verificationSite(req('/health',jwt),{...env,VERIFICATION_END:'1'},r.keys)).status,503);
 }finally{await r.close();}
});
test('database expiry rejects delayed writes and automatic close persists pause independently of browser',async()=>{
 const r=await setup();try{
 const sql=readFileSync(new URL('../services/comments/verification-window.sql',import.meta.url),'utf8');
 // exec handles one SQL statement per line, including trigger body semicolons.
 for(const line of sql.split('\n').filter(x=>x.startsWith('CREATE ')))await r.env.DB.exec(line);
 const id=crypto.randomUUID();await r.env.DB.prepare("INSERT INTO comments(id,thread,nickname,body,status,request_hash,created_at) VALUES(?,'test','visitor','synthetic','published','hash',1)").bind(id).run();
 await r.env.DB.prepare('UPDATE verification_window SET expires=1').run();
 await assert.rejects(()=>r.env.DB.prepare("UPDATE comments SET body='late' WHERE id=?").bind(id).run(),/verification_closed/);
 await assert.rejects(()=>r.env.DB.prepare('UPDATE settings SET paused=0').run(),/verification_closed/);
 await closeExpiredWindow({...r.env,VERIFICATION_END:'1'});
 assert.equal((await r.env.DB.prepare('SELECT paused FROM settings').first()).paused,1);
 assert.equal((await r.env.DB.prepare('SELECT active FROM verification_window').first()).active,0);
 }finally{await r.close();}
});

import {verificationConfigs} from '../scripts/prepare-verification-window.mjs';
test('verification config preserves inactive release flags and rejects mismatched or broad Access evidence',()=>{
 const prod={CLOUDFLARE_ACCOUNT_ID:'1'.repeat(32),ENVIRONMENT:'production',D1_DATABASE_NAME:'fansi-comments',D1_DATABASE_ID:'11111111-1111-1111-1111-111111111111',STAGING_D1_DATABASE_ID:'22222222-2222-2222-2222-222222222222',SITE_ORIGIN:'https://quantummedic.github.io',SITE_BASE:'/fansi-notes',ACCESS_AUD:'a'.repeat(64),STAGING_ACCESS_AUD:'b'.repeat(64),ACCESS_APP_ID:'synthetic',ACCESS_TEAM_DOMAIN:'synthetic.cloudflareaccess.com',ADMIN_WORKER_URL:'https://fansi-comments-admin.synthetic.workers.dev',ADMIN_EMAIL_ALLOWLIST:'owner@example.test',ACCESS_POLICY_VERIFIED:'true'};
 const host=new URL(prod.ADMIN_WORKER_URL).hostname;
 const proof={app:{success:true,result:{id:prod.ACCESS_APP_ID,aud:prod.ACCESS_AUD,type:'self_hosted',domain:host,self_hosted_domains:[host],destinations:[{type:'public',uri:host}],options_preflight_bypass:false,app_launcher_visible:false,http_only_cookie_attribute:true,allowed_idps:['otp']}},policies:{success:true,result:[{decision:'allow',include:[{email:{email:prod.ADMIN_EMAIL_ALLOWLIST}}],exclude:[],require:[]}]}};
 const stage={...prod,ENVIRONMENT:'staging',SITE_ORIGIN:'https://fansi-notes-staging.synthetic.workers.dev',FRONTEND_ACCESS_AUD:'c'.repeat(64)};
 const f=structuredClone(proof);f.app.result.aud=stage.FRONTEND_ACCESS_AUD;f.app.result.domain=new URL(stage.SITE_ORIGIN).hostname;f.app.result.self_hosted_domains=[f.app.result.domain];
 const site={name:'fansi-notes-staging',account_id:prod.CLOUDFLARE_ACCOUNT_ID,assets:{directory:'/private/fixture',run_worker_first:true},vars:{ENVIRONMENT:'staging'}};
 const configs=verificationConfigs(prod,proof,stage,f,site,now,now+3600000);
 for(const {kind,config} of configs){assert.equal(config.vars.PRODUCTION_SERVICES_ACTIVE,'false');assert.equal(config.preview_urls,false);assert.equal(config.vars.LIVE_ACCESS_VERIFIED,undefined);if(kind!=='site')assert.equal(config.workers_dev,false);}
 assert.deepEqual(configs.at(-1).config.services,[{binding:'COMMENTS',service:'fansi-comments'}]);
 for(const mutate of [x=>x.policies.result[0].include=[{everyone:{}}],x=>x.app.result.aud='wrong',x=>x.app.result.self_hosted_domains.push('extra.test')]){const bad=structuredClone(f);mutate(bad);assert.throws(()=>verificationConfigs(prod,proof,stage,bad,site,now,now+3600000));}
 assert.throws(()=>verificationConfigs(prod,proof,stage,f,site,now,now+5*3600000));
});

import {receiptNamespace,newReceipt,readReceipts,storeReceipt} from '../src/lib/interaction-client.mjs';
test('verification receipts and retries never consume or erase existing staging credentials',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},old=newReceipt(),fresh=newReceipt();
 storeReceipt(storage,'same-work',old);
 const scoped=receiptNamespace('same-work','verification-1794840000000');assert.notEqual(scoped,'same-work');assert.deepEqual(readReceipts(storage,scoped),[]);
 storeReceipt(storage,scoped,fresh);assert.deepEqual(readReceipts(storage,scoped),[fresh]);assert.deepEqual(readReceipts(storage,'same-work'),[old]);
 assert.equal(receiptNamespace('same-work',undefined),'same-work');assert.equal(receiptNamespace('same-work','arbitrary'),'same-work');
});
