import { reviewMode } from './review-mode.mjs';
import type { z } from 'zod';
import { getCollection } from 'astro:content';
import rawEpisodes from '../data/podcast.json';
import classifications from '../data/podcast-classifications.json';
import { resolveClassifications, buildWorks } from './classification.mjs';
import rawMapping from '../data/podcast-work-map.json';
import { episodeSchema, mapSchema, newest, validateCatalog } from './model.mjs';
export type Classification = {
  content_type: string;
  topics: string[];
  keywords: string[];
  status: string;
  source?: string;
};
export type ClassifiedEpisode = z.infer<typeof episodeSchema> & {
  work_id: string;
  classification: Classification;
};
export async function catalog() {
  const articles = (await getCollection('articles')).sort(
    (a, b) => Date.parse(b.data.published_at) - Date.parse(a.data.published_at),
  );
  const episodes = newest(rawEpisodes.map((e) => episodeSchema.parse(e)));
  const mapping = mapSchema.parse(rawMapping);
  validateCatalog(
    articles.map((a) => a.data),
    episodes,
    mapping,
  );
  const classifiedEpisodes: ClassifiedEpisode[] = resolveClassifications(
    articles.map((a) => a.data),
    episodes,
    mapping,
    classifications,
    { includeProposed: reviewMode },
  );
  return {
    articles,
    episodes: classifiedEpisodes,
    mapping,
    works: buildWorks(articles, classifiedEpisodes),
  };
}
export const displayDate = (date: string) =>
  new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
