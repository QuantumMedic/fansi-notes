import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weeklyPlan as plan, hash, splitArticle } from '../scripts/weekly-sync.mjs';
import { parseFeed, mergeEpisodes } from '../src/lib/rss.mjs';
import { makeThreads, resolveThread } from '../src/lib/comment-threads.mjs';
const metadata = JSON.parse(readFileSync('examples/import-manifest.synthetic.json')).items[0]
  .metadata;
const weeklyPlan = (p, b, s) => plan(p, b, { ...s, allowPublic: true });
const body = '僅供隔離驗證的書面母稿。\n\n完整結尾。\n';
const packet = {
  version: 1,
  public_authorization: true,
  platforms_published: true,
  metadata: {
    ...metadata,
    synthetic: false,
    publication_status: 'published',
    public_author_name: '隔離合成測試',
    platform_urls: {
      instagram_url: 'https://www.instagram.com/p/fixture/',
      vocus_url: 'https://vocus.cc/article/fixture',
    },
  },
  master: {
    kind: 'ig-vocus-approved-master',
    revision: metadata.approved_revision,
    sha256: hash(body),
    file: 'master.md',
  },
  podcast: { guid: 'weekly-fixture-guid', approved: true },
};
const incoming = parseFeed(
  '<rss><channel><item><guid>weekly-fixture-guid</guid><title>合成音訊，標題刻意不同</title><pubDate>Tue, 01 Jan 2024 00:00:00 GMT</pubDate><description>合成</description></item></channel></rss>',
);
test('weekly approved master + RSS GUID yields one work, platform links and repeatable no-op', () => {
  const files = weeklyPlan(packet, body, { incoming });
  const raw = files['src/content/articles/' + metadata.slug + '.md'];
  const article = splitArticle(raw);
  assert.equal(article.body, body);
  assert.equal(article.metadata.platform_urls.vocus_url, packet.metadata.platform_urls.vocus_url);
  const episodes = JSON.parse(files['src/data/podcast.json']),
    mapping = JSON.parse(files['src/data/podcast-work-map.json']);
  const threads = makeThreads([article.metadata], episodes, mapping, []);
  assert.equal(
    resolveThread(threads, 'article', metadata.work_id),
    resolveThread(threads, 'podcast', incoming[0].guid),
  );
  const again = weeklyPlan({ ...packet, expected_article_sha256: hash(raw) }, body, {
    articles: [article],
    episodes,
    mapping,
    provenance: JSON.parse(files['src/data/written-master-provenance.json']),
  });
  assert.deepEqual(again, {});
  assert.ok(!JSON.stringify(files).includes('"file":"master.md"'));
});
test('weekly refuses missing approval, changed master, guessed/conflicting GUID and overwrite', () => {
  for (const p of [
    { ...packet, public_authorization: false },
    { ...packet, platforms_published: false },
    { ...packet, master: { ...packet.master, kind: 'podcast-transcript' } },
    { ...packet, podcast: { guid: 'unknown', approved: true } },
  ])
    assert.throws(() => weeklyPlan(p, body, { incoming }));
  assert.throws(() => weeklyPlan(packet, body + '改寫', { incoming }));
  assert.throws(() =>
    weeklyPlan(packet, body, {
      incoming,
      mapping: [{ guid: incoming[0].guid, work_id: 'other', approved: true }],
    }),
  );
  const raw = weeklyPlan(packet, body, { incoming })[
    'src/content/articles/' + metadata.slug + '.md'
  ];
  assert.throws(() => weeklyPlan(packet, body, { articles: [splitArticle(raw)], incoming }));
});
test('RSS preserves manual episode links and old GUIDs even when feed changes link', () => {
  const old = {
    ...incoming[0],
    spotify_episode_url: 'https://open.spotify.com/episode/1234567890123456789012',
    apple_episode_url: 'https://podcasts.apple.com/tw/podcast/id123?i=123',
  };
  const changed = {
    ...old,
    spotify_episode_url: 'https://open.spotify.com/episode/abcdefghijklmnopqrstuv',
  };
  assert.equal(mergeEpisodes([old], [changed])[0].spotify_episode_url, old.spotify_episode_url);
  assert.deepEqual(mergeEpisodes([old], []), [old]);
});
test('real master requires explicit CLI-equivalent allow flag; multiple IG links and metadata-only update preserve body', () => {
  assert.throws(() => plan(packet, body, { incoming }));
  const first = weeklyPlan(packet, body, { incoming }),
    raw = first['src/content/articles/' + metadata.slug + '.md'];
  const state = {
    articles: [splitArticle(raw)],
    episodes: JSON.parse(first['src/data/podcast.json']),
    mapping: JSON.parse(first['src/data/podcast-work-map.json']),
    provenance: JSON.parse(first['src/data/written-master-provenance.json']),
  };
  const update = {
    ...packet,
    expected_article_sha256: hash(raw),
    metadata: {
      ...packet.metadata,
      platform_urls: {
        ...packet.metadata.platform_urls,
        related_instagram_urls: ['https://www.instagram.com/p/second-fixture/'],
      },
    },
  };
  const changed = weeklyPlan(update, body, state);
  assert.equal(splitArticle(changed['src/content/articles/' + metadata.slug + '.md']).body, body);
  assert.equal(changed['src/data/podcast-work-map.json'], undefined);
  assert.throws(() =>
    weeklyPlan({ ...update, master: { ...update.master, revision: 'unapproved' } }, body, state),
  );
});
test('CLI private packet stages only approved files outside repo, rejects overwrite and unapproved input',async()=>{
 const {mkdtempSync,writeFileSync,readFileSync,rmSync,existsSync}=await import('node:fs');
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {spawnSync}=await import('node:child_process');
 const root=mkdtempSync(join(tmpdir(),'weekly-private-'));
 const call=(extra=[])=>spawnSync(process.execPath,['scripts/weekly-sync.mjs',join(root,'handoff.json'),'--rss',join(root,'rss.json'),'--allow-public',...extra],{encoding:'utf8'});
 try{
  writeFileSync(join(root,'master.md'),body);writeFileSync(join(root,'handoff.json'),JSON.stringify(packet));writeFileSync(join(root,'rss.json'),JSON.stringify(incoming));
  const stage=join(root,'stage');assert.equal(call(['--output',stage]).status,0);
  assert.equal(splitArticle(readFileSync(join(stage,'src/content/articles',metadata.slug+'.md'),'utf8')).body,body);
  assert.equal(existsSync('src/content/articles/'+metadata.slug+'.md'),false);
  assert.notEqual(call(['--output',stage]).status,0);
  assert.notEqual(call(['--output','.weekly-unsafe-stage-test']).status,0);assert.equal(existsSync('.weekly-unsafe-stage-test'),false);
  writeFileSync(join(root,'handoff.json'),JSON.stringify({...packet,public_authorization:false}));
  const refused=call();assert.notEqual(refused.status,0);assert.ok(!refused.stderr.includes(body));
 }finally{rmSync(root,{recursive:true,force:true});}
});
