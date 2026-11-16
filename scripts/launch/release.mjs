// Static release preparation only. No network writes or deployment.
import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {serviceEnvironment,validateServiceRelease} from './service-release.mjs';
export const target='https://quantummedic.github.io/fansi-notes/';
export function validate(c,sha){
 const errors=[];
 if(c.environment!=='production'||c.site!==target)errors.push('Exact production target required');
 if(!['noindex','index'].includes(c.indexing))errors.push('Explicit indexing mode required');
 if(c.indexing==='index'&&c.indexing_authorized!==true)errors.push('Indexing requires separate authorization');
 // Services are activated through their existing private preflight, never ambient env.
 if(!['off','full'].includes(c.services))errors.push('Explicit off|full service mode required');
 if(c.services==='full')errors.push(...validateServiceRelease(c.service_manifest,sha));
 return errors;
}
export function files(dir){return readdirSync(dir).flatMap(n=>{const p=resolve(dir,n);return statSync(p).isDirectory()?files(p):[p];});}
export function audit(dir,indexing,allowedApi=''){
 const errors=[];for(const p of files(dir)){
 if(!/\.(html|xml|txt|js|map)$/.test(p))continue;
 const s=readFileSync(p,'utf8');
 const scanned=allowedApi?s.replaceAll(allowedApi,'APPROVED_PRODUCTION_API'):s;
 if(/https?:\/\/(?:localhost|127\.0\.0\.1|[^\s"'<>]*staging[^\s"'<>]*\.workers\.dev|fansi-comments-admin\.[^\s"'<>]*)/i.test(scanned))errors.push(relative(dir,p)+': nonproduction URL');
 if(p.endsWith('.html')){
 const canonical=s.match(/rel="canonical" href="([^"]+)"/);
 if(!canonical||!canonical[1].toLowerCase().startsWith(target))errors.push(relative(dir,p)+': canonical');
 if(s.includes('http-equiv="refresh"') ? !s.includes('name="robots" content="noindex"') : !s.includes(`name="robots" content="${indexing==='index'?'index,follow':'noindex,nofollow'}"`))errors.push(relative(dir,p)+': robots');
 }
 }return errors;
}
export function buildEnvironment(c,sha,ambient={}){
 const errors=validate(c,sha);if(errors.length)throw Error(errors.join('; '));
 const env=Object.fromEntries(Object.entries(ambient).filter(([k])=>!k.startsWith('PUBLIC_')&&!k.startsWith('FANSI_')));
 Object.assign(env,{PUBLIC_COMMENTS_ENABLED:'false',PUBLIC_CONTACT_ENABLED:'false',PUBLIC_ANALYTICS_ENABLED:'false',PUBLIC_COMMENTS_API:'',PUBLIC_TURNSTILE_SITE_KEY:'',PUBLIC_FORMSPREE_ENDPOINT:'',PUBLIC_GOATCOUNTER_ENDPOINT:'',PUBLIC_ANALYTICS_HOSTS:'',PUBLIC_EMAIL_APPROVED:'false',PUBLIC_CONTACT_EMAIL:'',PUBLIC_INTERACTIONS_LOCAL:'false'});
 if(c.services==='full'){Object.assign(env,serviceEnvironment(c.service_manifest,sha));delete env.CI;}
 Object.assign(env,{FANSI_INDEXING:c.indexing,FANSI_INDEXING_AUTHORIZED:String(c.indexing_authorized===true),ASTRO_TELEMETRY_DISABLED:'1'});
 return env;
}
if(process.argv[1]?.endsWith('/release.mjs')){
 const [action,file]=process.argv.slice(2);if(!['build','audit'].includes(action)||!file)throw Error('release.mjs build|audit CONFIG.json');
 const c=JSON.parse(readFileSync(file));const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const errors=validate(c,sha);if(errors.length)throw Error(errors.join('; '));
 const out=resolve('.release/site');
 if(action==='build'){
 const env=buildEnvironment(c,sha,process.env);
 execFileSync('npm',['run','build','--','--outDir',out],{env,stdio:'inherit'});
 }
 const problems=audit(out,c.indexing,c.services==='full'?c.service_manifest.public.PUBLIC_COMMENTS_API:'');if(problems.length)throw Error(problems.join('\n'));
 const manifest={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),target,indexing:c.indexing,services:c.services,files:Object.fromEntries(files(out).map(p=>[relative(out,p),createHash('sha256').update(readFileSync(p)).digest('hex')]))};
 mkdirSync('.release',{recursive:true});writeFileSync('.release/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('Static candidate verified; nothing deployed.');
}
