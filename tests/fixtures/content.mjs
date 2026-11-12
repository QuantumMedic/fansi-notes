import { articleSchema } from '../../src/lib/model.mjs';
export const article = (overrides = {}) =>
  articleSchema.parse({
    work_id: 'demo-test',
    slug: 'demo-test',
    title: '合成文章',
    summary: '僅供測試',
    content_type: 'fansiwei',
    topics: ['thinking'],
    synthetic: true,
    publication_status: 'demo',
    website_approved: true,
    approved_by: 'synthetic-fixture',
    approved_revision: 'synthetic-v1',
    approved_at: '2026-01-01T00:00:00+08:00',
    published_at: '2026-01-02T00:00:00+08:00',
    written_master: 'ig-vocus',
    ...overrides,
  });
export const xml = (items = [{}]) =>
  `<?xml version="1.0"?><rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><title>合成節目</title><itunes:owner><itunes:email>fixture@example.invalid</itunes:email></itunes:owner>${items.map((e, i) => `<item><guid isPermaLink="false">${e.guid || `fixture-${i}`}</guid><title>${e.title || '不同的單集標題'}</title><description><![CDATA[${e.description || '<p>合成介紹</p>'}]]></description><pubDate>${e.date || 'Fri, 02 Jan 2026 00:00:00 GMT'}</pubDate>${e.link ? `<link>${e.link}</link>` : ''}<itunes:image href="https://example.invalid/cover.jpg"/></item>`).join('')}</channel></rss>`;
