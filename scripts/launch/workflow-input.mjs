import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
import {validate} from './release.mjs';
export function workflowInput(e,sha){
 const mode=e.RELEASE_SERVICES||'off';
 if(mode==='full'&&e.SERVICES_CONFIRMATION!=='ENABLE_VERIFIED_PRODUCTION_SERVICES')throw Error('Separate full-service authorization required');
 if(e.INDEXING==='index'&&e.INDEXING_CONFIRMATION!=='AUTHORIZE_INDEXING')throw Error('Separate indexing authorization required');
 let manifest;
 if(mode==='full'){try{manifest=JSON.parse(e.RELEASE_SERVICES_JSON||'');}catch{throw Error('Missing valid environment release manifest');}}
 const c={environment:'production',site:'https://quantummedic.github.io/fansi-notes/',indexing:e.INDEXING||'noindex',indexing_authorized:e.INDEXING_CONFIRMATION==='AUTHORIZE_INDEXING',services:mode,...(manifest?{service_manifest:manifest}:{})};
 const errors=validate(c,sha);if(errors.length)throw Error(errors.join('; '));return c;
}
if(process.argv[1]?.endsWith('/workflow-input.mjs')){
 const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const c=workflowInput(process.env,sha);
 writeFileSync(process.argv[2],JSON.stringify(c),{mode:0o600,flag:'wx'});
 console.log('Explicit release choices and SHA-scoped evidence validated.');
}
