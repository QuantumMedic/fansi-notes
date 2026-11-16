import {existsSync,readFileSync} from 'node:fs';
import {interactionConfig} from '../src/lib/interaction-config.mjs';
export function preflight(e,mode='local'){
 const missing=[],invalid=[];const requireValue=k=>{if(!e[k])missing.push(k);};
 if(mode==='local'){
  for(const p of ['node_modules/miniflare','node_modules/jose','services/comments/generated/threads.json','services/comments/migrations/0001_comments.sql'])if(!existsSync(p))missing.push(p);
  return {mode:'local',ready:missing.length===0,missing,invalid,live_verified:false};
 }
 for(const k of ['ENVIRONMENT','D1_DATABASE_ID','D1_DATABASE_NAME','PUBLIC_COMMENTS_API','ADMIN_WORKER_URL','PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','TURNSTILE_HOSTNAMES','RATE_LIMIT_HMAC_SECRET','ALLOWED_ORIGINS','ACCESS_TEAM_DOMAIN','ACCESS_AUD','ADMIN_EMAIL_ALLOWLIST','PUBLIC_FORMSPREE_ENDPOINT','PUBLIC_GOATCOUNTER_ENDPOINT','PUBLIC_ANALYTICS_HOSTS'])requireValue(k);
 if(e.ENVIRONMENT!==mode)invalid.push('ENVIRONMENT');
 for(const k of ['PUBLIC_COMMENTS_API','ADMIN_WORKER_URL']){try{const u=new URL(e[k]);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash||u.username||u.password||/example|localhost/.test(u.hostname))throw Error();}catch{invalid.push(k);}}
 if(e.PUBLIC_COMMENTS_API===e.ADMIN_WORKER_URL)invalid.push('separate_worker_origins');
 if(e.D1_DATABASE_ID&&!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(e.D1_DATABASE_ID))invalid.push('D1_DATABASE_ID');
 for(const k of ['PUBLIC_TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY'])if(e[k]&&(/^(1x|2x|3x|local)/.test(e[k])||/test|dummy|example/i.test(e[k])))invalid.push(k);
 if((e.RATE_LIMIT_HMAC_SECRET||'').length<32)invalid.push('RATE_LIMIT_HMAC_SECRET');
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(e.ACCESS_TEAM_DOMAIN||''))invalid.push('ACCESS_TEAM_DOMAIN');
 if(!(e.ADMIN_EMAIL_ALLOWLIST||'').split(',').every(x=>/^[^\s@*]+@[^\s@*]+\.[^\s@*]+$/.test(x.trim()))||/example\./.test(e.ADMIN_EMAIL_ALLOWLIST||''))invalid.push('ADMIN_EMAIL_ALLOWLIST');
 for(const k of ['ALLOWED_ORIGINS'])if(!(e[k]||'').split(',').every(s=>{try{const u=new URL(s);return u.protocol==='https:'&&u.origin===s&&!/localhost|example/.test(u.hostname);}catch{return false;}}))invalid.push(k);
 const c=interactionConfig({...e,PUBLIC_COMMENTS_ENABLED:'true',PUBLIC_CONTACT_ENABLED:'true',PUBLIC_ANALYTICS_ENABLED:'true',DEV:false,CI:false});
 if(!c.comments.enabled)invalid.push('comments_public_config');if(!c.contact.enabled)invalid.push('contact_public_config');if(!c.analytics.enabled)invalid.push('analytics_public_config');
 const consent=['REMOTE_TEST_DEPLOY_APPROVED','FORMSPREE_RECIPIENT_VERIFIED','ACCESS_POLICY_VERIFIED','GOATCOUNTER_PRIVATE_DASHBOARD_VERIFIED'];
 if(mode==='production')consent.push('M6_DEPLOY_APPROVED','LIVE_COMMENTS_VERIFIED','LIVE_ACCESS_VERIFIED','LIVE_MAIL_RECEIVED','ISOLATED_ANALYTICS_VERIFIED');
 for(const k of consent)if(e[k]!=='true')missing.push(k);
 return {mode,ready:missing.length===0&&invalid.length===0,missing:[...new Set(missing)],invalid:[...new Set(invalid)],live_verified:mode==='production'&&missing.length===0};
}
if(process.argv[1]?.endsWith('check_interaction_config.mjs')){
 const mode=process.argv[2]||'local';if(!['local','staging','production'].includes(mode))throw Error('Use local|staging|production');
 const file=process.argv[3];const e=file?JSON.parse(readFileSync(file,'utf8')):process.env;
 const result=preflight(e,mode);console.log(JSON.stringify({...result,status:result.ready?mode+'-ready':'not-configured'},null,2));if(!result.ready)process.exitCode=1;
}
