// Explicitly authorized, temporary acceptance configs; never a release manifest.
import {readFileSync,writeFileSync,mkdirSync,chmodSync} from 'node:fs';
import {resolve} from 'node:path';
import {inactiveConfigs} from './prepare-production-inactive.mjs';
export function verificationConfigs(prod,proof,stage,frontProof,site,start,end){
 const configs=inactiveConfigs(prod,proof),a=frontProof?.app?.result||frontProof?.app,p=frontProof?.policies?.result||frontProof?.policies;
 const u=new URL(stage.SITE_ORIGIN);
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||end<=start||end-start>4*3600000||
    stage.ENVIRONMENT!=='staging'||stage.CLOUDFLARE_ACCOUNT_ID!==prod.CLOUDFLARE_ACCOUNT_ID||
    u.protocol!=='https:'||u.origin!==stage.SITE_ORIGIN||!/^fansi-notes-staging\.[a-z0-9-]+\.workers\.dev$/.test(u.hostname)||
    stage.ADMIN_EMAIL_ALLOWLIST!==prod.ADMIN_EMAIL_ALLOWLIST||stage.ACCESS_TEAM_DOMAIN!==prod.ACCESS_TEAM_DOMAIN||
    !stage.FRONTEND_ACCESS_AUD||stage.FRONTEND_ACCESS_AUD===prod.ACCESS_AUD||a?.aud!==stage.FRONTEND_ACCESS_AUD||a?.domain!==u.hostname||
    a?.type!=='self_hosted'||a?.options_preflight_bypass!==false||a?.http_only_cookie_attribute!==true||
    JSON.stringify(a?.self_hosted_domains)!==JSON.stringify([u.hostname])||
    !Array.isArray(p)||p.length!==1||p[0].decision!=='allow'||JSON.stringify(p[0].include)!==JSON.stringify([{email:{email:prod.ADMIN_EMAIL_ALLOWLIST}}])||p[0].exclude?.length||p[0].require?.length||
    site.name!=='fansi-notes-staging'||site.account_id!==prod.CLOUDFLARE_ACCOUNT_ID||!site.assets?.run_worker_first||!site.assets?.directory)throw Error('Invalid private verification target or Access evidence');
 const window={PRODUCTION_SERVICES_ACTIVE:'false',VERIFICATION_ENABLED:'true',VERIFICATION_START:String(start),VERIFICATION_END:String(end)};
 for(const {kind,config} of configs){config.main=`verification-${kind}.mjs`;Object.assign(config.vars,window);
  if(kind==='public'){
   Object.assign(config.vars,{ALLOWED_ORIGINS:stage.SITE_ORIGIN,TURNSTILE_HOSTNAMES:u.hostname,ACCESS_TEAM_DOMAIN:stage.ACCESS_TEAM_DOMAIN,ACCESS_AUD:stage.FRONTEND_ACCESS_AUD});
   config.triggers={crons:['* * * * *']};
  }else Object.assign(config.vars,{SITE_ORIGIN:stage.SITE_ORIGIN});
 }
 configs.push({kind:'site',config:{...site,main:'verification-site.mjs',preview_urls:false,services:[{binding:'COMMENTS',service:'fansi-comments'}],vars:{...site.vars,...window}}});
 return configs;
}
if(process.argv[1]?.endsWith('/prepare-verification-window.mjs')){
 const [planFile,out]=process.argv.slice(2);const plan=JSON.parse(readFileSync(planFile));
 if(resolve(out).startsWith(resolve('.')+'/'))throw Error('Private output must be outside repository');
 const load=f=>JSON.parse(readFileSync(f));
 const configs=verificationConfigs(load(plan.production),load(plan.productionEvidence),load(plan.staging),load(plan.frontendEvidence),load(plan.siteConfig),plan.start,plan.end);
 mkdirSync(out,{recursive:true,mode:0o700});chmodSync(out,0o700);
 for(const {kind,config} of configs){config.main=resolve('services/comments',config.main);if(config.d1_databases)config.d1_databases[0].migrations_dir=resolve('services/comments/migrations');const f=resolve(out,kind+'.json');writeFileSync(f,JSON.stringify(config,null,2),{mode:0o600});chmodSync(f,0o600);}
 console.log('Private verification configs prepared. No deployment, release approval or live-evidence flags set.');
}
