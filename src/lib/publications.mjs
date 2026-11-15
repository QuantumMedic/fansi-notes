import { z } from 'zod';
import { slugSchema, safeUrl } from './model.mjs';
export const kinds = { published: '已出版', online: '網路發表', serialized: '連載中', unpublished: '未出版' };
export const forms = { novel: '長篇小說', short: '短篇小說', collection: '作品集' };
export const linkGroups = { print: '紙本購書', ebook: '電子書', read: '線上閱讀' };
const text = z.string().min(1);
const external = z.string().refine(v => safeUrl(v));
// Only the author-specified legacy publication URL may use HTTP.
export const legacyReadingUrl = 'http://www.wlkhds.com/wlkhds7_detail.php?id=808';
const publicationLink = z.object({label:text,url:z.string().refine(v=>safeUrl(v)||v===legacyReadingUrl),group:z.enum(['print','ebook','read']).optional(),scope:z.enum(['volume','whole_work']).optional()}).strict();
export const publicationSchema = z.object({
 work_id: slugSchema, slug: slugSchema, title:text,
 publication_status:z.enum(['published','online','serialized','unpublished']),
 completion_status:z.enum(['completed','ongoing']).optional(),
 work_form:z.enum(['novel','short','collection']), synthetic:z.boolean(),
 website_approved:z.literal(true), approved_by:text, approved_revision:text,
 summary:text, description:z.array(text).default([]), description_scope:z.enum(['whole_work','volume']).optional(),
 endorsements:z.array(z.object({by:text,quote:text,source_label:text,source_url:external,source_page:z.number().int().positive().optional(),quoted_verbatim:z.literal(true)}).strict()).default([]),
 recommendation_credits:z.array(text).default([]),
 award:z.object({year:z.number().int(),label:text,source_url:external}).strict().optional(),
 theme:z.enum(['sage','bronze']).default('sage'), cover:external.optional(),cover_alt:text.optional(),
 publisher:text.optional(), year:z.number().int().optional(), author:text.optional(),
 edition_date:z.string().regex(/^\d{4}-\d{2}(?:-\d{2})?$/).optional(),edition_isbn:z.string().regex(/^\d{13}$/).optional(),date_note:text.optional(),
 series:text.optional(), order:z.number().int().positive().optional(),display_order:z.number().int().positive().optional(),
 excerpt:text.optional(),
 full_text:z.object({approved:z.literal(true),approved_by:text,approved_revision:text,text}).strict().optional(),
 links:z.array(publicationLink).default([]),
 world:z.object({approved:z.literal(true),intro:text,entries:z.array(z.object({kind:z.enum(['人物','地點','事件','番外']),name:text,description:text})).min(1)}).optional()
}).strict().superRefine((b,ctx)=>{
 if(b.full_text&&(b.work_form!=='short'||!['published','online'].includes(b.publication_status)))ctx.addIssue({code:'custom',message:'全文僅接受已公開且另行核准的短篇作品；書籍不預設公開全文'});
 if(b.links.some(l=>l.url===legacyReadingUrl&&(b.work_id!=='publication-data-storm'||l.group!=='read')))ctx.addIssue({code:'custom',message:'HTTP 例外限數據風暴原發表閱讀入口'});
});
export function publicationStatus(b) {
 if(b.publication_status==='online'&&b.work_form==='short')return '公開短篇';
 return kinds[b.publication_status]+(b.publication_status==='online'&&b.completion_status==='completed'?'・已完結':'');
}
export function validatePublications(raw) { const records=raw.map(x=>publicationSchema.parse(x)); for(const key of ['work_id','slug']) if(new Set(records.map(x=>x[key])).size!==records.length) throw Error('重複作品識別碼'); return records; }
