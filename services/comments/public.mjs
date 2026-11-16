import {readThread} from './reading.mjs';
import {LIMITS,fail,json,hash,list,canonical,tokenOK,idOK,text,readJSON,rate,erase,errorResponse,baseConfigured} from './shared.mjs';
export async function verifyTurnstile(token,env,fetcher=fetch){
 if(typeof token!=='string'||token.length>2048||!token)fail(400,'verification_required');
 const r=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(8000)});
 const v=await r.json();if(!r.ok||!v.success||v.action!=='comment'||!list(env.TURNSTILE_HOSTNAMES).includes(v.hostname))fail(403,'verification_failed');
 const now=Math.floor(Date.now()/1000);await env.DB.prepare('DELETE FROM used_tokens WHERE expires < ?').bind(now).run();
 const result=await env.DB.prepare('INSERT OR IGNORE INTO used_tokens(digest,expires) VALUES(?,?)').bind(await hash(token),now+600).run();if(!result.meta.changes)fail(403,'verification_replayed');
}
export async function handlePublic(req,env,verify=verifyTurnstile){
 const origin=req.headers.get('Origin'),allowed=list(env.ALLOWED_ORIGINS),headers={};
 try{
  if(env.ENVIRONMENT==='production'&&env.PRODUCTION_SERVICES_ACTIVE!=='true')fail(503,'production_inactive');
  if(origin&&!allowed.includes(origin))fail(403,'origin_denied');
  if(origin){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';}
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, DELETE','Access-Control-Allow-Headers':'Content-Type, Authorization'}});
  const url=new URL(req.url),path=url.pathname;if(url.searchParams.has('token'))fail(400,'credentials_not_in_url');
  if(path==='/health'){
   const configured=!!baseConfigured(env);
   const settings=configured&&env.ENVIRONMENT==='production'?await env.DB.prepare('SELECT paused FROM settings WHERE id=1').first():null;
   return json({service:'comments',configured,...(env.ENVIRONMENT==='production'?{accepting_comments:configured&&settings?.paused===0}:{})},200,headers);
  }
  if(!baseConfigured(env))fail(503,'not_configured');
  if(path.startsWith('/v1/threads/')&&path.endsWith('/comments')&&req.method==='GET'){
   const thread=canonical(decodeURIComponent(path.slice(12,-9)));return json(await readThread(env.DB,thread,url),200,headers);
  }
  if(!origin||!allowed.includes(origin))fail(403,'origin_required');
  if(path==='/v1/comments'&&req.method==='POST'){
   const b=await readJSON(req);if(!idOK(b.id)||!tokenOK(b.delete_token))fail(400,'invalid_credential');
   const thread=canonical(b.thread),nickname=text(b.nickname,LIMITS.nickname),body=text(b.body,LIMITS.message);
   if(b.parent_id)fail(400,'reader_reply_not_supported');
   const digest=await hash(b.delete_token),requestHash=await hash(JSON.stringify([thread,nickname,body]));
   const old=await env.DB.prepare('SELECT delete_hash,request_hash,status FROM comments WHERE id=?').bind(b.id).first();
   if(old){if(old.delete_hash!==digest||old.request_hash!==requestHash)fail(409,'request_conflict');return json({id:b.id,status:old.status,replayed:true},200,headers);}
   await rate(req,env);
   const settings=await env.DB.prepare('SELECT * FROM settings WHERE id=1').first();if(settings.paused)fail(503,'comments_paused');
   if(!env.TURNSTILE_SECRET_KEY||/^(1x|2x|3x)/.test(env.TURNSTILE_SECRET_KEY)||!list(env.TURNSTILE_HOSTNAMES).length)fail(503,'not_configured');
   await verify(b.turnstile_token,env);
   const status=settings.moderation?'pending':'published';
   await env.DB.prepare('INSERT OR IGNORE INTO comments(id,thread,nickname,body,status,delete_hash,request_hash,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(b.id,thread,nickname,body,status,digest,requestHash,Date.now()).run();
   const saved=await env.DB.prepare('SELECT delete_hash,request_hash,status FROM comments WHERE id=?').bind(b.id).first();
   if(saved.delete_hash!==digest||saved.request_hash!==requestHash)fail(409,'request_conflict');
   return json({id:b.id,status:saved.status},201,headers);
  }
  if(/^\/v1\/comments\/[a-f0-9-]{36}$/.test(path)&&req.method==='DELETE'){
   await rate(req,env,'delete');const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!tokenOK(token))fail(403,'delete_denied');
   const id=path.split('/').at(-1),row=await env.DB.prepare('SELECT delete_hash FROM comments WHERE id=?').bind(id).first();
   if(!row?.delete_hash||row.delete_hash!==await hash(token))fail(403,'delete_denied');await erase(env.DB,id);return json({deleted:true},200,headers);
  }
  fail(404,'not_found');
 }catch(e){return errorResponse(e,headers);}
}
export default {fetch:(req,env)=>handlePublic(req,env)};
