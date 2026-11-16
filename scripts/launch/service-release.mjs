import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {preflight} from '../check_interaction_config.mjs';
import {interactionConfig} from '../../src/lib/interaction-config.mjs';
export const publicKeys=['PUBLIC_COMMENTS_API','PUBLIC_TURNSTILE_SITE_KEY','PUBLIC_FORMSPREE_ENDPOINT','PUBLIC_GOATCOUNTER_ENDPOINT','PUBLIC_ANALYTICS_HOSTS'];
export const gates=['M6_DEPLOY_APPROVED','LIVE_COMMENTS_VERIFIED','LIVE_ACCESS_VERIFIED','NON_ALLOWLIST_ADMIN_VERIFIED','INDEPENDENT_BROWSER_DELETE_VERIFIED','ACCESS_POLICY_VERIFIED','FORMSPREE_RECIPIENT_VERIFIED','LIVE_MAIL_RECEIVED','ISOLATED_ANALYTICS_VERIFIED','GOATCOUNTER_PRIVATE_DASHBOARD_VERIFIED'];
export function validateServiceRelease(s,sha){
 const errors=[];if(!s||typeof s!=='object')return ['Missing approved service manifest'];
 if(Object.keys(s).some(k=>!['environment','approved_commit','public','evidence'].includes(k)))errors.push('Unknown manifest field');
 if(s.environment!=='production'||s.approved_commit!==sha||!/^[a-f0-9]{40}$/.test(sha||''))errors.push('Release SHA/environment mismatch');
 if(!s.public||Object.keys(s.public).some(k=>!publicKeys.includes(k))||publicKeys.some(k=>typeof s.public[k]!=='string'))errors.push('Public allowlist mismatch');
 if(!s.evidence||gates.some(k=>s.evidence[k]!==true)||Object.keys(s.evidence||{}).some(k=>!gates.includes(k)))errors.push('Unverified activation evidence');
 const e=s.public||{};const c=interactionConfig({...e,PUBLIC_COMMENTS_ENABLED:'true',PUBLIC_CONTACT_ENABLED:'true',PUBLIC_ANALYTICS_ENABLED:'true'});
 if(!c.comments.enabled||!c.contact.enabled||!c.analytics.enabled)errors.push('Invalid service config');
 try{const u=new URL(e.PUBLIC_COMMENTS_API);if(!/^fansi-comments\.[a-z0-9-]+\.workers\.dev$/.test(u.hostname)||/staging/.test(u.hostname.split('.')[0]))throw Error();}catch{errors.push('Production API identity');}
 // Account-level workers.dev suffix may contain "staging"; script identity, not suffix, separates services.
 if(e.PUBLIC_GOATCOUNTER_ENDPOINT!=='https://fansi-notes.goatcounter.com/count'||e.PUBLIC_ANALYTICS_HOSTS!=='quantummedic.github.io')errors.push('Production analytics mismatch');
 if(!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(e.PUBLIC_FORMSPREE_ENDPOINT||''))errors.push('Formspree endpoint');
 if(/^(1x|2x|3x|local)|dummy|example|test/i.test(e.PUBLIC_TURNSTILE_SITE_KEY||''))errors.push('Turnstile key');
 return errors;
}
export function serviceEnvironment(s,sha){const errors=validateServiceRelease(s,sha);if(errors.length)throw Error(errors.join('; '));return {...s.public,PUBLIC_COMMENTS_ENABLED:'true',PUBLIC_CONTACT_ENABLED:'true',PUBLIC_ANALYTICS_ENABLED:'true',PUBLIC_EMAIL_APPROVED:'false',PUBLIC_CONTACT_EMAIL:''};}
if(process.argv[1]?.endsWith('/service-release.mjs')){
 const [input,out]=process.argv.slice(2);if(!input||!out)throw Error('PRIVATE_CONFIG OUTPUT (keep outside repo)');
 const e=JSON.parse(readFileSync(input));const r=preflight(e,'production');if(!r.ready)throw Error('Production gates missing: '+[...r.missing,...r.invalid].join(', '));
 const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const s={environment:'production',approved_commit:sha,public:Object.fromEntries(publicKeys.map(k=>[k,e[k]])),evidence:Object.fromEntries(gates.map(k=>[k,e[k]==='true']))};
 const errors=validateServiceRelease(s,sha);if(errors.length)throw Error(errors.join('; '));
 writeFileSync(out,JSON.stringify(s,null,2)+'\n',{flag:'wx',mode:0o600});console.log('Allowlisted release manifest exported; no Worker secret/admin URL/email exported. No activation or deployment.');
}
