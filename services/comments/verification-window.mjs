// Isolated acceptance lease. This is never an alternative production release flag.
import {fail,errorResponse} from './shared.mjs';
import {verifyAccess} from './access.mjs';
import {handlePublic} from './public.mjs';
import {handleAdmin} from './admin.mjs';
function diagnostic(e){if(!e.status)console.error('verification-runtime',e.name,String(e.message).replace(/https?:\/\/[^\s]+/g,'[url]').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'[identity]').replace(/[a-f0-9]{32,}/gi,'[id]').slice(0,240));}
const MAX_WINDOW=4*60*60*1000;
export function windowTime(env,now=Date.now()){
 const start=Number(env.VERIFICATION_START),end=Number(env.VERIFICATION_END);
 if(env.PRODUCTION_SERVICES_ACTIVE!=='false'||env.VERIFICATION_ENABLED!=='true'||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||end<=start||end-start>MAX_WINDOW||now<start||now>=end)fail(503,'verification_closed');
 return {start,end};
}
export async function windowLease(env){
 const {end}=windowTime(env);
 if(env.ENVIRONMENT!=='production'||!env.DB)fail(503,'verification_closed');
 const row=await env.DB.prepare('SELECT active,expires FROM verification_window WHERE id=1').first();
 if(row?.active!==1||row.expires!==end)fail(503,'verification_closed');
}
export async function closeExpiredWindow(env){
 const end=Number(env.VERIFICATION_END);
 if(env.ENVIRONMENT!=='production'||env.PRODUCTION_SERVICES_ACTIVE!=='false'||!Number.isSafeInteger(end)||Date.now()<end)return;
 await env.DB.batch([env.DB.prepare('UPDATE verification_window SET active=0 WHERE id=1'),env.DB.prepare('UPDATE settings SET paused=1 WHERE id=1')]);
}
export async function verificationPublic(req,env,keys,turnstile){
 try{
  await windowLease(env);
  await verifyAccess(req,env,keys);
  // No request header, URL parameter or client flag can enable this lease.
  return await handlePublic(req,{...env,PRODUCTION_SERVICES_ACTIVE:'true'},turnstile);
 }catch(e){diagnostic(e);return errorResponse(e);}
}
export async function verificationAdmin(req,env,keys){
 try{await windowLease(env);return await handleAdmin(req,{...env,PRODUCTION_SERVICES_ACTIVE:'true'},keys);}
 catch(e){diagnostic(e);return errorResponse(e);}
}
export function publicRoute(path,method){
 return (method==='GET'&&(path==='/health'||/^\/v1\/threads\/[^/]+\/comments$/.test(path)))||
  (method==='POST'&&path==='/v1/comments')||(method==='DELETE'&&/^\/v1\/comments\/[a-f0-9-]{36}$/.test(path));
}
export async function verificationSite(req,env,keys){
 try{
  windowTime(env);
  if(env.ENVIRONMENT!=='staging'||env.SITE_BASE!=='/fansi-notes'||!env.ASSETS||!env.COMMENTS)fail(503,'not_configured');
  await verifyAccess(req,env,keys);
  const u=new URL(req.url),path=u.pathname;
  if(publicRoute(path,req.method)){
   if(req.method!=='GET'&&req.headers.get('Origin')!==u.origin)fail(403,'origin_denied');
   const h=new Headers();
   for(const name of ['Content-Type','Authorization','Cf-Access-Jwt-Assertion','CF-Connecting-IP']){const v=req.headers.get(name);if(v)h.set(name,v);}
   h.set('Origin',u.origin);
   const upstream=await env.COMMENTS.fetch(new Request('https://verification.internal'+path+u.search,{method:req.method,headers:h,body:['GET','HEAD'].includes(req.method)?undefined:req.body,redirect:'manual'}));
   if(upstream.status>=300&&upstream.status<400)fail(502,'upstream_redirect_denied');
   const response=new Response(upstream.body,upstream);response.headers.set('Cache-Control','private, no-store');return response;
  }
  if(!['GET','HEAD'].includes(req.method)||(path!==env.SITE_BASE&&!path.startsWith(env.SITE_BASE+'/')))fail(404,'not_found');
  const asset=await env.ASSETS.fetch(req),response=new Response(asset.body,asset);
  response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');response.headers.set('Referrer-Policy','no-referrer');return response;
 }catch(e){diagnostic(e);return errorResponse(e);}
}
