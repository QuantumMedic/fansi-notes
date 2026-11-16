// Provisioning configuration only. No activation, network calls or fabricated approvals.
import {readFileSync,writeFileSync,chmodSync} from 'node:fs';
export function inactiveConfigs(e){
 if(!/^[a-f0-9]{32}$/i.test(e.CLOUDFLARE_ACCOUNT_ID||''))throw Error('Explicit actual account ID required');
 if(e.ENVIRONMENT!=='production'||e.D1_DATABASE_NAME!=='fansi-comments'||!/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(e.D1_DATABASE_ID||'')||!e.STAGING_D1_DATABASE_ID||e.D1_DATABASE_ID===e.STAGING_D1_DATABASE_ID)throw Error('Separate actual production D1 required');
 if(e.SITE_ORIGIN!=='https://quantummedic.github.io'||e.SITE_BASE!=='/fansi-notes')throw Error('Production target mismatch');
 return ['public','admin'].map(kind=>{
 const config=JSON.parse(readFileSync(`services/comments/wrangler.${kind}.jsonc`));
 config.account_id=e.CLOUDFLARE_ACCOUNT_ID;config.workers_dev=false;config.preview_urls=false;
 config.d1_databases=[{binding:'DB',database_name:e.D1_DATABASE_NAME,database_id:e.D1_DATABASE_ID,migrations_dir:'migrations'}];
 config.vars={ENVIRONMENT:'production',PRODUCTION_SERVICES_ACTIVE:'false',...(kind==='public'?{ALLOWED_ORIGINS:e.SITE_ORIGIN,TURNSTILE_HOSTNAMES:'quantummedic.github.io'}:{ACCESS_TEAM_DOMAIN:e.ACCESS_TEAM_DOMAIN||'',ACCESS_AUD:'',SITE_ORIGIN:e.SITE_ORIGIN,SITE_BASE:e.SITE_BASE})};
 return {kind,config};
 });
}
if(process.argv[1]?.endsWith('/prepare-production-inactive.mjs')){
 const e=JSON.parse(readFileSync(process.argv[2]));
 for(const {kind,config} of inactiveConfigs(e)){
 const f=`services/comments/${kind}.production.private.json`;writeFileSync(f,JSON.stringify(config,null,2)+'\n',{mode:0o600});chmodSync(f,0o600);
 }
 console.log('Inactive configs only: no routes, workers.dev off, preview off, activation false, admin AUD absent.');
}
