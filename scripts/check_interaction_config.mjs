import {existsSync,readFileSync} from 'node:fs';
import {interactionConfig} from '../src/lib/interaction-config.mjs';
export function preflight(e,mode='local'){
 const missing=[],invalid=[];const requireValue=k=>{if(!e[k])missing.push(k);};
 if(mode==='local'){
  for(const p of ['node_modules/miniflare','node_modules/jose','services/comments/generated/threads.json','services/comments/migrations/0001_comments.sql'])if(!existsSync(p))missing.push(p);
  return {mode:'local',ready:missing.length===0,missing,invalid,live_verified:false};
 }
 for(const k of ['SITE_ORIGIN','SITE_BASE','ENVIRONMENT','D1_DATABASE_ID','D1_DATABASE_NAME','PUBLIC_COMMENTS_API','ADMIN_WORKER_URL','PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','TURNSTILE_HOSTNAMES','RATE_LIMIT_HMAC_SECRET','ALLOWED_ORIGINS','ACCESS_TEAM_DOMAIN','ACCESS_AUD','ADMIN_EMAIL_ALLOWLIST','PUBLIC_FORMSPREE_ENDPOINT','PUBLIC_GOATCOUNTER_ENDPOINT','PUBLIC_ANALYTICS_HOSTS'])requireValue(k);
 if(e.ENVIRONMENT!==mode)invalid.push('ENVIRONMENT');
 for(const k of ['PUBLIC_COMMENTS_API','ADMIN_WORKER_URL']){try{const u=new URL(e[k]);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash||u.username||u.password||/example|localhost/.test(u.hostname))throw Error();}catch{invalid.push(k);}}
 try{const u=new URL(e.SITE_ORIGIN);if(u.protocol!=='https:'||u.origin!==e.SITE_ORIGIN)throw Error();}catch{invalid.push('SITE_ORIGIN');}
 if(!/^\/[a-zA-Z0-9/-]*$/.test(e.SITE_BASE||''))invalid.push('SITE_BASE');
 if(e.PUBLIC_COMMENTS_API===e.ADMIN_WORKER_URL)invalid.push('separate_worker_origins');
 if(e.D1_DATABASE_ID&&!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(e.D1_DATABASE_ID))invalid.push('D1_DATABASE_ID');
 for(const k of ['PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY'])if(e[k]&&(/^(1x|2x|3x|local)/.test(e[k])||/test|dummy|example/i.test(e[k])))invalid.push(k);
 if((e.RATE_LIMIT_HMAC_SECRET||'').length<32)invalid.push('RATE_LIMIT_HMAC_SECRET');
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(e.ACCESS_TEAM_DOMAIN||''))invalid.push('ACCESS_TEAM_DOMAIN');
 if(!(e.ADMIN_EMAIL_ALLOWLIST||'').split(',').every(x=>/^[^\s@*]+@[^\s@*]+\.[^\s@*]+$/.test(x.trim()))||/example\./.test(e.ADMIN_EMAIL_ALLOWLIST||''))invalid.push('ADMIN_EMAIL_ALLOWLIST');
 for(const k of ['ALLOWED_ORIGINS'])if(!(e[k]||'').split(',').every(s=>{try{const u=new URL(s);return u.protocol==='https:'&&u.origin===s&&!/localhost|example/.test(u.hostname);}catch{return false;}}))invalid.push(k);
 const c=interactionConfig({...e,PUBLIC_COMMENTS_ENABLED:'true',PUBLIC_CONTACT_ENABLED:'true',PUBLIC_ANALYTICS_ENABLED:'true',DEV:false,CI:false});
 if(!c.comments.enabled)invalid.push('comments_public_config');if(!c.contact.enabled)invalid.push('contact_public_config');if(!c.analytics.enabled)invalid.push('analytics_public_config');
 const consent=[mode==='production'?'PRODUCTION_RESOURCES_AUTHORIZED':'REMOTE_TEST_DEPLOY_APPROVED','FORMSPREE_RECIPIENT_VERIFIED','ACCESS_POLICY_VERIFIED','GOATCOUNTER_PRIVATE_DASHBOARD_VERIFIED'];
 if(mode==='production')consent.push('M6_DEPLOY_APPROVED','LIVE_COMMENTS_VERIFIED','LIVE_ACCESS_VERIFIED','LIVE_MAIL_RECEIVED','ISOLATED_ANALYTICS_VERIFIED','NON_ALLOWLIST_ADMIN_VERIFIED','INDEPENDENT_BROWSER_DELETE_VERIFIED');
 if(mode==='production'){
  if(/https:\/\/[^.]*staging/i.test(e.PUBLIC_COMMENTS_API||''))invalid.push('staging_api');
  if(!e.STAGING_ACCESS_AUD)missing.push('STAGING_ACCESS_AUD');
  if(e.ACCESS_AUD===e.STAGING_ACCESS_AUD)invalid.push('separate_access_audience');
  if(e.ALLOWED_ORIGINS!=='https://quantummedic.github.io'||e.TURNSTILE_HOSTNAMES!=='quantummedic.github.io')invalid.push('exact_production_origin');
  if(e.D1_DATABASE_NAME!=='fansi-comments')invalid.push('production_database_name');
  if(!e.STAGING_D1_DATABASE_ID)missing.push('STAGING_D1_DATABASE_ID');
  if(e.D1_DATABASE_ID===e.STAGING_D1_DATABASE_ID)invalid.push('separate_production_database');
  if(e.SITE_ORIGIN!=='https://quantummedic.github.io'||e.SITE_BASE!=='/fansi-notes')invalid.push('production_site');
  if(e.PUBLIC_GOATCOUNTER_ENDPOINT!=='https://fansi-notes.goatcounter.com/count')invalid.push('production_analytics');
 }
 for(const k of consent)if(e[k]!=='true')missing.push(k);
 return {mode,ready:missing.length===0&&invalid.length===0,missing:[...new Set(missing)],invalid:[...new Set(invalid)],live_verified:mode==='production'&&missing.length===0};
}
if(process.argv[1]?.endsWith('check_interaction_config.mjs')){
 const mode=process.argv[2]||'local';if(!['local','staging','production'].includes(mode))throw Error('Use local|staging|production');
 const file=process.argv[3];const e=file?JSON.parse(readFileSync(file,'utf8')):process.env;
 const result=preflight(e,mode);console.log(JSON.stringify({...result,status:result.ready?mode+'-ready':'not-configured'},null,2));if(!result.ready)process.exitCode=1;
}
