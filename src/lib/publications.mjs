import { z } from 'zod';
import { slugSchema, safeUrl } from './model.mjs';
export const kinds = { published: '已出版', short: '短篇小說', series: '系列創作' };
const external = z.string().refine(v => safeUrl(v));
export const publicationSchema = z.object({
 work_id: slugSchema, slug: slugSchema, title:z.string().min(1), publication_kind:z.enum(['published','short','series']), synthetic:z.boolean(), website_approved:z.literal(true), approved_by:z.string().min(1), approved_revision:z.string().min(1), summary:z.string().min(1), theme:z.enum(['sage','bronze']).default('sage'), cover:external.optional(), publisher:z.string().optional(), year:z.number().int().optional(), author:z.string().optional(), series:z.string().optional(), order:z.number().int().positive().optional(), excerpt:z.string().optional(), links:z.array(z.object({label:z.string(),url:external})).default([]), world:z.object({approved:z.literal(true),intro:z.string().min(1),entries:z.array(z.object({kind:z.enum(['人物','地點','事件','番外']),name:z.string().min(1),description:z.string().min(1)})).min(1)}).optional()
}).strict();
export function validatePublications(raw) { const records=raw.map(x=>publicationSchema.parse(x)); for(const key of ['work_id','slug']) if(new Set(records.map(x=>x[key])).size!==records.length) throw Error('重複作品識別碼'); return records; }
