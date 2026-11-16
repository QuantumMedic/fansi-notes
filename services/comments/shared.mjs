import manifest from './generated/threads.json' with {type:'json'};
export const LIMITS={body:16384,nickname:40,message:2000,page:20,maxPage:50,window:600,requests:10};
export class HttpError extends Error {constructor(status,code){super(code);this.status=status;}}
export const fail=(status,code)=>{throw new HttpError(status,code);};
export const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
export const list=v=>(v||'').split(',').map(s=>s.trim()).filter(Boolean);
export const canonical=key=>{const t=manifest.aliases[key]||key;return Object.hasOwn(manifest.threads,t)?t:fail(404,'unknown_thread');};
export const tokenOK=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export const idOK=v=>typeof v==='string'&&/^[a-f0-9-]{36}$/.test(v);
export function text(v,max){if(typeof v!=='string'||!v.trim()||[...v.trim()].length>max)fail(400,'invalid_input');return v.trim();}
export async function readJSON(req){
 if(!req.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'json_required');
 if(Number(req.headers.get('Content-Length'))>LIMITS.body)fail(413,'too_large');
 const reader=req.body?.getReader();if(!reader)fail(400,'invalid_json');let size=0,chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>LIMITS.body){await reader.cancel();fail(413,'too_large');}chunks.push(value);}
 try{const bytes=new Uint8Array(size);let i=0;for(const c of chunks){bytes.set(c,i);i+=c.length;}const b=JSON.parse(new TextDecoder().decode(bytes));if(!b||Array.isArray(b)||typeof b!=='object')fail(400,'invalid_json');return b;}catch{fail(400,'invalid_json');}
}
export function baseConfigured(env){return env.DB&&['staging','production'].includes(env.ENVIRONMENT)&&env.RATE_LIMIT_HMAC_SECRET?.length>=32;}
export async function rate(req,env,scope='write'){
 if(!env.RATE_LIMIT_HMAC_SECRET||env.RATE_LIMIT_HMAC_SECRET.length<32)fail(503,'not_configured');
 const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/LIMITS.window);
 const ip=req.headers.get('CF-Connecting-IP');if(!ip)fail(503,'identity_unavailable');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.RATE_LIMIT_HMAC_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=[...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${scope}:${bucket}:${ip}`)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const rows=await env.DB.batch([
 env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now),
 env.DB.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(digest,now+LIMITS.window)]);
 if(rows[1].results[0].count>LIMITS.requests)fail(429,'rate_limited');
}
export async function erase(db,id){await db.prepare("UPDATE comments SET nickname='',body='',delete_hash=NULL,status='deleted' WHERE id=?").bind(id).run();}
export const publicFields='id,thread,parent_id,nickname,body,status,author,created_at';
export function errorResponse(e,headers={}){return json({error:e instanceof HttpError?e.message:'service_unavailable'},e.status||503,{...headers,...(e.status===429?{'Retry-After':String(LIMITS.window)}:{})});}
