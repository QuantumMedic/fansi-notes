import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageSlice,pageNumbers} from '../src/lib/pagination.mjs';
test('文章20／Podcast15：首尾頁與空結果、非法頁碼',()=>{
 assert.deepEqual(pageSlice(57,20,3),{page:3,pages:3,start:40,end:57});
 assert.deepEqual(pageSlice(25,15,2),{page:2,pages:2,start:15,end:25});
 assert.equal(pageSlice(0,20,99).page,1);assert.equal(pageSlice(0,20).end,0);
 assert.equal(pageSlice(57,20,-1).page,1);assert.equal(pageSlice(57,20,999).page,3);
 assert.equal(pageSlice(20,20).pages,1);
});
test('分頁數字保留首尾與相鄰頁，大量頁面收合不溢出',()=>{
 assert.deepEqual(pageNumbers(1,3),[1,2,3]);
 assert.deepEqual(pageNumbers(5,10),[1,'…',4,5,6,'…',10]);
 assert.deepEqual(pageNumbers(1,1),[1]);
});
