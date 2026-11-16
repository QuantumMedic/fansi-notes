// Writes ignored deployment configuration only; does not provision or deploy anything.
import {readFileSync,writeFileSync,chmodSync} from 'node:fs';
import {preflight} from './check_interaction_config.mjs';
const [file,mode]=process.argv.slice(2);if(!file||!['staging','production'].includes(mode))throw Error('Usage: node scripts/prepare-interaction-config.mjs PRIVATE_CONFIG.json staging|production');
const e=JSON.parse(readFileSync(file,'utf8')),result=preflight(e,mode);if(!result.ready){console.log(JSON.stringify(result,null,2));process.exit(1);}
for(const kind of ['public','admin']){
 const config=JSON.parse(readFileSync(`services/comments/wrangler.${kind}.jsonc`,'utf8'));
 if(e.CLOUDFLARE_ACCOUNT_ID)config.account_id=e.CLOUDFLARE_ACCOUNT_ID;
 config.name+=(mode==='staging'?'-staging':'');config.d1_databases=[{binding:'DB',database_name:e.D1_DATABASE_NAME,database_id:e.D1_DATABASE_ID,migrations_dir:'migrations'}];
 config.vars=kind==='public'?{ENVIRONMENT:mode,ALLOWED_ORIGINS:e.ALLOWED_ORIGINS,TURNSTILE_HOSTNAMES:e.TURNSTILE_HOSTNAMES}:{ENVIRONMENT:mode,ACCESS_TEAM_DOMAIN:e.ACCESS_TEAM_DOMAIN,ACCESS_AUD:e.ACCESS_AUD,SITE_ORIGIN:e.SITE_ORIGIN,SITE_BASE:e.SITE_BASE};
 if(mode==='production')config.vars.PRODUCTION_SERVICES_ACTIVE='true';
 const output=`services/comments/${kind}.${mode}.private.json`;
 writeFileSync(output,JSON.stringify(config,null,2)+'\n',{mode:0o600});chmodSync(output,0o600);
}
console.log('Prepared ignored config only. Secrets, migration and deployment remain separate authorized steps.');
