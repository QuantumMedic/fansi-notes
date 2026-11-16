// SQL plan only. Run against the intended DB only after explicit authorization.
import manifest from '../services/comments/generated/threads.json' with {type:'json'};
const quote=s=>"'"+s.replaceAll("'","''")+"'";
console.log('-- Approved GUID aliases only; backup privately before applying.');
for(const [from,to] of Object.entries(manifest.aliases))console.log(`UPDATE comments SET thread=${quote(to)} WHERE thread=${quote(from)};`);
