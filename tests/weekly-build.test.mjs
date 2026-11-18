import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync,
  mkdtempSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { weeklyPlan, hash, splitArticle } from '../scripts/weekly-sync.mjs';
import { parseFeed } from '../src/lib/rss.mjs';
import { article } from './fixtures/content.mjs';

test('single private master packet rebuilds homepage/series/topic/search and GUID thread without altering historical sources', () => {
  const repo = resolve('.'),
    root = realpathSync(mkdtempSync(join(tmpdir(), 'fansi-weekly-build-')));
  try {
    for (const p of [
      'src',
      'public',
      'services/comments/generated',
      'scripts',
      'tests',
      'docs/review',
      'astro.config.mjs',
      'tsconfig.json',
      'package.json',
    ])
      cpSync(join(repo, p), join(root, p), { recursive: true });
    symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'), 'dir');
    // Each parallel fixture owns its Astro/Vite content cache.
    const configPath = join(root, 'astro.config.mjs');
    writeFileSync(configPath, readFileSync(configPath, 'utf8').replace('defineConfig({', "defineConfig({cacheDir: './.astro-cache/', vite: {cacheDir: './.vite-cache/'},"));
    const json = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
    const paths = readdirSync(join(root, 'src/content/articles')).filter((f) => f.endsWith('.md'));
    const old = paths.map((f) =>
      splitArticle(readFileSync(join(root, 'src/content/articles', f), 'utf8')),
    );
    const saved = paths.map((f) => hash(readFileSync(join(root, 'src/content/articles', f))));
    const body = '每週交接隔離測試，搜尋暗號藍色信封。\n\n## 末段\n\n保留原稿結尾。\n';
    const metadata = article({
      work_id: 'demo-weekly-isolated',
      slug: 'demo-weekly-isolated',
      synthetic: false,
      publication_status: 'published',
      public_author_name: '隔離測試',
      published_at: new Date(Date.now() - 60000).toISOString(),
      platform_urls: {
        instagram_url: 'https://www.instagram.com/p/fixture/',
        vocus_url: 'https://vocus.cc/article/fixture',
      },
    });
    const incoming = parseFeed(
      '<rss><channel><item><guid>weekly-build-fixture</guid><title>合成異名單集</title><pubDate>Tue, 01 Jan 2024 00:00:00 GMT</pubDate><description>隔離測試</description><link>https://open.spotify.com/episode/0123456789012345678901</link></item></channel></rss>',
    );
    const packet = {
      version: 1,
      public_authorization: true,
      platforms_published: true,
      metadata,
      master: {
        kind: 'ig-vocus-approved-master',
        revision: metadata.approved_revision,
        sha256: hash(body),
        file: 'private-master.md',
      },
      podcast: { guid: incoming[0].guid, approved: true },
    };
    const files = weeklyPlan(packet, body, {
      articles: old,
      episodes: json('src/data/podcast.json'),
      mapping: json('src/data/podcast-work-map.json'),
      incoming,
      allowPublic: true,
    });
    for (const [p, s] of Object.entries(files)) writeFileSync(join(root, p), s);
    const run = (args) => {
      const p = spawnSync(process.execPath, args, {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      });
      assert.equal(p.status, 0, p.stdout + p.stderr);
    };
    run(['scripts/sync-comment-threads.mjs']);
    run([join(repo, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', root]);
    const html = (p) => readFileSync(join(root, 'dist', p, 'index.html'), 'utf8');
    for (const p of ['', 'articles', 'series/fansiwei', 'topics/psychology'])
      assert.ok(html(p).includes(metadata.slug), p);
    assert.match(html('articles'), /藍色信封/);
    const detail = html('articles/' + metadata.slug);
    assert.match(detail, /保留原稿結尾/);
    assert.match(detail, /Instagram 圖文/);
    assert.match(detail, /Vocus 原文/);
    assert.match(detail, /合成異名單集/);
    assert.match(html('podcast/' + incoming[0].slug), /閱讀對應文章/);
    const threads = json('services/comments/generated/threads.json');
    assert.equal(threads.aliases['podcast:' + incoming[0].guid], 'article:' + metadata.work_id);
    for (const [i, f] of paths.entries())
      assert.equal(hash(readFileSync(join(root, 'src/content/articles', f))), saved[i], f);
    for (const p of ['podcast-classifications.json', 'popularity.json', 'article-images.json'])
      assert.equal(
        readFileSync(join(root, 'src/data', p), 'utf8'),
        readFileSync(join(repo, 'src/data', p), 'utf8'),
      );
    // Existing regression checks must admit additive works, without weakening old body/mapping baselines.
    run([
      '--test',
      'tests/m5d-final.test.mjs',
      'tests/m5b-import.test.mjs',
      'tests/m5c-podcast-approved.test.mjs',
      'tests/m5d-data.test.mjs',
      'tests/interactions-client.test.mjs',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
