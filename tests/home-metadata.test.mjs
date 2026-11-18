import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const built = path => readFileSync(`dist/${path}index.html`, 'utf8');

test('首頁搜尋與分享使用作者指定標題及描述，內頁仍沿用原規則', () => {
  const title = '凡思筆記｜江宗凡的文字、聲音與創作';
  const description = '由江宗凡經營的創作網站，收錄文章、凡思聲 Podcast、小說及出版作品。';
  const home = built('');
  for (const tag of [`<title>${title}</title>`, `name="description" content="${description}"`, `property="og:title" content="${title}"`, `property="og:description" content="${description}"`]) assert.ok(home.includes(tag), tag);
  const podcast = built('podcast/');
  assert.ok(podcast.includes('<title>凡思聲｜凡思筆記</title>'));
  assert.ok(podcast.includes('property="og:title" content="凡思聲"'));
});
