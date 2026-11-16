// Explicit read-only remote verification; no analytics scripts are executed.
const [origin,mode]=process.argv.slice(2);
if(origin!=='https://quantummedic.github.io/fansi-notes/'||!['index','noindex'].includes(mode))throw Error('Explicit canonical target and index|noindex required');
for(const path of ['', 'articles/','podcast/','works/','about/','robots.txt','sitemap.xml','missing-launch-check/']){
 const r=await fetch(origin+path);const s=await r.text();
 if(r.status!==(path==='missing-launch-check/'?404:200))throw Error(`Unexpected HTTP status: ${path}`);
 if(path===''&&!s.includes(`content="${mode==='index'?'index,follow':'noindex,nofollow'}"`))throw Error('Indexing mismatch');
 console.log(path||'home',r.status);
}
