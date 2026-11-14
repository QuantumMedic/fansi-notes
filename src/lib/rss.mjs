import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { episodeSchema, safeUrl, spotifyId } from './model.mjs';
const MAX_BYTES = 2_000_000;
export function plain(value) {
  return String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function parseFeed(xml, now = Date.now()) {
  if (
    Buffer.byteLength(xml) > MAX_BYTES ||
    /<!DOCTYPE|<!ENTITY/i.test(xml) ||
    SyntaxValidator.validate(xml, { multipleRoots: false }) !== true
  )
    throw Error('RSS 格式或大小不符合安全限制');
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true,
    processEntities: true,
  });
  const feed = parser.parse(xml);
  const items = feed?.rss?.channel?.item;
  if (!items) throw Error('RSS 無單集，保留既有資料');
  const rows = Array.isArray(items) ? items : [items];
  if (rows.length > 5000) throw Error('單集數過多');
  const seen = new Set();
  return rows.map((item) => {
    const guid = String(item.guid?.['#text'] ?? item.guid ?? '').trim();
    const title = plain(item.title);
    const ms = Date.parse(String(item.pubDate));
    if (!guid || !title || !Number.isFinite(ms) || ms > now || seen.has(guid))
      throw Error('單集 GUID、日期或標題無效／重複');
    seen.add(guid);
    const link = String(item.link ?? '').trim();
    if (link && !safeUrl(link)) throw Error('單集網址非安全 HTTPS');
    const cover = String(
      item['itunes:image']?.['@_href'] ?? feed.rss.channel['itunes:image']?.['@_href'] ?? '',
    );
    if (cover && !safeUrl(cover)) throw Error('封面網址不安全');
    return episodeSchema.parse({
      guid,
      slug: `episode-${createHash('sha256').update(guid).digest('hex').slice(0, 20)}`,
      title,
      description: plain(item.description ?? item['itunes:summary']).slice(0, 12000),
      published_at: new Date(ms).toISOString(),
      synthetic: false,
      ...(link ? { url: link } : {}),
      ...(spotifyId(link) ? { spotify_episode_url: link } : {}),
      ...(cover ? { cover_image: cover } : {}),
    });
  });
}
export async function fetchFeed(url, { hosts, fetchImpl = fetch, timeout = 15000 } = {}) {
  if (!safeUrl(url, hosts) || !hosts?.length) throw Error('RSS 來源未在明確允許清單');
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(timeout),
        redirect: 'error',
        headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
      });
      if (!response.ok) throw Error(`RSS HTTP ${response.status}`);
      const reader = response.body.getReader();
      let size = 0;
      const chunks = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          throw Error('RSS 超過大小限制');
        }
        chunks.push(value);
      }
      return parseFeed(Buffer.concat(chunks).toString('utf8'));
    } catch (error) {
      last = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
  throw last;
}
export async function syncFeed({ url, hosts, output, fetchImpl = fetch }) {
  const incoming = await fetchFeed(url, { hosts, fetchImpl });
  let previous = [];
  try {
    previous = JSON.parse(await readFile(output, 'utf8')).map((e) => episodeSchema.parse(e));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  // RSS 可能只保留最近數集；保留先前已同步的正式單集，更新以 GUID 為準。
  const merged = new Map(previous.filter((e) => !e.synthetic).map((e) => [e.guid, e]));
  for (const item of incoming) {
    const old = merged.get(item.guid);
    merged.set(item.guid, {
      ...old,
      ...item,
      slug: old?.slug ?? item.slug,
      ...(old?.spotify_episode_url && !item.spotify_episode_url
        ? { spotify_episode_url: old.spotify_episode_url }
        : {}),
    });
  }
  const result = [...merged.values()].sort(
    (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at),
  );
  const temp = `${output}.${process.pid}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(result, null, 2) + '\n');
    await rename(temp, output);
  } finally {
    await unlink(temp).catch(() => {});
  }
  return result;
}
