import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {spawnSync} from 'node:child_process';
import {inactiveConfigs} from '../scripts/prepare-production-inactive.mjs';
function fixture(){
 const e={CLOUDFLARE_ACCOUNT_ID:'1'.repeat(32),ENVIRONMENT:'production',D1_DATABASE_NAME:'fansi-comments',D1_DATABASE_ID:'11111111-1111-1111-1111-111111111111',STAGING_D1_DATABASE_ID:'22222222-2222-2222-2222-222222222222',SITE_ORIGIN:'https://quantummedic.github.io',SITE_BASE:'/fansi-notes',ACCESS_AUD:'a'.repeat(64),STAGING_ACCESS_AUD:'b'.repeat(64),ACCESS_APP_ID:'synthetic-app',ACCESS_TEAM_DOMAIN:'synthetic.cloudflareaccess.com',ADMIN_WORKER_URL:'https://fansi-comments-admin.synthetic.workers.dev',ADMIN_EMAIL_ALLOWLIST:'owner@example.test',ACCESS_POLICY_VERIFIED:'true'};
 const host=new URL(e.ADMIN_WORKER_URL).hostname;
 const evidence={app:{success:true,result:{id:e.ACCESS_APP_ID,aud:e.ACCESS_AUD,type:'self_hosted',domain:host,self_hosted_domains:[host],destinations:[{type:'public',uri:host}],options_preflight_bypass:false,app_launcher_visible:false,http_only_cookie_attribute:true,allowed_idps:['synthetic-otp']}},policies:{success:true,result:[{decision:'allow',include:[{email:{email:e.ADMIN_EMAIL_ALLOWLIST}}],exclude:[],require:[]}]}};
 return {e,evidence};
}
test('inactive regeneration preserves the exact verified AUD only on admin, without enabling services',()=>{
 const {e,evidence}=fixture(),before=structuredClone({e,evidence});
 const first=inactiveConfigs(e,evidence);assert.deepEqual(inactiveConfigs(e,evidence),first);
 for(const {kind,config} of first){assert.equal(config.vars.PRODUCTION_SERVICES_ACTIVE,'false');assert.equal(config.workers_dev,false);assert.equal(config.preview_urls,false);assert.equal(config.routes,undefined);assert.equal(config.d1_databases[0].database_id,e.D1_DATABASE_ID);assert.equal(config.vars.ACCESS_AUD,kind==='admin'?e.ACCESS_AUD:undefined);}
 assert.deepEqual({e,evidence},before);
 const blank=inactiveConfigs({...e,ACCESS_AUD:'',ACCESS_POLICY_VERIFIED:''});assert.equal(blank.find(x=>x.kind==='admin').config.vars.ACCESS_AUD,'');
});
test('unverified, mismatched and permissive Access data cannot produce a production AUD configuration',()=>{
 const {e,evidence}=fixture();
 for(const patch of [{ACCESS_AUD:''},{ACCESS_AUD:'fake'},{ACCESS_AUD:e.STAGING_ACCESS_AUD},{ACCESS_POLICY_VERIFIED:''},{ACCESS_APP_ID:'other'},{ADMIN_EMAIL_ALLOWLIST:'other@example.test'},{ADMIN_EMAIL_ALLOWLIST:'*@example.test'},{ADMIN_WORKER_URL:'https://fansi-comments-admin.synthetic.workers.dev/admin/'},{ACCESS_TEAM_DOMAIN:''}])assert.throws(()=>inactiveConfigs({...e,...patch},evidence));
 assert.throws(()=>inactiveConfigs(e));
 for(const mutate of [x=>x.app.success=false,x=>x.app.result.aud='c'.repeat(64),x=>x.app.result.domain+='/*',x=>x.app.result.destinations.push({type:'public',uri:'other.test'}),x=>x.app.result.options_preflight_bypass=true,x=>x.app.result.allowed_idps=[],x=>x.policies.result[0].include=[{everyone:{}}],x=>x.policies.result.push({decision:'bypass',include:[{everyone:{}}]})]){
  const changed=structuredClone(evidence);mutate(changed);assert.throws(()=>inactiveConfigs(e,changed));
 }
});
test('CLI rejects incomplete verified configuration before overwriting existing private outputs',()=>{
 const dir=mkdtempSync(join(tmpdir(),'fansi-aud-regression-'));try{
  const out=join(dir,'services/comments');mkdirSync(out,{recursive:true});
  for(const kind of ['public','admin'])writeFileSync(join(out,`${kind}.production.private.json`),'keep-existing-private-config');
  const {e}=fixture();writeFileSync(join(dir,'input.json'),JSON.stringify(e));
  const run=spawnSync(process.execPath,[resolve('scripts/prepare-production-inactive.mjs'),join(dir,'input.json')],{cwd:dir,encoding:'utf8'});
  assert.notEqual(run.status,0);assert.ok(!run.stdout.includes(e.ACCESS_AUD));assert.ok(!run.stderr.includes(e.ACCESS_AUD));
  for(const kind of ['public','admin'])assert.equal(readFileSync(join(out,`${kind}.production.private.json`),'utf8'),'keep-existing-private-config');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
