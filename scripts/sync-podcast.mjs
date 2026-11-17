import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { syncFeed } from '../src/lib/rss.mjs';
const config = JSON.parse(
  await readFile(new URL('../src/data/podcast-config.json', import.meta.url), 'utf8'),
);
if (!config.feed_url) {
  console.log('尚未設定 RSS，既有資料維持不變。');
  process.exit(0);
}
try {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output');
  if (outputIndex >= 0 && !args[outputIndex + 1]) throw Error('Missing output');
  const episodes = await syncFeed({
    url: config.feed_url,
    hosts: config.allowed_feed_hosts,
    output:
      outputIndex < 0
        ? new URL('../src/data/podcast.json', import.meta.url).pathname
        : resolve(args[outputIndex + 1]),
    previousFile: new URL('../src/data/podcast.json', import.meta.url).pathname,
  });
  console.log(`已同步 ${episodes.length} 集公開資料；未保存原始 RSS。`);
} catch {
  console.error('RSS 同步失敗；既有單集資料未覆寫。請檢查來源、連線或資料格式後重試。');
  process.exitCode = 1;
}
