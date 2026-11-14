import raw from '../data/author.json';
import {z} from 'zod';
import {safeUrl} from './model.mjs';
const schema=z.object({name:z.string().nullable(),bio:z.string().nullable(),photo:z.string().refine(v=>safeUrl(v)).nullable(),timeline:z.array(z.object({year:z.string(),event:z.string()})),approved:z.boolean()}).strict().superRefine((a,ctx)=>{if(!a.approved&&(a.name||a.bio||a.photo||a.timeline.length))ctx.addIssue({code:'custom',message:'未核准作者資料不可寫入公開資料來源'});});
export const author=schema.parse(raw);
