export function newReceipt(){const bytes=crypto.getRandomValues(new Uint8Array(32));return {id:crypto.randomUUID(),token:[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('')};}
export function storeReceipt(storage,thread,receipt){try{const key='fansi.comment.'+thread;const entries=JSON.parse(storage.getItem(key)||'[]').filter(x=>x.id!==receipt.id);storage.setItem(key,JSON.stringify([...entries,receipt]));return true;}catch{return false;}}
export function readReceipts(storage,thread){try{return JSON.parse(storage.getItem('fansi.comment.'+thread)||'[]').filter(x=>/^[a-f0-9-]{36}$/.test(x.id)&&/^[a-f0-9]{64}$/.test(x.token));}catch{return [];}}
export async function sendContact(endpoint,fields,{fetcher=fetch,timeout=12000}={}){
 try{const r=await fetcher(endpoint,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(fields),signal:AbortSignal.timeout(timeout)});
 if(r.status===429)return {ok:false,message:'服務額度已滿或送出過於頻繁，文字已保留，請稍後再試。'};
 if(!r.ok)return {ok:false,message:'服務未接受來信，文字已保留。請稍後再試或使用已提供的聯絡備援。'};
 const data=await r.json();if(data.ok!==true)return {ok:false,message:'尚未取得服務接受確認，文字已保留。'};
 return {ok:true,message:'服務已接受來信；這不代表信件已送達或作者已閱讀。'};
 }catch{return {ok:false,message:'連線失敗或逾時，文字已保留。可能已被服務接受，請勿立即重複寄送。'};}
}
