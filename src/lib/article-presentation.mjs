// Only explicitly author-confirmed independent summaries appear above the prose.
// Cards and SEO continue to use the original summary metadata.
export function showArticleSummary(_summary, _body = '', mode = 'auto') {
  return mode === 'independent';
}
