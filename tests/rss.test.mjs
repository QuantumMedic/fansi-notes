import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseFeed, fetchFeed, syncFeed } from '../src/lib/rss.mjs';
import { xml } from './fixtures/content.mjs';
const options = { url: 'https://example.invalid/rss', hosts: ['example.invalid'] };
test('RSS 只保存展示欄位；異名與重命名保持 GUID slug', () => {
  const [e] = parseFeed(xml());
  assert.equal(e.title, '不同的單集標題');
  assert.equal(e.description, '合成介紹');
  assert.equal(e.slug, parseFeed(xml([{ title: '新標題' }]))[0].slug);
  assert.doesNotMatch(JSON.stringify(e), /fixture@example|itunes:owner/);
});
test('拒絕 DTD、壞 XML、無單集、重複 GUID、壞日期及不安全 URL', () => {
  for (const input of [
    '<!DOCTYPE rss><rss/>',
    '<rss>',
    '<rss><channel/></rss>',
    xml([{ guid: 'a' }, { guid: 'a' }]),
    xml([{ date: 'bad' }]),
    xml([{ link: 'javascript:alert(1)' }]),
  ])
    assert.throws(() => parseFeed(input));
  const [safe] = parseFeed(
    xml([
      {
        description: '<script>alert(1)</script><b>可讀文字</b>',
        title: '&lt;img src=x onerror=alert(1)&gt;安全',
      },
    ]),
  );
  assert.equal(safe.description, '可讀文字');
  assert.equal(safe.title, '安全');
});
test('HTTP 500 重試三次；逾時訊號能中止；來源主機受限', async () => {
  let n = 0;
  await assert.rejects(
    fetchFeed(options.url, {
      hosts: options.hosts,
      fetchImpl: async () => {
        n++;
        return new Response('', { status: 500 });
      },
    }),
  );
  assert.equal(n, 3);
  await assert.rejects(fetchFeed('https://not-allowed.invalid/', { hosts: options.hosts }));
  await assert.rejects(
    fetchFeed(options.url, {
      hosts: options.hosts,
      timeout: 5,
      fetchImpl: (_u, { signal }) =>
        new Promise((_, reject) => {
          const timer = setTimeout(() => reject(Error('mock failed')), 500);
          signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(signal.reason);
            },
            { once: true },
          );
        }),
    }),
  );
});
test('RSS 失敗完整保留快取；成功去重、保留舊集及補填 Spotify URL', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fansi-rss-'));
  try {
    const output = join(dir, 'episodes.json');
    const old = parseFeed(xml([{ guid: 'old' }, { guid: 'current' }]));
    old[1].spotify_episode_url = 'https://open.spotify.com/episode/0123456789012345678901';
    old[1].apple_episode_url = 'https://podcasts.apple.com/tw/podcast/test/id123?i=456';
    await writeFile(output, JSON.stringify(old));
    const original = await readFile(output, 'utf8');
    await assert.rejects(
      syncFeed({ ...options, output, fetchImpl: async () => new Response('', { status: 500 }) }),
    );
    assert.equal(await readFile(output, 'utf8'), original);
    await assert.rejects(
      syncFeed({
        ...options,
        output,
        fetchImpl: async () => new Response('<rss><channel/></rss>'),
      }),
    );
    assert.equal(await readFile(output, 'utf8'), original);
    const result = await syncFeed({
      ...options,
      output,
      fetchImpl: async () =>
        new Response(xml([{ guid: 'current', title: '更新' }, { guid: 'new' }])),
    });
    assert.equal(result.length, 3);
    assert.equal(
      result.find((e) => e.guid === 'current').apple_episode_url,
      old[1].apple_episode_url,
    );
    assert.equal(
      result.find((e) => e.guid === 'current').spotify_episode_url,
      old[1].spotify_episode_url,
    );
    assert.equal(result.find((e) => e.guid === 'current').slug, old[1].slug);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
