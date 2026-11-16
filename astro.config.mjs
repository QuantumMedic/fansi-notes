import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://quantummedic.github.io',
  base: '/fansi-notes',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    {
      name: 'local-author-review-only',
      hooks: {
        'astro:config:setup': ({ command, updateConfig, injectRoute }) => {
          const review = command === 'dev';
          updateConfig({
            vite: { define: { 'import.meta.env.FANSI_REVIEW_MODE': JSON.stringify(review), 'import.meta.env.FANSI_CI': JSON.stringify(!!process.env.CI), 'import.meta.env.FANSI_INDEXING': JSON.stringify(process.env.FANSI_INDEXING || ''), 'import.meta.env.FANSI_INDEXING_AUTHORIZED': JSON.stringify(process.env.FANSI_INDEXING_AUTHORIZED || '') } },
          });
          if (review)
            injectRoute({
              pattern: '/review/classifications/',
              entrypoint: './src/review/classifications.astro',
            });
        },
      },
    },
  ],
});
