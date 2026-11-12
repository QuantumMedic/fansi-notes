import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  realpathSync,
  cpSync,
  symlinkSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { article } from './fixtures/content.mjs';
const repo = resolve('.');
test('整合建置：新增、改名、改分類標籤、補平台網址與異名 GUID 配對', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'fansi-build-')));
  try {
    for (const path of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json'])
      cpSync(join(repo, path), join(root, path), { recursive: true });
    symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'), 'dir');
    const file = join(root, 'src/content/articles/demo-new.md');
    const write = (data) =>
      writeFileSync(
        file,
        `---\n${JSON.stringify(data)}\n---\n僅供測試的正文搜尋關鍵字：海邊的紅色信箱。\n\n## 合成章節\n\n測試資料。`,
      );
    const build = () => {
      const p = spawnSync(
        process.execPath,
        [join(repo, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', root],
        { cwd: root, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } },
      );
      assert.equal(p.status, 0, p.stdout + p.stderr);
    };
    const html = (p) => readFileSync(join(root, 'dist', p), 'utf8');
    let data = article({
      work_id: 'demo-new',
      slug: 'demo-new',
      title: '新增合成文章',
      featured_order: 0,
    });
    write(data);
    build();
    assert.match(html('articles/index.html'), /海邊的紅色信箱/);
    assert.match(html('topics/psychology/index.html'), /新增合成文章/);
    assert.match(html('index.html'), /新增合成文章/);
    assert.match(html('series/fansiwei/index.html'), /新增合成文章/);
    assert.match(html('series/fansiwei/index.html'), /一盆植物延長生命/);
    assert.doesNotMatch(html('articles/demo-new/index.html'), /觀看 Instagram|data-spotify-id/);
    const e = {
      guid: 'fixture-unique-guid',
      slug: 'fixture-episode',
      title: '和文章不同名的單集',
      description: '合成介紹',
      published_at: data.published_at,
      synthetic: true,
      spotify_episode_url: 'https://open.spotify.com/episode/0123456789012345678901',
    };
    writeFileSync(
      join(root, 'src/data/podcast.json'),
      JSON.stringify([e, { ...e, guid: 'unpaired', slug: 'unpaired-episode', title: '獨立單集' }]),
    );
    writeFileSync(
      join(root, 'src/data/podcast-work-map.json'),
      JSON.stringify([{ guid: e.guid, work_id: data.work_id, approved: true }]),
    );
    data = article({
      ...data,
      slug: 'demo-renamed',
      aliases: ['demo-new'],
      title: '改名合成文章',
      content_type: 'longform',
      topics: ['literature'],
      platform_urls: {
        instagram_url: 'https://www.instagram.com/p/fixture/',
        vocus_url: 'https://vocus.cc/article/fixture',
      },
      related_work_ids: ['demo-paper-garden'],
    });
    write(data);
    build();
    const detail = html('articles/demo-renamed/index.html');
    assert.match(detail, /文章目錄/);
    assert.match(detail, /觀看 Instagram/);
    assert.match(detail, /閱讀 Vocus/);
    assert.match(detail, /和文章不同名的單集/);
    assert.match(detail, /data-spotify-id/);
    assert.doesNotMatch(detail, /<iframe/);
    assert.match(detail, /紙上花園/);
    assert.match(html('articles/demo-new/index.html'), /http-equiv="refresh"/);
    assert.match(html('articles/demo-new/index.html'), /articles\/demo-renamed\//);
    assert.match(
      html('topics/psychology/index.html'),
      /hidden[^>]*data-work-result[^>]*data-topics="literature"/,
    );
    assert.match(html('topics/literature/index.html'), /改名合成文章/);
    assert.match(html('podcast/fixture-episode/index.html'), /閱讀對應文章/);
    assert.doesNotMatch(html('podcast/unpaired-episode/index.html'), /閱讀對應文章/);
    assert.ok(existsSync(join(root, 'dist/podcast/unpaired-episode/index.html')));
    assert.match(html('podcast/unpaired-episode/index.html'), /分類待確認/);
    assert.match(html('podcast/fixture-episode/index.html'), /主要：書籍與文學/);
    assert.equal((html('series/longform/index.html').match(/data-work-id="demo-new"/g)||[]).length,1);
    // Extending and renaming the central dictionary changes every route/filter at build time.
    const taxFile=join(root,'src/data/taxonomy.json');
    const tax=JSON.parse(readFileSync(taxFile,'utf8'));
    tax.topics.push({slug:'new-topic',name:'合成新主題'});
    tax.topics.find(t=>t.slug==='psychology').name='合成重新命名';
    writeFileSync(taxFile,JSON.stringify(tax));
    write({...data,content_type:'special',topics:['new-topic']});
    build();
    assert.match(html('topics/new-topic/index.html'),/改名合成文章/);
    assert.match(html('articles/index.html'),/合成重新命名/);
    assert.match(html('podcast/fixture-episode/index.html'),/主要：合成新主題/);
    assert.match(html('series/special/index.html'),/data-work-id="demo-new"/);

  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
