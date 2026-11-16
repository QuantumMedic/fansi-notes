// Print reviewable project-scoped commands; NEVER run them here.
import {readFileSync,writeFileSync,realpathSync} from 'node:fs';import {resolve,relative} from 'node:path';
const [action,file,output,version]=process.argv.slice(2);
if(!['provision','migrate','rollback'].includes(action)||!file||!output)throw Error('worker-commands.mjs provision|migrate|rollback PRIVATE.json PRIVATE_OUTPUT [VERSION_UUID]');
const c=JSON.parse(readFileSync(file));if(c.ENVIRONMENT!=='production'||c.D1_DATABASE_NAME!=='fansi-comments')throw Error('Exact production project required');
const rel=relative(process.cwd(),resolve(output));if(!rel.startsWith('..'))throw Error('Output must be outside repository');
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
let commands=['# REVIEW ONLY: requires separate author authorization; not executed.','umask 077'];
if(action==='provision')commands.push('npx wrangler d1 create fansi-comments','# Copy returned ID into private settings. Create exact-host Turnstile and admin-only Access; never protect public Pages with author login.');
else {
 if(!c.D1_DATABASE_ID)throw Error('Missing actual database ID');
 for(const kind of ['public','admin']){
 const path=resolve(`services/comments/${kind}.production.private.json`);const cfg=JSON.parse(readFileSync(path));
 if(cfg.d1_databases[0].database_id!==c.D1_DATABASE_ID||cfg.d1_databases[0].database_name!==c.D1_DATABASE_NAME)throw Error('Binding mismatch');
 if(action==='rollback'){
 if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(version||''))throw Error('Actual Worker version UUID required');
 commands.push(`# ${kind}: verify this version belongs to this Worker before running`, `npx wrangler rollback ${quote(version)} --config ${quote(path)}`);
 }else if(kind==='public')commands.push(`npx wrangler d1 migrations apply fansi-comments --remote --config ${quote(path)}`);
 }
}
writeFileSync(output,commands.join('\n')+'\n',{mode:0o600,flag:'wx'});console.log('Private commands prepared only.');
