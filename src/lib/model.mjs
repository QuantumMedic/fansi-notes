import { z } from 'zod';
export const topics = [
  { slug: 'thinking', name: '思考' },
  { slug: 'reading', name: '閱讀' },
];
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export function safeUrl(value, hosts = []) {
  try {
    const u = new URL(value);
    return (
      u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      !u.port &&
      (!hosts.length || hosts.includes(u.hostname))
    );
  } catch {
    return false;
  }
}
const platform = (hosts) =>
  z.string().refine((v) => safeUrl(v, hosts), '需使用核准平台的 HTTPS 網址');
export function spotifyId(value) {
  if (!safeUrl(value, ['open.spotify.com'])) return null;
  return new URL(value).pathname.match(/^\/episode\/([A-Za-z0-9]{22})\/?$/)?.[1] || null;
}
export const platformsSchema = z
  .object({
    instagram_url: platform(['www.instagram.com', 'instagram.com']).optional(),
    vocus_url: platform(['vocus.cc', 'www.vocus.cc']).optional(),
    spotify_episode_url: z
      .string()
      .refine((v) => !!spotifyId(v), '無效 Spotify 單集網址')
      .optional(),
  })
  .strict();
const date = z.iso
  .datetime({ offset: true })
  .refine((v) => Number.isFinite(Date.parse(v)), '無效日期');
export const articleSchema = z
  .object({
    work_id: slugSchema,
    slug: slugSchema,
    title: z.string().min(1),
    subtitle: z.string().optional(),
    summary: z.string().min(1),
    content_type: z.enum(['fansiwei', 'longform']),
    topics: z.array(z.enum(['thinking', 'reading'])).min(1),
    related_work_ids: z.array(slugSchema).default([]),
    aliases: z.array(slugSchema).default([]),
    featured_order: z.number().int().nonnegative().optional(),
    synthetic: z.boolean(),
    publication_status: z.enum(['demo', 'published']),
    approved_revision: z.string().min(1),
    website_approved: z.literal(true),
    approved_by: z.string().min(1),
    approved_at: date,
    published_at: date,
    updated_at: date.optional(),
    public_author_name: z.string().optional(),
    written_master: z.literal('ig-vocus'),
    platform_urls: platformsSchema.default({}),
    sources: z
      .array(z.object({ title: z.string().min(1), url: z.string().refine((v) => safeUrl(v)) }))
      .default([]),
    cover_image: z
      .string()
      .regex(/^assets\/[a-zA-Z0-9/_-]+\.(svg|png|jpg|webp)$/)
      .optional(),
    cover_alt: z.string().optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.synthetic !== (d.publication_status === 'demo'))
      ctx.addIssue({ code: 'custom', message: '示意與正式發布狀態不一致' });
    if (d.synthetic && !d.work_id.startsWith('demo-'))
      ctx.addIssue({ code: 'custom', message: '示意 ID 必須以 demo- 開頭' });
    if (!d.synthetic && !d.public_author_name)
      ctx.addIssue({ code: 'custom', message: '正式資料必須有核准署名' });
    if (d.cover_image && !d.cover_alt)
      ctx.addIssue({ code: 'custom', message: '封面必須提供替代文字' });
    if (Date.parse(d.published_at) > Date.now())
      ctx.addIssue({ code: 'custom', message: '未到發布日的稿件不可放入公開來源' });
  });
export const episodeSchema = z
  .object({
    guid: z.string().min(1),
    slug: slugSchema,
    title: z.string().min(1),
    description: z.string(),
    published_at: date,
    synthetic: z.boolean(),
    cover_image: z
      .string()
      .refine((v) => safeUrl(v))
      .optional(),
    url: z
      .string()
      .refine((v) => safeUrl(v))
      .optional(),
    apple_episode_url: z
      .string()
      .refine((v) => {
        if (!safeUrl(v, ['podcasts.apple.com'])) return false;
        const u = new URL(v);
        return /\/id[0-9]+$/.test(u.pathname) && /^[0-9]+$/.test(u.searchParams.get('i') || '');
      }, '無效 Apple Podcasts 單集網址')
      .optional(),
    spotify_episode_url: z
      .string()
      .refine((v) => !!spotifyId(v))
      .optional(),
  })
  .strict();
export const mapSchema = z.array(
  z.object({ guid: z.string().min(1), work_id: slugSchema, approved: z.literal(true) }).strict(),
);
export function validateCatalog(articles, episodes = [], mapping = []) {
  articles = articles.map((a) => articleSchema.parse(a));
  const ids = new Set(),
    paths = new Set();
  for (const a of articles) {
    articleSchema.parse(a);
    if (ids.has(a.work_id)) throw Error('重複 work_id');
    ids.add(a.work_id);
    for (const p of [a.slug, ...a.aliases]) {
      if (paths.has(p)) throw Error('slug 或舊網址衝突');
      paths.add(p);
    }
  }
  for (const a of articles)
    for (const id of a.related_work_ids) {
      if (!ids.has(id) || id === a.work_id) throw Error('相關作品 ID 不存在或指向自己');
    }
  const guids = new Set(),
    episodePaths = new Set();
  for (const e of episodes) {
    episodeSchema.parse(e);
    if (guids.has(e.guid) || episodePaths.has(e.slug)) throw Error('重複單集');
    guids.add(e.guid);
    episodePaths.add(e.slug);
  }
  const mapped = new Set();
  for (const m of mapSchema.parse(mapping)) {
    if (mapped.has(m.guid) || !guids.has(m.guid) || !ids.has(m.work_id))
      throw Error('GUID 映射重複或找不到作品／單集');
    mapped.add(m.guid);
  }
}
export const newest = (items) =>
  [...items].sort(
    (a, b) =>
      Date.parse(b.published_at) - Date.parse(a.published_at) || a.slug.localeCompare(b.slug),
  );
export function relatedArticles(article, all) {
  const manual = article.related_work_ids
    .map((id) => all.find((a) => a.work_id === id))
    .filter(Boolean);
  return [
    ...manual,
    ...newest(all).filter(
      (a) =>
        a.work_id !== article.work_id &&
        !manual.includes(a) &&
        a.topics.some((t) => article.topics.includes(t)),
    ),
  ].slice(0, 3);
}
