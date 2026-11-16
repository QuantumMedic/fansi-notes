// Review-only pipeline. Ingestion remains an explicit, authorized preceding step.
import {execFileSync} from 'node:child_process';
for(const [bin,args] of [
 ['git',['diff','--stat']],['python3',['scripts/check_m5e_inputs.py']],
 ['node',['scripts/sync-comment-threads.mjs']],['npm',['run','check']],
 ['npm',['run','build']],['npm',['test']],['git',['diff','--stat']]
])execFileSync(bin,args,{stdio:'inherit'});
console.log('Review diff and local preview. No commit, push or publish performed.');
