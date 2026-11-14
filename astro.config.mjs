import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://QuantumMedic.github.io',
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
            vite: { define: { 'import.meta.env.FANSI_REVIEW_MODE': JSON.stringify(review) } },
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
