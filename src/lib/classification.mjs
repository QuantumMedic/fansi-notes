import { z } from 'zod';
import { classificationSchema } from './taxonomy.mjs';
import { slugSchema } from './model.mjs';
export const standaloneSchema = z
  .object({
    guid: z.string().min(1),
    work_id: slugSchema,
    ...classificationSchema.shape,
    status: z.enum(['proposed', 'confirmed']),
    reviewed_by: z.string().min(1).optional(),
    reviewed_at: z.iso.datetime({ offset: true }).optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.status === 'confirmed' && (!v.reviewed_by || !v.reviewed_at))
      ctx.addIssue({ code: 'custom', message: '正式分類需核准者與時間' });
  });
export function resolveClassifications(articles, episodes, mapping, raw) {
  const records = raw.map((r) => standaloneSchema.parse(r));
  const byGuid = new Map();
  const definitions = new Map();
  for (const r of records) {
    if (byGuid.has(r.guid)) throw Error('重複分類 GUID');
    byGuid.set(r.guid, r);
    // One work can have several episodes, but only one classification.
    const definition = JSON.stringify([r.content_type, r.topics, r.keywords, r.status]);
    if (definitions.has(r.work_id) && definitions.get(r.work_id) !== definition)
      throw Error('同作品分類衝突');
    definitions.set(r.work_id, definition);
    const article = articles.find((a) => a.work_id === r.work_id);
    if (article && !mapping.some((m) => m.guid === r.guid && m.work_id === r.work_id))
      throw Error('未核准的作品 ID 關聯');
  }
  return episodes.map((e) => {
    const match = mapping.find((m) => m.guid === e.guid && m.approved === true);
    const article = match && articles.find((a) => a.work_id === match.work_id);
    const own = byGuid.get(e.guid);
    const source = article || own;
    return {
      ...e,
      work_id: article?.work_id || own?.work_id || `podcast-${e.slug}`,
      classification: source
        ? {
            content_type: source.content_type,
            topics: source.topics,
            keywords: source.keywords || [],
            status: article ? (article.synthetic ? 'demo' : 'confirmed') : own.status,
            source: article ? 'work' : 'episode',
          }
        : { content_type: '', topics: [], keywords: [], status: 'pending', source: 'none' },
    };
  });
}
export function buildWorks(articles, episodes) {
  const result = new Map(
    articles.map((a) => [
      a.data.work_id,
      {
        work_id: a.data.work_id,
        title: a.data.title,
        summary: a.data.summary,
        published_at: a.data.published_at,
        classification: {
          content_type: a.data.content_type,
          topics: a.data.topics,
          keywords: a.data.keywords,
          status: a.data.synthetic ? 'demo' : 'confirmed',
        },
        article: a,
        episodes: [],
      },
    ]),
  );
  for (const e of episodes) {
    if (!result.has(e.work_id))
      result.set(e.work_id, {
        work_id: e.work_id,
        title: e.title,
        summary: e.description,
        published_at: e.published_at,
        classification: e.classification,
        article: null,
        episodes: [],
      });
    result.get(e.work_id).episodes.push(e);
  }
  return [...result.values()].sort(
    (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at),
  );
}
