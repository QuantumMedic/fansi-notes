import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema } from './lib/model.mjs';
export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: articleSchema,
  }),
};
