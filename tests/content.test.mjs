import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  articleSchema,
  validateCatalog,
  platformsSchema,
  spotifyId,
  relatedArticles,
  newest,
} from '../src/lib/model.mjs';
import { matchesSearch } from '../src/lib/search.mjs';
import { article } from './fixtures/content.mjs';
test('拒絕未核准、未來日期、私有欄位及錯誤狀態', () => {
  for (const change of [
    { website_approved: false },
    { published_at: '2099-01-01T00:00:00Z' },
    { podcast_master: '不得存入' },
    { publication_status: 'draft' },
    { synthetic: false },
    { slug: '../escape' },
    { topics: ['unconfirmed'] },
  ])
    assert.equal(articleSchema.safeParse({ ...article(), ...change }).success, false);
});
test('唯一 work_id、路由／別名及相關作品 ID 驗證', () => {
  const a = article();
  assert.throws(() => validateCatalog([a, a]));
  assert.throws(() =>
    validateCatalog([a, article({ work_id: 'demo-other', aliases: ['demo-test'] })]),
  );
  assert.throws(() => validateCatalog([article({ related_work_ids: ['unknown'] })]));
  assert.doesNotThrow(() => validateCatalog([article({ aliases: ['old-name'] })]));
});
test('平台補鏈只接受正確 HTTPS 主機與 Spotify 單集 ID', () => {
  assert.ok(
    platformsSchema.safeParse({ instagram_url: 'https://www.instagram.com/p/fixture/' }).success,
  );
  assert.ok(platformsSchema.safeParse({ vocus_url: 'https://vocus.cc/article/fixture' }).success);
  for (const url of [
    'javascript:alert(1)',
    'https://instagram.com.evil.invalid/p/x',
    'https://user:password@instagram.com/p/x',
  ])
    assert.equal(platformsSchema.safeParse({ instagram_url: url }).success, false);
  assert.equal(spotifyId('https://open.spotify.com/show/1OTO4ceuRIblBy9JbUNJM2'), null);
  assert.equal(
    spotifyId('https://open.spotify.com/episode/0123456789012345678901'),
    '0123456789012345678901',
  );
});
test('GUID 明確配對，不靠同名；拒絕重複與未知映射', () => {
  const a = article();
  const e = {
    guid: 'fixed-guid',
    slug: 'episode-demo',
    title: '異名單集',
    description: '示意',
    published_at: a.published_at,
    synthetic: true,
  };
  assert.doesNotThrow(() =>
    validateCatalog([a], [e], [{ guid: e.guid, work_id: a.work_id, approved: true }]),
  );
  assert.doesNotThrow(() => validateCatalog([a], [e], []));
  assert.throws(() =>
    validateCatalog([a], [e], [{ guid: 'other', work_id: a.work_id, approved: true }]),
  );
  assert.throws(() =>
    validateCatalog([a], [e], [{ guid: e.guid, work_id: a.work_id, approved: false }]),
  );
});
test('作者指定推薦優先，日期排序與正文／主題交叉搜尋', () => {
  const a = article({ related_work_ids: ['demo-b'] });
  const b = article({ work_id: 'demo-b', slug: 'b', topics: ['literature'] });
  const c = article({ work_id: 'demo-c', slug: 'c', published_at: '2026-01-03T00:00:00Z' });
  assert.equal(relatedArticles(a, [a, b, c])[0].work_id, 'demo-b');
  assert.equal(newest([a, c])[0].work_id, 'demo-c');
  assert.ok(
    matchesSearch('標題 正文中的 ABC 詞句', ['psychology'], 'fansiwei', {
      q: '正文 abc',
      topic: 'psychology',
    }),
  );
  assert.equal(
    matchesSearch('正文', ['literature'], 'longform', { q: '正文', topic: 'psychology' }),
    false,
  );
});
