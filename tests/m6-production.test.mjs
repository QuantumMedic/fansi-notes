import {test} from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './helpers/comments-runtime.mjs';import {handlePublic} from '../services/comments/public.mjs';import {handleAdmin} from '../services/comments/admin.mjs';
import {inactiveConfigs} from '../scripts/prepare-production-inactive.mjs';import {gates,validateServiceRelease,serviceEnvironment} from '../scripts/launch/service-release.mjs';import {workflowInput} from '../scripts/launch/workflow-input.mjs';
const sha='a'.repeat(40);
function manifest(){return {environment:'production',approved_commit:sha,public:{PUBLIC_COMMENTS_API:'https://fansi-comments.synthetic-account.workers.dev',PUBLIC_TURNSTILE_SITE_KEY:'0x00000000000000000000000000000000',PUBLIC_FORMSPREE_ENDPOINT:'https://formspree.io/f/synthetic',PUBLIC_GOATCOUNTER_ENDPOINT:'https://fansi-notes.goatcounter.com/count',PUBLIC_ANALYTICS_HOSTS:'quantummedic.github.io'},evidence:Object.fromEntries(gates.map(k=>[k,true]))};}
test('production startup is closed even with valid identity; staging unaffected',async()=>{
 const r=await runtime();try{
 const env={...r.env,ENVIRONMENT:'production'};let calls=0;const verify=async()=>{calls++;};
 for(const method of ['GET','POST','DELETE','OPTIONS'])assert.equal((await handlePublic(new Request('https://public.test/v1/comments',{method,headers:{Origin:r.env.SITE_ORIGIN}}),env,verify)).status,503);
 assert.equal(calls,0);assert.equal((await env.DB.prepare('SELECT COUNT(*) n FROM comments').first()).n,0);
 const token=await r.sign();assert.equal((await handleAdmin(new Request('https://admin.test/admin/',{headers:{'Cf-Access-Jwt-Assertion':token}}),env,r.keys)).status,503);
 assert.equal((await handleAdmin(new Request('https://admin.test/admin/'),env,r.keys)).status,401);
 assert.equal((await handlePublic(new Request('https://public.test/health'),r.env)).status,200);
 const active={...env,PRODUCTION_SERVICES_ACTIVE:'true'};await env.DB.prepare('UPDATE settings SET paused=1 WHERE id=1').run();
 assert.equal((await (await handlePublic(new Request('https://public.test/health'),active)).json()).accepting_comments,false);
 await env.DB.prepare('UPDATE settings SET paused=0 WHERE id=1').run();
 assert.equal((await (await handlePublic(new Request('https://public.test/health'),active)).json()).accepting_comments,true);
 }finally{await r.close();}
});
test('inactive provisioning isolates D1 and disables every hostname',()=>{
 const e={CLOUDFLARE_ACCOUNT_ID:'1'.repeat(32),ENVIRONMENT:'production',D1_DATABASE_NAME:'fansi-comments',D1_DATABASE_ID:'11111111-1111-1111-1111-111111111111',STAGING_D1_DATABASE_ID:'22222222-2222-2222-2222-222222222222',SITE_ORIGIN:'https://quantummedic.github.io',SITE_BASE:'/fansi-notes'};
 for(const {config} of inactiveConfigs(e)){assert.equal(config.workers_dev,false);assert.equal(config.preview_urls,false);assert.equal(config.vars.PRODUCTION_SERVICES_ACTIVE,'false');assert.equal(config.routes,undefined);}
 assert.throws(()=>inactiveConfigs({...e,STAGING_D1_DATABASE_ID:e.D1_DATABASE_ID}));
});
test('complete release binds evidence to SHA, excludes private fields and staging configuration',()=>{
 const s=manifest();assert.deepEqual(validateServiceRelease(s,sha),[]);
 for(const k of gates)assert.ok(validateServiceRelease({...s,evidence:{...s.evidence,[k]:false}},sha).length);
 assert.ok(validateServiceRelease(s,'b'.repeat(40)).length);
 for(const patch of [{ADMIN_WORKER_URL:'https://private.test'},{PUBLIC_GOATCOUNTER_ENDPOINT:'https://fansi-notes-test.goatcounter.com/count'},{PUBLIC_COMMENTS_API:'https://fansi-comments-staging.synthetic-account.workers.dev'}])assert.ok(validateServiceRelease({...s,public:{...s.public,...patch}},sha).length);
 const env=serviceEnvironment(s,sha);assert.equal(env.PUBLIC_ANALYTICS_ENABLED,'true');assert.equal(env.PUBLIC_EMAIL_APPROVED,'false');assert.ok(!Object.keys(env).some(k=>/SECRET|ALLOWLIST|ADMIN/.test(k)));
});
test('workflow requires independent full-service and indexing authorizations',()=>{
 const e={RELEASE_SERVICES:'full',RELEASE_SERVICES_JSON:JSON.stringify(manifest()),INDEXING:'noindex'};
 assert.throws(()=>workflowInput(e,sha));const approved={...e,SERVICES_CONFIRMATION:'ENABLE_VERIFIED_PRODUCTION_SERVICES'};
 assert.equal(workflowInput(approved,sha).services,'full');assert.throws(()=>workflowInput({...approved,INDEXING:'index'},sha));
 assert.equal(workflowInput({},sha).services,'off');
});

