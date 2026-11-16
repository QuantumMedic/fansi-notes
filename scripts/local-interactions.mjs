import {seedLocal} from './seed-local-comments.mjs';
import manifest from '../services/comments/generated/threads.json' with {type:'json'};
// Local-only adapter; never imported by Wrangler entrypoints or website bundles.
import {createServer} from 'node:http';
import {runtime} from '../tests/helpers/comments-runtime.mjs';
import {handlePublic} from '../services/comments/public.mjs';
import {handleAdmin} from '../services/comments/admin.mjs';
const rt=await runtime(),servers=[],origin='http://127.0.0.1:4335',issued=new Set();
const demo=await seedLocal(rt.env.DB,manifest);
function serve(port,handler){const s=createServer(async(req,res)=>{try{
 if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403);res.end();return;}
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>16384){res.writeHead(413);res.end();return;}chunks.push(c);}
 const request=new Request(`http://127.0.0.1:${port}${req.url}`,{method:req.method,headers:{...req.headers,'CF-Connecting-IP':'127.0.0.1'},body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
 const out=await handler(request);res.writeHead(out.status,Object.fromEntries(out.headers));res.end(Buffer.from(await out.arrayBuffer()));
 }catch{res.writeHead(503);res.end('Local service unavailable');}}).listen(port,'127.0.0.1');servers.push(s);}
serve(8787,async req=>{
 if(req.method==='OPTIONS')return handlePublic(req,rt.env,rt.verify);
 if(new URL(req.url).pathname==='/local/demo'&&req.headers.get('Origin')===origin)return Response.json(demo,{headers:{'Access-Control-Allow-Origin':origin,'Cache-Control':'no-store'}});
 if(new URL(req.url).pathname==='/local/token'){
  if(req.headers.get('Origin')!==origin||req.method!=='POST')return new Response(null,{status:403});
  const t='local-'+crypto.randomUUID();issued.add(t);return Response.json({token:t},{headers:{'Access-Control-Allow-Origin':origin,'Cache-Control':'no-store'}});
 }
 return handlePublic(req,rt.env,async t=>{if(!issued.delete(t)){const e=Error('verification_failed');e.status=403;throw e;}});
});
serve(8788,async req=>{
 // Test-only issuer: actual JWT signature still checked by the unchanged admin handler.
 const h=new Headers(req.headers);h.set('Cf-Access-Jwt-Assertion',await rt.sign());
 return handleAdmin(new Request(req,{headers:h}),rt.env,rt.keys);
});
serve(8789,async req=>{
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'};
 if(req.headers.get('Origin')!==origin)return new Response(null,{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 const fields=await req.json();const p=fields.message==='[quota]'?'/quota':fields.message==='[timeout]'?'/timeout':fields.message==='[failure]'?'/failure':new URL(req.url).pathname;if(p==='/timeout'){await new Promise(r=>setTimeout(r,14000));return Response.json({ok:true},{headers});}
 if(p==='/quota')return Response.json({error:'quota'},{status:429,headers});
 if(p==='/failure')return Response.json({error:'failure'},{status:500,headers});
 return Response.json({ok:true},{headers});
});
console.log('LOCAL ONLY: comments 8787; synthetic authenticated admin http://127.0.0.1:8788/admin/; contact provider 8789. No cloud/login/mail/analytics. In-memory D1 resets on restart.');
async function close(){for(const s of servers)s.close();await rt.close();process.exit();}process.on('SIGINT',close);process.on('SIGTERM',close);
