import {verifyAccess} from './access.mjs';
import {adminPage} from './admin-page.mjs';
import {fail,json,readJSON,text,idOK,hash,erase,publicFields,errorResponse} from './shared.mjs';
export async function handleAdmin(req,env,keys){
 try{
  if(!['staging','production'].includes(env.ENVIRONMENT)||!env.DB)fail(503,'not_configured');
  await verifyAccess(req,env,keys);
  const u=new URL(req.url),p=u.pathname;
  if(req.method!=='GET'&&req.headers.get('Origin')!==u.origin)fail(403,'origin_denied');
  if(p==='/admin/'&&req.method==='GET')return new Response(adminPage,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
  if(p==='/v1/admin/settings'){
   if(req.method==='GET')return json(await env.DB.prepare('SELECT moderation,paused FROM settings WHERE id=1').first());
   if(req.method==='POST'){const b=await readJSON(req);if(typeof b.moderation!=='boolean'||typeof b.paused!=='boolean')fail(400,'invalid_input');await env.DB.prepare('UPDATE settings SET moderation=?,paused=? WHERE id=1').bind(+b.moderation,+b.paused).run();return json({saved:true});}
  }
  if(['/v1/admin/comments','/v1/admin/export'].includes(p)&&req.method==='GET'){
   const cursor=Number(u.searchParams.get('cursor')||0);if(!Number.isSafeInteger(cursor)||cursor<0)fail(400,'invalid_cursor');const status=u.searchParams.get('status')||'all';if(!['all','pending','published','hidden','deleted'].includes(status))fail(400,'invalid_status');
   const rows=(await env.DB.prepare(`SELECT seq,${publicFields} FROM comments WHERE seq>? AND (?='all' OR status=?) ORDER BY seq LIMIT 21`).bind(cursor,status,status).all()).results;
   const page=rows.slice(0,20);return json({comments:page.map(({seq,...r})=>r),next:rows.length>20?page.at(-1).seq:null});
  }
  if(/^\/v1\/admin\/comments\/[a-f0-9-]{36}$/.test(p)&&req.method==='POST'){
   const id=p.split('/').at(-1),b=await readJSON(req);const row=await env.DB.prepare('SELECT status FROM comments WHERE id=?').bind(id).first();if(!row)fail(404,'not_found');
   if(b.action==='delete')await erase(env.DB,id);
   else {if(row.status==='deleted'||!['publish','hide'].includes(b.action))fail(400,'invalid_action');await env.DB.prepare('UPDATE comments SET status=? WHERE id=?').bind(b.action==='publish'?'published':'hidden',id).run();}
   return json({updated:true});
  }
  if(p==='/v1/admin/reply'&&req.method==='POST'){
   const b=await readJSON(req);if(!idOK(b.id)||!idOK(b.parent_id))fail(400,'invalid_id');const body=text(b.body,2000);
   const parent=await env.DB.prepare('SELECT thread,parent_id FROM comments WHERE id=?').bind(b.parent_id).first();if(!parent||parent.parent_id)fail(400,'invalid_parent');
   const digest=await hash(JSON.stringify([parent.thread,b.parent_id,body]));
   await env.DB.prepare("INSERT OR IGNORE INTO comments(id,thread,parent_id,nickname,body,status,author,request_hash,created_at) VALUES(?,?,?,'作者',?,'published',1,?,?)").bind(b.id,parent.thread,b.parent_id,body,digest,Date.now()).run();
   const row=await env.DB.prepare('SELECT request_hash,author FROM comments WHERE id=?').bind(b.id).first();if(row.request_hash!==digest||!row.author)fail(409,'request_conflict');return json({id:b.id},201);
  }
  fail(404,'not_found');
 }catch(e){return errorResponse(e);}
}
export default {fetch:(req,env)=>handleAdmin(req,env)};
