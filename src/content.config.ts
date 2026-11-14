import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const articles = defineCollection({loader: glob({pattern:'**/*.md',base:'./src/content/articles'}),schema:z.object({
 work_id:z.string().regex(/^demo-[a-z-]+$/), title:z.string(), summary:z.string(), content_type:z.enum(['fansiwei','longform']), topics:z.array(z.enum(['thinking','reading'])), synthetic:z.literal(true), publication_status:z.literal('demo'), approved_revision:z.literal('synthetic-v1'),
})});
export const collections = { articles };
