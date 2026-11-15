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
  mkdirSync,
  readdirSync,
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
    cpSync(join(repo,'tests/fixtures/platforms.astro.txt'),join(root,'src/pages/platform-fixture.astro'));
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
      cover_image: 'assets/test-banner.svg', cover_alt: '隔離合成橫幅',
      synthetic: false, publication_status: 'published', public_author_name: '隔離測試署名',
    });
    writeFileSync(join(root,'public/assets/test-banner.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><rect width="1200" height="400" fill="#82978b"/><text x="80" y="210" font-size="48">Synthetic banner 3:1</text></svg>');
    write(data);
    const booksFile=join(root,'src/data/publications.json');
    const books=JSON.parse(readFileSync(booksFile,'utf8'));
    books[0].title='更新合成書名';
    books[0].synthetic=false; // Public-state fixture exists only inside this temporary build.
    books[0].work_form='short';books[0].publication_status='published';books[0].full_text={approved:true,approved_by:'synthetic-fixture',approved_revision:'demo-v1',text:'獨立授權的合成短篇全文。'};
    books[0].cover='https://example.com/approved-cover.jpg';
    books[0].links=[{label:'合成購書入口',url:'https://example.com/book'}];
    delete books[0].world;
    writeFileSync(booksFile,JSON.stringify(books));
    writeFileSync(join(root, 'src/data/publication-relations.json'), JSON.stringify([
      {article_work_id: data.work_id, publication_work_id: books[0].work_id, approved:true}
    ]));
    // A stale review build and proposed-only keyword must never survive a public build.
    const reviewDir = join(root, 'dist/review/classifications');
    mkdirSync(reviewDir, { recursive: true });
    writeFileSync(join(reviewDir, 'index.html'), 'STALE-REVIEW-SECRET');
    const classificationsFile = join(root, 'src/data/podcast-classifications.json');
    const classifications = JSON.parse(readFileSync(classificationsFile, 'utf8'));
    classifications[0].keywords = ['PROPOSED-SEARCH-SECRET'];
    const before = JSON.stringify(classifications);
    writeFileSync(classificationsFile, before);
    build();
    for (const page of ['index.html','articles/index.html','series/fansiwei/index.html']) {
      assert.match(html(page), /class="article-banner"[^>]*src="[^"]*assets\/test-banner.svg"[^>]*alt="隔離合成橫幅"/);
    }
    for (const [alias, canonical] of [['books','literature'],['personal','creation'],['history_society','society']]) {
      assert.match(html(`topics/${alias}/index.html`), new RegExp(`topics/${canonical}/`));
      assert.match(html(`topics/${alias}/index.html`), /http-equiv="refresh"/);
    }
    const showcase=html('platform-fixture/index.html');
    for(const platform of ['spotify','apple','vocus','instagram']) assert.match(showcase,new RegExp(`data-platform="${platform}"`));
    assert.equal((showcase.match(/class="platform-button"/g)||[]).length,4);
    assert.match(showcase,/Instagram 圖文/);assert.match(showcase,/Spotify 收聽/);
    assert.equal(readFileSync(classificationsFile, 'utf8'), before);
    assert.equal(existsSync(join(root, 'dist/review/classifications/index.html')), false);
    const inspect = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          inspect(path);
          continue;
        }
        if (/\.(html|js|json|xml|txt)$/.test(path))
          assert.doesNotMatch(
            readFileSync(path, 'utf8'),
            /review\/classifications|PROPOSED-SEARCH-SECRET|STALE-REVIEW-SECRET|分類建議・待審核/,
          );
      }
    };
    inspect(join(root, 'dist'));
    for(const page of ['index.html','works/index.html','about/index.html']) {
      assert.match(html(page),/更新合成書名/);
      assert.match(html(page),/approved-cover.jpg/);
    }
    assert.match(html('works/demo-paper-city/index.html'),/獨立授權的合成短篇全文/);
    assert.match(html('works/demo-paper-city/index.html'),/https:\/\/example.com\/book/);
    assert.equal(existsSync(join(root,'dist/works/demo-paper-city/world/index.html')),false);
    const realEpisodes = JSON.parse(readFileSync(join(root, 'src/data/podcast.json'), 'utf8'));
    for (const ep of realEpisodes)
      assert.match(html(`podcast/${ep.slug}/index.html`), /分類待確認/);

    assert.match(html('articles/index.html'), /海邊的紅色信箱/);
    assert.match(html('topics/psychology/index.html'), /新增合成文章/);
    assert.match(html('index.html'), /新增合成文章/);
    assert.match(html('series/fansiwei/index.html'), /新增合成文章/);
    assert.doesNotMatch(html('series/fansiwei/index.html'), /一盆植物延長生命/);
    assert.doesNotMatch(html('series/fansiwei/index.html'), /id="work-series"/);
    assert.match(html('series/fansiwei/index.html'), /data-fixed-series="fansiwei"/);
    assert.doesNotMatch(html('articles/demo-new/index.html'), /Instagram 圖文|data-spotify-id|相關 Podcast/);
    assert.match(html('articles/demo-new/index.html'), /works\/demo-paper-city\//);
    assert.match(html('works/demo-paper-city/index.html'), /articles\/demo-new\//);
    const e = {
      guid: 'fixture-unique-guid',
      slug: 'fixture-episode',
      title: '和文章不同名的單集',
      description: '合成介紹',
      published_at: data.published_at,
      synthetic: true,
      spotify_episode_url: 'https://open.spotify.com/episode/0123456789012345678901',
      apple_episode_url: 'https://podcasts.apple.com/tw/podcast/test/id123?i=456',
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
      topics: ['books'],
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
    assert.match(detail, /Instagram 圖文/);
    assert.match(detail, /Vocus 原文/);
    assert.match(detail, /和文章不同名的單集/);
    assert.match(detail, /data-spotify-id/);
    assert.doesNotMatch(detail, /<iframe/);
    assert.doesNotMatch(detail, /紙上花園/);
    assert.match(detail, /聆聽這篇文章/);
    assert.match(detail, /Apple Podcasts/);
    assert.match(detail, /id="article-listening"/);
    assert.ok(detail.indexOf('Vocus 原文') > detail.indexOf('class="reading article-body"'));
    assert.equal((detail.match(/Vocus 原文/g)||[]).length,1);
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
    assert.equal(
      (html('series/stories/index.html').match(/data-work-id="demo-new"/g) || []).length,
      1,
    );
    // Extending and renaming the central dictionary changes every route/filter at build time.
    const taxFile = join(root, 'src/data/taxonomy.json');
    const tax = JSON.parse(readFileSync(taxFile, 'utf8'));
    tax.topics.push({ slug: 'new-topic', name: '合成新主題' });
    tax.topics.find((t) => t.slug === 'psychology').name = '合成重新命名';
    writeFileSync(taxFile, JSON.stringify(tax));
    write({ ...data, content_type: 'special', topics: ['new-topic'] });
    build();
    assert.match(html('topics/new-topic/index.html'), /改名合成文章/);
    assert.match(html('articles/index.html'), /合成重新命名/);
    assert.match(html('podcast/fixture-episode/index.html'), /主要：合成新主題/);
    assert.match(html('series/stories/index.html'), /data-work-id="demo-new"/);
    for(const old of ['longform','special']) assert.match(html(`series/${old}/index.html`), /series\/stories\//);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
