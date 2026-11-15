import {test} from 'node:test';import assert from 'node:assert/strict';
import {validatePopularity} from '../src/lib/popularity.mjs';
import {compareBrowse} from '../src/lib/browse-sort.mjs';
test('熱門已知在前、未知非零、同排名按日期，最新最早不受熱門影響',()=>{
 const rows=[{id:'unknown',rank:null,date:30},{id:'older',rank:1,date:10},{id:'newer',rank:1,date:20},{id:'second',rank:2,date:40}];
 assert.deepEqual([...rows].sort((a,b)=>compareBrowse(a,b,'popular')).map(r=>r.id),['newer','older','second','unknown']);
 assert.equal([...rows].sort((a,b)=>compareBrowse(a,b,'newest'))[0].id,'second');
 assert.equal([...rows].sort((a,b)=>compareBrowse(a,b,'oldest'))[0].id,'older');
});
test('拒絕錯誤統計口徑、負值與重複ID',()=>{
 const row={id:'fixture',rank:1,snapshot_at:null,metric:'first_7_days_plays_plus_downloads'};
 assert.doesNotThrow(()=>validatePopularity({articles:[],podcast:[row]}));
 assert.throws(()=>validatePopularity({articles:[row],podcast:[]}));
 assert.throws(()=>validatePopularity({articles:[],podcast:[row,row]}));
 assert.throws(()=>validatePopularity({articles:[],podcast:[{...row,rank:-1}]}));
});


test('未知人氣保持日期順序；拒絕零排名、小數與無效快照日期',()=>{
 assert.equal(compareBrowse({id:'a',rank:null,date:2},{id:'b',rank:null,date:1},'popular'),-1);
 for(const extra of [{rank:0},{rank:1.5},{snapshot_at:'unknown'}]){
  assert.throws(()=>validatePopularity({articles:[{id:'fixture',rank:1,snapshot_at:null,metric:'instagram_primary_post_likes',...extra}],podcast:[]}));
 }
});
