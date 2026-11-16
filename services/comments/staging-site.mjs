// Dedicated acceptance frontend. Never used by the production GitHub Pages build.
import {verifyAccess} from './access.mjs';
import {fail,errorResponse} from './shared.mjs';

export async function handleStagingSite(req,env,keys){
 try{
  if(env.ENVIRONMENT!=='staging'||!env.ASSETS||env.SITE_BASE!=='/fansi-notes')fail(503,'not_configured');
  await verifyAccess(req,env,keys);
  const pathname=new URL(req.url).pathname;
  if(pathname!==env.SITE_BASE&&!pathname.startsWith(env.SITE_BASE+'/'))fail(404,'not_found');
  if(!['GET','HEAD'].includes(req.method))fail(405,'method_not_allowed');
  const asset=await env.ASSETS.fetch(req);
  const response=new Response(asset.body,asset);
  response.headers.set('Cache-Control','private, no-store');
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  response.headers.set('Referrer-Policy','no-referrer');
  return response;
 }catch(e){return errorResponse(e);}
}
export default {fetch:(req,env)=>handleStagingSite(req,env)};
