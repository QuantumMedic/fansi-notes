import {createRemoteJWKSet,jwtVerify} from 'jose';
import {fail,list} from './shared.mjs';
const sets=new Map();
export async function verifyAccess(req,env,keys){
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN||'')||!env.ACCESS_AUD||!list(env.ADMIN_EMAIL_ALLOWLIST).length)fail(503,'admin_not_configured');
 const issuer=`https://${env.ACCESS_TEAM_DOMAIN}`;
 if(!keys){if(!sets.has(issuer))sets.set(issuer,createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`),{timeoutDuration:5000}));keys=sets.get(issuer);}
 const token=req.headers.get('Cf-Access-Jwt-Assertion');if(!token)fail(401,'login_required');
 try{
  const {payload}=await jwtVerify(token,keys,{issuer,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email']});
  if(!list(env.ADMIN_EMAIL_ALLOWLIST).includes(payload.email))fail(403,'not_authorized');
 }catch{fail(403,'not_authorized');}
}
