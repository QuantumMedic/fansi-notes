export function showArticleSummary(summary, body = '', mode = 'auto') {
  if (mode === 'independent') return true;
  if (mode === 'excerpt') return false;
  // Compare prose opening, excluding headings and image placeholders/captions.
  const first =
    body.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i)?.[1] ??
    body.split(/\n\s*\n/).find((p) => p.trim() && !/^\s*#/.test(p)) ??
    '';
  const normalize = (s) =>
    s
      .replace(/<[^>]*>/g, '')
      .replace(
        /&(amp|lt|gt|quot|apos|nbsp);/g,
        (_, n) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[n],
      )
      .replace(/\s/g, '');
  return !normalize(first).startsWith(normalize(summary));
}
