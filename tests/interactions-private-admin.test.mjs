import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './helpers/comments-runtime.mjs';
import {handleAdmin} from '../services/comments/admin.mjs';
import {handlePublic} from '../services/comments/public.mjs';
test('每條管理頁及API驗證JWT、精確帳號與寫入來源；public沒有管理後門',async()=>{
 const rt=await runtime();try{
 const paths=[['/admin/','GET'],['/v1/admin/comments','GET'],['/v1/admin/counts','GET'],['/v1/admin/settings','GET'],['/v1/admin/export','GET'],['/v1/admin/reply','POST'],['/v1/admin/settings','POST'],...['read','delete','hide'].map(action=>['/v1/admin/comments/00000000-0000-4000-8000-000000000001','POST',action])];
 const tokens=['', 'forged',await rt.sign({email:'other@example.test'}),await rt.sign({aud:'wrong'}),await rt.sign({iss:'https://wrong.cloudflareaccess.com'}),await rt.sign({exp:1})];
 for(const [path,method,action] of paths){for(const token of tokens){const req=new Request('https://admin.test'+path,{method,headers:{Origin:'https://admin.test','Content-Type':'application/json','Cf-Access-Jwt-Assertion':token,'Cf-Access-Authenticated-User-Email':'author@example.test'},body:method==='POST'?JSON.stringify({action}):undefined});const res=await handleAdmin(req,rt.env,rt.keys);assert.ok([401,403].includes(res.status),path);}
 const req=new Request('https://admin.test'+path);assert.equal((await handleAdmin(req,{...rt.env,ACCESS_AUD:''},rt.keys)).status,503);
 assert.ok((await handlePublic(new Request('https://public.test'+path),rt.env)).status>=400);
 }
 for(const path of ['/admin/','/v1/admin/comments','/v1/admin/counts','/v1/admin/settings','/v1/admin/export'])assert.equal((await handleAdmin(new Request('https://admin.test'+path,{headers:{'Cf-Access-Jwt-Assertion':await rt.sign()}}),rt.env,rt.keys)).status,200);
 for(const action of ['read','hide','delete'])assert.equal((await handleAdmin(new Request('https://admin.test/v1/admin/comments/00000000-0000-4000-8000-000000000001',{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json','Cf-Access-Jwt-Assertion':await rt.sign()},body:JSON.stringify({action})}),rt.env,rt.keys)).status,403);
 }finally{await rt.close();}
});
