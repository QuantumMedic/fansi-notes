export const loopback=h=>['localhost','127.0.0.1','[::1]'].includes(h);
const enabled=v=>v===true||v==='true';
const url=(value,test)=>{try{const u=new URL(value);if(u.username||u.password||u.search||u.hash)return null;if(u.protocol!=='https:'&&!(test&&u.protocol==='http:'&&loopback(u.hostname)))return null;return u;}catch{return null;}};
export function interactionConfig(e={}){
 const ci=enabled(e.CI)||e.CI==='1';
 const local=enabled(e.DEV)&&enabled(e.PUBLIC_INTERACTIONS_LOCAL)&&!ci;
 const api=url(e.PUBLIC_COMMENTS_API,local),siteKey=e.PUBLIC_TURNSTILE_SITE_KEY||'';
 const contact=url(e.PUBLIC_FORMSPREE_ENDPOINT,local);
 const endpoint=url(e.PUBLIC_GOATCOUNTER_ENDPOINT,false);
 const fallback=enabled(e.PUBLIC_EMAIL_APPROVED)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.PUBLIC_CONTACT_EMAIL||'')?e.PUBLIC_CONTACT_EMAIL:null;
 return {
  local,
  comments:{enabled:enabled(e.PUBLIC_COMMENTS_ENABLED)&&!!api&&api.pathname==='/'&&!!siteKey&&(local||(!/^(1x|2x|3x|local)/.test(siteKey))),api:api?.origin||'',siteKey},
  contact:{enabled:enabled(e.PUBLIC_CONTACT_ENABLED)&&!!contact&&((contact.hostname==='formspree.io'&&/^\/f\/[a-zA-Z0-9]+$/.test(contact.pathname))||(local&&loopback(contact.hostname))),endpoint:contact?.href||'',email:fallback},
  analytics:{enabled:enabled(e.PUBLIC_ANALYTICS_ENABLED)&&!ci&&!!endpoint&&/^[a-z0-9-]+\.goatcounter\.com$/.test(endpoint.hostname)&&endpoint.pathname==='/count',endpoint:endpoint?.href||'',hosts:(e.PUBLIC_ANALYTICS_HOSTS||'').split(',').filter(Boolean)}
 };
}
