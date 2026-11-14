import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const walk = (p) =>
  readdirSync(p, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(p, e.name)) : [join(p, e.name)],
  );
test('M1 路由全部輸出，原型禁止索引', () => {
  for (const p of [
    '',
    'articles/',
    'articles/willpower-and-habits/',
    'articles/antifragile-life/',
    'podcast/',
    'works/',
    'about/',
    'contact/',
    'privacy/',
    'topics/',
    'topics/psychology/',
    'topics/literature/',
  ]) {
    const html = readFileSync(`dist/${p}index.html`, 'utf8');
    assert.match(html, /lang="zh-TW"/);
    assert.match(html, /noindex,nofollow/);
  }
  assert.ok(existsSync('dist/404.html'));
});
test('所有本機連結及資產遵守 Pages base 且目的地存在', () => {
  for (const file of walk('dist').filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    for (const [, href] of html.matchAll(/(?:href|src|action)="([^"#]+)"/g)) {
      if (/^(https:|data:)/.test(href)) continue;
      assert.ok(href.startsWith('/fansi-notes/'), `${file}: ${href}`);
      const path = decodeURI(href.split(/[?#]/)[0].replace('/fansi-notes/', ''));
      assert.ok(existsSync(`dist/${path}`) || existsSync(`dist/${path}/index.html`), href);
    }
  }
});
test('現有兩篇示意文章維持合成資料標記', () => {
  const files = ['src/content/articles/paper-garden.md', 'src/content/articles/reading-window.md'];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    assert.match(text, /synthetic: true/);
    assert.match(text, /publication_status: demo/);
    assert.match(text, /work_id: demo-/);
    assert.doesNotMatch(text, /https?:|podcast_master|三個傻瓜|說不完的故事|奧德賽|25 號宇宙/);
  }
});
test('CI 沒有部署、排程或寫入權限', () => {
  const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
  assert.doesNotMatch(ci, /deploy-pages|pages: write|schedule:|contents: write/);
});
test('RSS 排程只有唯讀權限與預覽輸出，不推送或部署', () => {
  const workflow = readFileSync('.github/workflows/sync-podcast.yml', 'utf8');
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /schedule:/);
  assert.doesNotMatch(
    workflow,
    /contents: write|pull-requests: write|git push|deploy-pages|create-pull-request/,
  );
});
test('正式 RSS 單集均有獨立路由、封面與收聽入口；不自動誤配', () => {
  const episodes = JSON.parse(readFileSync('src/data/podcast.json', 'utf8'));
  const mapping = JSON.parse(readFileSync('src/data/podcast-work-map.json', 'utf8'));
  for (const e of episodes) {
    const html = readFileSync(`dist/podcast/${e.slug}/index.html`, 'utf8');
    assert.match(html, /lang="zh-TW"/);
    if (e.cover_image) assert.ok(html.includes(e.cover_image));
    if (e.url) assert.match(html, /開啟官方單集頁/);
    if (mapping.some((m) => m.guid === e.guid)) assert.match(html, /閱讀對應文章/);
    else assert.doesNotMatch(html, /閱讀對應文章/);
    if (e.spotify_episode_url) {
      assert.ok(html.includes(e.spotify_episode_url));
      assert.match(html, /在 Spotify 收聽本集/);
      assert.doesNotMatch(html, /在 Spotify 開啟節目首頁/);
    }
    if (e.apple_episode_url) {
      assert.ok(html.includes(e.apple_episode_url.replaceAll('&', '&amp;')));
      assert.match(html, /在 Apple Podcasts 收聽本集/);
    }
    assert.doesNotMatch(html, /<iframe/);
  }
});
test('正式 dist 無分類審閱路由、入口、proposed 標籤或審閱搜尋／網站地圖資料', () => {
  assert.equal(existsSync('dist/review/classifications/index.html'), false);
  for (const file of walk('dist').filter((f) => /\.(html|js|json|xml|txt)$/.test(f))) {
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      /review\/classifications|分類建議・待審核|檢視分類建議/,
    );
  }
  const episodes = JSON.parse(readFileSync('src/data/podcast.json', 'utf8'));
  for (const ep of episodes) assert.ok(existsSync(`dist/podcast/${ep.slug}/index.html`));
});
