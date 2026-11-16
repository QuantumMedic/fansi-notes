// Only image-owned elements collapse. Source references remain readable.
export function collapseArticleImage(img) {
  const visual = img.closest('[data-image-visual]');
  if (visual) visual.hidden = true;
  else img.hidden = true;
  const block = img.closest('[data-source-image-block]');
  if (block && !block.querySelector('[data-image-source]')) block.hidden = true;
}
export function bindArticleImages(root) {
  root.querySelectorAll('img[data-article-image]').forEach(img => {
    img.addEventListener('error', () => collapseArticleImage(img), { once: true });
    if (img.complete && !img.naturalWidth) collapseArticleImage(img);
  });
}
