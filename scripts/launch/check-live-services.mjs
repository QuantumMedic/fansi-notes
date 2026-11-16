// Read-only activation prerequisite; never sends comments, mail, analytics or admin requests.
import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import {validate} from './release.mjs';
const c=JSON.parse(readFileSync(process.argv[2]));const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const errors=validate(c,sha);if(errors.length)throw Error(errors.join('; '));
if(c.services==='full'){
 const r=await fetch(c.service_manifest.public.PUBLIC_COMMENTS_API+'/health',{redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('Production API is not active; stop release');
 const x=await r.json();if(x.service!=='comments'||x.configured!==true||x.accepting_comments!==true)throw Error('Production API configuration not ready');
 console.log('Production public API read-only health verified. Private Access evidence remains a separate gate.');
}else console.log('Service-off release: no network service checks.');
