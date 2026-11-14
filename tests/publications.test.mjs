import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePublications } from '../src/lib/publications.mjs';
const data = JSON.parse(readFileSync('src/data/publications.json', 'utf8'));
test('出版資料拒絕未核准、重複識別與不安全網址，世界資料需獨立核准', () => {
  assert.equal(validatePublications(data).length, data.length);
  for (const change of [
    { website_approved: false },
    { links: [{ label: '錯誤', url: 'javascript:alert(1)' }] },
    { world: { approved: false, intro: 'x', entries: [] } },
  ])
    assert.throws(() => validatePublications([{ ...data[0], ...change }]));
  assert.throws(() => validatePublications([data[0], data[0]]));
  const b = validatePublications([
    {
      ...data[0],
      world: undefined,
      cover: 'https://example.com/approved.jpg',
      links: [{ label: '合成購書測試', url: 'https://example.com/book' }],
    },
  ])[0];
  assert.equal(b.world, undefined);
  assert.equal(b.links.length, 1);
});
test('書架、作者頁與首頁共用作品；試讀與世界具明確合成標記', () => {
  for (const page of ['index', 'works/index', 'about/index'])
    assert.match(readFileSync(`dist/${page}.html`, 'utf8'), /紙城・合成作品示範/);
  assert.match(readFileSync('dist/works/demo-paper-city/index.html', 'utf8'), /合成試讀測試文字/);
  assert.match(readFileSync('dist/works/demo-paper-city/world/index.html', 'utf8'), /合成世界資料/);
});

import { validatePublicationRelations } from '../src/lib/publication-relations.mjs';
test('文章與出版關聯只接受核准的存在 ID，拒絕重複且雙向呈現', () => {
  const r = { article_work_id: 'a', publication_work_id: 'b', approved: true };
  assert.equal(validatePublicationRelations([r], [{ work_id: 'a' }], [{ work_id: 'b' }]).length, 1);
  for (const rows of [[{ ...r, approved: false }], [{ ...r, article_work_id: 'missing' }], [r, r]])
    assert.throws(() => validatePublicationRelations(rows, [{ work_id: 'a' }], [{ work_id: 'b' }]));
  assert.match(
    readFileSync('dist/articles/paper-garden/index.html', 'utf8'),
    /href="\/fansi-notes\/works\/demo-paper-city\/"/,
  );
  assert.match(
    readFileSync('dist/works/demo-paper-city/index.html', 'utf8'),
    /href="\/fansi-notes\/articles\/paper-garden\/"/,
  );
});
