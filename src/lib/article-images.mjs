import images from '../data/article-images.json' with { type: 'json' };
const escape = (s = '') => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const markerPattern = /<span hidden data-source-image-position="(\d+)"><\/span>/g;
const wrapperPattern = /<div><div>(?:<picture>)?(<span hidden data-source-image-position="(\d+)"><\/span>)(?:<\/picture>)?<\/div><div>([\s\S]*?)<\/div><\/div>/g;
const imageTag = image => `<img data-article-image src="${escape(image.original_url)}" alt="${escape(image.alt || image.source_caption)}"${image.width && image.height ? ` width="${image.width}" height="${image.height}"` : ''} referrerpolicy="no-referrer" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto" />`;
// Transform only the exact imported image wrapper, never adjacent article paragraphs.
// Original files and marker keys remain intact. Caption sources live outside the
// image-only container so network errors cannot remove citations or research links.
export function articleImages(html, workId, records = images) {
  if (html === null) return null;
  const byPosition = new Map(records.filter(i => i.work_id === workId).map(i => [i.source_position, i]));
  const inserted = new Set();
  const rendered = html.replace(wrapperPattern, (_, marker, position, caption) => {
    const image = byPosition.get(Number(position));
    const source = /<a\b|圖源|來源|轉自|取自/.test(caption) && !/data-original-podcast-link/.test(caption);
    const sourceHtml = source ? `<div data-image-source>${caption}</div>` : '';
    if (!image || inserted.has(Number(position))) return `${marker}${sourceHtml}`;
    inserted.add(Number(position));
    const captionHtml = !source && caption.trim() ? `<figcaption>${caption}</figcaption>` : '';
    return `<div data-source-image-block="${position}">${marker}<figure data-image-visual>${imageTag(image)}${captionHtml}</figure>${sourceHtml}</div>`;
  });
  // Support isolated markers used by future imports. An already rendered marker
  // is followed by our image/figure, making repeated processing idempotent.
  return rendered.replace(markerPattern, (marker, position, offset) => {
    if (/^<(?:figure data-image-visual|img data-article-image)/.test(rendered.slice(offset + marker.length))) { inserted.add(Number(position)); return marker; }
    if (inserted.has(Number(position))) return marker;
    const image = byPosition.get(Number(position));
    if (image) inserted.add(Number(position));
    return image ? `${marker}${imageTag(image)}` : marker;
  });
}
