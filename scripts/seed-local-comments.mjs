// Only imported by the isolated loopback adapter and local SQL tests.
import {hash} from '../services/comments/shared.mjs';
export async function seedLocal(db,manifest){
 const thread=Object.keys(manifest.threads).find(k=>manifest.threads[k].canonical_path==='/articles/antifragile-life/');if(!thread)throw Error('Missing approved preview article');
 const ids=Array.from({length:18},(_,i)=>'00000000-0000-4000-8000-'+String(i+1).padStart(12,'0'));
 const receipt={id:ids[12],token:'a'.repeat(64)};
 const paragraph='這是隔離示範留言，並非真實讀者經驗。我想在閱讀之後留一點空間，把今天理解的想法慢慢寫下來。段落中的停頓也值得保留，讓不同長度的文字可以自然展開。';
 for(let i=0;i<14;i++)await db.prepare("INSERT OR IGNORE INTO comments(id,thread,nickname,body,status,delete_hash,request_hash,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(ids[i],thread,i===9?'這是一個用來測試自然換行的較長讀者暱稱':'示範讀者'+(i+1),i===11?Array(5).fill(paragraph).join('\n\n'):i===12?'可以試著刪除這則自己的示範留言。':`示範留言 ${i+1}：讀完後留下的一點想法。\n這些都只是測試文字。`,i===13?'pending':'published',i===12?await hash(receipt.token):null,'local-seed',1700000000000+i*1000).run();
 for(let i=0;i<4;i++)await db.prepare("INSERT OR IGNORE INTO comments(id,thread,parent_id,nickname,body,status,author,request_hash,created_at) VALUES(?,?,?,'作者',?,'published',1,'local-seed',?)").bind(ids[14+i],thread,ids[i===3?12:i],`合成作者回覆 ${i+1}，不是宗凡實際說過的話。`,1700000100000+i*1000).run();
 return {thread,receipt};
}
