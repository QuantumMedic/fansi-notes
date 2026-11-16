// Static release preparation only. No network writes or deployment.
import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
export const target='https://quantummedic.github.io/fansi-notes/';
export function validate(c){
 const errors=[];
 if(c.environment!=='production'||c.site!==target)errors.push('Exact production target required');
 if(!['noindex','index'].includes(c.indexing))errors.push('Explicit indexing mode required');
 if(c.indexing==='index'&&c.indexing_authorized!==true)errors.push('Indexing requires separate authorization');
 // Services are activated through their existing private preflight, never ambient env.
 if(c.services!== 'off')errors.push('This static release candidate requires services off; production interactions remain gated');
 return errors;
}
export function files(dir){return readdirSync(dir).flatMap(n=>{const p=resolve(dir,n);return statSync(p).isDirectory()?files(p):[p];});}
export function audit(dir,indexing){
 const errors=[];for(const p of files(dir)){
 if(!/\.(html|xml|txt|js|map)$/.test(p))continue;
 const s=readFileSync(p,'utf8');
 if(/https?:\/\/(?:localhost|127\.0\.0\.1|[^\s"'<>]*staging[^\s"'<>]*\.workers\.dev)/i.test(s))errors.push(relative(dir,p)+': nonproduction URL');
 if(p.endsWith('.html')){
 const canonical=s.match(/rel="canonical" href="([^"]+)"/);
 if(!canonical||!canonical[1].toLowerCase().startsWith(target))errors.push(relative(dir,p)+': canonical');
 if(s.includes('http-equiv="refresh"') ? !s.includes('name="robots" content="noindex"') : !s.includes(`name="robots" content="${indexing==='index'?'index,follow':'noindex,nofollow'}"`))errors.push(relative(dir,p)+': robots');
 }
 }return errors;
}
if(process.argv[1]?.endsWith('/release.mjs')){
 const [action,file]=process.argv.slice(2);if(!['build','audit'].includes(action)||!file)throw Error('release.mjs build|audit CONFIG.json');
 const c=JSON.parse(readFileSync(file));const errors=validate(c);if(errors.length)throw Error(errors.join('; '));
 const out=resolve('.release/site');
 if(action==='build'){
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!k.startsWith('PUBLIC_')&&!k.startsWith('FANSI_')));
 Object.assign(env,{FANSI_INDEXING:c.indexing,FANSI_INDEXING_AUTHORIZED:String(c.indexing_authorized===true),ASTRO_TELEMETRY_DISABLED:'1'});
 execFileSync('npm',['run','build','--','--outDir',out],{env,stdio:'inherit'});
 }
 const problems=audit(out,c.indexing);if(problems.length)throw Error(problems.join('\n'));
 const manifest={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),target,indexing:c.indexing,services:'off',files:Object.fromEntries(files(out).map(p=>[relative(out,p),createHash('sha256').update(readFileSync(p)).digest('hex')]))};
 mkdirSync('.release',{recursive:true});writeFileSync('.release/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('Static candidate verified; nothing deployed.');
}
