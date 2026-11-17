// One approved written-master packet -> reviewable staged files. Never deploys or writes the repo.
import { readFileSync, readdirSync, realpathSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { z } from 'zod';
import { articleSchema, validateCatalog } from '../src/lib/model.mjs';
import { mergeEpisodes } from '../src/lib/rss.mjs';
import { writeStage } from './import-batch.mjs';
export const hash = (s) => createHash('sha256').update(s).digest('hex');
const packetSchema = z
  .object({
    version: z.literal(1),
    public_authorization: z.literal(true),
    platforms_published: z.literal(true),
    metadata: articleSchema,
    master: z
      .object({
        kind: z.literal('ig-vocus-approved-master'),
        revision: z.string().min(1),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        file: z.string().min(1),
      })
      .strict(),
    podcast: z
      .object({ guid: z.string().min(1), approved: z.literal(true) })
      .strict()
      .optional(),
    expected_article_sha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .strict();
export function splitArticle(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw Error('Invalid article');
  return { metadata: articleSchema.parse(parse(m[1])), body: raw.slice(m[0].length), raw };
}
export function weeklyPlan(
  input,
  body,
  {
    articles = [],
    episodes = [],
    incoming = [],
    mapping = [],
    provenance = {},
    allowPublic = false,
  } = {},
) {
  const p = packetSchema.parse(input),
    m = p.metadata;
  if (!m.synthetic && !allowPublic) throw Error('Explicit public authorization required');
  if (
    m.written_master !== 'ig-vocus' ||
    m.approved_revision !== p.master.revision ||
    hash(body) !== p.master.sha256 ||
    !body.trim()
  )
    throw Error('Approved written master mismatch');
  const existing = articles.find((a) => a.metadata.work_id === m.work_id);
  if (existing) {
    if (
      p.expected_article_sha256 !== hash(existing.raw) ||
      existing.body !== body ||
      existing.metadata.slug !== m.slug
    )
      throw Error('Existing text/route may not be overwritten; separate editorial review required');
  } else if (p.expected_article_sha256) throw Error('Missing existing work');
  const merged = mergeEpisodes(episodes, incoming);
  const maps = structuredClone(mapping);
  if (p.podcast) {
    const old = maps.find((x) => x.guid === p.podcast.guid);
    if (old && old.work_id !== m.work_id) throw Error('Existing GUID relationship conflict');
    if (!old) maps.push({ guid: p.podcast.guid, work_id: m.work_id, approved: true });
  }
  validateCatalog(
    [...articles.filter((a) => a.metadata.work_id !== m.work_id).map((a) => a.metadata), m],
    merged,
    maps,
  );
  const files = {};
  const article = `---\n${JSON.stringify(m)}\n---\n${body}`;
  if (article !== existing?.raw) files[`src/content/articles/${m.slug}.md`] = article;
  const json = (x) => JSON.stringify(x, null, 2) + '\n';
  if (json(merged) !== json(episodes)) files['src/data/podcast.json'] = json(merged);
  if (json(maps) !== json(mapping)) files['src/data/podcast-work-map.json'] = json(maps);
  // Deliberately exclude private file location/status-card contents from public provenance.
  const record = {
    kind: p.master.kind,
    revision: p.master.revision,
    sha256: p.master.sha256,
    approved_by: m.approved_by,
    approved_at: m.approved_at,
  };
  const next = { ...provenance, [m.work_id]: record };
  if (json(next) !== json(provenance))
    files['src/data/written-master-provenance.json'] = json(next);
  return files;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2),
      root = realpathSync('.'),
      file = realpathSync(args[0]);
    if (file.startsWith(root + '/')) throw Error('Private handoff must be outside repo');
    const p = packetSchema.parse(JSON.parse(readFileSync(file))),
      master = realpathSync(resolve(dirname(file), p.master.file));
    if (master.startsWith(root + '/')) throw Error('Private master must be outside repo');
    const articles = readdirSync('src/content/articles')
      .filter((f) => f.endsWith('.md'))
      .map((f) => splitArticle(readFileSync('src/content/articles/' + f, 'utf8')));
    const read = (f) => JSON.parse(readFileSync(f));
    const ix = args.indexOf('--rss');
    const incoming = ix < 0 ? [] : read(args[ix + 1]);
    const state = {
      articles,
      episodes: read('src/data/podcast.json'),
      mapping: read('src/data/podcast-work-map.json'),
      incoming,
      provenance: existsSync('src/data/written-master-provenance.json')
        ? read('src/data/written-master-provenance.json')
        : {},
      allowPublic: args.includes('--allow-public'),
    };
    const files = weeklyPlan(p, readFileSync(master, 'utf8'), state);
    const out = args.indexOf('--output');
    if (out >= 0) writeStage(files, args[out + 1]);
    console.log(
      JSON.stringify({ valid: true, changed_files: Object.keys(files), staged: out >= 0 }),
    );
  } catch {
    console.error(
      'Weekly sync refused: check private packet, explicit approval, master hash/version and exact GUID; no manuscript logged.',
    );
    process.exitCode = 1;
  }
}
