// Packages the existing Astro build for a separate, Access-protected staging Worker.
// No cloud changes; requires real, already verified Access policy configuration.
import {readFileSync,writeFileSync,chmodSync,mkdtempSync,cpSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {preflight} from './check_interaction_config.mjs';

const [file]=process.argv.slice(2);
if(!file)throw Error('Usage: node scripts/prepare-staging-site.mjs PRIVATE_CONFIG.json');
const e=JSON.parse(readFileSync(file,'utf8'));
const result=preflight(e,'staging');
if(!result.ready){console.log(JSON.stringify(result,null,2));process.exit(1);}
if(!e.FRONTEND_ACCESS_AUD||e.FRONTEND_ACCESS_AUD===e.ACCESS_AUD)throw Error('Separate frontend Access audience required');
const privateDir=dirname(resolve(file)),root=process.cwd();
if(privateDir===root||privateDir.startsWith(root+'/'))throw Error('Staging assets must be outside the repository');
if(!existsSync('dist/index.html'))throw Error('Build Astro before packaging staging assets');
const forbidden=[e.ADMIN_WORKER_URL,e.ADMIN_EMAIL_ALLOWLIST,e.TURNSTILE_SECRET_KEY,e.RATE_LIMIT_HMAC_SECRET].filter(Boolean);
function audit(dir){for(const item of readdirSync(dir,{withFileTypes:true})){
 const path=join(dir,item.name);
 if(item.isSymbolicLink())throw Error('Symlinks are not allowed in staging assets');
 if(item.isDirectory())audit(path);
 else if(/\.(html|js|json|map|xml|txt)$/i.test(item.name)){
  const text=readFileSync(path,'utf8');if(forbidden.some(value=>text.includes(value)))throw Error('Private configuration found in static assets');
 }
}}
audit('dist');
const assets=mkdtempSync(join(privateDir,'site-assets-'));chmodSync(assets,0o700);
cpSync('dist',join(assets,'fansi-notes'),{recursive:true});
const config={name:'fansi-notes-staging',account_id:e.CLOUDFLARE_ACCOUNT_ID,main:'staging-site.mjs',compatibility_date:'2026-11-16',workers_dev:true,preview_urls:false,
 assets:{directory:assets,binding:'ASSETS',run_worker_first:true},
 vars:{ENVIRONMENT:'staging',SITE_BASE:'/fansi-notes',ACCESS_TEAM_DOMAIN:e.ACCESS_TEAM_DOMAIN,ACCESS_AUD:e.FRONTEND_ACCESS_AUD}};
const output='services/comments/site.staging.private.json';
writeFileSync(output,JSON.stringify(config,null,2)+'\n',{mode:0o600});chmodSync(output,0o600);
console.log('Prepared private staging assets/config only. Set the server-only author allowlist secret before authorized deployment.');