test('full release build emits all three adapters, no admin URL or ambient staging settings',async()=>{
 const {mkdtempSync,readFileSync,rmSync,cpSync,symlinkSync,writeFileSync,realpathSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {execFileSync}=await import('node:child_process');
 const {buildEnvironment}=await import('../scripts/launch/release.mjs');
 const c={environment:'production',site:'https://quantummedic.github.io/fansi-notes/',indexing:'noindex',indexing_authorized:false,services:'full',service_manifest:manifest()};
 const env=buildEnvironment(c,sha,{...process.env,CI:'true',PUBLIC_COMMENTS_ADMIN_URL:'https://private-admin.invalid',PUBLIC_COMMENTS_API:'https://staging.invalid',PUBLIC_EMAIL_APPROVED:'true',PUBLIC_CONTACT_EMAIL:'private@example.test'});
 assert.equal(env.CI,undefined);assert.equal(env.PUBLIC_COMMENTS_ADMIN_URL,undefined);assert.equal(env.PUBLIC_EMAIL_APPROVED,'false');
 const repo=process.cwd();const root=realpathSync(mkdtempSync(join(tmpdir(),'fansi-full-release-')));const dir=join(root,'dist');
 try{
 for(const path of ['src','public','services/comments/generated','astro.config.mjs','tsconfig.json','package.json'])cpSync(join(repo,path),join(root,path),{recursive:true});
 symlinkSync(join(repo,'node_modules'),join(root,'node_modules'),'dir');
 const config=join(root,'astro.config.mjs');writeFileSync(config,readFileSync(config,'utf8').replace('defineConfig({',"defineConfig({cacheDir: './.astro-cache/', vite: {cacheDir: './.vite-cache/'},"));
 execFileSync(process.execPath,[join(repo,'node_modules/astro/bin/astro.mjs'),'build','--root',root],{cwd:root,env,stdio:'pipe'});
 const html=readFileSync(join(dir,'contact/index.html'),'utf8');assert.match(html,/data-analytics/);assert.match(html,/formspree.io\/f\/synthetic/);assert.match(html,/noindex,nofollow/);
 const {files}=await import('../scripts/launch/release.mjs');const all=files(dir).filter(x=>/\.(html|js|xml)$/.test(x)).map(x=>readFileSync(x,'utf8')).join('\n');
 assert.match(all,/https:\/\/fansi-comments.synthetic-account.workers.dev/);assert.match(all,/data-comments/);assert.doesNotMatch(all,/private-admin\.invalid|staging\.invalid|private@example\.test/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
