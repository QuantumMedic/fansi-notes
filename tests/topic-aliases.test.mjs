import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classificationSchema,topicName,canonicalTopic} from '../src/lib/taxonomy.mjs';
import {matchesSearch} from '../src/lib/search.mjs';
import {planImport} from '../scripts/import-batch.mjs';
import {article} from './fixtures/content.mjs';

test('舊主題 ID 正規化，維持名稱與主次順序，不放寬未知或重複分類',()=>{
 for(const [old,current,name] of [['books','literature','書籍與文學'],['history_society','society','歷史與社會'],['personal','creation','個人與創作']]) {
  assert.equal(canonicalTopic(old),current);assert.equal(topicName(old),name);
  assert.deepEqual(classificationSchema.parse({content_type:'longform',topics:[old,'psychology']}).topics,[current,'psychology']);
  assert.ok(matchesSearch('正文',[current],'longform',{topic:old}));
  assert.ok(matchesSearch('正文',[old],'longform',{topic:current}));
  assert.throws(()=>classificationSchema.parse({content_type:'longform',topics:[old,current]}));
 }
 assert.throws(()=>classificationSchema.parse({content_type:'longform',topics:['unknown']}));
});
test('批次工具接受已核准舊分類 ID，但拒絕未分類與覆蓋既有作品',()=>{
 const metadata={...article(),topics:['books']};
 const manifest={version:1,items:[{kind:'article',metadata,body:'合成原文',public_authorization:true}]};
 const files=planImport(manifest);assert.match(Object.values(files)[0],/"topics":\["literature"\]/);
 assert.throws(()=>planImport(manifest,{existingIds:[metadata.work_id]}));
 assert.throws(()=>planImport({...manifest,items:[{...manifest.items[0],metadata:{...metadata,topics:[]}}]}));
});
