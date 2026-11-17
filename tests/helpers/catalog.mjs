// Current catalog assertions may grow; historical fixtures/hashes remain immutable.
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { articleSchema, validateCatalog } from '../../src/lib/model.mjs';
import { resolveClassifications, buildWorks } from '../../src/lib/classification.mjs';
import { makeThreads } from '../../src/lib/comment-threads.mjs';
export const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const articles = readdirSync('src/content/articles')
  .filter((f) => f.endsWith('.md'))
  .map((f) =>
    articleSchema.parse(
      parse(readFileSync(`src/content/articles/${f}`, 'utf8').split(/^---\s*$/m)[1]),
    ),
  );
export const publicArticles = articles.filter(
  (a) => !a.synthetic && a.publication_status === 'published',
);
export const episodes = json('src/data/podcast.json');
export const mapping = json('src/data/podcast-work-map.json');
validateCatalog(articles, episodes, mapping);
export const classified = resolveClassifications(
  publicArticles,
  episodes,
  mapping,
  json('src/data/podcast-classifications.json'),
  { includeProposed: false },
);
export const works = buildWorks(
  publicArticles.map((data) => ({ data })),
  classified,
);
export const threads = makeThreads(articles, episodes, mapping, json('src/data/publications.json'));
