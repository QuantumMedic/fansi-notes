import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT} from 'jose';
export async function runtime(){
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("local SQL only")}}',d1Databases:['DB']}));
 const DB=await mf.getD1Database('DB');
 const dir=new URL('../../services/comments/migrations/',import.meta.url);
 const sql=readdirSync(dir).filter(x=>x.endsWith('.sql')).sort().map(x=>readFileSync(new URL(x,dir),'utf8')).join('\n');
 for(const stmt of sql.split(';').filter(x=>x.trim()))await DB.prepare(stmt).run();
 const pair=await generateKeyPair('RS256'),jwk=await exportJWK(pair.publicKey);jwk.kid='local-isolated';
 const keys=createLocalJWKSet({keys:[jwk]});
 const env={DB,SITE_ORIGIN:'http://127.0.0.1:4335',SITE_BASE:'/fansi-notes',ENVIRONMENT:'staging',RATE_LIMIT_HMAC_SECRET:crypto.randomUUID()+crypto.randomUUID(),ALLOWED_ORIGINS:'http://127.0.0.1:4335',TURNSTILE_SECRET_KEY:'isolated-provider-not-a-real-secret',TURNSTILE_HOSTNAMES:'127.0.0.1',ACCESS_TEAM_DOMAIN:'isolated-test.cloudflareaccess.com',ACCESS_AUD:'isolated-test',ADMIN_EMAIL_ALLOWLIST:'author@example.test'};
 const sign=(claims={})=>new SignJWT({email:'author@example.test',...claims}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setIssuedAt().setIssuer(claims.iss||'https://'+env.ACCESS_TEAM_DOMAIN).setAudience(claims.aud||env.ACCESS_AUD).setSubject('local-author').setExpirationTime(claims.exp??'1h').sign(pair.privateKey);
 const used=new Set();
 const verify=async(token)=>{if(!token?.startsWith('local-')||used.has(token)){const e=Error('verification_failed');e.status=403;throw e;}used.add(token);};
 return {mf,env,keys,sign,verify,close:()=>mf.dispose()};
}
