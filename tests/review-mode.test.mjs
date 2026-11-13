import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../astro.config.mjs';
test('審閱路由只在 dev 註冊；build／preview／sync 永不註冊', () => {
  const hook = config.integrations.find((x) => x.name === 'local-author-review-only').hooks[
    'astro:config:setup'
  ];
  for (const command of ['dev', 'build', 'preview', 'sync']) {
    const routes = [],
      configs = [];
    hook({ command, updateConfig: (c) => configs.push(c), injectRoute: (r) => routes.push(r) });
    assert.equal(routes.length, command === 'dev' ? 1 : 0);
    assert.equal(
      configs[0].vite.define['import.meta.env.FANSI_REVIEW_MODE'],
      JSON.stringify(command === 'dev'),
    );
  }
});
