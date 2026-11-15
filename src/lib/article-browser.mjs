import { matchesSeries } from './taxonomy.mjs';
import { popularityRank } from './popularity.mjs';
// Only this fixed series is a mixed-media entry. General article browsing stays written-only.
export function articleBrowseWorks(catalog, fixedSeries = '') {
  if (fixedSeries === 'fansiwei') return catalog.works.filter(w =>
    w.classification.status === 'confirmed' && matchesSeries(w.classification.content_type, fixedSeries));
  const ids = new Set(catalog.articles.filter(a => matchesSeries(a.data.content_type, fixedSeries)).map(a => a.data.work_id));
  return catalog.works.filter(w => w.article && ids.has(w.work_id));
}
export function articleBrowseRank(work) {
  return work.article ? popularityRank('articles', work.work_id) : null;
}
