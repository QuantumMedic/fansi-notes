// Provisioning configuration only. No activation, network calls or fabricated approvals.
import {readFileSync,writeFileSync,chmodSync} from 'node:fs';
// Saved Access API readback must match the private production configuration.
// Missing AUD is permitted for initial fail-closed provisioning; a partial or
// mismatched verified configuration aborts before writing any output files.
export function verifiedInactiveAudience(e, evidence){
 if(!e.ACCESS_AUD){
  if(e.ACCESS_POLICY_VERIFIED==='true')throw Error('Verified Access configuration is incomplete');
  return '';
 }
 const a=evidence?.app?.result,p=evidence?.policies?.result;
 let origin;try{origin=new URL(e.ADMIN_WORKER_URL);}catch{throw Error('Invalid private admin origin');}
 const emails=(e.ADMIN_EMAIL_ALLOWLIST||'').split(',').map(x=>x.trim());
 const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 if(e.ACCESS_POLICY_VERIFIED!=='true'||!evidence?.app?.success||!evidence?.policies?.success||
    !/^[a-f0-9]{64}$/.test(e.ACCESS_AUD)||!e.STAGING_ACCESS_AUD||e.ACCESS_AUD===e.STAGING_ACCESS_AUD||
    !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(e.ACCESS_TEAM_DOMAIN||'')||
    origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password||
    !/^fansi-comments-admin\.[a-z0-9-]+\.workers\.dev$/.test(origin.hostname)||
    !e.ACCESS_APP_ID||a?.id!==e.ACCESS_APP_ID||a?.aud!==e.ACCESS_AUD||a?.type!=='self_hosted'||a?.domain!==origin.hostname||
    !same(a?.self_hosted_domains,[origin.hostname])||!Array.isArray(a?.destinations)||a.destinations.length!==1||a.destinations[0].type!=='public'||a.destinations[0].uri!==origin.hostname||
    a?.options_preflight_bypass!==false||a?.app_launcher_visible!==false||a?.http_only_cookie_attribute!==true||
    a?.allowed_idps?.length!==1||!a.allowed_idps[0]||
    emails.length!==1||!/^[^\s@*]+@[^\s@*]+\.[^\s@*]+$/.test(emails[0])||
    !Array.isArray(p)||p.length!==1||p[0].decision!=='allow'||
    !same(p[0].include,[{email:{email:emails[0]}}])||!same(p[0].exclude,[])||!same(p[0].require,[]))throw Error('Private Access readback does not match verified production settings');
 return e.ACCESS_AUD;
}
export function inactiveConfigs(e, evidence){
 if(!/^[a-f0-9]{32}$/i.test(e.CLOUDFLARE_ACCOUNT_ID||''))throw Error('Explicit actual account ID required');
 if(e.ENVIRONMENT!=='production'||e.D1_DATABASE_NAME!=='fansi-comments'||!/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(e.D1_DATABASE_ID||'')||!e.STAGING_D1_DATABASE_ID||e.D1_DATABASE_ID===e.STAGING_D1_DATABASE_ID)throw Error('Separate actual production D1 required');
 if(e.SITE_ORIGIN!=='https://quantummedic.github.io'||e.SITE_BASE!=='/fansi-notes')throw Error('Production target mismatch');
 const audience=verifiedInactiveAudience(e,evidence);
 return ['public','admin'].map(kind=>{
 const config=JSON.parse(readFileSync(`services/comments/wrangler.${kind}.jsonc`));
 config.account_id=e.CLOUDFLARE_ACCOUNT_ID;config.workers_dev=false;config.preview_urls=false;
 config.d1_databases=[{binding:'DB',database_name:e.D1_DATABASE_NAME,database_id:e.D1_DATABASE_ID,migrations_dir:'migrations'}];
 config.vars={ENVIRONMENT:'production',PRODUCTION_SERVICES_ACTIVE:'false',...(kind==='public'?{ALLOWED_ORIGINS:e.SITE_ORIGIN,TURNSTILE_HOSTNAMES:'quantummedic.github.io'}:{ACCESS_TEAM_DOMAIN:e.ACCESS_TEAM_DOMAIN||'',ACCESS_AUD:audience,SITE_ORIGIN:e.SITE_ORIGIN,SITE_BASE:e.SITE_BASE})};
 return {kind,config};
 });
}
if(process.argv[1]?.endsWith('/prepare-production-inactive.mjs')){
 const e=JSON.parse(readFileSync(process.argv[2]));
 const evidence=process.argv[3]?JSON.parse(readFileSync(process.argv[3])):undefined;
 for(const {kind,config} of inactiveConfigs(e,evidence)){
 const f=`services/comments/${kind}.production.private.json`;writeFileSync(f,JSON.stringify(config,null,2)+'\n',{mode:0o600});chmodSync(f,0o600);
 }
 console.log('Inactive configs only: no routes, workers.dev off, preview off, activation false; verified admin AUD preserved when supplied (value not logged).');
}
