import {z} from 'zod';
import raw from '../data/popularity.json' with {type:'json'};
const row=z.object({id:z.string().min(1),rank:z.number().int().positive().nullable(),snapshot_at:z.iso.datetime({offset:true}).nullable(),metric:z.enum(['instagram_primary_post_likes','first_7_days_plays_plus_downloads'])}).strict();
export function validatePopularity(input){
 const data=z.object({articles:z.array(row),podcast:z.array(row)}).strict().parse(input);
 for(const [kind,metric] of [['articles','instagram_primary_post_likes'],['podcast','first_7_days_plays_plus_downloads']]){
  const ids=new Set();for(const r of data[kind]){if(ids.has(r.id)||r.metric!==metric)throw Error('重複識別碼或人氣口徑錯誤');ids.add(r.id);}
 }return data;
}
export const popularity=validatePopularity(raw);
export const popularityRank=(kind,id)=>popularity[kind].find(r=>r.id===id)?.rank ?? null;
