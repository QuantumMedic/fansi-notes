import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  classificationSchema,
  makeClassificationSchema,
  series,
  topics,
} from '../src/lib/taxonomy.mjs';
import {
  resolveClassifications,
  buildWorks,
  standaloneSchema,
} from '../src/lib/classification.mjs';
import { article } from './fixtures/content.mjs';
const episode = (guid = 'guid-a') => ({
  guid,
  slug: `episode-${guid}`,
  title: '同名也不自動配對',
  description: '合成',
  published_at: '2026-01-01T00:00:00Z',
  synthetic: true,
});
const record = (overrides = {}) => ({
  guid: 'guid-a',
  work_id: 'audio-a',
  content_type: 'fansiwei',
  topics: ['psychology', 'science'],
  keywords: ['自由關鍵字'],
  status: 'proposed',
  ...overrides,
});
test('主要必填、至多兩個不同主題；分類字典擴充只需一處', () => {
  for (const values of [
    [],
    ['psychology', 'science', 'society'],
    ['psychology', 'psychology'],
    ['unknown'],
  ])
    assert.equal(
      classificationSchema.safeParse({ content_type: 'fansiwei', topics: values }).success,
      false,
    );
  assert.equal(
    classificationSchema.safeParse({ content_type: 'bad', topics: ['psychology'] }).success,
    false,
  );
  const extended = makeClassificationSchema({
    series,
    topics: [...topics, { slug: 'new-topic', name: '合成新主題' }],
  });
  assert.ok(
    extended.safeParse({ content_type: 'special', topics: ['new-topic'], keywords: ['任意細節'] })
      .success,
  );
  assert.equal(standaloneSchema.safeParse(record({ status: 'confirmed' })).success, false);
});
test('Podcast-only 凡思維、未分類單集保留；proposed 不冒充核准', () => {
  const es = resolveClassifications([], [episode(), episode('new')], [], [record()], {
    includeProposed: true,
  });
  assert.equal(es[0].classification.status, 'proposed');
  assert.equal(es[0].classification.content_type, 'fansiwei');
  assert.equal(es[1].classification.status, 'pending');
  const works = buildWorks([], es);
  assert.equal(works.length, 2);
  assert.equal(works[0].article, null);
});
test('核准 work_id 關聯優先且同作品只一筆；改一次文章更新全部媒介', () => {
  const a = article({ title: '同名也不自動配對', content_type: 'special', topics: ['creation'] });
  const own = record({
    status: 'confirmed',
    reviewed_by: 'synthetic',
    reviewed_at: '2026-01-01T00:00:00Z',
  });
  const unpaired = resolveClassifications([a], [episode()], [], [own]);
  assert.equal(unpaired[0].work_id, 'audio-a');
  const m = [{ guid: 'guid-a', work_id: a.work_id, approved: true }];
  let es = resolveClassifications([a], [episode()], m, [own]);
  assert.equal(es[0].classification.content_type, 'special');
  assert.equal(buildWorks([{ data: a }], es).length, 1);
  const changed = { ...a, content_type: 'longform', topics: ['literature'] };
  es = resolveClassifications([changed], [episode()], m, [own]);
  assert.deepEqual(es[0].classification.topics, ['literature']);
  assert.equal(es[0].classification.source, 'work');
});
test('GUID 分類不受 RSS 順序／標題變動影響，不修改人工資料', () => {
  const records = [record()];
  const before = JSON.stringify(records);
  const updated = { ...episode(), title: 'RSS 更新標題' };
  const es = resolveClassifications([], [episode('new'), updated], [], records, {
    includeProposed: true,
  });
  assert.equal(es[1].classification.content_type, 'fansiwei');
  assert.equal(JSON.stringify(records), before);
  assert.throws(() => resolveClassifications([], [], [], [record(), record()]));
});
test('人工分類資料的 GUID 唯一且存在；允許後續作者核准與改分類', async () => {
  const read = async (p) => JSON.parse(await readFile(p, 'utf8'));
  const es = await read('src/data/podcast.json'),
    rs = await read('src/data/podcast-classifications.json');
  assert.equal(new Set(rs.map((r) => r.guid)).size, rs.length);
  for (const r of rs) {
    assert.ok(es.some((e) => e.guid === r.guid));
    standaloneSchema.parse(r);
  }
});

test('正式資料預設排除 proposed 標籤和關鍵字；confirmed 與未分類單集保留', () => {
  const raw = [
    record(),
    record({
      guid: 'confirmed',
      work_id: 'confirmed-work',
      status: 'confirmed',
      reviewed_by: 'test',
      reviewed_at: '2026-01-01T00:00:00Z',
    }),
  ];
  const before = JSON.stringify(raw);
  const publicEpisodes = resolveClassifications(
    [],
    [episode(), episode('confirmed'), episode('new')],
    [],
    raw,
  );
  assert.equal(publicEpisodes.length, 3);
  assert.deepEqual(publicEpisodes[0].classification, {
    content_type: '',
    topics: [],
    keywords: [],
    status: 'pending',
    source: 'none',
  });
  assert.equal(publicEpisodes[0].work_id, 'audio-a');
  assert.equal(publicEpisodes[1].classification.status, 'confirmed');
  assert.deepEqual(publicEpisodes[1].classification.topics, ['psychology', 'science']);
  assert.equal(publicEpisodes[2].classification.status, 'pending');
  assert.equal(JSON.stringify(raw), before);
});
