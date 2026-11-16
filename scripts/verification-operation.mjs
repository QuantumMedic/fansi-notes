// Operator-only, OAuth-authenticated, project-scoped acceptance lifecycle.
// Plan, snapshots, logs and settings must all live outside the repository.
import {readFileSync,writeFileSync,existsSync,chmodSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {verificationConfigs} from './prepare-verification-window.mjs';
const root=resolve('.'),[action,file]=process.argv.slice(2);
if(!['snapshot','prepare','open','readback','restore','watch'].includes(action)||!file)throw Error('Explicit action and private plan required');
const load=f=>JSON.parse(readFileSync(f));const plan=load(file),dir=dirname(resolve(file));
if(dir===root||dir.startsWith(root+'/'))throw Error('Private operation directory must be outside repository');
const prod=load(plan.production),stage=load(plan.staging),proof=load(plan.productionEvidence),front=load(plan.frontendEvidence),site=load(plan.siteConfig);
const configs=verificationConfigs(prod,proof,stage,front,site,plan.start,plan.end);
const names={public:'fansi-comments',admin:'fansi-comments-admin',site:'fansi-notes-staging'};
if(!plan.authorized||prod.D1_DATABASE_ID===stage.D1_DATABASE_ID||prod.ENVIRONMENT!=='production')throw Error('Wrong scope');
const save=(f,x)=>{writeFileSync(join(dir,f),JSON.stringify(x,null,2),{mode:0o600});chmodSync(join(dir,f),0o600);};
const env={...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:join(dir,'wrangler.log')};
function wrangler(args,label,input){try{const v=execFileSync(process.execPath,[join(root,'node_modules/wrangler/bin/wrangler.js'),...args],{cwd:root,env,input,encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:240000});writeFileSync(join(dir,label+'.log'),v,{mode:0o600});return v;}catch(e){writeFileSync(join(dir,label+'.log'),String(e.stdout||'')+String(e.stderr||''),{mode:0o600});throw Error(label+' failed; private log retained');}}
let token;
async function api(path,method='GET',body){
 if(!token)token=JSON.parse(execFileSync(process.execPath,[join(root,'node_modules/wrangler/bin/wrangler.js'),'auth','token','--json'],{cwd:root,env,encoding:'utf8',stdio:['ignore','pipe','pipe']})).token;
 const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${prod.CLOUDFLARE_ACCOUNT_ID}/`+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 const r=await response.json();if(!r.success)throw Error(`Cloud operation rejected (${response.status}; ${r.errors?.map(x=>x.code).join(',')})`);return r.result;
}
const db=sql=>api(`d1/database/${prod.D1_DATABASE_ID}/query`,'POST',{sql});
const widgetPath=`challenges/widgets/${prod.PUBLIC_TURNSTILE_SITE_KEY}`;
const configFile=kind=>join(dir,kind+'.json');
function writeConfig(kind,c){const cfg=structuredClone(c);cfg.main=resolve('services/comments',cfg.main);if(cfg.d1_databases)cfg.d1_databases[0].migrations_dir=resolve('services/comments/migrations');save(kind+'.json',cfg);}
async function snapshot(){
 const out={workers:{},widget:await api(widgetPath),db:await db('SELECT COUNT(*) AS count FROM comments; SELECT paused,moderation FROM settings WHERE id=1;')};
 for(const [kind,name] of Object.entries(names))out.workers[kind]={settings:await api(`workers/scripts/${name}/settings`),url:await api(`workers/scripts/${name}/subdomain`)};
 return out;
}
function inactive(s){
 for(const k of ['public','admin']){if(s.workers[k].url.enabled||s.workers[k].url.previews_enabled||s.workers[k].settings.bindings.find(b=>b.name==='PRODUCTION_SERVICES_ACTIVE')?.text!=='false')throw Error('Production is not inactive');}
 if(s.db[0].results[0].count!==0||s.db[1].results[0].paused!==1)throw Error('Production DB must start empty and paused');
 if(JSON.stringify([...s.widget.domains].sort())!==JSON.stringify(['quantummedic.github.io']))throw Error('Unexpected existing Turnstile hosts');
}
async function restore(){
 const before=load(join(dir,'before.json'));
 for(const name of [names.public,names.admin]){const live=await api(`workers/scripts/${name}/settings`),b=live.bindings;if(b.find(x=>x.name==='PRODUCTION_SERVICES_ACTIVE')?.text!=='false'||b.find(x=>x.type==='d1')?.id!==prod.D1_DATABASE_ID||b.some(x=>x.name==='VERIFICATION_END'&&x.text!==String(plan.end)))throw Error('Concurrent configuration change; refusing overwrite');}
 save('cleanup-start.json',{at:new Date().toISOString()});
 // Pause first; private admin hostname is closed before restoring code.
 await db('UPDATE settings SET paused=1 WHERE id=1;');
 await api(`workers/scripts/${names.admin}/subdomain`,'POST',{enabled:false,previews_enabled:false});
 await api(`workers/scripts/${names.public}/subdomain`,'POST',{enabled:false,previews_enabled:false});
 const {inactiveConfigs}=await import('./prepare-production-inactive.mjs');
 for(const {kind,config} of inactiveConfigs(prod,proof)){config.triggers={crons:[]};writeConfig('restore-'+kind,config);wrangler(['deploy','--config',configFile('restore-'+kind)],'restore-'+kind);}
 writeConfig('restore-site',load(join(dir,'original-site.json')));wrangler(['deploy','--config',configFile('restore-site')],'restore-site');
 await api(widgetPath,'PUT',{name:before.widget.name,domains:before.widget.domains,mode:before.widget.mode,bot_fight_mode:before.widget.bot_fight_mode,clearance_level:before.widget.clearance_level});
 // All rows were created solely within the isolated authorized acceptance window.
 // Export privately before exact-ID cleanup; never touch another DB or earlier rows.
 const rows=(await db('SELECT * FROM comments;'))[0].results;if(!existsSync(join(dir,'verification-comments-private-backup.json')))save('verification-comments-private-backup.json',rows);
 const unexpected=rows.some(r=>r.created_at<plan.start);if(unexpected)throw Error('Unexpected earlier data; private backup saved, cleanup stopped');
 await db('DROP TRIGGER IF EXISTS verification_insert; DROP TRIGGER IF EXISTS verification_update; DROP TRIGGER IF EXISTS verification_delete; DROP TRIGGER IF EXISTS verification_unpause; DROP TABLE IF EXISTS verification_window;');
 for(const row of [...rows].sort((a,b)=>Number(!!b.parent_id)-Number(!!a.parent_id))){if(!/^[a-f0-9-]{36}$/.test(row.id))throw Error('Invalid stored ID');await db(`DELETE FROM comments WHERE id='${row.id}';`);}
 await db(`UPDATE settings SET paused=1,moderation=${before.db[1].results[0].moderation} WHERE id=1;`);
 // Remove only the temporary public-worker allowlist secret; keep admin/site secrets.
 if((await api(`workers/scripts/${names.public}/secrets`)).some(x=>x.name==='ADMIN_EMAIL_ALLOWLIST'))await api(`workers/scripts/${names.public}/secrets/ADMIN_EMAIL_ALLOWLIST`,'DELETE');
 const after=await snapshot();save('after-restore.json',after);inactive(after);
 save('restored.json',{at:new Date().toISOString(),inactive:true,privateBackup:true});console.log('Restoration verified: production entrances closed, empty DB paused, original widget hosts and frontend restored.');
}
try{
 if(action==='snapshot'){
  if(existsSync(join(dir,'before.json')))throw Error('Snapshot already exists; refusing overwrite');
  const s=await snapshot();inactive(s);save('before.json',s);save('original-site.json',site);console.log('Private pre-window snapshot saved; production inactive verified.');
 }else if(action==='prepare'){
  inactive(load(join(dir,'before.json')));for(const {kind,config} of configs){if(kind==='site'){if(!plan.assetsDirectory||!existsSync(join(plan.assetsDirectory,'fansi-notes/index.html')))throw Error('Missing isolated assets');config.assets.directory=plan.assetsDirectory;}writeConfig(kind,config);}console.log('Private scoped configs prepared; no cloud changes.');
 }else if(action==='open'){
  if(Date.now()<plan.start||Date.now()>=plan.end||!existsSync(join(dir,'watch-ready.json'))||existsSync(join(dir,'opened.json'))||existsSync(join(dir,'restored.json')))throw Error('Window/watch not ready or already used');
  inactive(await snapshot());
  const sql=readFileSync('services/comments/verification-window.sql','utf8');await db(sql);
  await db(`INSERT INTO verification_window(id,active,expires) VALUES(1,0,${plan.end});`);
  for(const k of ['public','admin'])wrangler(['deploy','--config',configFile(k)],'deploy-'+k);
  // Public backend independently verifies frontend JWT, never relying solely on binding privacy.
  wrangler(['secret','bulk','--config',configFile('public')],'temporary-public-secret',JSON.stringify({ADMIN_EMAIL_ALLOWLIST:prod.ADMIN_EMAIL_ALLOWLIST}));
  const before=load(join(dir,'before.json'));
  await api(widgetPath,'PUT',{name:before.widget.name,domains:[...before.widget.domains,new URL(stage.SITE_ORIGIN).hostname],mode:before.widget.mode,bot_fight_mode:before.widget.bot_fight_mode,clearance_level:before.widget.clearance_level});
  wrangler(['deploy','--config',configFile('site')],'deploy-site');
  // Verify bindings and cron exist before opening any writes.
  const s=await snapshot();save('armed.json',s);
  for(const k of ['public','admin']){if(s.workers[k].url.enabled||s.workers[k].settings.bindings.find(x=>x.name==='VERIFICATION_END')?.text!==String(plan.end))throw Error('Lease not deployed');}
  const schedules=await api(`workers/scripts/${names.public}/schedules`);save('schedules.json',schedules);
  if(!JSON.stringify(schedules).includes('* * * * *'))throw Error('Cloud expiration schedule missing');
  await db('UPDATE verification_window SET active=1 WHERE id=1; UPDATE settings SET paused=0,moderation=0 WHERE id=1;');
  await api(`workers/scripts/${names.admin}/subdomain`,'POST',{enabled:true,previews_enabled:false});
  save('opened.json',{at:new Date().toISOString(),end:plan.end});save('opened-readback.json',await snapshot());console.log('Protected verification window opened. Pages untouched; public Worker URL remains off.');
 }else if(action==='readback'){save('current.json',await snapshot());console.log('Private readback saved.');}
 else if(action==='restore')await restore();
 else if(action==='watch'){
  save('watch-ready.json',{pid:process.pid,end:plan.end});
  await new Promise(r=>setTimeout(r,Math.max(0,plan.end-Date.now())));
  if(existsSync(join(dir,'restored.json')))process.exit(0);
  for(let n=0;n<6;n++){try{await restore();break;}catch(e){save('cleanup-error.json',{at:new Date().toISOString(),attempt:n+1,error:e.message});if(n===5)throw e;token=undefined;await new Promise(r=>setTimeout(r,60000));}}
 }
}catch(e){console.error(e.message);if(action==='open'){try{await restore();}catch{console.error('Automatic cleanup incomplete; cloud hard expiry remains. Private recovery required.');}}process.exitCode=1;}
