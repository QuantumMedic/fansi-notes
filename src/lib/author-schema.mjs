import {z} from 'zod';
import {safeUrl} from './model.mjs';
const external=z.string().refine(v=>safeUrl(v));
export const authorSchema=z.object({
 name:z.string().nullable(),bio:z.string().nullable(),label:z.string().optional(),short_bio:z.string().optional(),
 photo:z.string().refine(v=>safeUrl(v)||/^images\/[a-zA-Z0-9/_-]+\.(avif|webp|png|jpg)$/.test(v)).nullable(),photo_alt:z.string().optional(),
 timeline:z.array(z.object({year:z.string(),event:z.string(),source_url:external.optional()})),
 social_links:z.array(z.object({label:z.string(),url:external})).default([]),approved:z.boolean()
}).strict().superRefine((a,ctx)=>{if(!a.approved&&(a.name||a.bio||a.photo||a.timeline.length||a.label||a.short_bio||a.photo_alt||a.social_links.length))ctx.addIssue({code:'custom',message:'未核准作者資料不可寫入公開資料來源'});});
