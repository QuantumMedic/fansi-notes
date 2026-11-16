// One resolver shared by the site, exported manifest and both Workers.
export function makeThreads(articles, episodes, mappings, publications) {
 const threads={}, aliases={};
 for(const a of articles.filter(a=>!a.synthetic&&a.publication_status==='published'))threads[`article:${a.work_id}`]={work_id:a.work_id,title:a.title,canonical_path:`/articles/${a.slug}/`};
 for(const b of publications.filter(b=>!b.synthetic&&b.website_approved))threads[`publication:${b.work_id}`]={work_id:b.work_id,title:b.title,canonical_path:`/works/${b.slug}/`};
 for(const e of episodes.filter(e=>!e.synthetic)) {
  const key=`podcast:${e.guid}`, m=mappings.find(m=>m.approved&&m.guid===e.guid);
  if(m&&threads[`article:${m.work_id}`])aliases[key]=`article:${m.work_id}`;
  else threads[key]={work_id:null,title:e.title,canonical_path:`/podcast/${e.slug}/`};
 }
 return {version:1,threads,aliases};
}
export function resolveThread(manifest,kind,id) {
 const key=`${kind}:${id}`, canonical=manifest.aliases[key]||key;
 return Object.hasOwn(manifest.threads,canonical)?canonical:null;
}
