import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './helpers/comments-runtime.mjs';
import {handleStagingSite} from '../services/comments/staging-site.mjs';

test('受控staging前台所有資產先驗Access，拒絕缺設定、假身分及production，保留base與noindex',async()=>{
 const rt=await runtime();let reads=0;
 try{
  const env={...rt.env,SITE_BASE:'/fansi-notes',ASSETS:{fetch:async()=>{reads++;return new Response('approved static asset',{headers:{'Content-Type':'text/html','Cache-Control':'public'}});}}};
  const request=(path,token='')=>new Request('https://staging.test'+path,{headers:{'Cf-Access-Jwt-Assertion':token,'Cf-Access-Authenticated-User-Email':'author@example.test'}});
  for(const path of ['/fansi-notes/','/fansi-notes/_astro/site.js','/fansi-notes/images/author/jiang-zongfan.avif','/fansi-notes/feed.xml']){
   for(const token of ['', 'forged',await rt.sign({email:'other@example.test'}),await rt.sign({aud:'wrong'}),await rt.sign({exp:1})])assert.ok([401,403].includes((await handleStagingSite(request(path,token),env,rt.keys)).status));
  }
  assert.equal(reads,0);
  const token=await rt.sign();
  for(const override of [{ENVIRONMENT:'production'},{SITE_BASE:'/'},{ASSETS:null},{ACCESS_AUD:''}])assert.equal((await handleStagingSite(request('/fansi-notes/',token),{...env,...override},rt.keys)).status,503);
  assert.equal((await handleStagingSite(request('/other/',token),env,rt.keys)).status,404);
  const res=await handleStagingSite(request('/fansi-notes/',token),env,rt.keys);
  assert.equal(res.status,200);assert.equal(await res.text(),'approved static asset');assert.equal(reads,1);
  assert.equal(res.headers.get('Cache-Control'),'private, no-store');assert.equal(res.headers.get('X-Robots-Tag'),'noindex, nofollow');
 }finally{await rt.close();}
});
