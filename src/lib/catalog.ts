import { getCollection } from 'astro:content';
import rawEpisodes from '../data/podcast.json';
import rawMapping from '../data/podcast-work-map.json';
import { episodeSchema, mapSchema, newest, validateCatalog } from './model.mjs';
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
  return { articles, episodes, mapping };
}
export const displayDate = (date: string) =>
  new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
