import images from '../data/article-images.json' with {type:'json'};
const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function articleImages(html,workId) {
 if(html===null)return null;
 return html.replace(/<span hidden data-source-image-position="(\d+)"><\/span>/g,(marker,position)=>{
  const image=images.find(i=>i.work_id===workId && i.source_position===Number(position));
  return image ? `${marker}<img data-article-image src="${escape(image.original_url)}" alt="${escape(image.source_caption)}" referrerpolicy="no-referrer" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto" />` : marker;
 });
}
